const TOKEN_KEY = "biziq_token";

export const auth = {
  get token() { return localStorage.getItem(TOKEN_KEY); },
  set token(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); },
  get isAuthed() { return !!localStorage.getItem(TOKEN_KEY); },
  logout() { localStorage.removeItem(TOKEN_KEY); },
};

async function request(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.json);
    delete opts.json;
  }
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) {
    let msg = `${res.status}`;
    try { const j = await res.json(); msg = j.detail || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res;
}

export const api = {
  signup: (data) => request("/api/auth/signup", { method: "POST", json: data }),
  login: async (email, password) => {
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch("/api/auth/login", { method: "POST", body });
    if (!res.ok) throw new Error("Invalid email or password");
    return res.json();
  },
  me: () => request("/api/auth/me"),
  updateMe: (data) => request("/api/auth/me", { method: "PATCH", json: data }),

  uploadCsv: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return request("/api/datasets/upload", { method: "POST", body: fd });
  },
  listDatasets: () => request("/api/datasets"),
  getDataset: (id) => request(`/api/datasets/${id}`),
  deleteDataset: (id) => request(`/api/datasets/${id}`, { method: "DELETE" }),
  dashboard: (id) => request(`/api/datasets/${id}/dashboard`),
  summary: () => request("/api/dashboard/summary"),
  insights: (id) => request(`/api/datasets/${id}/insights`, { method: "POST" }),
  ask: (id, question) => request(`/api/datasets/${id}/ask`, { method: "POST", json: { question } }),
  reportUrl: (id) => `/api/datasets/${id}/report`,
};
