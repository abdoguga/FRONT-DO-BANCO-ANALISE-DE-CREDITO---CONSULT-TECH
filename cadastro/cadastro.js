import { $, on, validate, users, go, masks } from "/assets/js/utils.js";

const form      = $("#formCadastro");
const nome      = $("#nome");
const idade     = $("#idade");
const empresa   = $("#empresa");
const cnpj      = $("#cnpj");
const email     = $("#email");
const senha     = $("#senha");
const confirmar = $("#confirmar");
const msgBox    = $("#msg");

// máscaras
on(idade, "input", () => masks.onlyDigits(idade));
on(cnpj,  "input", () => masks.cnpj(cnpj));

function showMsg(text, type = "error") {
  msgBox.textContent = text;
  msgBox.classList.remove("hidden");
  msgBox.classList.toggle("border-rose-500", type === "error");
  msgBox.classList.toggle("bg-rose-500/10", type === "error");
  msgBox.classList.toggle("text-rose-200",  type === "error");
  msgBox.classList.toggle("border-emerald-500", type === "success");
  msgBox.classList.toggle("bg-emerald-500/10", type === "success");
  msgBox.classList.toggle("text-emerald-200",  type === "success");
}

function clearMsg() {
  msgBox.classList.add("hidden");
  msgBox.textContent = "";
}

function setError(input, hasError, msg = "") {
  input.classList.toggle("ring-2", hasError);
  input.classList.toggle("ring-rose-500", hasError);
  input.title = hasError ? msg : "";
}

function countDigits(str = "") {
  return (str.match(/\d/g) || []).length;
}

on(form, "submit", (e) => {
  e.preventDefault();
  clearMsg();
  [nome, idade, empresa, cnpj, email, senha, confirmar].forEach(i => setError(i, false));

  let ok = true;

  if (!validate.required(nome.value)) {
    setError(nome, true, "Informe seu nome."); ok = false;
  }
  if (!validate.number(idade.value) || Number(idade.value) <= 0) {
    setError(idade, true, "Idade deve conter apenas números."); ok = false;
  }
  if (!validate.required(empresa.value)) {
    setError(empresa, true, "Informe o nome da empresa."); ok = false;
  }
  if (countDigits(cnpj.value) !== 14) {
    setError(cnpj, true, "CNPJ deve ter 14 dígitos."); ok = false;
  }
  if (!validate.email(email.value)) {
    setError(email, true, "E-mail inválido."); ok = false;
  }
  if (!validate.min(senha.value, 6)) {
    setError(senha, true, "Senha mínima de 6 caracteres."); ok = false;
  }
  if (confirmar.value !== senha.value) {
    setError(confirmar, true, "As senhas não coincidem."); ok = false;
  }

  if (!ok) {
    showMsg("Corrija os campos destacados para continuar.", "error");
    return;
  }

  const data = {
    nome: nome.value.trim(),
    idade: idade.value.trim(),
    empresa: empresa.value.trim(),
    cnpj: cnpj.value.trim(),
    email: email.value.trim(),
    senha: senha.value
  };

  const added = users.add({ ...data });
  if (!added) {
    setError(email, true, "Já existe uma conta com este e-mail.");
    showMsg("Já existe uma conta com este e-mail.", "error");
    return;
  }

  // sucesso, sem popup
  showMsg("Conta criada com sucesso! Redirecionando para o login…", "success");
  setTimeout(() => go("/login/login.html"), 900);
});
