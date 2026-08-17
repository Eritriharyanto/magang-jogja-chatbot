import { useEffect, useState } from "react";
import AdminLayout from "@/admin/AdminLayout";
import ListFieldEditor from "@/admin/components/ListFieldEditor";
import * as adminApi from "@/lib/adminApi";
import { API_BASE } from "@/lib/api";

const EMPTY_FORM = {
  id: null,
  slug: "",
  label: "",
  sub: "",
  deskripsi: "",
  jobdesk: [],
  skill_dibutuhkan: [],
  gformLink: "",
  urutan: 0,
  aktif: true,
  icon_filename: null,
  iconPreview: null,
};

function DivisiPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  function load() {
    setLoading(true);
    adminApi
      .listDivisi()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(item) {
    setForm({
      id: item.id,
      slug: item.slug,
      label: item.label,
      sub: item.sub || "",
      deskripsi: item.deskripsi,
      jobdesk: item.jobdesk || [],
      skill_dibutuhkan: item.skill_dibutuhkan || [],
      gformLink: item.gformLink || "",
      urutan: item.urutan,
      aktif: item.aktif,
      icon_filename: item.icon_filename || null,
      iconPreview: item.icon ? `${API_BASE}${item.icon}` : null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  async function handleIconChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // biar bisa pilih file yang sama lagi kalau mau ganti ulang
    if (!file) return;
    setUploadingIcon(true);
    setError("");
    try {
      const res = await adminApi.uploadIcon(file);
      setForm((f) => ({ ...f, icon_filename: res.filename, iconPreview: `${API_BASE}${res.url}` }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingIcon(false);
    }
  }

  function handleIconRemove() {
    setForm((f) => ({ ...f, icon_filename: null, iconPreview: null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        label: form.label,
        sub: form.sub || null,
        deskripsi: form.deskripsi,
        jobdesk: form.jobdesk,
        skill_dibutuhkan: form.skill_dibutuhkan,
        gformLink: form.gformLink,
        urutan: Number(form.urutan) || 0,
        aktif: form.aktif,
        icon_filename: form.icon_filename,
      };
      if (form.id) {
        await adminApi.updateDivisi(form.id, payload);
      } else {
        await adminApi.createDivisi(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus posisi "${item.label}"? Ini gak bisa dibatalkan.`)) return;
    try {
      await adminApi.deleteDivisi(item.id);
      if (form.id === item.id) resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AdminLayout title="Posisi Magang">
      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* List */}
        <div className="rounded-xl bg-white shadow">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-500">
            {loading ? "Memuat..." : `${items.length} posisi`}
          </div>
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-mj-ink">
                    {item.label} {item.sub}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    /{item.slug} {item.aktif ? "" : "· disembunyikan"}
                  </p>
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
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
          <h2 className="text-sm font-bold uppercase text-slate-500">
            {form.id ? "Edit Posisi" : "Tambah Posisi Baru"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-mj-ink">Slug</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="mis. programmer"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-mj-ink">Urutan</label>
              <input
                type="number"
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-mj-ink">Label</label>
              <input
                type="text"
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-mj-ink">
                Sub-label (opsional)
              </label>
              <input
                type="text"
                value={form.sub}
                onChange={(e) => setForm({ ...form, sub: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-mj-ink">Gambar / Icon</label>
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
                {form.iconPreview ? (
                  <img src={form.iconPreview} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-[0.65rem] text-slate-400">Belum ada</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="w-fit cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200">
                  {uploadingIcon ? "Mengupload..." : form.iconPreview ? "Ganti Gambar" : "Upload Gambar"}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp"
                    onChange={handleIconChange}
                    disabled={uploadingIcon}
                    className="hidden"
                  />
                </label>
                {form.iconPreview ? (
                  <button
                    type="button"
                    onClick={handleIconRemove}
                    className="w-fit text-xs font-semibold text-red-600 hover:underline"
                  >
                    Hapus gambar
                  </button>
                ) : null}
                <p className="text-[0.65rem] text-slate-400">PNG, JPG, SVG, atau WEBP. Maks 5MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-mj-ink">Deskripsi</label>
            <textarea
              required
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
            />
          </div>

          <ListFieldEditor
            label="Jobdesk"
            items={form.jobdesk}
            onChange={(jobdesk) => setForm({ ...form, jobdesk })}
          />

          <ListFieldEditor
            label="Skill dibutuhkan"
            items={form.skill_dibutuhkan}
            onChange={(skill_dibutuhkan) => setForm({ ...form, skill_dibutuhkan })}
          />

          <div>
            <label className="mb-1 block text-sm font-semibold text-mj-ink">
              Link Google Form
            </label>
            <input
              type="url"
              value={form.gformLink}
              onChange={(e) => setForm({ ...form, gformLink: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-mj-ink">
            <input
              type="checkbox"
              checked={form.aktif}
              onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
            />
            Aktif (tampil di landing page)
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-mj-green px-6 py-2 text-sm font-bold uppercase text-white hover:bg-mj-green-dark disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : form.id ? "Simpan Perubahan" : "Tambah Posisi"}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full bg-slate-100 px-6 py-2 text-sm font-bold uppercase text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default DivisiPage;
