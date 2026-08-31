import { useEffect, useState } from "react";
import { InfoField, groupFields } from "@/admin/components/InfoProgramFields";
import * as adminApi from "@/lib/adminApi";

function KnowledgeInfoTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    setLoading(true);
    adminApi
      .getKnowledge()
      .then((kb) => setData(kb.informasi_program || {}))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function updateField(key, value) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRawMode() {
    setError("");
    if (!rawMode) {
      setRawText(JSON.stringify(data, null, 2));
    } else {
      // balik dari mode JSON ke mode form -> parse dulu, kalau rusak jangan
      // ditutup dulu formnya biar admin bisa perbaiki teksnya
      try {
        setData(JSON.parse(rawText));
      } catch {
        setError("Format JSON tidak valid — perbaiki dulu sebelum kembali ke mode form.");
        return;
      }
    }
    setRawMode((v) => !v);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    let payload = data;
    if (rawMode) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        setError("Format JSON tidak valid — cek lagi tanda kurung/koma-nya.");
        return;
      }
    }
    setSaving(true);
    try {
      await adminApi.updateInformasiProgram(payload);
      setData(payload);
      setSuccess("Tersimpan — chatbot langsung pakai info terbaru ini.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-sm text-slate-500">
          Ini data umum program (kontak admin, syarat pendaftaran, durasi,
          fasilitas, biaya, dll) yang dipakai chatbot buat jawab pertanyaan di
          luar daftar posisi. Klik judul tiap bagian buat buka/tutup, isi
          kolomnya, lalu simpan.
        </p>
        {!loading ? (
          <button
            type="button"
            onClick={toggleRawMode}
            className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-500 hover:underline"
          >
            {rawMode ? "Kembali ke Tampilan Biasa" : "Mode JSON Lanjutan"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      ) : null}

      {loading || !data ? (
        <p className="text-sm text-slate-400">Memuat...</p>
      ) : (
        <form onSubmit={handleSave}>
          {rawMode ? (
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={24}
              spellCheck={false}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-mj-green"
            />
          ) : (
            <div className="space-y-3">
              {groupFields(data).map((group, i) => (
                <details
                  key={group.title}
                  open={i === 0}
                  className="group rounded-lg border border-slate-200"
                >
                  <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-sm font-bold text-mj-ink">
                    {group.title}
                    <span className="text-xs font-normal text-slate-400">
                      {group.keys.length} field
                    </span>
                  </summary>
                  <div className="space-y-5 border-t border-slate-100 p-4">
                    {group.keys.map((key) => (
                      <InfoField
                        key={key}
                        fieldKey={key}
                        value={data[key]}
                        onChange={(v) => updateField(key, v)}
                      />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 rounded-full bg-mj-green px-6 py-2 text-sm font-bold uppercase text-white hover:bg-mj-green-dark disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Info Program"}
          </button>
        </form>
      )}
    </div>
  );
}

export default KnowledgeInfoTab;
