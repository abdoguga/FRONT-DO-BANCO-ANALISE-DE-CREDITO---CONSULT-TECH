import { $, on, go, auth, users, toast } from "/assets/js/utils.js";
import { apiUsers } from "/assets/js/api.js";

const sess = auth.current();
if (!sess) go("/login/login.html");

let u = users.getByEmail(sess.email) || { email: sess.email };
// try { u = await apiUsers.getProfile(); } catch(e){}

$("#empresaTitle").textContent = u.empresa || "—";
$("#pNome").textContent  = u.nome || "—";
$("#pIdade").textContent = u.idade || "—";
$("#pCnpj").textContent  = u.cnpj || "—";
$("#pEmail").textContent = u.email || "—";
$("#pTel").textContent   = u.telefone || "—";

on($("#btnEditar"), "click", async () => {
  const novoTel = prompt("Atualizar telefone:", u.telefone || "");
  if (novoTel == null) return;
  const list = users.all().map(x => x.email === u.email ? { ...u, telefone: novoTel } : x);
  users.save(list);
  try { await apiUsers.updateProfile({ telefone: novoTel }); } catch (e) {}
  $("#pTel").textContent = novoTel;
  toast("Perfil atualizado.");
});
