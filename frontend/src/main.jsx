import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import PosisiDetail from "./pages/PosisiDetail.jsx";
import ScrollToHash from "./components/ScrollToHash.jsx";
import { AdminAuthProvider } from "./admin/AdminAuthContext.jsx";
import RequireAdmin from "./admin/RequireAdmin.jsx";
import AdminLogin from "./admin/pages/Login.jsx";
import DivisiPage from "./admin/pages/DivisiPage.jsx";
import SyaratPage from "./admin/pages/SyaratPage.jsx";
import FasilitasPage from "./admin/pages/FasilitasPage.jsx";
import IntentsPage from "./admin/pages/IntentsPage.jsx";
import RiwayatPage from "./admin/pages/RiwayatPage.jsx";
import PengaturanPage from "./admin/pages/PengaturanPage.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/posisi/:slug" element={<PosisiDetail />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/divisi"
            element={
              <RequireAdmin>
                <DivisiPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/syarat"
            element={
              <RequireAdmin>
                <SyaratPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/fasilitas"
            element={
              <RequireAdmin>
                <FasilitasPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/intents"
            element={
              <RequireAdmin>
                <IntentsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/riwayat"
            element={
              <RequireAdmin>
                <RiwayatPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/pengaturan"
            element={
              <RequireAdmin>
                <PengaturanPage />
              </RequireAdmin>
            }
          />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
