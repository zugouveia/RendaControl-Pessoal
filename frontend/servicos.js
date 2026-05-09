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

const API_SERVICOS =
  "https://rendacontrol-pessoal-production.up.railway.app/api/servicos";
const API_CLIENTES =
  "https://rendacontrol-pessoal-production.up.railway.app/api/clientes";

const formServico = document.getElementById("form-servico");
const tabelaServicosBody = document.getElementById("tabela-servicos-body");
const selectCliente = document.getElementById("select-cliente");
const filtroStatus = document.getElementById("filtro-status");
const btnLimpar = document.getElementById("btn-limpar");
const tituloForm = document.getElementById("titulo-form-servico");
const btnRegistrar = document.getElementById("btn-registrar");

let todosServicos = [];
let servicoEditandoId = null;

//CARREGAR CLIENTES NO SELECT
async function carregarClientesSelect() {
  const resposta = await fetch(API_CLIENTES);
  const clientes = await resposta.json();
  selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';

  clientes.forEach(function (cliente) {
    const option = document.createElement("option");
    option.value = cliente.id;
    option.textContent = cliente.nome;
    selectCliente.appendChild(option);
  });
}

//CARREGAR SERVIÇOS
async function carregarServicos() {
  const resposta = await fetch(API_SERVICOS);
  todosServicos = await resposta.json();
  atualizarCards(todosServicos);
  renderizarServicos(todosServicos);
}

//CARDS
function atualizarCards(servicos) {
  const total = servicos.length;

  const receita = servicos.reduce(function (acc, s) {
    return acc + s.valor;
  }, 0);

  const pagos = servicos.filter(function (s) {
    return s.status === "Pago";
  }).length;

  let taxa;
  if (total > 0) {
    taxa = Math.round((pagos / total) * 100);
  } else {
    taxa = 0;
  }

  document.getElementById("total-servicos").textContent = total;
  document.getElementById("total-receita").textContent =
    "R$ " + receita.toFixed(2).replace(".", ",");

  if (total > 0) {
    document.getElementById("ticket-medio").textContent =
      "R$ " + (receita / total).toFixed(2).replace(".", ",");
  } else {
    document.getElementById("ticket-medio").textContent = "R$ 0";
  }

  document.getElementById("taxa-pagamento").textContent = taxa + "%";
  document.getElementById("detalhe-pagamento").textContent =
    pagos + " de " + total + " pagos";
}

//RENDERIZAR TABELA
function renderizarServicos(servicos) {
  tabelaServicosBody.innerHTML = "";

  servicos.forEach(function (servico) {
    const linha = document.createElement("tr");

    let nomeCliente;
    if (servico.cliente && servico.cliente.nome) {
      nomeCliente = servico.cliente.nome;
    } else {
      nomeCliente = "-";
    }

    let classeStatus;
    if (servico.status) {
      classeStatus = servico.status.toLowerCase();
    } else {
      classeStatus = "";
    }

    //Qual option do select fica selecionado
    let selecionadoPendente = "";
    let selecionadoPago = "";
    let selecionadoAtrasado = "";

    if (servico.status === "Pendente") {
      selecionadoPendente = "selected";
    } else if (servico.status === "Pago") {
      selecionadoPago = "selected";
    } else if (servico.status === "Atrasado") {
      selecionadoAtrasado = "selected";
    }

    const valorFormatado = "R$ " + servico.valor.toFixed(2).replace(".", ",");

    linha.innerHTML =
      "<td>" +
      servico.descricao +
      "</td>" +
      "<td>" +
      nomeCliente +
      "</td>" +
      "<td>" +
      valorFormatado +
      "</td>" +
      "<td>" +
      "<select class='status-servico-select " +
      classeStatus +
      "' data-id='" +
      servico.id +
      "'>" +
      "<option value='Pendente' " +
      selecionadoPendente +
      ">Pendente</option>" +
      "<option value='Pago' " +
      selecionadoPago +
      ">Pago</option>" +
      "<option value='Atrasado' " +
      selecionadoAtrasado +
      ">Atrasado</option>" +
      "</select>" +
      "</td>" +
      "<td>" +
      "<div style='display:flex;gap:10px;'>" +
      "<button class='btn-editar-servico' data-id='" +
      servico.id +
      "' title='Editar'><i class='fa-solid fa-pen-to-square'></i></button>" +
      "<button class='btn-deletar-servico' data-id='" +
      servico.id +
      "' title='Deletar'><i class='fa-solid fa-trash-can'></i></button>" +
      "</div>" +
      "</td>";

    tabelaServicosBody.appendChild(linha);
  });

  //Status
  document
    .querySelectorAll(".status-servico-select")
    .forEach(function (select) {
      select.addEventListener("change", async function () {
        const id = select.dataset.id;
        const novoStatus = select.value;
        select.className = "status-servico-select " + novoStatus.toLowerCase();
        await atualizarStatusServico(id, novoStatus);
        await carregarServicos();
      });
    });

  //Editar
  document.querySelectorAll(".btn-editar-servico").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(btn.dataset.id);
      const servico = todosServicos.find(function (s) {
        return s.id === id;
      });
      preencherFormServico(servico);
    });
  });

  //Deletar
  document.querySelectorAll(".btn-deletar-servico").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
      await fetch(API_SERVICOS + "/" + btn.dataset.id, { method: "DELETE" });
      carregarServicos();
    });
  });
}

//PREENCHER FORMULARIO PARA EDITAR
function preencherFormServico(servico) {
  servicoEditandoId = servico.id;
  tituloForm.textContent = "EDITAR SERVIÇO";
  btnRegistrar.textContent = "Atualizar";

  selectCliente.value = servico.clienteId;

  if (servico.descricao) {
    document.getElementById("input-descricao").value = servico.descricao;
  } else {
    document.getElementById("input-descricao").value = "";
  }

  if (servico.dataRealizacao) {
    document.getElementById("input-data").value =
      servico.dataRealizacao.split("T")[0];
  } else {
    document.getElementById("input-data").value = "";
  }

  if (servico.valor) {
    document.getElementById("input-valor").value = servico.valor;
  } else {
    document.getElementById("input-valor").value = "";
  }

  if (servico.formaPagamento) {
    document.getElementById("select-pagamento").value = servico.formaPagamento;
  } else {
    document.getElementById("select-pagamento").value = "PIX";
  }

  if (servico.materiaisUtilizados) {
    document.getElementById("input-materiais").value =
      servico.materiaisUtilizados;
  } else {
    document.getElementById("input-materiais").value = "";
  }

  if (servico.status) {
    document.getElementById("select-status").value = servico.status;
  } else {
    document.getElementById("select-status").value = "Pendente";
  }

  formServico.scrollIntoView({ behavior: "smooth" });
}

//RESETAR FORMULÁRIO
function resetarFormServico() {
  servicoEditandoId = null;
  tituloForm.textContent = "REGISTRAR NOVO SERVIÇO";
  btnRegistrar.textContent = "Registrar";
  formServico.reset();
}

//SALVAR / ATUALIZAR SERVIÇO
formServico.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  let dataRealizacao;
  if (document.getElementById("input-data").value) {
    dataRealizacao = document.getElementById("input-data").value;
  } else {
    dataRealizacao = new Date().toISOString();
  }

  const dados = {
    clienteId: parseInt(selectCliente.value),
    descricao: document.getElementById("input-descricao").value,
    dataRealizacao: dataRealizacao,
    valor: parseFloat(document.getElementById("input-valor").value),
    formaPagamento: document.getElementById("select-pagamento").value,
    materiaisUtilizados: document.getElementById("input-materiais").value,
    status: document.getElementById("select-status").value,
  };

  if (servicoEditandoId) {
    dados.id = servicoEditandoId;
    await fetch(API_SERVICOS + "/" + servicoEditandoId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
  } else {
    // Criar novo serviço
    await fetch(API_SERVICOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
  }

  resetarFormServico();
  carregarServicos();
});

//ATUALIZAR STATUS
async function atualizarStatusServico(id, novoStatus) {
  const resposta = await fetch(API_SERVICOS + "/" + id);
  const servico = await resposta.json();
  servico.status = novoStatus;
  await fetch(API_SERVICOS + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(servico),
  });
}

//FILTRO
filtroStatus.addEventListener("change", function () {
  const filtro = filtroStatus.value;

  let filtrados;
  if (filtro) {
    filtrados = todosServicos.filter(function (s) {
      return s.status === filtro;
    });
  } else {
    filtrados = todosServicos;
  }

  renderizarServicos(filtrados);
});

//LIMPAR
btnLimpar.addEventListener("click", function () {
  resetarFormServico();
});

//INICIAR
carregarClientesSelect();
carregarServicos();
