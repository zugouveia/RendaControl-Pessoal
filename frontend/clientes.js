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

const API_URL = "https://localhost:7058/api/clientes";
const API_SERVICOS = "https://localhost:7058/api/servicos";

const campoBusca = document.querySelector(".campo-busca");
const tabelaBody = document.querySelector(".tabela-clientes tbody");
const tituloHistorico = document.querySelector(".painel-historico h2");
const historicoLista = document.querySelector(".historico-lista");
const btnCancelar = document.querySelector(".btn-cancelar");
const formulario = document.querySelector(".form-cadastro");
const tituloCadastro = document.querySelector(".coluna-acoes .painel-title");
const btnSalvar = document.querySelector(".btn-salvar");

let todosClientes = [];
let clienteEditandoId = null;

//CARREGAR CLIENTES
async function carregarClientes() {
  const respostaClientes = await fetch(API_URL);
  const respostaServicos = await fetch(API_SERVICOS);

  todosClientes = await respostaClientes.json();
  const todosServicos = await respostaServicos.json();

  atualizarCards(todosClientes);
  renderizarClientes(todosClientes, todosServicos);
}

//ATUALIZAR CARDS
function atualizarCards(clientes) {
  const total = clientes.length;

  const ativos = clientes.filter(function (c) {
    return c.status === "Ativo";
  }).length;

  let percentAtivos;
  if (total > 0) {
    percentAtivos = Math.round((ativos / total) * 100);
  } else {
    percentAtivos = 0;
  }

  document.querySelector(
    ".resumo-grade .resumo-cartao:nth-child(1) .resumo-valor",
  ).textContent = total;
  document.querySelector(
    ".resumo-grade .resumo-cartao:nth-child(1) .resumo-detalhe",
  ).textContent = "+" + total + " cadastrados";
  document.querySelector(
    ".resumo-grade .resumo-cartao:nth-child(2) .resumo-valor",
  ).textContent = ativos;
  document.querySelector(
    ".resumo-grade .resumo-cartao:nth-child(2) .resumo-detalhe",
  ).textContent = percentAtivos + "% da base";
}

//RENDERIZAR TABELA
function renderizarClientes(clientes, todosServicos) {
  tabelaBody.innerHTML = "";

  clientes.forEach(function (cliente) {
    const linha = document.createElement("tr");

    // Contar quantos servicos pertencem a este cliente
    let totalServicos = 0;
    for (let i = 0; i < todosServicos.length; i++) {
      if (todosServicos[i].clienteId === cliente.id) {
        totalServicos = totalServicos + 1;
      }
    }

    let statusAtivo = "";
    let statusInadimplente = "";
    let statusNovo = "";

    if (cliente.status === "Novo") {
      statusNovo = "selected";
    } else if (cliente.status === "Ativo") {
      statusAtivo = "selected";
    } else if (cliente.status === "Inadimplente") {
      statusInadimplente = "selected";
    }

    let classeStatus = "";
    if (cliente.status) {
      classeStatus = cliente.status.toLowerCase();
    }

    let telefoneExibido;
    if (cliente.telefone) {
      telefoneExibido = cliente.telefone;
    } else {
      telefoneExibido = "-";
    }

    linha.innerHTML =
      "<td><strong>" +
      cliente.nome +
      "</strong></td>" +
      "<td>" +
      telefoneExibido +
      "</td>" +
      "<td>" +
      totalServicos +
      "</td>" +
      "<td>" +
      "<select class='status-cliente " +
      classeStatus +
      "' data-id='" +
      cliente.id +
      "'>" +
      "<option value='Novo' " +
      statusNovo +
      ">Novo</option>" +
      "<option value='Ativo' " +
      statusAtivo +
      ">Ativo</option>" +
      "<option value='Inadimplente' " +
      statusInadimplente +
      ">Inadimplente</option>" +
      "</select>" +
      "</td>" +
      "<td>" +
      "<div style='display:flex;gap:10px;'>" +
      "<button class='btn-editar-cliente' data-id='" +
      cliente.id +
      "' title='Editar'><i class='fa-solid fa-pen-to-square'></i></button>" +
      "<button class='btn-deletar-cliente' data-id='" +
      cliente.id +
      "' title='Deletar'><i class='fa-solid fa-trash-can'></i></button>" +
      "</div>" +
      "</td>";

    //Carrega historico quando clica no cliente
    linha.addEventListener("click", function (e) {
      if (e.target.closest("select") || e.target.closest("button")) return;

      document
        .querySelectorAll(".tabela-clientes tbody tr")
        .forEach(function (l) {
          l.classList.remove("linha-selecionada");
        });

      linha.classList.add("linha-selecionada");
      carregarHistorico(cliente.id, cliente.nome);
    });

    tabelaBody.appendChild(linha);
  });

  //Status
  document.querySelectorAll(".status-cliente").forEach(function (select) {
    select.addEventListener("change", async function () {
      const id = select.dataset.id;
      const novoStatus = select.value;
      select.className = "status-cliente " + novoStatus.toLowerCase();
      await atualizarStatus(id, novoStatus);
      await carregarClientes();
    });
  });

  //Editar
  document.querySelectorAll(".btn-editar-cliente").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(btn.dataset.id);
      const cliente = todosClientes.find(function (c) {
        return c.id === id;
      });
      preencherFormulario(cliente);
    });
  });

  //Deletar
  document.querySelectorAll(".btn-deletar-cliente").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      const id = btn.dataset.id;
      if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
      await fetch(API_URL + "/" + id, { method: "DELETE" });
      carregarClientes();
    });
  });
}

//PREENCHER FORMULARIO PARA EDITAR
function preencherFormulario(cliente) {
  clienteEditandoId = cliente.id;
  tituloCadastro.textContent = "EDITAR CLIENTE";
  btnSalvar.textContent = "Atualizar";

  if (cliente.nome) {
    document.querySelector('input[placeholder="Nome do cliente"]').value =
      cliente.nome;
  } else {
    document.querySelector('input[placeholder="Nome do cliente"]').value = "";
  }

  if (cliente.telefone) {
    document.querySelector('input[placeholder="(11) 99999-0000"]').value =
      cliente.telefone;
  } else {
    document.querySelector('input[placeholder="(11) 99999-0000"]').value = "";
  }

  if (cliente.email) {
    document.querySelector('input[placeholder="email@exemplo.com"]').value =
      cliente.email;
  } else {
    document.querySelector('input[placeholder="email@exemplo.com"]').value = "";
  }

  if (cliente.endereco) {
    document.querySelector('input[placeholder="Rua, número, cidade"]').value =
      cliente.endereco;
  } else {
    document.querySelector('input[placeholder="Rua, número, cidade"]').value =
      "";
  }

  formulario.scrollIntoView({ behavior: "smooth" });
}

//RESETAR FORMULaRIO
function resetarFormulario() {
  clienteEditandoId = null;
  tituloCadastro.textContent = "CADASTRAR NOVO CLIENTE";
  btnSalvar.textContent = "Salvar";
  formulario.reset();
}

//SALVAR / ATUALIZAR CLIENTE
formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  let statusDoCliente;
  if (clienteEditandoId) {
    const clienteAtual = todosClientes.find(function (c) {
      return c.id === clienteEditandoId;
    });
    if (clienteAtual && clienteAtual.status) {
      statusDoCliente = clienteAtual.status;
    } else {
      statusDoCliente = "Novo";
    }
  } else {
    statusDoCliente = "Novo";
  }

  const dadosCliente = {
    nome: document.querySelector('input[placeholder="Nome do cliente"]').value,
    telefone: document.querySelector('input[placeholder="(11) 99999-0000"]')
      .value,
    email: document.querySelector('input[placeholder="email@exemplo.com"]')
      .value,
    endereco: document.querySelector('input[placeholder="Rua, número, cidade"]')
      .value,
    status: statusDoCliente,
  };

  if (clienteEditandoId) {
    //Editar cliente a criado
    dadosCliente.id = clienteEditandoId;
    await fetch(API_URL + "/" + clienteEditandoId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosCliente),
    });
  } else {
    //Criar novo cliente
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosCliente),
    });
  }

  resetarFormulario();
  carregarClientes();
});

//HISTORICO
async function carregarHistorico(clienteId, nomeCliente) {
  tituloHistorico.textContent = "Histórico — " + nomeCliente;
  historicoLista.innerHTML =
    "<p style='font-size:0.85rem;color:#9ca3af'>Carregando...</p>";

  const resposta = await fetch(API_SERVICOS + "/cliente/" + clienteId);
  const servicos = await resposta.json();

  if (servicos.length === 0) {
    historicoLista.innerHTML =
      "<p style='font-size:0.85rem;color:#9ca3af'>Nenhum serviço encontrado.</p>";
    return;
  }

  historicoLista.innerHTML = "";

  servicos.forEach(function (servico) {
    const data = new Date(servico.dataRealizacao).toLocaleDateString("pt-BR");

    let statusClass;
    if (servico.status === "Pago") {
      statusClass = "status-pago";
    } else if (servico.status === "Pendente") {
      statusClass = "status-pendente";
    } else {
      statusClass = "status-atrasado";
    }

    const valorFormatado = "R$ " + servico.valor.toFixed(2).replace(".", ",");

    const item = document.createElement("article");
    item.classList.add("historico-item");

    item.innerHTML =
      "<div class='historico-info'>" +
      "<h3>" +
      servico.descricao +
      "</h3>" +
      "<time>" +
      data +
      "</time>" +
      "</div>" +
      "<div class='historico-valores'>" +
      "<strong>" +
      valorFormatado +
      "</strong>" +
      "<span class='" +
      statusClass +
      "'>" +
      servico.status +
      "</span>" +
      "</div>";

    historicoLista.appendChild(item);
  });
}

//ATUALIZAR STATUS
async function atualizarStatus(id, novoStatus) {
  const resposta = await fetch(API_URL + "/" + id);
  const cliente = await resposta.json();
  cliente.status = novoStatus;
  await fetch(API_URL + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
}

//BUSCAR
campoBusca.addEventListener("input", function () {
  const termo = campoBusca.value.toLowerCase();

  document
    .querySelectorAll(".tabela-clientes tbody tr")
    .forEach(function (linha) {
      const nome = linha.querySelector("strong").innerText.toLowerCase();

      if (nome.includes(termo)) {
        linha.style.display = "";
      } else {
        linha.style.display = "none";
      }
    });
});

//CANCELAR
btnCancelar.addEventListener("click", function () {
  resetarFormulario();
});

//INICIAR
carregarClientes();
