// ====== DADOS DO USUÁRIO ======
window.addEventListener('DOMContentLoaded', () => {
  const nome = localStorage.getItem('nome') || 'Participante';
  document.getElementById('nomeUsuario')?.append(document.createTextNode(nome));
});

// ====== CONFIGURAÇÃO DA ROLETA ======
// ATENÇÃO: defina quantos setores tem a imagem PREMIOS.png
const SETORES = 12;                       // nº de fatias do disco
const setorDeg = 360 / SETORES;

// Ajuste fino para alinhar o ponteiro ao centro da primeira fatia.
// Use valores entre -15 e +15 até bater certinho.
// (0º significa que o centro da fatia 0 está exatamente às 12h)
const offsetDeg = 0;

// Mapeie os rótulos na ordem HORÁRIA começando da posição das 12h (ponteiro)
const premios = [
  "DONUT",
  "NÃO FOI DESSA VEZ",
  "MOLHO YAKISSOBA",
  "QUASE... TENTE OUTRA VEZ",
  "SHOYU",
  "GIRA DE NOVO",
  "TENTE OUTRA VEZ",
  "RESPIRA... E GIRA DE NOVO",
  "QUEM SABE NA PRÓXIMA",
  "MARCA PAGINA",
  "PRÊMIO SURPRESA",
  "VALE-DESCONTO"
];

// ====== LÓGICA DE GIRO ======
const roletaEl = document.getElementById('roleta');
const btnGirar = document.getElementById('btnGirar');
const saida = document.getElementById('resultado');

let girando = false;
let giroAcumulado = 0; // mantém rotação acumulada p/ giros sucessivos

function girarRoleta(){
  if(girando) return;
  girando = true;
  saida.textContent = '';

  // 4 a 6 voltas completas + ângulo aleatório dentro de 360°
  const voltas = 4 + Math.floor(Math.random()*3);          // 4..6 voltas
  const alvoDentro360 = Math.random() * 360;               // 0..360
  const anguloFinal = voltas*360 + alvoDentro360;

  giroAcumulado += anguloFinal;
  roletaEl.style.transform = `rotate(${giroAcumulado}deg)`;
  btnGirar.setAttribute('disabled','');

  const duracaoMs = 4000; // igual ao CSS transition
  setTimeout(() => {
    const absoluto = giroAcumulado % 360;

    // ângulo no referencial do ponteiro (12h), invertendo o sentido do giro visual
    // e aplicando o offset de calibração
    const relativoPonteiro = (360 - absoluto + offsetDeg + 360) % 360;

    const indice = Math.floor(relativoPonteiro / setorDeg) % SETORES;
    const premio = premios[indice] ?? "—";

    saida.textContent = `🎉 Você ganhou: ${premio}`;
    btnGirar.removeAttribute('disabled');
    girando = false;

    // vibração leve (se disponível)
    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
  }, duracaoMs);
}

btnGirar?.addEventListener('click', girarRoleta);
