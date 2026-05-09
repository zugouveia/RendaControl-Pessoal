// PROTECAO DE ROTA
// Se o usuário não estiver logado, redireciona para o login.
if (!localStorage.getItem("usuarioId")) {
  window.location.href = "login.html";
}
// logout
document.querySelector(".botao-logout").addEventListener("click", function () {
  localStorage.clear();
  window.location.href = "login.html";
});


const API_SERVICOS = "https://localhost:7058/api/servicos";
const API_DESPESAS = "https://localhost:7058/api/despesas";
const API_CLIENTES = "https://localhost:7058/api/clientes";

//SAUDAÇÃO
function definirSaudacao() {
  const hora = new Date().getHours();

  let saudacao;
  if (hora < 12) {
    saudacao = "Bom dia";
  } else if (hora < 18) {
    saudacao = "Boa tarde";
  } else {
    saudacao = "Boa noite";
  }

  document.getElementById("saudacao").textContent = saudacao + "!";

  const agora = new Date();
  const mes = agora.toLocaleString("pt-BR", { month: "long" });
  const ano = agora.getFullYear();

  const mesMaiusculo = mes.charAt(0).toUpperCase() + mes.slice(1);

  document.getElementById("subtitulo-data").textContent =
    "Resumo financeiro — " + mesMaiusculo + "/" + ano;
}

//CARREGAR DADOS
async function carregarDados() {
  const [resServicos, resDespesas, resClientes] = await Promise.all([
    fetch(API_SERVICOS),
    fetch(API_DESPESAS),
    fetch(API_CLIENTES),
  ]);

  const servicos = await resServicos.json();
  const despesas = await resDespesas.json();
  const clientes = await resClientes.json();

  atualizarCards(servicos, despesas);
  renderizarServicosRecentes(servicos);
  renderizarAtividade(servicos, clientes);
}

//CARDS
function atualizarCards(servicos, despesas) {
  const totalDespesas = despesas.reduce(function (acc, d) {
    return acc + d.valor;
  }, 0);

  const servicosPagos = servicos.filter(function (s) {
    return s.status === "Pago";
  });

  const totalReceitas = servicosPagos.reduce(function (acc, s) {
    return acc + s.valor;
  }, 0);

  const lucro = totalReceitas - totalDespesas;

  let margem;
  if (totalReceitas > 0) {
    margem = Math.round((lucro / totalReceitas) * 100);
  } else {
    margem = 0;
  }

  const pendentes = servicos.filter(function (s) {
    return s.status === "Pendente" || s.status === "Atrasado";
  });

  const totalPendentes = pendentes.reduce(function (acc, s) {
    return acc + s.valor;
  }, 0);

  const idsVistos = [];
  for (let i = 0; i < pendentes.length; i++) {
    const id = pendentes[i].clienteId;
    if (idsVistos.indexOf(id) === -1) {
      idsVistos.push(id);
    }
  }
  const clientesPendentes = idsVistos.length;

  document.getElementById("card-despesas").textContent =
    "R$ " + totalDespesas.toFixed(2).replace(".", ",");
  document.getElementById("card-despesas-detalhe").textContent =
    despesas.length + " lançamentos";

  document.getElementById("card-lucro").textContent =
    "R$ " + lucro.toFixed(2).replace(".", ",");
  document.getElementById("card-lucro-detalhe").textContent =
    "Margem " + margem + "%";

  document.getElementById("card-pendentes").textContent =
    "R$ " + totalPendentes.toFixed(2).replace(".", ",");
  document.getElementById("card-pendentes-detalhe").textContent =
    clientesPendentes + " cliente(s) em atraso";
}

//SERVIÇOS RECENTES
function renderizarServicosRecentes(servicos) {
  const tbody = document.getElementById("tabela-servicos-recentes");
  const recentes = servicos.slice(-5).reverse();

  tbody.innerHTML = "";

  recentes.forEach(function (servico) {
    let statusClass;
    if (servico.status === "Pago") {
      statusClass = "status-pago";
    } else if (servico.status === "Pendente") {
      statusClass = "status-pendente";
    } else {
      statusClass = "status-atrasado";
    }

    let nomeCliente;
    if (servico.cliente && servico.cliente.nome) {
      nomeCliente = servico.cliente.nome;
    } else {
      nomeCliente = "-";
    }

    const valorFormatado = "R$ " + servico.valor.toFixed(2).replace(".", ",");

    const linha = document.createElement("tr");

    linha.innerHTML =
      "<td>" +
      nomeCliente +
      "</td>" +
      "<td>" +
      servico.descricao +
      "</td>" +
      "<td>" +
      valorFormatado +
      "</td>" +
      "<td><span class='status-servico " +
      statusClass +
      "'>" +
      servico.status +
      "</span></td>";

    tbody.appendChild(linha);
  });
}

//ATIVIDADE RECENTE
function renderizarAtividade(servicos, clientes) {
  const container = document.getElementById("atividade-recente");
  const atividades = [];

  const servicosRecentes = servicos.slice(-3).reverse();

  servicosRecentes.forEach(function (s) {
    let icone;
    if (s.status === "Pago") {
      icone = "💰";
    } else {
      icone = "📋";
    }

    let nomeCliente;
    if (s.cliente && s.cliente.nome) {
      nomeCliente = s.cliente.nome;
    } else {
      nomeCliente = "cliente";
    }

    let texto;
    if (s.status === "Pago") {
      texto =
        "Pagamento recebido de " +
        nomeCliente +
        " — R$ " +
        s.valor.toFixed(2).replace(".", ",");
    } else {
      texto = "Novo serviço registrado para " + nomeCliente;
    }

    atividades.push({ icone: icone, texto: texto });
  });

  const clientesRecentes = clientes.slice(-2).reverse();

  clientesRecentes.forEach(function (c) {
    atividades.push({
      icone: "👤",
      texto: "Novo cliente cadastrado: " + c.nome,
    });
  });

  container.innerHTML = "";

  atividades.forEach(function (a) {
    const item = document.createElement("div");
    item.classList.add("atividade-item");

    item.innerHTML =
      "<span class='atividade-icone'>" +
      a.icone +
      "</span>" +
      "<span class='atividade-texto'>" +
      a.texto +
      "</span>";

    container.appendChild(item);
  });
}

//INICIAR
definirSaudacao();
carregarDados();
