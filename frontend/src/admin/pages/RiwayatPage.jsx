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

/** Link WA ke nomor si PENGUNJUNG sendiri (beda sama nomor WA admin di
 * ChatWidget) — biar admin bisa langsung chat/follow-up ke pengunjung itu. */
function waLinkPengunjung(noTelepon) {
  if (!noTelepon) return null;
  const digits = noTelepon.replace(/\D/g, "").replace(/^0/, "62");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

function RiwayatPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    adminApi
      .listRiwayat()
      .then((data) => {
        setVisitors(data);
        // buang id yang udah gak ada lagi dari centangan (kalau ada)
        setSelectedIds((prev) => {
          const validIds = new Set(data.map((v) => v.id));
          return new Set([...prev].filter((id) => validIds.has(id)));
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openTranscript(visitor) {
    setSelected(visitor);
    setLoadingTranscript(true);
    adminApi
      .getTranscript(visitor.id)
      .then(setTranscript)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingTranscript(false));
  }

  function toggleSelect(id, checked) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleSelectAll(checked) {
    setSelectedIds(checked ? new Set(visitors.map((v) => v.id)) : new Set());
  }

  const allSelected =
    visitors.length > 0 && selectedIds.size === visitors.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function afterDeleteCleanup(deletedIds) {
    if (selected && deletedIds.includes(selected.id)) {
      setSelected(null);
      setTranscript([]);
    }
    setSelectedIds(new Set());
  }

  async function handleDeleteOne(visitor) {
    if (
      !window.confirm(
        `Hapus riwayat chat "${visitor.nama || `Pengunjung #${visitor.id}`}"? Tindakan ini gak bisa dibatalin.`,
      )
    ) {
      return;
    }
    setError("");
    setDeleting(true);
    try {
      await adminApi.deleteRiwayat(visitor.id);
      afterDeleteCleanup([visitor.id]);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Hapus ${ids.length} riwayat chat yang dipilih? Tindakan ini gak bisa dibatalin.`,
      )
    ) {
      return;
    }
    setError("");
    setDeleting(true);
    try {
      await adminApi.bulkDeleteRiwayat(ids);
      afterDeleteCleanup(ids);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteAll() {
    if (visitors.length === 0) return;
    if (
      !window.confirm(
        `Hapus SEMUA riwayat chat (${visitors.length} pengunjung)? Tindakan ini gak bisa dibatalin.`,
      )
    ) {
      return;
    }
    setError("");
    setDeleting(true);
    try {
      await adminApi.deleteAllRiwayat();
      afterDeleteCleanup(visitors.map((v) => v.id));
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminLayout title='Riwayat Chat'>
      {error ? (
        <p className='mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>
          {error}
        </p>
      ) : null}

      <div className='grid gap-6 lg:grid-cols-[1fr_1.3fr]'>
        <div className='rounded-xl bg-white shadow'>
          <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3'>
            <label className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
              <input
                type='checkbox'
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                disabled={loading || visitors.length === 0}
                className='size-4 accent-mj-green'
              />
              {loading ? "Memuat..." : `${visitors.length} pengunjung`}
            </label>
            {visitors.length > 0 ? (
              <div className='flex shrink-0 items-center gap-3'>
                <a
                  href={adminApi.exportAllRiwayatUrl()}
                  className='text-xs font-semibold text-mj-green hover:underline'
                >
                  Unduh Semua
                </a>
                <button
                  type='button'
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  className='text-xs font-semibold text-red-600 hover:underline disabled:opacity-50'
                >
                  Hapus Semua
                </button>
              </div>
            ) : null}
          </div>

          {selectedIds.size > 0 ? (
            <div className='flex items-center justify-between gap-3 border-b border-slate-100 bg-mj-green/5 px-5 py-2'>
              <span className='text-xs font-semibold text-mj-ink'>
                {selectedIds.size} dipilih
              </span>
              <button
                type='button'
                onClick={handleDeleteSelected}
                disabled={deleting}
                className='rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50'
              >
                Hapus Terpilih
              </button>
            </div>
          ) : null}

          <ul className='max-h-[70vh] divide-y divide-slate-100 overflow-y-auto'>
            {visitors.map((v) => (
              <li key={v.id} className='flex items-center gap-2 px-5'>
                <input
                  type='checkbox'
                  checked={selectedIds.has(v.id)}
                  onChange={(e) => toggleSelect(v.id, e.target.checked)}
                  className='size-4 shrink-0 accent-mj-green'
                />
                <button
                  type='button'
                  onClick={() => openTranscript(v)}
                  className={`min-w-0 flex-1 px-2 py-3 text-left hover:bg-slate-50 ${
                    selected?.id === v.id ? "bg-mj-green/5" : ""
                  }`}
                >
                  <p className='text-sm font-semibold text-mj-ink'>
                    {v.nama || `Pengunjung #${v.id}`}
                    {v.no_telepon ? (
                      <span className='ml-2 font-normal text-slate-400'>
                        · {v.no_telepon}
                      </span>
                    ) : null}
                  </p>
                  <p className='text-xs text-slate-400'>
                    {v.jumlah_pesan} pesan · terakhir{" "}
                    {formatDate(v.terakhir_aktif)}
                  </p>
                </button>
                <div className='flex shrink-0 items-center gap-1'>
                  {waLinkPengunjung(v.no_telepon) ? (
                    <a
                      href={waLinkPengunjung(v.no_telepon)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rounded-lg px-2 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50'
                      title={`Chat WA ke ${v.no_telepon}`}
                    >
                      WA
                    </a>
                  ) : null}
                  <a
                    href={adminApi.exportRiwayatUrl(v.id)}
                    className='rounded-lg px-2 py-1.5 text-xs font-semibold text-mj-green hover:bg-mj-green/5'
                    title='Unduh riwayat pengunjung ini'
                  >
                    Unduh
                  </a>
                  <button
                    type='button'
                    onClick={() => handleDeleteOne(v)}
                    disabled={deleting}
                    className='rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50'
                    title='Hapus riwayat pengunjung ini'
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
            {!loading && visitors.length === 0 ? (
              <li className='px-5 py-6 text-center text-sm text-slate-400'>
                Belum ada riwayat chat.
              </li>
            ) : null}
          </ul>
        </div>

        <div className='rounded-xl bg-white shadow'>
          <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3'>
            <span className='text-sm font-semibold text-slate-500'>
              {selected
                ? `Transkrip — ${selected.nama || `Pengunjung #${selected.id}`}${
                    selected.no_telepon ? ` (${selected.no_telepon})` : ""
                  }`
                : "Pilih pengunjung"}
            </span>
            {selected ? (
              <div className='flex shrink-0 items-center gap-3'>
                {waLinkPengunjung(selected.no_telepon) ? (
                  <a
                    href={waLinkPengunjung(selected.no_telepon)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs font-semibold text-green-600 hover:underline'
                  >
                    Chat WA
                  </a>
                ) : null}
                <a
                  href={adminApi.exportRiwayatUrl(selected.id)}
                  className='text-xs font-semibold text-mj-green hover:underline'
                >
                  Unduh
                </a>
              </div>
            ) : null}
          </div>
          <div className='max-h-[70vh] space-y-3 overflow-y-auto p-5'>
            {loadingTranscript ? (
              <p className='text-sm text-slate-400'>Memuat...</p>
            ) : null}
            {!loadingTranscript && selected && transcript.length === 0 ? (
              <p className='text-sm text-slate-400'>Belum ada pesan.</p>
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
                <p className='whitespace-pre-line'>{m.content}</p>
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
