import { $, $$, on, toast, validate, go, auth, users } from "/assets/js/utils.js";
import { apiPix } from "/assets/js/api.js";

if (!auth.current()) go("/login/login.html");

const tabs = $$(".tab");
const painelEnviar = $("#tab-enviar");
const painelReceber = $("#tab-receber");

// Elementos do Modal
const pixModal = $("#pixModal");
const btnCloseModal = $("#btnCloseModal");
const btnNewPix = $("#btnNewPix");
const btnCompartilhar = $("#btnCompartilhar");

// Função para formatar o valor para Real
const brl = (n) => Number(n || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

// Função para fechar o Modal
const closeModal = () => {
  pixModal.classList.remove("open");
  // Limpa os campos após fechar o pop-up
  chave.value = "";
  valor.value = "";
};

// Eventos de fechar o modal (X, botão "Novo Pix", clique no fundo)
on(btnCloseModal, "click", closeModal);
on(btnNewPix, "click", closeModal);
on(pixModal, "click", (e) => {
  if (e.target === pixModal) closeModal();
});


// Função para preencher os dados do comprovante no modal
const setComprovanteData = (tx) => {
  const set = (id, v) => document.getElementById(id).textContent = v ?? "—";
  set("vValor", brl(tx.valor));
  set("vDataHora", tx.dataHora);
  set("vId", tx.id);
  set("vDe", tx.de);
  set("vCnpj", tx.cnpjPagador);
  set("vPara", tx.para);
  set("vChave", tx.chavePix);
  set("vInst", tx.instituicao);

  // Lógica do botão Compartilhar
  // O 'true' no final garante que o listener seja removido e recolocado, evitando múltiplos eventos
  on(btnCompartilhar, "click", async () => {
    const texto = `Comprovante Pix\nValor: ${brl(tx.valor)}\nData/Hora: ${tx.dataHora}\nID: ${tx.id}`;
    try {
      if (navigator.share) await navigator.share({ title:"Comprovante Pix", text:texto });
      else { await navigator.clipboard.writeText(texto); toast("Comprovante copiado!"); }
    } catch { toast("Não foi possível compartilhar/copiar."); }
  }, true);
};


// Lógica de Tabs (Envio/Recebimento)
tabs.forEach(t => on(t, "click", () => {
  tabs.forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  const tab = t.getAttribute("data-tab");
  painelEnviar.classList.toggle("hidden", tab !== "enviar");
  painelReceber.classList.toggle("hidden", tab !== "receber");
}));

const chave = $("#pixChave");
const valor = $("#pixValor");

// Lógica de formatação de valor
on(valor, "input", () => {
  const v = valor.value.replace(/[^\d]/g,"");
  const n = (parseInt(v || "0", 10) / 100).toFixed(2);
  valor.value = n.replace(".", ",");
});

// Lógica para enviar o Pix e abrir o Modal
on($("#btnContinuar"), "click", async () => {
  const vChave = chave.value.trim();
  const vValor = valor.value.replace(/\./g,"").replace(",", ".").trim();
  const numVal = Number(vValor);

  if (!validate.required(vChave) || !(numVal > 0)) {
    toast("Informe chave e valor válidos.");
    return;
  }

  try {
    // const resp = await apiPix.send({ chave: vChave, valor: numVal });
    const u = users.getByEmail(auth.current().email) || {};
    const tx = {
      valor: numVal,
      dataHora: new Date().toLocaleString("pt-BR"),
      id: Math.random().toString(36).slice(2),
      de: u.empresa || "Minha Empresa",
      cnpjPagador: u.cnpj || "00.000.000/0001-00",
      para: "Empresa Teste Recebedora",
      chavePix: vChave,
      instituicao: "Consult Tech"
    };
    sessionStorage.setItem("ct.pix.lastTx", JSON.stringify(tx));
    
    // 1. Preenche os dados do comprovante no modal
    setComprovanteData(tx); 
    
    // 2. Abre o modal com o fundo desfocado
    pixModal.classList.add("open");
    
  } catch (err) {
    toast(`Falha ao enviar Pix: ${err.message || "erro"}`);
  }
});

// Lógica de copiar (Recebimento) - Mantida
on($("#btnCopiar"), "click", async () => {
  const code = "00020126400014BR.GOV.BCB.PIX0114chave@pix.com5204000053039865405100.005802BR5921Empresa Exemplo6009Sao Paulo62130510ABCDEF12345";
  try { await navigator.clipboard.writeText(code); toast("Código copiado!"); } catch { toast("Não foi possível copiar."); }
});
