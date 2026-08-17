// Base URL backend Flask. Di dev, .env bikin ini "http://localhost:5000".
// Kalau env var gak diisi, fallback ke localhost:5000 (default run.py).
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // wajib: /api/chat pakai session cookie buat inget riwayat obrolan
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error || "";
    } catch {
      // respons bukan JSON, biarkan detail kosong
    }
    throw new Error(detail || `Request ke ${path} gagal (${res.status})`);
  }
  return res.json();
}

export function getDivisi() {
  return apiFetch("/api/divisi");
}

export function getDivisiBySlug(slug) {
  return apiFetch(`/api/divisi/${slug}`);
}

export function getSyarat() {
  return apiFetch("/api/syarat");
}

export function getFasilitas() {
  return apiFetch("/api/fasilitas");
}

export function getVisitorStatus() {
  return apiFetch("/api/visitor");
}

export function registerVisitor(nama, noTelepon) {
  return apiFetch("/api/visitor", {
    method: "POST",
    body: JSON.stringify({ nama, no_telepon: noTelepon }),
  });
}

export function sendChatMessage(pesan) {
  return apiFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ pesan }),
  });
}
