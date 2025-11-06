export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const on = (el, evt, fn) => el && el.addEventListener(evt, fn);
export const go = (href) => (window.location.href = href);
export const toast = (msg) => alert(msg);

export const validate = {
  email: (v) => /\S+@\S+\.\S+/.test(v),
  min: (v, n) => (v ?? "").trim().length >= n,
  required: (v) => (v ?? "").trim().length > 0,
  number: (v) => /^\d+$/.test((v ?? "").replace(/\D/g, "")),
};

const AUTH_KEY = "ct.auth";
const USERS_KEY = "ct.users";

export const auth = {
  login(email) { localStorage.setItem(AUTH_KEY, JSON.stringify({ email, ts: Date.now() })); },
  logout() { localStorage.removeItem(AUTH_KEY); },
  current() { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } },
  isLoggedIn() { return !!auth.current(); }
};

export const users = {
  all() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } },
  save(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); },
  getByEmail(email) { return users.all().find(u => u.email === email); },
  add(user) {
    const list = users.all();
    if (list.some(u => u.email === user.email)) return false;
    list.push(user);
    users.save(list);
    return true;
  }
};

export const masks = {
  onlyDigits(input) { input.value = input.value.replace(/\D/g, ""); },
  phone(input) {
    let v = input.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    input.value = v;
  },
  cnpj(input) {
    let v = input.value.replace(/\D/g, "").slice(0,14);
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    input.value = v;
  }
};
