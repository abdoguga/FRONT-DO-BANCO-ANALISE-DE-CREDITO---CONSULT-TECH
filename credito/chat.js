import { $, on, auth, go } from "/assets/js/utils.js";

if (!auth.current()) go("/login/login.html");

const chatBody = $("#chatBody");
const chatForm = $("#chatForm");
const chatInput = $("#chatInput");

const ctx = { step: 0, payload: { valor:null, motivo:null, faturamento:null, possuiDividas:null, tempoNegocioMeses:null } };

const brl = (n) => Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const scrollBottom = () => chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
function addBot(text, small=false){ const el=document.createElement("div"); el.className="msg bot"+(small?" small":""); el.textContent=text; chatBody.appendChild(el); scrollBottom(); }
function addUser(text){ const el=document.createElement("div"); el.className="msg user"; el.textContent=text; chatBody.appendChild(el); scrollBottom(); }
const onlyDigits = (s) => (s||"").replace(/[^\d]/g,""); const toNumber = (s)=>Number(onlyDigits(s));

function nextStep(){
  switch(ctx.step){
    case 0: addBot("Olá! Sou sua assistente de crédito inteligente da Consult Tech. Para começarmos, qual o valor que você gostaria de solicitar?"); break;
    case 1: addBot("Entendido. E qual o principal motivo ou objetivo para este empréstimo?"); break;
    case 2: addBot("Obrigado! Qual é o faturamento médio mensal da sua empresa?"); break;
    case 3: addBot("Você possui dívidas em aberto? (responda: sim ou não)"); break;
    case 4: addBot("Há quanto tempo o negócio está ativo? (em meses)"); break;
    case 5: simulateAnalysis(); break;
    default: addBot("Posso ajudar em algo mais?");
  }
}

async function simulateAnalysis(){
  addBot("Certo. Recebi todas as informações. Vou fazer uma análise rápida. Por favor, aguarde...", true);
  const { valor, motivo, faturamento, possuiDividas, tempoNegocioMeses } = ctx.payload;
  let score = 600;
  const parcela = valor/24, carga = parcela/Math.max(faturamento,1);
  if (carga < 0.2) score += 120; else if(carga < 0.35) score += 60; else if(carga < 0.5) score += 20; else score -= 100;
  if (possuiDividas === "sim") score -= 80;
  if (tempoNegocioMeses >= 24) score += 60; else if (tempoNegocioMeses >= 12) score += 30; else score -= 40;
  if (/estoque|expans/i.test(motivo)) score += 20;
  await new Promise(r=>setTimeout(r, 800));
  if (score >= 700){
    addBot("Boa notícia! Sua solicitação foi pré-aprovada ✅");
    addBot(`Valor solicitado: ${brl(valor)}\nPrazo estimado: 24 meses\nParcela aproximada: ${brl(valor/24)}\nTaxa simulada: a partir de 1,89% a.m.`, true);
    addBot("Um agente entrará em contato para finalizar sua proposta. Deseja receber por e-mail ou telefone?", true);
  } else {
    addBot("Após nossa análise, não foi possível aprovar sua solicitação de crédito no momento ❌");
    addBot("Isso pode ocorrer por políticas internas ou perfil de risco atual. Sugerimos tentar novamente em 3 meses ou reduzir o valor solicitado.", true);
    addBot("Posso ajudar em algo mais?");
  }
  ctx.step = 999;
}

on(chatForm, "submit", (e)=>{
  e.preventDefault();
  const text = chatInput.value.trim(); if(!text) return;
  addUser(text);
  switch(ctx.step){
    case 0: { const n=toNumber(text); if(n<=0){ addBot("Informe um valor válido (ex.: 10000)."); return; } ctx.payload.valor=n; ctx.step=1; break; }
    case 1: { ctx.payload.motivo=text; ctx.step=2; break; }
    case 2: { const n=toNumber(text); if(n<=0){ addBot("Informe um faturamento válido (ex.: 200000)."); return; } ctx.payload.faturamento=n; ctx.step=3; break; }
    case 3: { const t=text.toLowerCase(); if(!["sim","nao","não"].includes(t)){ addBot("Responda com 'sim' ou 'não'."); return; } ctx.payload.possuiDividas=(t==="sim"?"sim":"nao"); ctx.step=4; break; }
    case 4: { const n=toNumber(text); if(n<=0){ addBot("Informe o tempo em meses (ex.: 18)."); return; } ctx.payload.tempoNegocioMeses=n; ctx.step=5; break; }
    default: break;
  }
  chatInput.value = ""; nextStep();
});

nextStep();
