import { createContext, useContext, useEffect, useState } from "react";
import * as adminApi from "@/lib/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    adminApi
      .me()
      .then((data) => setUsername(data.username))
      .catch(() => setUsername(null))
      .finally(() => setChecking(false));
  }, []);

  async function doLogin(user, pass) {
    const data = await adminApi.login(user, pass);
    setUsername(data.username);
  }

  async function doLogout() {
    try {
      await adminApi.logout();
    } finally {
      setUsername(null);
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{ username, isAuthed: !!username, checking, login: doLogin, logout: doLogout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth harus dipakai di dalam AdminAuthProvider");
  return ctx;
}
