const API_USUARIOS =
  "https://rendacontrol-pessoal-production.up.railway.app/api/usuarios";

const abaEntrar = document.getElementById("aba-entrar");
const abaCadastrar = document.getElementById("aba-cadastrar");
const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
const mensagemErro = document.getElementById("auth-erro");
const btnEntrar = document.getElementById("btn-entrar");
const btnCadastrar = document.getElementById("btn-cadastrar");
const linkParaCadastro = document.getElementById("link-para-cadastro");
const linkParaLogin = document.getElementById("link-para-login");

const formRecuperar = document.getElementById("form-recuperar");
const linkRecuperar = document.getElementById("link-recuperar");
const linkVoltarLogin = document.getElementById("link-voltar-login");
const btnRecuperar = document.getElementById("btn-recuperar");

//VER SE JA TA LOGADO

if (localStorage.getItem("usuarioId")) {
  window.location.href = "dashboard.html";
}

// TROCAR ABAS LOGIN E CADASTRO
function mostrarLogin() {
  formLogin.style.display = "block";
  formCadastro.style.display = "none";
  abaEntrar.classList.add("ativa");
  abaCadastrar.classList.remove("ativa");
  mensagemErro.textContent = "";
}

function mostrarCadastro() {
  formLogin.style.display = "none";
  formCadastro.style.display = "block";
  abaEntrar.classList.remove("ativa");
  abaCadastrar.classList.add("ativa");
  mensagemErro.textContent = "";
}

abaEntrar.addEventListener("click", function () {
  mostrarLogin();
});

abaCadastrar.addEventListener("click", function () {
  mostrarCadastro();
});

linkParaCadastro.addEventListener("click", function (e) {
  e.preventDefault();
  mostrarCadastro();
});

linkParaLogin.addEventListener("click", function (e) {
  e.preventDefault();
  mostrarLogin();
});

//MOSTRAR ERRO
function mostrarErro(mensagem) {
  mensagemErro.textContent = mensagem;
}

//LOGIN
btnEntrar.addEventListener("click", async function () {
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;

  // Validacao antes do API
  if (!email || !senha) {
    mostrarErro("Preencha o e-mail e a senha.");
    return;
  }

  // Desabilitar botao
  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  const resposta = await fetch(API_USUARIOS + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, senha: senha }),
  });

  if (resposta.ok) {
    const usuario = await resposta.json();

    // Salva os dados do usuario no localStorage
    localStorage.setItem("usuarioId", usuario.id);
    localStorage.setItem("usuarioNome", usuario.nome);
    localStorage.setItem("usuarioEmail", usuario.email);

    // Redireciona para o dashboard
    window.location.href = "dashboard.html";
  } else {
    const erro = await resposta.json();

    // Mostra a mensagem de erro retornada pela API
    if (erro.mensagem) {
      mostrarErro(erro.mensagem);
    } else {
      mostrarErro("Erro ao fazer login. Tente novamente.");
    }

    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar na conta";
  }
});

//CADASTRO
btnCadastrar.addEventListener("click", async function () {
  const nome = document.getElementById("cadastro-nome").value;
  const email = document.getElementById("cadastro-email").value;
  const senha = document.getElementById("cadastro-senha").value;

  // Validacao antes API
  if (!nome || !email || !senha) {
    mostrarErro("Preencha todos os campos.");
    return;
  }

  if (senha.length < 6) {
    mostrarErro("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  // Desabilita o botão para evitar cliques duplos
  btnCadastrar.disabled = true;
  btnCadastrar.textContent = "Criando conta...";

  const resposta = await fetch(API_USUARIOS + "/cadastrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: nome, email: email, senha: senha }),
  });

  if (resposta.ok) {
    const usuario = await resposta.json();

    // Depois de cadastrar ja loga o usuário automaticamente
    localStorage.setItem("usuarioId", usuario.id);
    localStorage.setItem("usuarioNome", usuario.nome);
    localStorage.setItem("usuarioEmail", usuario.email);

    window.location.href = "dashboard.html";
  } else {
    const erro = await resposta.json();

    if (erro.mensagem) {
      mostrarErro(erro.mensagem);
    } else {
      mostrarErro("Erro ao criar conta. Tente novamente.");
    }

    btnCadastrar.disabled = false;
    btnCadastrar.textContent = "Criar conta";
  }
});

//Recuperar senha
function mostrarRecuperar() {
  formLogin.style.display = "none";
  formCadastro.style.display = "none";
  formRecuperar.style.display = "block";
  abaEntrar.classList.remove("ativa");
  abaCadastrar.classList.remove("ativa");
  mensagemErro.textContent = "";
}

linkRecuperar.addEventListener("click", function (e) {
  e.preventDefault();
  mostrarRecuperar();
});

linkVoltarLogin.addEventListener("click", function (e) {
  e.preventDefault();
  mostrarLogin();
});

btnRecuperar.addEventListener("click", async function () {
  const email = document.getElementById("recuperar-email").value;
  const novaSenha = document.getElementById("recuperar-senha").value;

  if (!email || !novaSenha) {
    mostrarErro("Preencha o e-mail e a nova senha.");
    return;
  }

  if (novaSenha.length < 6) {
    mostrarErro("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  btnRecuperar.disabled = true;
  btnRecuperar.textContent = "Redefinindo...";

  try {
    const resposta = await fetch(API_AUTH + "/recuperar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, novaSenha: novaSenha }),
    });

    if (resposta.ok) {
      mensagemErro.style.color = "green";
      mensagemErro.textContent = "Senha redefinida! Faça login.";
      mostrarLogin();
    } else {
      const texto = await resposta.text();
      mostrarErro(texto || "E-mail não encontrado.");
    }
  } catch (error) {
    mostrarErro("Erro ao conectar. Tente novamente.");
  }

  btnRecuperar.disabled = false;
  btnRecuperar.textContent = "Redefinir senha";
});
