/* ==========================================================================
   DOMUS - GERENCIADOR DE ESTADO GLOBAL (js/state.js)
   ========================================================================== */

const DOMUS_INITIAL_STATE = {
    currentUser: {
        nome: "Matheus",
        senha: "1234",
        residencia: "Residência Principal",
        avatar: "J"
    },
    users: [
        { nome: "Matheus", senha: "1234", residencia: "Residência Principal", avatar: "M" },
        { nome: "Arthur", senha: "1234", residencia: "Casa de Campo", avatar: "A" }
    ],
    devices: {
        lights: {
            sala: { name: "Lâmpada da Sala", status: true, intensity: 60, room: "Sala" },
            quarto: { name: "Lâmpada do Quarto", status: true, intensity: 100, room: "Quarto" },
            corredor: { name: "Lâmpada do Corredor", status: false, intensity: 15, room: "Corredor" },
            cozinha: { name: "Lâmpada da Cozinha", status: true, intensity: 60, room: "Cozinha" }
        },
        security: {
            active: true,
            mode: "Protegido",
            doorLocked: true,
            windowClosed: true
        }
    },
    notifications: [
        { id: 1, time: "09:42", title: "Movimento detectado", desc: "Sensor da sala identificou presença.", type: "security" },
        { id: 2, time: "09:37", title: "Iluminação alterada", desc: "Lâmpada da sala ajustada para 60%.", type: "light" },
        { id: 3, time: "09:31", title: "Sistema de segurança ativado", desc: "Residência configurada no modo protegido.", type: "security" },
        { id: 4, time: "09:12", title: "Janela fechada", desc: "Janela da cozinha foi fechada.", type: "security" }
    ]
};

class AppState {
    static get() {
        const data = localStorage.getItem("DOMUS_GLOBAL_DATA");
        return data ? JSON.parse(data) : DOMUS_INITIAL_STATE;
    }

    static save(data) {
        localStorage.setItem("DOMUS_GLOBAL_DATA", JSON.stringify(data));
        window.dispatchEvent(new Event("domusStateChanged"));
    }

    static formatTime() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    static addNotification(title, desc, type = "info") {
        const state = this.get();
        const newNotif = {
            id: Date.now(),
            time: this.formatTime(),
            title,
            desc,
            type
        };
        state.notifications.unshift(newNotif);
        this.save(state);
    }

    static setLight(id, status, intensity = null) {
        const state = this.get();
        const light = state.devices.lights[id];
        if (!light) return;

        if (status !== null) light.status = status;
        if (intensity !== null) light.intensity = Number(intensity);

        this.save(state);

        const statusMsg = light.status ? `ajustada para ${light.intensity}%` : 'desligada';
        this.addNotification("Iluminação alterada", `${light.name} ${statusMsg}.`, "light");
    }

    static applyScene(sceneKey) {
        const state = this.get();
        const scenes = {
            estudo: { name: "Modo Estudo", config: { sala: 70, quarto: 100, corredor: 0, cozinha: 0 } },
            cinema: { name: "Modo Cinema", config: { sala: 20, quarto: 0, corredor: 0, cozinha: 0 } },
            noturno: { name: "Modo Noturno", config: { corredor: 15, quarto: 10, sala: 0, cozinha: 0 } },
            ausente: { name: "Modo Ausente", config: { sala: 0, quarto: 0, corredor: 0, cozinha: 0 } }
        };

        const scene = scenes[sceneKey];
        if (!scene) return;

        Object.keys(scene.config).forEach(key => {
            if (state.devices.lights[key]) {
                const val = scene.config[key];
                state.devices.lights[key].intensity = val;
                state.devices.lights[key].status = val > 0;
            }
        });

        this.save(state);
        this.addNotification("Cena ativada", `${scene.name} foi aplicado com sucesso.`, "scene");
    }

    static setSecurity(active) {
        const state = this.get();
        state.devices.security.active = active;
        state.devices.security.mode = active ? "Protegido" : "Desativado";
        this.save(state);

        const actionText = active ? "ativado" : "desativado";
        this.addNotification("Sistema de segurança", `Residência configurada no modo ${actionText}.`, "security");
    }

    static login(nome, senha) {
        const state = this.get();
        const found = state.users.find(u => u.nome.toLowerCase() === nome.toLowerCase() && u.senha === senha);
        if (found) {
            state.currentUser = found;
            this.save(state);
            return true;
        }
        return false;
    }

    static register(nome, senha, residencia) {
        const state = this.get();
        const avatar = nome.trim().charAt(0).toUpperCase();
        const newUser = { nome, senha, residencia, avatar };
        state.users.push(newUser);
        state.currentUser = newUser;
        this.save(state);
        return true;
    }
}

// Inicializa estado padrão se não existir
if (!localStorage.getItem("DOMUS_GLOBAL_DATA")) {
    AppState.save(DOMUS_INITIAL_STATE);
}