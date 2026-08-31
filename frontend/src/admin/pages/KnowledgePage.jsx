import { useState } from "react";
import AdminLayout from "@/admin/AdminLayout";
import KnowledgeInfoTab from "@/admin/pages/KnowledgeInfoTab";
import KnowledgePosisiTab from "@/admin/pages/KnowledgePosisiTab";

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-mj-green text-mj-green"
          : "border-transparent text-slate-500 hover:text-mj-ink"
      }`}
    >
      {children}
    </button>
  );
}

function KnowledgePage() {
  const [tab, setTab] = useState("posisi"); // "posisi" | "info"

  return (
    <AdminLayout title="Isi Pengetahuan Chatbot">
      <p className="mb-4 text-sm text-slate-500">
        Ini data yang dipakai <b>chatbot AI</b> buat menjawab pertanyaan
        pengunjung — beda dari halaman <b>Posisi Magang</b> yang cuma ngatur
        tampilan website. Ubah di sini kalau mau jawaban chatbot ikut
        ter-update.
      </p>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <TabButton active={tab === "posisi"} onClick={() => setTab("posisi")}>
          Daftar Posisi
        </TabButton>
        <TabButton active={tab === "info"} onClick={() => setTab("info")}>
          Info Program
        </TabButton>
      </div>

      {tab === "posisi" ? <KnowledgePosisiTab /> : <KnowledgeInfoTab />}
    </AdminLayout>
  );
}

export default KnowledgePage;
