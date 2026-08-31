import { useEffect, useState } from "react";
import ListFieldEditor from "@/admin/components/ListFieldEditor";
import * as adminApi from "@/lib/adminApi";
import { API_BASE } from "@/lib/api";

const EMPTY_FORM = {
  originalNama: null, // null = mode tambah baru; diisi pas edit (buat tau nama lama)
  nama_posisi: "",
  deskripsi: "",
  jobdesk: [],
  skill_dibutuhkan: [],
  icon_filename: null,
  iconPreview: null,
};

function PosisiKnowledgeTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  function load() {
    setLoading(true);
    adminApi
      .listPosisiKnowledge()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(item) {
    setForm({
      originalNama: item.nama_posisi,
      nama_posisi: item.nama_posisi,
      deskripsi: item.deskripsi || "",
      jobdesk: item.jobdesk || [],
      skill_dibutuhkan: item.skill_dibutuhkan || [],
      icon_filename: item.icon_filename || null,
      iconPreview: item.icon_filename
        ? `${API_BASE}/uploads/icons/${item.icon_filename}`
        : null,
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
      setForm((f) => ({
        ...f,
        icon_filename: res.filename,
        iconPreview: `${API_BASE}${res.url}`,
      }));
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
        nama_posisi: form.nama_posisi,
        deskripsi: form.deskripsi,
        jobdesk: form.jobdesk,
        skill_dibutuhkan: form.skill_dibutuhkan,
        icon_filename: form.icon_filename,
      };
      if (form.originalNama) {
        await adminApi.updatePosisiKnowledge(form.originalNama, payload);
        if (form.nama_posisi !== form.originalNama) {
          // Backend gak dukung "rename" nama posisi — kalau namanya diganti,
          // hapus entri lama lalu buat entri baru dengan nama barunya.
          await adminApi.deletePosisiKnowledge(form.originalNama);
          await adminApi.createPosisiKnowledge(payload);
        }
      } else {
        await adminApi.createPosisiKnowledge(payload);
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
    if (
      !window.confirm(
        `Hapus "${item.nama_posisi}" dari pengetahuan chatbot? Ini gak bisa dibatalkan.`,
      )
    )
      return;
    try {
      await adminApi.deletePosisiKnowledge(item.nama_posisi);
      if (form.originalNama === item.nama_posisi) resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {error ? (
        <p className='mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>
          {error}
        </p>
      ) : null}

      <div className='grid gap-6 lg:grid-cols-[1fr_1.3fr]'>
        <div className='rounded-xl bg-white shadow'>
          <div className='border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-500'>
            {loading ? "Memuat..." : `${items.length} posisi diketahui chatbot`}
          </div>
          <ul className='max-h-[70vh] divide-y divide-slate-100 overflow-y-auto'>
            {items.map((item) => (
              <li
                key={item.nama_posisi}
                className='flex items-center justify-between gap-3 px-5 py-3'
              >
                <div className='flex min-w-0 items-center gap-3'>
                  <div className='flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50'>
                    {item.icon_filename ? (
                      <img
                        src={`${API_BASE}/uploads/icons/${item.icon_filename}`}
                        alt=''
                        className='size-full object-cover'
                      />
                    ) : null}
                  </div>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-mj-ink'>
                      {item.nama_posisi}
                    </p>
                    <p className='truncate text-xs text-slate-400'>
                      {(item.jobdesk || []).length} jobdesk ·{" "}
                      {(item.skill_dibutuhkan || []).length} skill
                    </p>
                  </div>
                </div>
                <div className='flex shrink-0 gap-2'>
                  <button
                    type='button'
                    onClick={() => startEdit(item)}
                    className='rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200'
                  >
                    Edit
                  </button>
                  <button
                    type='button'
                    onClick={() => handleDelete(item)}
                    className='rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100'
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
            {!loading && items.length === 0 ? (
              <li className='px-5 py-6 text-center text-sm text-slate-400'>
                Belum ada posisi.
              </li>
            ) : null}
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-4 rounded-xl bg-white p-6 shadow'
        >
          <h2 className='text-sm font-bold uppercase text-slate-500'>
            {form.originalNama ? "Edit Posisi" : "Tambah Posisi Baru"}
          </h2>

          <div>
            <label className='mb-1 block text-sm font-semibold text-mj-ink'>
              Nama Posisi
            </label>
            <input
              type='text'
              required
              value={form.nama_posisi}
              onChange={(e) =>
                setForm({ ...form, nama_posisi: e.target.value })
              }
              placeholder='mis. Programmer'
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-semibold text-mj-ink'>
              Deskripsi
            </label>
            <textarea
              required
              rows={2}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-semibold text-mj-ink'>
              Gambar / Icon
            </label>
            <div className='flex items-center gap-4'>
              <div className='flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50'>
                {form.iconPreview ? (
                  <img
                    src={form.iconPreview}
                    alt=''
                    className='size-full object-cover'
                  />
                ) : (
                  <span className='text-[0.65rem] text-slate-400'>
                    Belum ada
                  </span>
                )}
              </div>
              <div className='flex flex-col gap-2'>
                <label className='w-fit cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200'>
                  {uploadingIcon
                    ? "Mengupload..."
                    : form.iconPreview
                      ? "Ganti Gambar"
                      : "Upload Gambar"}
                  <input
                    type='file'
                    accept='.png,.jpg,.jpeg,.svg,.webp'
                    onChange={handleIconChange}
                    disabled={uploadingIcon}
                    className='hidden'
                  />
                </label>
                {form.iconPreview ? (
                  <button
                    type='button'
                    onClick={handleIconRemove}
                    className='w-fit text-xs font-semibold text-red-600 hover:underline'
                  >
                    Hapus gambar
                  </button>
                ) : null}
                <p className='text-[0.65rem] text-slate-400'>
                  PNG, JPG, SVG, atau WEBP. Maks 5MB. (Cuma buat referensi
                  visual di admin — chatbot AI sendiri tetap jawab pakai teks.)
                </p>
              </div>
            </div>
          </div>

          <ListFieldEditor
            label='Jobdesk'
            items={form.jobdesk}
            onChange={(jobdesk) => setForm({ ...form, jobdesk })}
          />

          <ListFieldEditor
            label='Skill dibutuhkan'
            items={form.skill_dibutuhkan}
            onChange={(skill_dibutuhkan) =>
              setForm({ ...form, skill_dibutuhkan })
            }
          />

          <div className='flex gap-3 pt-2'>
            <button
              type='submit'
              disabled={saving}
              className='rounded-full bg-mj-green px-6 py-2 text-sm font-bold uppercase text-white hover:bg-mj-green-dark disabled:opacity-50'
            >
              {saving
                ? "Menyimpan..."
                : form.originalNama
                  ? "Simpan Perubahan"
                  : "Tambah Posisi"}
            </button>
            {form.originalNama ? (
              <button
                type='button'
                onClick={resetForm}
                className='rounded-full bg-slate-100 px-6 py-2 text-sm font-bold uppercase text-slate-600 hover:bg-slate-200'
              >
                Batal
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

export default PosisiKnowledgeTab;
