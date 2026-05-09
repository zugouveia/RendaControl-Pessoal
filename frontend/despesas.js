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

const API_DESPESAS = "https://localhost:7058/api/despesas";
const API_SERVICOS = "https://localhost:7058/api/servicos";

const formDespesa = document.getElementById("form-despesa");
const tabelaDespesasBody = document.getElementById("tabela-despesas-body");
const tituloDespesa = document.getElementById("titulo-form-despesa");
const btnRegistrar = document.getElementById("btn-registrar-despesa");
const btnLimpar = document.getElementById("btn-limpar-despesa");

let todasDespesas = [];
let despesaEditandoId = null;

// CARREGAR DADOS
async function carregarDados() {
  const [resDespesas, resServicos] = await Promise.all([
    fetch(API_DESPESAS),
    fetch(API_SERVICOS),
  ]);

  todasDespesas = await resDespesas.json();
  const servicos = await resServicos.json();

  atualizarCards(todasDespesas, servicos);
  renderizarDespesas(todasDespesas);
}

//CARDS
function atualizarCards(despesas, servicos) {
  const totalDespesas = despesas.reduce(function (acc, d) {
    return acc + d.valor;
  }, 0);

  const servicosPagos = servicos.filter(function (s) {
    return s.status === "Pago";
  });

  const totalReceitas = servicosPagos.reduce(function (acc, s) {
    return acc + s.valor;
  }, 0);

  const saldo = totalReceitas - totalDespesas;

  document.getElementById("total-despesas").textContent =
    "R$ " + totalDespesas.toFixed(2).replace(".", ",");
  document.getElementById("detalhe-despesas").textContent =
    despesas.length + " lançamentos";
  document.getElementById("saldo-liquido").textContent =
    "R$ " + saldo.toFixed(2).replace(".", ",");

  if (totalReceitas > 0) {
    document.getElementById("detalhe-saldo").textContent =
      "Margem " + Math.round((saldo / totalReceitas) * 100) + "%";
  } else {
    document.getElementById("detalhe-saldo").textContent = "Sem receitas";
  }
}

//RENDERIZAR TABELA
function renderizarDespesas(despesas) {
  tabelaDespesasBody.innerHTML = "";

  despesas.forEach(function (despesa) {
    let data;
    if (despesa.data) {
      data = new Date(despesa.data).toLocaleDateString("pt-BR");
    } else {
      data = "-";
    }

    let categoriaExibida;
    if (despesa.categoria) {
      categoriaExibida = despesa.categoria;
    } else {
      categoriaExibida = "-";
    }

    const valorFormatado = "-R$ " + despesa.valor.toFixed(2).replace(".", ",");

    const linha = document.createElement("tr");

    linha.innerHTML =
      "<td>" +
      despesa.descricao +
      "</td>" +
      "<td>" +
      categoriaExibida +
      "</td>" +
      "<td>" +
      data +
      "</td>" +
      "<td class='valor-negativo'>" +
      valorFormatado +
      "</td>" +
      "<td>" +
      "<div style='display:flex;gap:8px;'>" +
      "<button class='btn-editar-despesa' data-id='" +
      despesa.id +
      "' title='Editar'><i class='fa-solid fa-pen-to-square'></i></button>" +
      "<button class='btn-deletar-despesa' data-id='" +
      despesa.id +
      "' title='Deletar'><i class='fa-solid fa-trash-can'></i></button>" +
      "</div>" +
      "</td>";

    tabelaDespesasBody.appendChild(linha);
  });

  // Editar
  document.querySelectorAll(".btn-editar-despesa").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(btn.dataset.id);
      const despesa = todasDespesas.find(function (d) {
        return d.id === id;
      });
      preencherFormDespesa(despesa);
    });
  });

  // Deletar
  document.querySelectorAll(".btn-deletar-despesa").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
      await fetch(API_DESPESAS + "/" + btn.dataset.id, { method: "DELETE" });
      carregarDados();
    });
  });
}

//PREENCHER FORMULARIO
function preencherFormDespesa(despesa) {
  despesaEditandoId = despesa.id;
  tituloDespesa.textContent = "EDITAR DESPESA";
  btnRegistrar.textContent = "Atualizar";

  if (despesa.descricao) {
    document.getElementById("input-descricao-despesa").value =
      despesa.descricao;
  } else {
    document.getElementById("input-descricao-despesa").value = "";
  }

  if (despesa.valor) {
    document.getElementById("input-valor-despesa").value = despesa.valor;
  } else {
    document.getElementById("input-valor-despesa").value = "";
  }

  if (despesa.data) {
    document.getElementById("input-data-despesa").value =
      despesa.data.split("T")[0];
  } else {
    document.getElementById("input-data-despesa").value = "";
  }

  if (despesa.categoria) {
    document.getElementById("input-categoria-despesa").value =
      despesa.categoria;
  } else {
    document.getElementById("input-categoria-despesa").value = "";
  }

  formDespesa.scrollIntoView({ behavior: "smooth" });
}

//RESETAR FORMULARIO
function resetarForm() {
  despesaEditandoId = null;
  tituloDespesa.textContent = "Registrar Nova Despesa";
  btnRegistrar.textContent = "Registrar";
  formDespesa.reset();
}

//SALVAR / ATUALIZAR
formDespesa.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const dados = {
    descricao: document.getElementById("input-descricao-despesa").value,
    valor: parseFloat(document.getElementById("input-valor-despesa").value),
    data: new Date(
      document.getElementById("input-data-despesa").value,
    ).toISOString(),
    categoria: document.getElementById("input-categoria-despesa").value,
  };

  if (despesaEditandoId) {
    dados.id = despesaEditandoId;
    await fetch(API_DESPESAS + "/" + despesaEditandoId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
  } else {
    // Criar nova despesa
    await fetch(API_DESPESAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
  }

  resetarForm();
  carregarDados();
});

//LIMPAR
btnLimpar.addEventListener("click", function () {
  resetarForm();
});

//INICIAR
carregarDados();
