// Backend cuma nyimpen `icon_filename` (buat upload custom lewat admin nanti).
// Selama belum ada upload asli, kita tetap pakai SVG lokal yang sudah ada,
// dipetakan lewat slug supaya konsisten sama data di database.
import icAdministrasi from "@/assets/posisi/administrasi.svg";
import icUiux from "@/assets/posisi/uiux.svg";
import icProgrammer from "@/assets/posisi/programmer.svg";
import icHr from "@/assets/posisi/hr.svg";
import icSocmed from "@/assets/posisi/socmed.svg";
import icPhotographer from "@/assets/posisi/photographer.svg";
import icContentWriter from "@/assets/posisi/contentwriter.svg";
import icMarketing from "@/assets/posisi/marketing.svg";
import icDesainGrafis from "@/assets/posisi/desaingrafis.svg";
import icDigitalMarket from "@/assets/posisi/digitalmarket.svg";
import icMarcomm from "@/assets/posisi/marcomm.svg";
import icHost from "@/assets/posisi/host.svg";
import icTiktok from "@/assets/posisi/tiktok.svg";
import icVoiceOver from "@/assets/posisi/voiceover.svg";
import icContentPlanner from "@/assets/posisi/contentplanner.svg";
import icProjectManager from "@/assets/posisi/projectmanager.svg";
import icLas from "@/assets/posisi/las.svg";
import icAnimasi from "@/assets/posisi/animasi.svg";

export const POSISI_ICONS = {
  administrasi: icAdministrasi,
  "uiux-designer": icUiux,
  programmer: icProgrammer,
  "human-resource": icHr,
  "social-media-specialist": icSocmed,
  "photographer-videographer": icPhotographer,
  "content-writer": icContentWriter,
  "marketing-sales": icMarketing,
  "desain-grafis": icDesainGrafis,
  "digital-market": icDigitalMarket,
  "marcomm-public-relation": icMarcomm,
  "host-presenter": icHost,
  "tiktok-creator": icTiktok,
  "voice-over-talent": icVoiceOver,
  "content-planner": icContentPlanner,
  "project-manager": icProjectManager,
  las: icLas,
  animasi: icAnimasi,
};

export function iconForSlug(slug) {
  return POSISI_ICONS[slug] || icAdministrasi;
}
