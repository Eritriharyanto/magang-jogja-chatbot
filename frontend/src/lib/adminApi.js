import { API_BASE } from "@/lib/api";

async function adminFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // respons kosong (mis. 204), biarkan body null
  }
  if (!res.ok) {
    const err = new Error(
      body?.error || `Request ke ${path} gagal (${res.status})`,
    );
    err.status = res.status;
    throw err;
  }
  return body;
}

// --- Auth ---
export const login = (username, password) =>
  adminFetch("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
export const logout = () => adminFetch("/api/admin/logout", { method: "POST" });
export const me = () => adminFetch("/api/admin/me");

// --- Upload icon posisi ---
export async function uploadIcon(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/admin/upload/icon`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // respons kosong, biarkan body null
  }
  if (!res.ok) {
    const err = new Error(body?.error || `Upload gagal (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

// --- Divisi (posisi magang) ---
export const listDivisi = () => adminFetch("/api/admin/divisi");
export const createDivisi = (data) =>
  adminFetch("/api/admin/divisi", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateDivisi = (id, data) =>
  adminFetch(`/api/admin/divisi/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteDivisi = (id) =>
  adminFetch(`/api/admin/divisi/${id}`, { method: "DELETE" });

// --- Konten (syarat / fasilitas) ---
export const listKonten = (kategori) =>
  adminFetch(`/api/admin/konten/${kategori}`);
export const createKonten = (kategori, data) =>
  adminFetch(`/api/admin/konten/${kategori}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateKonten = (itemId, data) =>
  adminFetch(`/api/admin/konten/item/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteKonten = (itemId) =>
  adminFetch(`/api/admin/konten/item/${itemId}`, { method: "DELETE" });

// --- Intents (FAQ statis chatbot) ---
export const listIntents = () => adminFetch("/api/admin/intents");
export const createIntent = (data) =>
  adminFetch("/api/admin/intents", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateIntent = (nama, data) =>
  adminFetch(`/api/admin/intents/${encodeURIComponent(nama)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteIntent = (nama) =>
  adminFetch(`/api/admin/intents/${encodeURIComponent(nama)}`, {
    method: "DELETE",
  });

// --- Riwayat chat ---
export const listRiwayat = () => adminFetch("/api/admin/riwayat");
export const getTranscript = (visitorId) =>
  adminFetch(`/api/admin/riwayat/${visitorId}`);
export const deleteRiwayat = (visitorId) =>
  adminFetch(`/api/admin/riwayat/${visitorId}`, { method: "DELETE" });
export const bulkDeleteRiwayat = (ids) =>
  adminFetch("/api/admin/riwayat/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
export const deleteAllRiwayat = () =>
  adminFetch("/api/admin/riwayat/all", { method: "DELETE" });
// Bukan JSON — link download langsung (browser yang handle attachment-nya,
// sesi login tetap kepakai karena ini navigasi biasa, bukan fetch()).
export const exportRiwayatUrl = (visitorId) =>
  `${API_BASE}/api/admin/riwayat/${visitorId}/export`;
export const exportAllRiwayatUrl = () =>
  `${API_BASE}/api/admin/riwayat/export-all`;

// --- Knowledge base (isi pengetahuan chatbot AI) ---
export const getKnowledge = () => adminFetch("/api/admin/knowledge");
export const updateInformasiProgram = (data) =>
  adminFetch("/api/admin/knowledge/informasi-program", {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const listPosisiKnowledge = () =>
  adminFetch("/api/admin/knowledge/posisi");
export const createPosisiKnowledge = (data) =>
  adminFetch("/api/admin/knowledge/posisi", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updatePosisiKnowledge = (namaPosisi, data) =>
  adminFetch(`/api/admin/knowledge/posisi/${encodeURIComponent(namaPosisi)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deletePosisiKnowledge = (namaPosisi) =>
  adminFetch(`/api/admin/knowledge/posisi/${encodeURIComponent(namaPosisi)}`, {
    method: "DELETE",
  });

// --- Pengaturan ---
export const updatePassword = (passwordLama, passwordBaru) =>
  adminFetch("/api/admin/pengaturan/password", {
    method: "PUT",
    body: JSON.stringify({
      password_lama: passwordLama,
      password_baru: passwordBaru,
    }),
  });
