// ========================================
// AUTENTICAÇÃO E SESSÃO (PROTÓTIPO TCC)
// ========================================

function realizarLogin(event) {
    event.preventDefault();

    const usuarioInput = document.getElementById("usuario").value;
    const senhaInput = document.getElementById("senha").value;
    const errorElement = document.getElementById("loginError");

    // Credenciais simuladas para protótipo
    if (usuarioInput === "admin" && senhaInput === "1234") {
        localStorage.setItem("domus_usuario_logado", "true");
        window.location.href = "index.html";
    } else {
        if (errorElement) {
            errorElement.style.display = "block";
        }
    }
}

function verificarAutenticacao() {
    const estaLogado = localStorage.getItem("domus_usuario_logado");
    const paginaAtual = window.location.pathname;

    // Se não estiver logado e não estiver na tela de login, redireciona
    // if (!estaLogado && !paginaAtual.includes("login.html")) {
    //     // Ajusta o caminho se estiver dentro da pasta pages/
    //     if (paginaAtual.includes("/pages/")) {
    //         window.location.href = "../login.html";
    //     } else {
    //         window.location.href = "login.html";
    //     }
    // }
}

// // Executa a verificação ao carregar qualquer página
// verificarAutenticacao();

// ========================================
// LOGOUT / ENCERRAR SESSÃO
// ========================================

function realizarLogout() {
    // Remove o status de autenticação da sessão
    localStorage.removeItem("domus_usuario_logado");
    
    // Redireciona para a tela de login
    const paginaAtual = window.location.pathname;
    if (paginaAtual.includes("/pages/")) {
        window.location.href = "../login.html";
    } else {
        window.location.href = "login.html";
    }
}

// ========================================
// DOMUS - SCRIPT PRINCIPAL
// ========================================


// ========================================
// ILUMINAÇÃO
// ========================================

const iluminacao = {
    sala: false,
    quarto: false,
    cozinha: false,
    banheiro: false
};

const potenciaLuzes = {
    sala: 60,
    quarto: 40,
    cozinha: 80,
    banheiro: 40
};

// Função acionada ao alternar um interruptor
function controlarLuz(ambiente, interruptor) {
    iluminacao[ambiente] = interruptor.checked;

    const status = document.getElementById(`status-${ambiente}`);
    const card = document.getElementById(`card-luz-${ambiente}`);

    if (status) {
        status.textContent = iluminacao[ambiente] ? "Ligada" : "Desligada";
    }

    // Adiciona ou remove classe visual para efeito de brilho
    if (card) {
        if (iluminacao[ambiente]) {
            card.classList.add("light-on");
        } else {
            card.classList.remove("light-on");
        }
    }

    atualizarConsumo();
}

// Atualiza contadores de lâmpadas ligadas e consumo em Watts
function atualizarConsumo() {
    let quantidade = 0;
    let potencia = 0;

    for (const ambiente in iluminacao) {
        if (iluminacao[ambiente]) {
            quantidade++;
            potencia += potenciaLuzes[ambiente];
        }
    }

    const totalLigadas = document.getElementById("totalLigadas");
    const potenciaAtual = document.getElementById("potencia");

    if (totalLigadas) {
        totalLigadas.innerHTML = `${quantidade} <span>lâmpadas</span>`;
    }

    if (potenciaAtual) {
        potenciaAtual.innerHTML = `${potencia} <span>W</span>`;
    }
}

// Liga ou desliga todas as luzes simultaneamente
function alternarTodasLuzes(ligar) {
    for (const ambiente in iluminacao) {
        iluminacao[ambiente] = ligar;
        
        const checkbox = document.getElementById(`switch-${ambiente}`);
        if (checkbox) {
            checkbox.checked = ligar;
            controlarLuz(ambiente, checkbox);
        }
    }
}

// ========================================
// SEGURANÇA
// ========================================

let segurancaAtiva = true;

let movimentoDetectado = false;
let portaAberta = false;
let janelaAberta = false;


// ========================================
// ATIVAR / DESATIVAR SEGURANÇA
// ========================================

function alternarSeguranca() {

    segurancaAtiva = !segurancaAtiva;

    const status =
        document.getElementById("securityStatus");

    const botao =
        document.getElementById("securityButton");

    if (!status || !botao) {
        return;
    }

    if (segurancaAtiva) {

        status.textContent = "Protegida";

        botao.textContent =
            "Desativar monitoramento";

        adicionarEvento(
            "Sistema de segurança ativado",
            "Monitoramento normal"
        );

    } else {

        status.textContent =
            "Monitoramento desativado";

        botao.textContent =
            "Ativar monitoramento";

        adicionarEvento(
            "Sistema de segurança desativado",
            "Monitoramento interrompido"
        );
    }
}


// ========================================
// SENSOR DE MOVIMENTO
// ========================================

function simularMovimento() {

    const elemento =
        document.getElementById("movimento");

    const botao =
        document.querySelector(
            '[onclick="simularMovimento()"]'
        );

    if (!elemento || !botao) {
        return;
    }

    movimentoDetectado =
        !movimentoDetectado;

    if (movimentoDetectado) {

        elemento.textContent =
            "Movimento detectado";

        botao.textContent =
            "Simular fim do movimento";

        adicionarEvento(
            "Movimento detectado",
            "Sensor da sala registrou atividade"
        );

    } else {

        elemento.textContent =
            "Nenhum movimento";

        botao.textContent =
            "Simular movimento";

        adicionarEvento(
            "Movimento encerrado",
            "Sensor da sala voltou ao estado normal"
        );
    }
}


// ========================================
// SENSOR DA PORTA
// ========================================

function simularPorta() {

    const elemento =
        document.getElementById("porta");

    const botao =
        document.querySelector(
            '[onclick="simularPorta()"]'
        );

    if (!elemento || !botao) {
        return;
    }

    portaAberta =
        !portaAberta;

    if (portaAberta) {

        elemento.textContent =
            "Porta aberta";

        botao.textContent =
            "Simular fechamento";

        adicionarEvento(
            "Porta aberta",
            "Entrada principal"
        );

    } else {

        elemento.textContent =
            "Porta fechada";

        botao.textContent =
            "Simular abertura";

        adicionarEvento(
            "Porta fechada",
            "Entrada principal voltou ao estado normal"
        );
    }
}


// ========================================
// SENSOR DA JANELA
// ========================================

function simularJanela() {

    const elemento =
        document.getElementById("janela");

    const botao =
        document.querySelector(
            '[onclick="simularJanela()"]'
        );

    if (!elemento || !botao) {
        return;
    }

    janelaAberta =
        !janelaAberta;

    if (janelaAberta) {

        elemento.textContent =
            "Janela aberta";

        botao.textContent =
            "Simular fechamento";

        adicionarEvento(
            "Janela aberta",
            "Sensor da sala"
        );

    } else {

        elemento.textContent =
            "Janela fechada";

        botao.textContent =
            "Simular abertura";

        adicionarEvento(
            "Janela fechada",
            "Sensor da sala voltou ao estado normal"
        );
    }
}


// ========================================
// SENSOR DE TEMPERATURA
// ========================================

function simularTemperatura() {

    const elemento =
        document.getElementById(
            "temperaturaSensor"
        );

    if (!elemento) {
        return;
    }

    const temperatura =
        Math.floor(Math.random() * 7) + 21;

    elemento.textContent =
        `${temperatura} °C`;

    adicionarEvento(
        "Temperatura atualizada",
        `${temperatura} °C detectados`
    );
}


// ========================================
// HISTÓRICO DE SEGURANÇA
// ========================================

function adicionarEvento(titulo, descricao) {

    const historico =
        document.getElementById(
            "securityHistory"
        );

    if (!historico) {
        return;
    }

    const evento =
        document.createElement("div");

    evento.className =
        "security-event";

    evento.innerHTML = `
        <div class="event-icon">
            !
        </div>

        <div>
            <strong>
                ${titulo}
            </strong>

            <small>
                ${descricao}
            </small>
        </div>

        <time>
            Agora
        </time>
    `;

    historico.prepend(evento);
}// ========================================
// DASHBOARD - CONTROLE RÁPIDO E GRÁFICO
// ========================================

// Alterna a iluminação diretamente do Dashboard
function alternarLuz(ambiente) {
    iluminacao[ambiente] = !iluminacao[ambiente];

    const statusBtn = document.getElementById(`${ambiente}-status`);
    if (statusBtn) {
        statusBtn.textContent = iluminacao[ambiente]
            ? "Desligar iluminação"
            : "Ligar iluminação";
    }

    atualizarConsumo();
}

// Atualiza o consumo exibido no gráfico de acordo com o período selecionado
document.addEventListener("DOMContentLoaded", () => {
    const periodoSelect = document.getElementById("periodo");
    const energyValue = document.querySelector(".energy-value strong");

    if (periodoSelect && energyValue) {
        periodoSelect.addEventListener("change", (e) => {
            const valor = e.target.value;
            if (valor === "dia") {
                energyValue.textContent = "4,82 kWh";
            } else if (valor === "semana") {
                energyValue.textContent = "32,50 kWh";
            } else if (valor === "mes") {
                energyValue.textContent = "145,20 kWh";
            }
        });
    }
});// ========================================
// SISTEMA DE SEGURANÇA
// ========================================

let sistemaSegurancaAtivo = true;

// Alterna o estado geral do alarme
function alternarAlarmeGeral() {
    sistemaSegurancaAtivo = !sistemaSegurancaAtivo;

    const statusTexto = document.getElementById("status-alarme-texto");
    const statusDesc = document.getElementById("status-alarme-desc");
    const btnAlarme = document.getElementById("btn-alarme-geral");
    const shieldIcon = document.querySelector(".security-shield");

    if (sistemaSegurancaAtivo) {
        if (statusTexto) statusTexto.textContent = "SISTEMA ATIVO";
        if (statusDesc) statusDesc.textContent = "Residência totalmente protegida";
        if (btnAlarme) btnAlarme.textContent = "Desarmar Sistema";
        if (shieldIcon) shieldIcon.style.background = "#1d4ed8";
        adicionarHistoricoSeguranca("Sistema de alarme ARMADO pelo usuário.");
    } else {
        if (statusTexto) statusTexto.textContent = "SISTEMA DESARMADO";
        if (statusDesc) statusDesc.textContent = "Atenção: Proteção desativada";
        if (btnAlarme) btnAlarme.textContent = "Armar Sistema";
        if (shieldIcon) shieldIcon.style.background = "#ef4444";
        adicionarHistoricoSeguranca("Sistema de alarme DESARMADO pelo usuário.");
    }
}

// Registra ações no histórico visual da página de segurança
function adicionarHistoricoSeguranca(mensagem) {
    const listaHistorico = document.getElementById("historico-seguranca");
    if (!listaHistorico) return;

    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const item = document.createElement("div");
    item.className = "security-event";
    item.innerHTML = `
        <div class="event-icon">🛡</div>
        <div>
            <strong>${mensagem}</strong>
            <small>Monitoramento DOMUS</small>
        </div>
        <time>Hoje às ${hora}</time>
    `;

    listaHistorico.insertBefore(item, listaHistorico.firstChild);
}

// Alterna o status de um sensor ou câmera individual
function controlarDispositivoSeguranca(nome, checkbox) {
    const estado = checkbox.checked ? "ativado" : "desativado";
    adicionarHistoricoSeguranca(`${nome} foi ${estado}.`);
}function simularMovimento() {
    const statusMovimento = document.getElementById("movimento");
    if (statusMovimento) {
        statusMovimento.textContent = "Movimento Detectado!";
        
        setTimeout(() => {
            statusMovimento.textContent = "Nenhum movimento";
        }, 3000);
    }
    
    // Registra no histórico da tela
    adicionarHistoricoSeguranca("Movimento detectado na Sala.");
}