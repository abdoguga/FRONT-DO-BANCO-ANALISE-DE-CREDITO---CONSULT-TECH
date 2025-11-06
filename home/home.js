import { $, $$, on, auth, users, go, toast } from "/assets/js/utils.js";

const session = auth.current();
if (!session) go("/login/login.html");

const u = users.getByEmail(session.email) || {};
$("#userName").textContent = u?.nome || session.email.split("@")[0];
$("#userCompany").textContent = u?.empresa || "—";

const dashboardState = {
  saldo: 123456.78,
  proximaParcela: 1250.0,
  vencimento: "2025-11-25",
  movs: [
    { tipo: "out", titulo: "Pagamento Fornecedor Tech", data: "2025-10-20", valor: -5800.00 },
    { tipo: "in",  titulo: "Recebimento Cliente X",     data: "2025-10-19", valor: 15000.00 },
    { tipo: "out", titulo: "Compra de material de escritório", data: "2025-10-18", valor: -450.75 },
    { tipo: "out", titulo: "Pagamento de Contas (Água, Luz)",  data: "2025-10-17", valor: -890.50 },
    { tipo: "in",  titulo: "Recebimento Cliente Y",     data: "2025-10-17", valor: 7200.00 },
  ],
};

const fmtBRL = (n) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const fmtDateBR = (iso) => { const d = new Date(iso + "T00:00:00"); return d.toLocaleDateString("pt-BR"); };

const saldoEl = $("#saldoValor");
const parcelaValorEl = $("#parcelaValor");
const parcelaDataEl = $("#parcelaData");
function renderValores(){
  saldoEl.textContent = fmtBRL(dashboardState.saldo);
  parcelaValorEl.textContent = fmtBRL(dashboardState.proximaParcela);
  parcelaDataEl.textContent = fmtDateBR(dashboardState.vencimento);
}
renderValores();

const lista = $("#listaMovs");
function renderMovs(){
  lista.innerHTML = "";
  dashboardState.movs.forEach(m => {
    const li = document.createElement("li");
    li.className = "bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700";
    li.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="text-lg">${m.valor > 0 ? "⬇️" : "⬆️"}</span>
          <div>
            <p class="font-medium">${m.titulo}</p>
            <p class="text-slate-400 text-sm">${fmtDateBR(m.data)}</p>
          </div>
        </div>
        <div class="text-right ${m.valor < 0 ? "text-rose-400" : "text-green-400"} font-semibold">
          ${fmtBRL(m.valor)}
        </div>
      </div>`;
    lista.appendChild(li);
  });
  const empty = document.createElement("div");
  empty.className = "bg-slate-800/40 rounded-xl h-10 border border-slate-700/60 mt-2";
  lista.appendChild(empty);
}
renderMovs();

let saldoOculto = false;
on($("#toggleSaldo"), "click", () => {
  saldoOculto = !saldoOculto;
  saldoEl.textContent = saldoOculto ? "••••••••" : fmtBRL(dashboardState.saldo);
});

$$(".quickbtn").forEach(btn => on(btn, "click", () => toast("Em breve: ação rápida")));

// ====== MODAL RESUMO ======
const overlay = $("#resumoOverlay");
const closeBtn = $("#resumoClose");
const okBtn = $("#resumoOk");
const shareBtn = $("#resumoShare");
const rEntradas = $("#rEntradas");
const rSaidas = $("#rSaidas");
const rSaldo = $("#rSaldo");

function openResumo(entradas, saidas, saldo) {
  rEntradas.textContent = entradas.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  rSaidas.textContent   = saidas.toLocaleString("pt-BR",{style:"currency","currency":"BRL"});
  rSaldo.textContent    = saldo.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  overlay.classList.remove("hidden");
  okBtn.focus();
}
function closeResumo() { overlay.classList.add("hidden"); }

on(closeBtn, "click", closeResumo);
on(okBtn, "click", closeResumo);
on(overlay, "click", (e)=>{ if(e.target === overlay) closeResumo(); });
document.addEventListener("keydown", (e)=>{ if(e.key === "Escape") closeResumo(); });

on(shareBtn, "click", async ()=> {
  const t = `Resumo Financeiro
Entradas: ${rEntradas.textContent}
Saídas: ${rSaidas.textContent}
Saldo mov.: ${rSaldo.textContent}`;
  try {
    if (navigator.share) await navigator.share({ title:"Resumo", text:t });
    else { await navigator.clipboard.writeText(t); alert("Resumo copiado!"); }
  } catch {}
});

on($("#btnAnalise"), "click", () => {
  const total = dashboardState.movs.reduce((acc, m) => acc + m.valor, 0);
  const entradas = dashboardState.movs.filter(m => m.valor > 0).reduce((a,b)=>a+b.valor,0);
  const saidas   = dashboardState.movs.filter(m => m.valor < 0).reduce((a,b)=>a+b.valor,0);
  openResumo(entradas, saidas, total);
});

on($("#logout"), "click", () => {
  localStorage.removeItem("ct.auth");
  toast("Você saiu.");
  go("/login/login.html");
});
