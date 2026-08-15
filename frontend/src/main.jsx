import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import PosisiDetail from "./pages/PosisiDetail.jsx";
import ScrollToHash from "./components/ScrollToHash.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/posisi/:slug" element={<PosisiDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
