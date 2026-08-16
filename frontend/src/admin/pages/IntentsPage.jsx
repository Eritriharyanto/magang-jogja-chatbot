import { useEffect, useState } from "react";
import AdminLayout from "@/admin/AdminLayout";
import ListFieldEditor from "@/admin/components/ListFieldEditor";
import * as adminApi from "@/lib/adminApi";

const EMPTY_FORM = {
  originalIntent: null, // null = mode tambah baru; diisi pas edit (buat tau intent lama)
  intent: "",
  contoh_pertanyaan: [],
  jawaban_default: "",
  context_set: "",
  keywords: [],
};

function IntentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminApi
      .listIntents()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(item) {
    setForm({
      originalIntent: item.intent,
      intent: item.intent,
      contoh_pertanyaan: item.contoh_pertanyaan || [],
      jawaban_default: item.jawaban_default || "",
      context_set: item.context_set || "",
      keywords: item.keywords || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        intent: form.intent,
        contoh_pertanyaan: form.contoh_pertanyaan,
        jawaban_default: form.jawaban_default,
        context_set: form.context_set,
        keywords: form.keywords,
      };
      if (form.originalIntent) {
        // Kalau nama intent diganti, backend gak nyediain "rename" —
        // jadi update dulu isinya (pakai nama lama), lalu kalau namanya
        // berubah, hapus yang lama dan buat baru dengan nama baru.
        await adminApi.updateIntent(form.originalIntent, payload);
        if (form.intent !== form.originalIntent) {
          await adminApi.deleteIntent(form.originalIntent);
          await adminApi.createIntent(payload);
        }
      } else {
        await adminApi.createIntent(payload);
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
    if (!window.confirm(`Hapus intent "${item.intent}"?`)) return;
    try {
      await adminApi.deleteIntent(item.intent);
      if (form.originalIntent === item.intent) resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AdminLayout title="FAQ Chatbot (Intents)">
      <p className="mb-4 text-sm text-slate-500">
        Kalau pertanyaan pengunjung mirip salah satu contoh pertanyaan di sini, chatbot langsung
        balas pakai jawaban default (tanpa panggil Ollama). Perubahan langsung aktif tanpa restart
        server.
      </p>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-xl bg-white shadow">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-500">
            {loading ? "Memuat..." : `${items.length} intent`}
          </div>
          <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
            {items.map((item) => (
              <li key={item.intent} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-mj-ink">{item.intent}</p>
                  <p className="truncate text-xs text-slate-400">
                    {(item.contoh_pertanyaan || []).length} contoh pertanyaan
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

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
          <h2 className="text-sm font-bold uppercase text-slate-500">
            {form.originalIntent ? "Edit Intent" : "Tambah Intent Baru"}
          </h2>

          <div>
            <label className="mb-1 block text-sm font-semibold text-mj-ink">Nama Intent</label>
            <input
              type="text"
              required
              value={form.intent}
              onChange={(e) => setForm({ ...form, intent: e.target.value })}
              placeholder="mis. tanya_syarat"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
            />
          </div>

          <ListFieldEditor
            label="Contoh Pertanyaan"
            items={form.contoh_pertanyaan}
            onChange={(contoh_pertanyaan) => setForm({ ...form, contoh_pertanyaan })}
          />

          <div>
            <label className="mb-1 block text-sm font-semibold text-mj-ink">Jawaban Default</label>
            <textarea
              required
              rows={3}
              value={form.jawaban_default}
              onChange={(e) => setForm({ ...form, jawaban_default: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
            />
          </div>

          <ListFieldEditor
            label="Keywords (opsional)"
            items={form.keywords}
            onChange={(keywords) => setForm({ ...form, keywords })}
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-mj-green px-6 py-2 text-sm font-bold uppercase text-white hover:bg-mj-green-dark disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : form.originalIntent ? "Simpan Perubahan" : "Tambah Intent"}
            </button>
            {form.originalIntent ? (
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

export default IntentsPage;
