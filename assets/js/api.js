const API_BASE = "/api";

const TOKEN_KEY = "ct.token";
export const tokenStore = {
  set(t){ localStorage.setItem(TOKEN_KEY, t); },
  get(){ return localStorage.getItem(TOKEN_KEY); },
  clear(){ localStorage.removeItem(TOKEN_KEY); }
};

async function request(path, { method="GET", data, headers={}, params, auth=true, credentials="include" } = {}) {
  let url = API_BASE + path;
  if (params && typeof params === "object") {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }

  const h = new Headers(headers);
  if (!(data instanceof FormData)) h.set("Content-Type", "application/json");
  if (auth) {
    const t = tokenStore.get();
    if (t) h.set("Authorization", `Bearer ${t}`);
  }

  const res = await fetch(url, {
    method, headers: h, credentials,
    body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined
  });

  const isJSON = res.headers.get("content-type")?.includes("application/json");
  const payload = isJSON ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const msg = (payload && payload.message) || res.statusText || "Erro na requisição";
    const err = new Error(msg); err.status = res.status; err.payload = payload; throw err;
  }
  return payload;
}

export const apiAuth = {
  async login({ email, senha }) { return request("/auth/login", { method:"POST", data:{ email, senha }, auth:false }); },
  async me() { return request("/auth/me"); }
};

export const apiUsers = {
  async create(data) { return request("/users", { method:"POST", data, auth:false }); },
  async getProfile() { return request("/users/me"); },
  async updateProfile(data) { return request("/users/me", { method:"PUT", data }); }
};

export const apiPix = {
  async send({ chave, valor }) { return request("/pix/send", { method:"POST", data:{ chave, valor } }); },
  async createQr({ valor }) { return request("/pix/qr", { method:"POST", data:{ valor } }); }
};

export default { request, apiAuth, apiUsers, apiPix, tokenStore };
