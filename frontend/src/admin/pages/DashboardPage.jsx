import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/admin/AdminLayout";
import { useAdminAuth } from "@/admin/AdminAuthContext";
import * as adminApi from "@/lib/adminApi";

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID");
  } catch {
    return iso;
  }
}

const EMPTY_STATS = {
  divisiTotal: 0,
  divisiAktif: 0,
  syarat: 0,
  fasilitas: 0,
  intents: 0,
  posisiKb: 0,
  pengunjung: 0,
  pesan: 0,
};

function DashboardPage() {
  const { username } = useAdminAuth();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.listDivisi(),
      adminApi.listKonten("syarat"),
      adminApi.listKonten("fasilitas"),
      adminApi.listIntents(),
      adminApi.listRiwayat(),
      adminApi.listPosisiKnowledge(),
    ])
      .then(([divisi, syarat, fasilitas, intents, riwayat, posisiKb]) => {
        setStats({
          divisiTotal: divisi.length,
          divisiAktif: divisi.filter((d) => d.aktif).length,
          syarat: syarat.length,
          fasilitas: fasilitas.length,
          intents: intents.length,
          posisiKb: posisiKb.length,
          pengunjung: riwayat.length,
          pesan: riwayat.reduce((sum, v) => sum + (v.jumlah_pesan || 0), 0),
        });
        setVisitors(riwayat.slice(0, 5));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const websiteCards = [
    {
      to: "/admin/divisi",
      label: "Posisi Magang",
      value: `${stats.divisiAktif}/${stats.divisiTotal}`,
      hint: "aktif tampil / total",
      color: "bg-mj-blue",
    },
    { to: "/admin/syarat", label: "Syarat & Ketentuan", value: stats.syarat, hint: "item", color: "bg-mj-yellow" },
    { to: "/admin/fasilitas", label: "Fasilitas", value: stats.fasilitas, hint: "item", color: "bg-mj-purple" },
  ];

  const chatbotCards = [
    {
      to: "/admin/knowledge",
      label: "Posisi di Pengetahuan Chatbot",
      value: stats.posisiKb,
      hint: "posisi diketahui AI",
      color: "bg-mj-green-dark",
    },
    { to: "/admin/intents", label: "FAQ Chatbot", value: stats.intents, hint: "intent tersimpan", color: "bg-mj-red" },
    {
      to: "/admin/riwayat",
      label: "Riwayat Chat",
      value: stats.pengunjung,
      hint: `${stats.pesan} pesan masuk`,
      color: "bg-mj-orange",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <p className="mb-6 text-sm text-slate-500">
        Halo, <span className="font-semibold text-mj-ink">{username}</span> 👋 Ini ringkasan data website
        dan chatbot Magang Jogja.
      </p>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Tampilan Website
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {websiteCards.map((c) => (
            <StatCard key={c.to} {...c} loading={loading} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Otak Chatbot (AI)
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {chatbotCards.map((c) => (
            <StatCard key={c.to} {...c} loading={loading} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Aksi Cepat</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction
              to="/admin/divisi"
              label="+ Tambah Posisi Magang"
              desc="Muncul di halaman utama website"
            />
            <QuickAction
              to="/admin/knowledge"
              label="+ Update Pengetahuan Chatbot"
              desc="Supaya AI tau info terbaru"
            />
            <QuickAction
              to="/admin/intents"
              label="+ Tambah FAQ Chatbot"
              desc="Jawaban cepat tanpa panggil AI"
            />
            <QuickAction
              to="/admin/syarat"
              label="+ Edit Syarat & Ketentuan"
              desc="Tampil di halaman utama website"
            />
          </div>
        </div>

        <div className="rounded-xl bg-white shadow">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Chat Terbaru</h2>
            <Link to="/admin/riwayat" className="text-xs font-semibold text-mj-green hover:underline">
              Lihat semua
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {visitors.map((v) => (
              <li key={v.id} className="px-5 py-3">
                <p className="text-sm font-semibold text-mj-ink">{v.nama || `Pengunjung #${v.id}`}</p>
                <p className="text-xs text-slate-400">
                  {v.jumlah_pesan} pesan · terakhir {formatDate(v.terakhir_aktif)}
                </p>
              </li>
            ))}
            {!loading && visitors.length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-slate-400">Belum ada riwayat chat.</li>
            ) : null}
          </ul>
        </div>
      </section>
    </AdminLayout>
  );
}

function StatCard({ to, label, value, hint, color, loading }) {
  return (
    <Link to={to} className="block rounded-xl bg-white p-5 shadow transition-shadow hover:shadow-md">
      <div className={`mb-3 inline-block h-2 w-10 rounded-full ${color}`} />
      <p className="text-2xl font-bold text-mj-ink">{loading ? "…" : value}</p>
      <p className="text-sm font-semibold text-mj-ink">{label}</p>
      <p className="text-xs text-slate-400">{hint}</p>
    </Link>
  );
}

function QuickAction({ to, label, desc }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:border-mj-green hover:bg-mj-green/5"
    >
      <p className="text-sm font-semibold text-mj-ink">{label}</p>
      <p className="text-xs text-slate-400">{desc}</p>
    </Link>
  );
}

export default DashboardPage;
