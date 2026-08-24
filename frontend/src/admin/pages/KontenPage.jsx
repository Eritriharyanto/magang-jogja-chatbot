import { useEffect, useState } from "react";
import AdminLayout from "@/admin/AdminLayout";
import * as adminApi from "@/lib/adminApi";
import { API_BASE } from "@/lib/api";

function gambarUrl(item) {
  return item?.gambar ? `${API_BASE}${item.gambar}` : null;
}

/** Kotak preview + tombol upload/ganti/hapus gambar. Dipakai di form tambah & mode edit. */
function GambarField({ preview, uploading, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
        {preview ? (
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-[0.6rem] text-slate-400">Gambar</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="w-fit cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200">
          {uploading ? "Mengupload..." : preview ? "Ganti Gambar" : "Upload Gambar"}
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.webp"
            onChange={onChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {preview ? (
          <button
            type="button"
            onClick={onRemove}
            className="w-fit text-left text-[0.7rem] font-semibold text-red-600 hover:underline"
          >
            Hapus gambar
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Dipakai buat dua halaman: Syarat & Ketentuan, dan Fasilitas — bedanya cuma `kategori`. */
function KontenPage({ kategori, title }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState("");
  const [draftGambarFilename, setDraftGambarFilename] = useState(null);
  const [draftGambarPreview, setDraftGambarPreview] = useState(null);
  const [uploadingDraftGambar, setUploadingDraftGambar] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingGambarFilename, setEditingGambarFilename] = useState(null);
  const [editingGambarPreview, setEditingGambarPreview] = useState(null);
  const [uploadingEditGambar, setUploadingEditGambar] = useState(false);

  function load() {
    setLoading(true);
    adminApi
      .listKonten(kategori)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [kategori]);

  async function handleDraftGambarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingDraftGambar(true);
    setError("");
    try {
      const res = await adminApi.uploadIcon(file);
      setDraftGambarFilename(res.filename);
      setDraftGambarPreview(`${API_BASE}${res.url}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingDraftGambar(false);
    }
  }

  function handleDraftGambarRemove() {
    setDraftGambarFilename(null);
    setDraftGambarPreview(null);
  }

  async function handleAdd(e) {
    e.preventDefault();
    const isi = draft.trim();
    if (!isi) return;
    setSaving(true);
    setError("");
    try {
      await adminApi.createKonten(kategori, {
        isi,
        urutan: items.length,
        gambar_filename: draftGambarFilename,
      });
      setDraft("");
      setDraftGambarFilename(null);
      setDraftGambarPreview(null);
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
    setEditingGambarFilename(item.gambar_filename || null);
    setEditingGambarPreview(gambarUrl(item));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingGambarFilename(null);
    setEditingGambarPreview(null);
  }

  async function handleEditGambarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingEditGambar(true);
    setError("");
    try {
      const res = await adminApi.uploadIcon(file);
      setEditingGambarFilename(res.filename);
      setEditingGambarPreview(`${API_BASE}${res.url}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingEditGambar(false);
    }
  }

  function handleEditGambarRemove() {
    setEditingGambarFilename(null);
    setEditingGambarPreview(null);
  }

  async function saveEdit(item) {
    setError("");
    try {
      await adminApi.updateKonten(item.id, {
        isi: editingText,
        gambar_filename: editingGambarFilename,
      });
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm("Hapus item ini? Gambarnya (kalau ada) ikut kehapus juga.")) return;
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

      <form onSubmit={handleAdd} className="mb-6 flex flex-col gap-3 rounded-xl bg-white p-4 shadow">
        <div className="flex flex-col gap-3 sm:flex-row">
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
            className="shrink-0 self-start rounded-full bg-mj-green px-5 py-2 text-sm font-bold uppercase text-white hover:bg-mj-green-dark disabled:opacity-50 sm:self-auto"
          >
            Tambah
          </button>
        </div>
        <GambarField
          preview={draftGambarPreview}
          uploading={uploadingDraftGambar}
          onChange={handleDraftGambarChange}
          onRemove={handleDraftGambarRemove}
        />
      </form>

      <div className="rounded-xl bg-white shadow">
        <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-500">
          {loading ? "Memuat..." : `${items.length} item`}
        </div>
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-3">
              {editingId === item.id ? (
                <div className="flex flex-col gap-3">
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
                        onClick={cancelEdit}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                  <GambarField
                    preview={editingGambarPreview}
                    uploading={uploadingEditGambar}
                    onChange={handleEditGambarChange}
                    onRemove={handleEditGambarRemove}
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {item.gambar ? (
                      <img
                        src={gambarUrl(item)}
                        alt=""
                        className="size-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                      />
                    ) : null}
                    <p className="whitespace-pre-line text-sm text-mj-ink">{item.isi}</p>
                  </div>
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
