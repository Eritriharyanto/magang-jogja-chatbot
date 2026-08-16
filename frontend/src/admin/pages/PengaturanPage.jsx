import { useState } from "react";
import AdminLayout from "@/admin/AdminLayout";
import * as adminApi from "@/lib/adminApi";

function PengaturanPage() {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [passwordBaru2, setPasswordBaru2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordBaru !== passwordBaru2) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setSaving(true);
    try {
      await adminApi.updatePassword(passwordLama, passwordBaru);
      setSuccess("Password berhasil diganti.");
      setPasswordLama("");
      setPasswordBaru("");
      setPasswordBaru2("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Pengaturan">
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-xl bg-white p-6 shadow">
        <h2 className="text-sm font-bold uppercase text-slate-500">Ganti Password Admin</h2>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}
        {success ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-semibold text-mj-ink">Password Lama</label>
          <input
            type="password"
            required
            value={passwordLama}
            onChange={(e) => setPasswordLama(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-mj-ink">Password Baru</label>
          <input
            type="password"
            required
            minLength={6}
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
          />
          <p className="mt-1 text-xs text-slate-400">Minimal 6 karakter.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-mj-ink">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={passwordBaru2}
            onChange={(e) => setPasswordBaru2(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-mj-green px-6 py-2 text-sm font-bold uppercase text-white hover:bg-mj-green-dark disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </AdminLayout>
  );
}

export default PengaturanPage;
