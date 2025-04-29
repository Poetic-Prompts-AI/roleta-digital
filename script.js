window.onload = () => {
  const nome = localStorage.getItem("nome");
  if (nome) {
    document.getElementById("nomeUsuario").textContent = nome;
  }
};

const premios = [
  "Desconto Playerum – 20%",
  "Cupom T.T. Burger",
  "Produtos Tom Ticken",
  "Incrivelmente Não Dessa Vez 😢",
  "Produtos T.T.",
  "Nutriland Premium",
  "Produtos Marola"
];

function girarRoleta() {
  const roleta = document.getElementById("roleta");
  const anguloFinal = Math.floor(Math.random() * 360 + 1440); // 4 voltas
  roleta.style.transition = "transform 4s ease-out";
  roleta.style.transform = `rotate(${anguloFinal}deg)`;

  const setor = ((anguloFinal % 360) + 360) % 360;
  const index = Math.floor((360 - setor + 25.7) % 360 / 51.42); // 360 / 7

  setTimeout(() => {
    document.getElementById("resultado").textContent = `🎉 Você ganhou: ${premios[index]}`;
  }, 4000);
}

function voltarParaCadastro() {
  localStorage.clear();
  window.location.href = "index.html";
}
