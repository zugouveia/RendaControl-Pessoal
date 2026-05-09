// PROTECAO DE ROTA
// Se o usuário não estiver logado, redireciona para o login.
if (!localStorage.getItem("usuarioId")) {
  window.location.href = "index.html";
}
// logout
document.querySelector(".botao-logout").addEventListener("click", function () {
  localStorage.clear();
  window.location.href = "index.html";
});


const API_SERVICOS =
  "https://rendacontrol-pessoal-production.up.railway.app/api/servicos";
const API_DESPESAS =
  "https://rendacontrol-pessoal-production.up.railway.app/api/despesas";
const API_CLIENTES =
  "https://rendacontrol-pessoal-production.up.railway.app/api/clientes";

const filtroPeriodo = document.getElementById("filtro-periodo");
const filtroCliente = document.getElementById("filtro-cliente");
const btnGerar = document.getElementById("btn-gerar");
const btnExportar = document.getElementById("btn-exportar");
const btnPDF = document.getElementById("btn-pdf");

let todosServicos = [];
let todasDespesas = [];

// ===== PREENCHER FILTRO DE PERÍODO =====
// Gera os últimos 12 meses como opções no select
function preencherFiltroPeriodo() {
  const agora = new Date();

  for (let i = 0; i < 12; i++) {
    // Cria uma data para cada mês passado
    const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);

    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();

    // Formata o valor como "2026-02" para facilitar o filtro
    let mesFormatado;
    if (mes < 10) {
      mesFormatado = "0" + mes;
    } else {
      mesFormatado = String(mes);
    }

    const valor = ano + "-" + mesFormatado;

    // Formata o texto visível como "Fevereiro 2026"
    const nomeMes = data.toLocaleString("pt-BR", { month: "long" });
    const nomeMesMaiusculo = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    const texto = nomeMesMaiusculo + " " + ano;

    const option = document.createElement("option");
    option.value = valor;
    option.textContent = texto;

    // O primeiro item (mês atual) fica selecionado por padrão
    if (i === 0) {
      option.selected = true;
    }

    filtroPeriodo.appendChild(option);
  }
}

// ===== PREENCHER FILTRO DE CLIENTES =====
async function preencherFiltroClientes() {
  const resposta = await fetch(API_CLIENTES);
  const clientes = await resposta.json();

  clientes.forEach(function (cliente) {
    const option = document.createElement("option");
    option.value = cliente.id;
    option.textContent = cliente.nome;
    filtroCliente.appendChild(option);
  });
}

// ===== CARREGAR TODOS OS DADOS =====
async function carregarDados() {
  const respostaServicos = await fetch(API_SERVICOS);
  const respostaDespesas = await fetch(API_DESPESAS);

  todosServicos = await respostaServicos.json();
  todasDespesas = await respostaDespesas.json();

  // Gera o relatório do mês atual automaticamente ao entrar na página
  gerarRelatorio();
}

// ===== GERAR RELATÓRIO =====
function gerarRelatorio() {
  const periodoSelecionado = filtroPeriodo.value;
  const clienteSelecionado = filtroCliente.value;

  // Filtra os serviços pelo período selecionado
  // O período está no formato "2026-02", então verificamos se a data do serviço começa com esse valor
  let servicosFiltrados = [];

  for (let i = 0; i < todosServicos.length; i++) {
    const servico = todosServicos[i];

    // Verifica se o serviço pertence ao período selecionado
    let dentroDoMes = false;
    if (servico.dataRealizacao) {
      // A data vem como "2026-02-12T00:00:00", pegamos só "2026-02"
      const mesDoServico = servico.dataRealizacao.substring(0, 7);
      if (mesDoServico === periodoSelecionado) {
        dentroDoMes = true;
      }
    }

    // Verifica se o serviço pertence ao cliente selecionado
    // Se nenhum cliente foi selecionado, inclui todos
    let pertenceAoCliente = false;
    if (clienteSelecionado === "") {
      pertenceAoCliente = true;
    } else {
      if (String(servico.clienteId) === String(clienteSelecionado)) {
        pertenceAoCliente = true;
      }
    }

    if (dentroDoMes && pertenceAoCliente) {
      servicosFiltrados.push(servico);
    }
  }

  // Filtra as despesas pelo período selecionado
  // Se um cliente específico foi selecionado, não mostra despesas gerais
  // pois despesas não pertencem a um cliente específico
  let despesasFiltradas = [];

  if (clienteSelecionado === "") {
    for (let i = 0; i < todasDespesas.length; i++) {
      const despesa = todasDespesas[i];

      let dentroDoMes = false;
      if (despesa.data) {
        const mêsDaDespesa = despesa.data.substring(0, 7);
        if (mêsDaDespesa === periodoSelecionado) {
          dentroDoMes = true;
        }
      }

      if (dentroDoMes) {
        despesasFiltradas.push(despesa);
      }
    }
  }

  // Calcula os totais
  let totalServicos = servicosFiltrados.length;
  let servicosPagos = 0;
  let servicosPendentes = 0;
  let servicosAtrasados = 0;
  let receitaBruta = 0;

  for (let i = 0; i < servicosFiltrados.length; i++) {
    const s = servicosFiltrados[i];
    receitaBruta = receitaBruta + s.valor;

    if (s.status === "Pago") {
      servicosPagos = servicosPagos + 1;
    } else if (s.status === "Pendente") {
      servicosPendentes = servicosPendentes + 1;
    } else if (s.status === "Atrasado") {
      servicosAtrasados = servicosAtrasados + 1;
    }
  }

  let totalDespesas = 0;
  for (let i = 0; i < despesasFiltradas.length; i++) {
    totalDespesas = totalDespesas + despesasFiltradas[i].valor;
  }

  const lucroLiquido = receitaBruta - totalDespesas;

  let margemLucro;
  if (receitaBruta > 0) {
    margemLucro = Math.round((lucroLiquido / receitaBruta) * 100);
  } else {
    margemLucro = 0;
  }

  // Atualiza os cards KPI
  document.getElementById("rel-despesas").textContent =
    "R$ " + totalDespesas.toFixed(2).replace(".", ",");
  document.getElementById("rel-despesas-detalhe").textContent =
    despesasFiltradas.length + " lançamentos";

  document.getElementById("rel-lucro").textContent =
    "R$ " + lucroLiquido.toFixed(2).replace(".", ",");
  document.getElementById("rel-lucro-detalhe").textContent =
    "Margem " + margemLucro + "%";

  document.getElementById("rel-servicos").textContent = totalServicos;
  document.getElementById("rel-servicos-detalhe").textContent =
    servicosPagos + " pagos · " + servicosPendentes + " pend.";

  // Atualiza o resumo do período
  document.getElementById("res-total-servicos").textContent = totalServicos;
  document.getElementById("res-pagos").textContent = servicosPagos;
  document.getElementById("res-pendentes").textContent = servicosPendentes;
  document.getElementById("res-atrasados").textContent = servicosAtrasados;
  document.getElementById("res-receita-bruta").textContent =
    "R$ " + receitaBruta.toFixed(2).replace(".", ",");
  document.getElementById("res-total-despesas").textContent =
    "R$ " + totalDespesas.toFixed(2).replace(".", ",");
  document.getElementById("res-lucro-liquido").textContent =
    "R$ " + lucroLiquido.toFixed(2).replace(".", ",");
  document.getElementById("res-margem").textContent = margemLucro + "%";
}

//GERAR PDF
// O window.print() abre a janela de impressão do navegador
// O usuário pode salvar como PDF diretamente pelo navegador
function gerarPDF() {
  window.print();
}

//EXPORTAR RELATÓRIO
//Gera um arquivo .txt com o resumo do relatório atual
function exportarRelatorio() {
  const periodo =
    filtroPeriodo.options[filtroPeriodo.selectedIndex].textContent;

  let clienteNome;
  if (filtroCliente.value === "") {
    clienteNome = "Todos os clientes";
  } else {
    clienteNome =
      filtroCliente.options[filtroCliente.selectedIndex].textContent;
  }

  //Monta o conteúdo do arquivo de texto
  const conteudo =
    "RENDACONTROL — RELATÓRIO FINANCEIRO\n" +
    "=====================================\n\n" +
    "Período: " +
    periodo +
    "\n" +
    "Cliente: " +
    clienteNome +
    "\n\n" +
    "RESUMO\n" +
    "------\n" +
    "Total de serviços:  " +
    document.getElementById("res-total-servicos").textContent +
    "\n" +
    "Serviços pagos:     " +
    document.getElementById("res-pagos").textContent +
    "\n" +
    "Serviços pendentes: " +
    document.getElementById("res-pendentes").textContent +
    "\n" +
    "Serviços atrasados: " +
    document.getElementById("res-atrasados").textContent +
    "\n\n" +
    "Receita bruta:      " +
    document.getElementById("res-receita-bruta").textContent +
    "\n" +
    "Total de despesas:  " +
    document.getElementById("res-total-despesas").textContent +
    "\n" +
    "Lucro líquido:      " +
    document.getElementById("res-lucro-liquido").textContent +
    "\n" +
    "Margem de lucro:    " +
    document.getElementById("res-margem").textContent +
    "\n\n" +
    "Gerado em: " +
    new Date().toLocaleString("pt-BR");

  // Cria um link temporario para fazer o download do arquivo
  const blob = new Blob([conteudo], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorio-" + filtroPeriodo.value + ".txt";
  link.click();

  // Libera a memória do link temporário
  URL.revokeObjectURL(url);
}

// EVENTOS
btnGerar.addEventListener("click", function () {
  gerarRelatorio();
});

btnPDF.addEventListener("click", function () {
  gerarPDF();
});

btnExportar.addEventListener("click", function () {
  exportarRelatorio();
});

//INICIAR
preencherFiltroPeriodo();
preencherFiltroClientes();
carregarDados();
