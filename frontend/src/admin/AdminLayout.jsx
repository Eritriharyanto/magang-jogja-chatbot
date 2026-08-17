import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/admin/AdminAuthContext";

const NAV_GROUPS = [
  {
    label: "Umum",
    items: [{ to: "/admin", label: "Dashboard", end: true }],
  },
  {
    label: "Tampilan Website",
    items: [
      { to: "/admin/divisi", label: "Posisi Magang" },
      { to: "/admin/syarat", label: "Syarat & Ketentuan" },
      { to: "/admin/fasilitas", label: "Fasilitas" },
    ],
  },
  {
    label: "Chatbot AI",
    items: [
      { to: "/admin/knowledge", label: "Isi Pengetahuan Chatbot" },
      { to: "/admin/intents", label: "FAQ Chatbot" },
      { to: "/admin/riwayat", label: "Riwayat Chat" },
    ],
  },
  {
    label: "Lainnya",
    items: [{ to: "/admin/pengaturan", label: "Pengaturan" }],
  },
];

function AdminLayout({ children, title }) {
  const { username, logout } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100 font-body">
      <div className="flex min-h-screen">
        <aside className="flex w-64 shrink-0 flex-col bg-mj-green-dark text-white">
          <div className="px-5 py-6">
            <p className="mj-display text-lg leading-tight text-mj-yellow">Magang Jogja</p>
            <p className="text-xs text-white/60">Panel Admin</p>
          </div>
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-1 text-[0.65rem] font-bold uppercase tracking-wider text-white/40">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "bg-mj-yellow text-mj-ink" : "text-white/80 hover:bg-white/10"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-white/10 px-5 py-4">
            <p className="truncate text-xs text-white/60">Masuk sebagai</p>
            <p className="truncate text-sm font-semibold">{username}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-x-hidden">
          <header className="border-b border-slate-200 bg-white px-8 py-5">
            <h1 className="text-xl font-bold text-mj-ink">{title}</h1>
          </header>
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
