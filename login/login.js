import { $, on, validate, users, auth, toast, go } from "/assets/js/utils.js";
const form  = $("#formLogin");
const email = $("#email");
const senha = $("#senha");
on(form, "submit", (e) => {
  e.preventDefault();
  const em = email.value.trim();
  const pw = senha.value;
  if (!validate.email(em) || !validate.min(pw, 3)) { toast("Verifique e-mail e senha."); return; }
  const u = users.getByEmail(em);
  if (!u || u.senha !== pw) { toast("Credenciais inválidas."); return; }
  auth.login(em); toast("Login realizado!"); go("/home/home.html");
});
