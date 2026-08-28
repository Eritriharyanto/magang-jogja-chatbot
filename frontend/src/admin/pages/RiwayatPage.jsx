import { useEffect, useState } from "react";
import AdminLayout from "@/admin/AdminLayout";
import * as adminApi from "@/lib/adminApi";

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID");
  } catch {
    return iso;
  }
}

function downloadAllTranscripts(rows) {
  const grouped = new Map();
  rows.forEach((r) => {
    if (!grouped.has(r.visitor_id)) {
      grouped.set(r.visitor_id, { nama: r.nama, no_telepon: r.no_telepon, messages: [] });
    }
    if (r.role) {
      grouped.get(r.visitor_id).messages.push(r);
    }
  });

  const lines = [];
  grouped.forEach((v, id) => {
    lines.push(`=== ${v.nama || `Pengunjung #${id}`}${v.no_telepon ? ` (${v.no_telepon})` : ""} ===`);
    v.messages.forEach((m) => {
      lines.push(`[${formatDate(m.created_at)}] ${m.role === "user" ? "User" : "Bot"}: ${m.content}`);
    });
    lines.push("");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `riwayat-semua-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function RiwayatPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminApi
      .listRiwayat()
      .then(setVisitors)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openTranscript(visitor) {
    setSelected(visitor);
    setLoadingTranscript(true);
    adminApi
      .getTranscript(visitor.id)
      .then(setTranscript)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingTranscript(false));
  }

  function handleDownloadAll() {
    setExporting(true);
    adminApi
      .exportRiwayat()
      .then(downloadAllTranscripts)
      .catch((e) => setError(e.message))
      .finally(() => setExporting(false));
  }

  function handleDelete(visitor) {
    if (!confirm(`Hapus riwayat ${visitor.nama || `Pengunjung #${visitor.id}`}?`)) return;
    adminApi
      .deleteRiwayat(visitor.id)
      .then(() => {
        setVisitors((prev) => prev.filter((v) => v.id !== visitor.id));
        if (selected?.id === visitor.id) {
          setSelected(null);
          setTranscript([]);
        }
      })
      .catch((e) => setError(e.message));
  }

  return (
    <AdminLayout title="Riwayat Chat">
      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-xl bg-white shadow">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <span className="text-sm font-semibold text-slate-500">
              {loading ? "Memuat..." : `${visitors.length} pengunjung`}
            </span>
            {!loading && visitors.length > 0 ? (
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={exporting}
                className="text-xs font-medium text-mj-green hover:underline disabled:opacity-50"
              >
                {exporting ? "Menyiapkan..." : "Download Semua"}
              </button>
            ) : null}
          </div>
          <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
            {visitors.map((v) => (
              <li key={v.id} className="relative">
                <button
                  type="button"
                  onClick={() => openTranscript(v)}
                  className={`block w-full px-5 py-3 pr-16 text-left hover:bg-slate-50 ${
                    selected?.id === v.id ? "bg-mj-green/5" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-mj-ink">
                    {v.nama || `Pengunjung #${v.id}`}
                    {v.no_telepon ? (
                      <span className="ml-2 font-normal text-slate-400">
                        · {v.no_telepon}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-400">
                    {v.jumlah_pesan} pesan · terakhir {formatDate(v.terakhir_aktif)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400 hover:text-red-600"
                >
                  Hapus
                </button>
              </li>
            ))}
            {!loading && visitors.length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-slate-400">
                Belum ada riwayat chat.
              </li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-xl bg-white shadow">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-500">
            {selected
              ? `Transkrip — ${selected.nama || `Pengunjung #${selected.id}`}${
                  selected.no_telepon ? ` (${selected.no_telepon})` : ""
                }`
              : "Pilih pengunjung"}
          </div>
          <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
            {loadingTranscript ? <p className="text-sm text-slate-400">Memuat...</p> : null}
            {!loadingTranscript && selected && transcript.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada pesan.</p>
            ) : null}
            {transcript.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-mj-green text-white"
                    : "bg-slate-100 text-mj-ink"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
                <p
                  className={`mt-1 text-[0.65rem] ${
                    m.role === "user" ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {formatDate(m.created_at)} {m.source ? `· ${m.source}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default RiwayatPage;
