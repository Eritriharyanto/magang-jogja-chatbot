import { useEffect, useState } from "react";
import AdminLayout from "@/admin/AdminLayout";
import * as adminApi from "@/lib/adminApi";

/** Dipakai buat dua halaman: Syarat & Ketentuan, dan Fasilitas — bedanya cuma `kategori`. */
function KontenPage({ kategori, title }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  function load() {
    setLoading(true);
    adminApi
      .listKonten(kategori)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [kategori]);

  async function handleAdd(e) {
    e.preventDefault();
    const isi = draft.trim();
    if (!isi) return;
    setSaving(true);
    setError("");
    try {
      await adminApi.createKonten(kategori, { isi, urutan: items.length });
      setDraft("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingText(item.isi);
  }

  async function saveEdit(item) {
    setError("");
    try {
      await adminApi.updateKonten(item.id, { isi: editingText });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm("Hapus item ini?")) return;
    try {
      await adminApi.deleteKonten(item.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AdminLayout title={title}>
      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <form onSubmit={handleAdd} className="mb-6 flex gap-3 rounded-xl bg-white p-4 shadow">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tulis item baru..."
          rows={2}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
        />
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 rounded-full bg-mj-green px-5 text-sm font-bold uppercase text-white hover:bg-mj-green-dark disabled:opacity-50"
        >
          Tambah
        </button>
      </form>

      <div className="rounded-xl bg-white shadow">
        <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-500">
          {loading ? "Memuat..." : `${items.length} item`}
        </div>
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-3">
              {editingId === item.id ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={2}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
                  />
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(item)}
                      className="rounded-lg bg-mj-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-mj-green-dark"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <p className="whitespace-pre-line text-sm text-mj-ink">{item.isi}</p>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {!loading && items.length === 0 ? (
            <li className="px-5 py-6 text-center text-sm text-slate-400">Belum ada item.</li>
          ) : null}
        </ul>
      </div>
    </AdminLayout>
  );
}

export default KontenPage;
