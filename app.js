// ESTADO GLOBAL DO SISTEMA
let usuarioAtual = localStorage.getItem('domus_user') || '';

// ESTRUTURA DE DADOS DAS LÂMPADAS
let lampadas = [
  { id: 'sala', nome: 'Sala de Estar', ligada: true, intensidade: 60 },
  { id: 'quarto', nome: 'Quarto Principal', ligada: true, intensidade: 80 },
  { id: 'cozinha', nome: 'Cozinha', ligada: true, intensidade: 100 },
  { id: 'banheiro', nome: 'Banheiro', ligada: false, intensidade: 50 },
  { id: 'externa', nome: 'Área Externa', ligada: false, intensidade: 100 }
];

// ESTRUTURA DE SEGURANÇA
let dispositivosSeguranca = [
  { id: 'p_principal', nome: 'Porta Principal', status: 'Seguro', seguro: true },
  { id: 'p_fundos', nome: 'Porta dos Fundos', status: 'Seguro', seguro: true },
  { id: 'j_sala', nome: 'Janela da Sala', status: 'Seguro', seguro: true },
  { id: 'j_quarto', nome: 'Janela do Quarto', status: 'Seguro', seguro: true },
  { id: 's_movimento', nome: 'Sensor de Movimento', status: 'Ativo', seguro: true },
  { id: 'camera', nome: 'Câmeras HD', status: 'Monitorando', seguro: true }
];

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  if (usuarioAtual) {
    carregarAplicacao(usuarioAtual);
  }
  renderizarLampadas();
  renderizarSeguranca();
  atualizarContadores();
});

// NAVEGAÇÃO ENTRE LOGIN E CADASTRO
function toggleAuthMode(mode) {
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  if (formLogin && formRegister) {
    if (mode === 'register') {
      formLogin.style.display = 'none';
      formRegister.style.display = 'block';
    } else {
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
    }
  }
}

// EXECUÇÃO DO LOGIN
function executarLogin() {
  const usuariosPermitidos = ['matheusdlucca', 'diegobarbosa', 'arthurcarvalho'];
  const senhaCorreta = '123456';

  const userEl = document.getElementById('login-user');
  const passEl = document.getElementById('login-pass');

  if (!userEl || !passEl) {
    carregarAplicacao('matheusdlucca');
    return;
  }

  // Remove espaços extras e converte para minúsculas
  const userInput = userEl.value.trim().toLowerCase().replace(/\s+/g, '');
  const passInput = passEl.value.trim();

  const usuarioValido = usuariosPermitidos.includes(userInput);

  if (!usuarioValido || passInput !== senhaCorreta) {
    alert('Usuário ou senha incorretos!\n\nUsuários permitidos:\n- matheusdlucca\n- diegobarbosa\n- arthurcarvalho\n\nSenha: 123456');
    return;
  }

  usuarioAtual = userInput;
  localStorage.setItem('domus_user', userInput);

  carregarAplicacao(userInput);
}

// EXECUÇÃO DO CADASTRO
function executarCadastro() {
  const regUser = document.getElementById('reg-user');
  const user = regUser && regUser.value.trim() ? regUser.value.trim() : 'usuario';
  
  usuarioAtual = user;
  localStorage.setItem('domus_user', user);
  carregarAplicacao(user);
}

// CARREGAR APLICAÇÃO (ESCONDE O LOGIN E MOSTRA O APP DIRETO)
function carregarAplicacao(nome) {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');

  if (loginScreen) {
    loginScreen.style.setProperty('display', 'none', 'important');
  }

  if (appContainer) {
    appContainer.classList.remove('app-hidden');
    appContainer.style.setProperty('display', 'flex', 'important');
  }

  atualizarInterfaceUsuario(nome);
}

// SAIR
function fazerLogout() {
  localStorage.removeItem('domus_user');
  location.reload();
}

// ATUALIZAR INTERFACE
function atualizarInterfaceUsuario(nome) {
  if (!nome) nome = 'Usuário';
  const primeiraLetra = nome.charAt(0).toUpperCase();

  const elGreeting = document.getElementById('user-greeting');
  const elAvatarText = document.getElementById('header-avatar-text');
  const elProfileName = document.getElementById('profile-name');
  const elProfileAvatar = document.getElementById('profile-avatar-large');
  const elProfileEdit = document.getElementById('profile-edit-name');

  if (elGreeting) elGreeting.innerText = `Olá, ${nome}!`;
  if (elAvatarText) elAvatarText.innerText = primeiraLetra;
  if (elProfileName) elProfileName.innerText = nome;
  if (elProfileAvatar) elProfileAvatar.innerText = primeiraLetra;
  if (elProfileEdit) elProfileEdit.value = nome;
}

// SALVAR PERFIL
function salvarPerfil() {
  const editEl = document.getElementById('profile-edit-name');
  if (editEl) {
    const novoNome = editEl.value.trim();
    if (novoNome) {
      usuarioAtual = novoNome;
      localStorage.setItem('domus_user', novoNome);
      atualizarInterfaceUsuario(novoNome);
      alert('Perfil atualizado com sucesso!');
    }
  }
}

// ABAS
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  const activeTab = document.getElementById('tab-' + tabId);
  if (activeTab) activeTab.classList.add('active');
  if (element) element.classList.add('active');
}

// ILUMINAÇÃO
function renderizarLampadas() {
  const container = document.getElementById('light-cards-container');
  if (!container) return;

  container.innerHTML = lampadas.map((l, index) => `
    <div class="card">
      <div class="card-title">
        <span><i class="fa-solid fa-lightbulb ${l.ligada ? 'text-orange' : ''}"></i> ${l.nome}</span>
        <label class="switch">
          <input type="checkbox" ${l.ligada ? 'checked' : ''} onchange="alterarEstadoLuz(${index}, this.checked)">
          <span class="slider"></span>
        </label>
      </div>
      <p><small>Status: <strong>${l.ligada ? 'Ligada' : 'Desligada'}</strong></small></p>
      <div style="margin-top: 10px;">
        <small>Intensidade: <strong>${l.intensidade}%</strong></small>
        <input type="range" class="range-slider" min="0" max="100" value="${l.intensidade}" 
          ${!l.ligada ? 'disabled' : ''} oninput="alterarIntensidadeLuz(${index}, this.value)">
      </div>
    </div>
  `).join('');
}

function alterarEstadoLuz(index, estado) {
  lampadas[index].ligada = estado;
  renderizarLampadas();
  atualizarContadores();
}

function alterarIntensidadeLuz(index, valor) {
  lampadas[index].intensidade = valor;
  renderizarLampadas();
}

function alternarTodasLuzes(estado) {
  lampadas.forEach(l => l.ligada = estado);
  renderizarLampadas();
  atualizarContadores();
}

function atualizarContadores() {
  const ligadas = lampadas.filter(l => l.ligada).length;
  const countEl = document.getElementById('dash-lights-count');
  if (countEl) {
    countEl.innerText = `${ligadas} luzes ligadas`;
  }
}

// SEGURANÇA
function renderizarSeguranca() {
  const container = document.getElementById('security-devices-list');
  if (!container) return;

  container.innerHTML = dispositivosSeguranca.map(d => `
    <div class="activity-item">
      <span>${d.nome}</span>
      <span class="status-badge ${d.seguro ? 'status-ativo' : 'status-inativo'}">${d.status}</span>
    </div>
  `).join('');
}

function ativarModoSeguranca(modo) {
  document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
  
  const btnCasa = document.getElementById('mode-casa');
  const btnNoturno = document.getElementById('mode-noturno');
  const btnAusente = document.getElementById('mode-ausente');

  if (modo === 'Casa' && btnCasa) btnCasa.classList.add('active');
  if (modo === 'Noturno' && btnNoturno) btnNoturno.classList.add('active');
  if (modo === 'Ausente' && btnAusente) btnAusente.classList.add('active');

  const history = document.getElementById('security-history');
  if (history) {
    const hora = new Date().toLocaleTimeString([], { hour: '2-2digit', minute: '2-2digit' });
    const novoItem = document.createElement('li');
    novoItem.className = 'activity-item';
    novoItem.innerHTML = `<span>${hora} — Modo de segurança alterado para: <strong>${modo}</strong></span>`;
    history.insertBefore(novoItem, history.firstChild);
  }
}

// NOTIFICAÇÕES
function limparNotificacoes() {
  const container = document.getElementById('notifications-container');
  if (container) {
    container.innerHTML = '<p><small>Nenhuma notificação recente.</small></p>';
  }
}

// ACESSIBILIDADE
function toggleHighContrast(ativo) {
  if (ativo) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}

function toggleLargeFont(ativo) {
  if (ativo) {
    document.body.classList.add('large-font');
  } else {
    document.body.classList.remove('large-font');
  }
}

function iniciarComandoVoz() {
  alert('Reconhecimento de voz ativado. Diga: "DOMUS, apagar luzes".');
}

// AUTOMAÇÃO
function abrirModalAutomacao() {
  const nome = prompt('Digite o nome da nova automação:');
  if (nome) {
    const container = document.getElementById('automations-container');
    if (container) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-title">
          <span><i class="fa-solid fa-bolt text-orange"></i> ${nome}</span>
          <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
        </div>
        <p><small>Execução programada ativa.</small></p>
      `;
      container.appendChild(card);
    }
  }
}