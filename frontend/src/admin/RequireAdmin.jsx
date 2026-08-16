import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/admin/AdminAuthContext";

function RequireAdmin({ children }) {
  const { isAuthed, checking } = useAdminAuth();

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-white">Memuat...</div>;
  }
  if (!isAuthed) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default RequireAdmin;
