// ===== DADOS DO USUÁRIO NA TELA =====
window.addEventListener('DOMContentLoaded', () => {
  const nome = localStorage.getItem('nome') || 'Participante';
  const el = document.getElementById('nomeUsuario');
  if (el && !el.textContent) el.textContent = nome;

  const btn = document.getElementById('btnGirar');
  if (btn) btn.addEventListener('click', girarRoleta);
});

// ===== CONFIG DA ROLETA =====
// Nº de fatias da arte PREMIOS.png
const SETORES = 12;
const setorDeg = 360 / SETORES;

// Ajuste fino para alinhar ao ponteiro (0 = centro da fatia às 12h)
const offsetDeg = 0;

// Ordem HORÁRIA a partir do topo (12h, onde o ponteiro aponta)
const SETORES_LABELS = [
  "DONUT",
  "MOLHO YAKISSOBA",
  "SHOYU",
  "MARCA PAGINA",
  "TENTE OUTRA VEZ",
  "NÃO FOI DESSA VEZ",
  "NÃO FOI DESSA VEZ… MAS O PRÓXIMO É SEU",
  "QUASE! TENTA MAIS UMA VEZ",
  "RESPIRA… E GIRA DE NOVO!",
  "TENTE OUTRA VEZ",
  "NÃO FOI DESSA VEZ",
  "QUASE! TENTA MAIS UMA VEZ"
];

// Prêmios limitados (estoque)
const LIMITADOS = {
  "DONUT": 10,
  "MOLHO YAKISSOBA": 10,
  "SHOYU": 10,
  "MARCA PAGINA": 10
};

// ===== PERSISTÊNCIA =====
const ESTOQUE_KEY = "estoque_roleta_v1";
const JOGADAS_KEY = "jogadas_roleta_v1"; // array de jogadas (para ranking)

// carrega/salva estoque
function carregarEstoque(){
  try{
    const raw = localStorage.getItem(ESTOQUE_KEY);
    if (raw){
      const obj = JSON.parse(raw);
      for(const k of Object.keys(LIMITADOS)){
        if (typeof obj[k] !== 'number' || obj[k] < 0) obj[k] = LIMITADOS[k];
      }
      localStorage.setItem(ESTOQUE_KEY, JSON.stringify(obj));
      return obj;
    }
  }catch{}
  localStorage.setItem(ESTOQUE_KEY, JSON.stringify({...LIMITADOS}));
  return {...LIMITADOS};
}
let ESTOQUE = carregarEstoque();

function salvarJogada(reg){
  const arr = carregarJogadas();
  arr.push(reg);
  localStorage.setItem(JOGADAS_KEY, JSON.stringify(arr));
}
function carregarJogadas(){
  try{
    const raw = localStorage.getItem(JOGADAS_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{ return [] }
}

// ===== UTIL =====
function ehLimitado(lbl){ return Object.prototype.hasOwnProperty.call(LIMITADOS, lbl); }
function estoqueDisponivel(lbl){ return ehLimitado(lbl) ? (ESTOQUE[lbl]||0) > 0 : true; }
function debitar(lbl){
  if (ehLimitado(lbl)){
    ESTOQUE[lbl] = Math.max(0, (ESTOQUE[lbl]||0) - 1);
    localStorage.setItem(ESTOQUE_KEY, JSON.stringify(ESTOQUE));
  }
}

// escolher um setor válido respeitando estoque
function escolherIndice(){
  const disponiveis = [];
  for (let i=0;i<SETORES;i++){
    if (estoqueDisponivel(SETORES_LABELS[i])) disponiveis.push(i);
  }
  if (!disponiveis.length){
    // se tudo acabou, cair em mensagem
    return SETORES_LABELS.findIndex(v => !ehLimitado(v)) || 0;
  }
  const pick = Math.floor(Math.random() * disponiveis.length);
  return disponiveis[pick];
}

// calcular rotação p/ pousar no centro da fatia desejada
let giroAcumulado = 0;
const roletaEl = document.getElementById('roleta');
const saida = document.getElementById('resultado');
let girando = false;

function deltaParaSetor(idx){
  const atual = ((giroAcumulado % 360) + 360) % 360;
  const half = setorDeg / 2;
  const alvoRel = (idx*setorDeg + half) % 360;                 // alvo relativo ao ponteiro
  const absolutoFinal = (360 - alvoRel + offsetDeg + 360) % 360;
  const deltaDentro360 = (absolutoFinal - atual + 360) % 360;
  const voltas = 4 + Math.floor(Math.random()*3);              // 4..6 voltas
  return voltas*360 + deltaDentro360;
}

function girarRoleta(){
  if (girando || !roletaEl) return;
  girando = true;
  if (saida) saida.textContent = '';

  const idx = escolherIndice();
  const delta = deltaParaSetor(idx);

  giroAcumulado += delta;
  roletaEl.style.transition = "transform 4s cubic-bezier(.18,.72,.14,1)";
  roletaEl.style.transform = `rotate(${giroAcumulado}deg)`;

  setTimeout(() => {
    const label = SETORES_LABELS[idx];
    debitar(label);

    const nome = localStorage.getItem('nome') || 'Participante';
    const fone = localStorage.getItem('fone') || '';
    const login_ts = Number(localStorage.getItem('login_ts')) || Date.now();

    // registra a jogada (para ranking de primeiros)
    salvarJogada({
      nome, fone, premio: label, ts: login_ts
    });

    if (ehLimitado(label)){
      const rest = ESTOQUE[label];
      saida.textContent = `🎉 Você ganhou: ${label} — restantes: ${rest}`;
    }else{
      saida.textContent = `🌀 ${label}`;
    }

    if (navigator.vibrate) navigator.vibrate([20,30,20]);
    girando = false;
  }, 4000);
}

