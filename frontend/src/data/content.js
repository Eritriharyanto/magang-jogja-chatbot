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

export const NAV = [
  { label: "Syarat & Ketentuan", href: "#syarat" },
  { label: "Posisi Magang", href: "#posisi" },
  { label: "Fasilitas", href: "#fasilitas" },
  { label: "Tentang Kami", href: "#tentang" },
];

export const SYARAT = [
  "Mengisi Form Pendaftaran Magang (bs minta ke Admin Magangjogja di 0895 2900 2944)",
  "Membawa surat keterangan atau surat pengantar dari sekolah/kampus",
  "Direstui orangtua atau sudah ijin orangtua",
  "Memiliki niat positif untuk mencari skill & pengalaman selama magang berjalan",
  "Mau latihan hidup mandiri, dewasa dan latihan jauh dari orangtua.\nJadi lulus dari magang sudah siap hidup mandiri",
  "Mau berinteraksi dengan karyawan, menjaga nama baik perusahaan, kampus/sekolah, dan diri sendiri",
];

// GANTI link Google Form di bawah ini sesuai form pendaftaran asli tiap divisi.
// Kalau kamu cuma punya 1 form untuk semua divisi, ganti semua GFORM_DEFAULT
// jadi link form kamu, atau isi field gformLink di tiap divisi secara manual.
const GFORM_DEFAULT = "https://forms.gle/GANTI-DENGAN-LINK-GFORM-KAMU";

export const POSISI = [
  {
    slug: "administrasi",
    icon: icAdministrasi,
    label: "Administrasi",
    deskripsi:
      "Membantu operasional administratif harian perusahaan, mulai dari pengelolaan data hingga surat-menyurat.",
    jobdesk: [
      "Input dan mengelola data administrasi perusahaan",
      "Mengarsipkan dokumen dan surat masuk/keluar",
      "Membantu proses rekapitulasi laporan harian",
      "Mendukung kebutuhan operasional tim lain",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "uiux-designer",
    icon: icUiux,
    label: "UI/UX Designer",
    deskripsi:
      "Merancang tampilan dan pengalaman pengguna untuk produk digital perusahaan, mulai dari riset hingga prototipe.",
    jobdesk: [
      "Membuat wireframe dan prototype desain aplikasi/website",
      "Melakukan riset kebutuhan dan pengalaman pengguna",
      "Berkolaborasi dengan tim programmer untuk implementasi desain",
      "Menjaga konsistensi visual (design system)",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "programmer",
    icon: icProgrammer,
    label: "Programmer",
    sub: "Frontend/Backend",
    deskripsi:
      "Mengembangkan dan memelihara aplikasi web/mobile, baik dari sisi tampilan (frontend) maupun sistem (backend).",
    jobdesk: [
      "Menulis dan menguji kode program sesuai kebutuhan project",
      "Memperbaiki bug dan melakukan optimasi performa",
      "Berkolaborasi dengan tim desain dan project manager",
      "Mendokumentasikan kode dan alur sistem",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "human-resource",
    icon: icHr,
    label: "Human Resource",
    deskripsi:
      "Mendukung proses pengelolaan sumber daya manusia, mulai dari rekrutmen hingga administrasi karyawan.",
    jobdesk: [
      "Membantu proses rekrutmen dan seleksi kandidat",
      "Mengelola data dan administrasi karyawan/peserta magang",
      "Membantu penyelenggaraan pelatihan internal",
      "Menjaga komunikasi dan hubungan antar tim",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "social-media-specialist",
    icon: icSocmed,
    label: "Social Media",
    sub: "Specialist",
    deskripsi:
      "Mengelola akun media sosial perusahaan agar tetap aktif, menarik, dan sesuai dengan strategi branding.",
    jobdesk: [
      "Merencanakan dan menjadwalkan konten media sosial",
      "Memantau interaksi, komentar, dan pesan followers",
      "Menganalisis performa konten dan insight akun",
      "Berkoordinasi dengan tim desain dan content writer",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "photographer-videographer",
    icon: icPhotographer,
    label: "Photographer/",
    sub: "Videographer",
    deskripsi:
      "Menghasilkan konten foto dan video untuk kebutuhan promosi, dokumentasi, dan media sosial perusahaan.",
    jobdesk: [
      "Melakukan sesi foto dan pengambilan video (shooting)",
      "Mengedit foto dan video sesuai kebutuhan konten",
      "Mengelola dan merawat peralatan dokumentasi",
      "Berkoordinasi dengan tim kreatif untuk konsep konten",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "content-writer",
    icon: icContentWriter,
    label: "Content Writer",
    deskripsi:
      "Menulis berbagai jenis konten untuk kebutuhan promosi, blog, dan media sosial perusahaan.",
    jobdesk: [
      "Menulis artikel, caption, dan copywriting promosi",
      "Melakukan riset topik dan kata kunci (SEO dasar)",
      "Menyunting dan memastikan kualitas tulisan",
      "Berkoordinasi dengan tim desain dan social media",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "marketing-sales",
    icon: icMarketing,
    label: "Marketing & Sales",
    deskripsi:
      "Mendukung kegiatan pemasaran dan penjualan produk/jasa perusahaan ke calon pelanggan.",
    jobdesk: [
      "Membantu strategi pemasaran produk/jasa",
      "Melakukan follow up dan komunikasi dengan calon klien",
      "Membuat laporan penjualan dan progres target",
      "Membantu riset pasar dan kompetitor",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "desain-grafis",
    icon: icDesainGrafis,
    label: "Desain Grafis",
    deskripsi:
      "Membuat berbagai materi visual untuk kebutuhan promosi, media sosial, dan branding perusahaan.",
    jobdesk: [
      "Mendesain materi promosi (poster, feed, banner, dll)",
      "Menjaga konsistensi identitas visual perusahaan",
      "Berkolaborasi dengan tim content & social media",
      "Menyiapkan aset desain untuk berbagai kebutuhan tim",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "digital-market",
    icon: icDigitalMarket,
    label: "Digital Market",
    deskripsi:
      "Menjalankan strategi pemasaran digital untuk meningkatkan awareness dan penjualan secara online.",
    jobdesk: [
      "Membantu strategi iklan digital (ads) dan campaign",
      "Menganalisis data performa pemasaran digital",
      "Riset tren dan peluang pasar digital",
      "Berkoordinasi dengan tim kreatif dan sales",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "marcomm-public-relation",
    icon: icMarcomm,
    label: "Marcomm/",
    sub: "Public Relation",
    deskripsi:
      "Mengelola komunikasi dan citra perusahaan, baik ke publik, media, maupun mitra kerja.",
    jobdesk: [
      "Menyusun materi komunikasi dan publikasi perusahaan",
      "Menjaga hubungan dengan media dan mitra",
      "Membantu penyelenggaraan event/acara perusahaan",
      "Memantau citra dan reputasi perusahaan di publik",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "host-presenter",
    icon: icHost,
    label: "Host / Presenter",
    deskripsi:
      "Menjadi pembawa acara/host untuk kebutuhan konten live, event, maupun video promosi perusahaan.",
    jobdesk: [
      "Membawakan acara atau konten live (livestream/event)",
      "Mempelajari dan menyampaikan materi/script dengan baik",
      "Berkoordinasi dengan tim produksi dan kreatif",
      "Menjaga citra dan profesionalisme saat tampil",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "tiktok-creator",
    icon: icTiktok,
    label: "TikTok Creator",
    deskripsi:
      "Membuat konten kreatif untuk platform TikTok guna meningkatkan engagement dan awareness brand.",
    jobdesk: [
      "Membuat ide dan konsep konten TikTok",
      "Syuting dan mengedit video pendek",
      "Memantau tren dan algoritma TikTok terkini",
      "Menganalisis performa konten yang sudah tayang",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "voice-over-talent",
    icon: icVoiceOver,
    label: "Voice Over Talent",
    deskripsi:
      "Mengisi suara untuk kebutuhan konten video, iklan, maupun materi promosi perusahaan.",
    jobdesk: [
      "Mengisi suara (voice over) untuk video/konten promosi",
      "Berlatih intonasi dan artikulasi sesuai kebutuhan naskah",
      "Berkoordinasi dengan tim produksi video",
      "Membantu proses rekaman dan revisi audio",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "content-planner",
    icon: icContentPlanner,
    label: "Content Planner",
    deskripsi:
      "Merencanakan strategi dan kalender konten untuk berbagai platform milik perusahaan.",
    jobdesk: [
      "Menyusun kalender dan strategi konten bulanan",
      "Berkoordinasi dengan writer, desainer, dan videografer",
      "Memantau tren konten yang relevan dengan brand",
      "Mengevaluasi performa konten yang sudah tayang",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "project-manager",
    icon: icProjectManager,
    label: "Project Manager",
    deskripsi:
      "Mengoordinasikan jalannya sebuah project agar selesai tepat waktu sesuai target yang ditentukan.",
    jobdesk: [
      "Menyusun timeline dan pembagian tugas project",
      "Memantau progres kerja tiap anggota tim",
      "Menjadi penghubung komunikasi antar divisi",
      "Membuat laporan progres project secara berkala",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "las",
    icon: icLas,
    label: "LAS",
    deskripsi:
      "Divisi teknis yang mendukung kebutuhan operasional dan produksi sesuai bidang keahlian LAS.",
    jobdesk: [
      "Membantu proses kerja teknis sesuai penugasan",
      "Menjaga kualitas dan keamanan hasil kerja",
      "Berkoordinasi dengan tim terkait kebutuhan project",
      "Mengikuti standar operasional yang berlaku",
    ],
    gformLink: GFORM_DEFAULT,
  },
  {
    slug: "animasi",
    icon: icAnimasi,
    label: "Animasi",
    deskripsi:
      "Membuat konten animasi untuk kebutuhan promosi, edukasi, maupun hiburan sesuai kebutuhan perusahaan.",
    jobdesk: [
      "Membuat motion graphic/animasi untuk konten promosi",
      "Menyusun storyboard sebelum proses animasi",
      "Berkolaborasi dengan tim desain dan content writer",
      "Mengedit dan menyempurnakan hasil animasi",
    ],
    gformLink: GFORM_DEFAULT,
  },
];

export const FASILITAS = [
  "Bimbingan dari staff / asisten kami",
  "Ada pelatihan diluar jam kerja",
  "Mendapatkan sertifikat + seragam magangjogja.com",
  "Koneksi Internet Free (bagi yang WFO)",
  "Bagi yang jauh dari luar kota diberikan info kost murah",
  "Free drink (Coffee & Tea)",
  "Mendapat surat rekomendasi",
  "Mendapatkan kesempatan untuk bergabung dan\nbekerjasama di project-project team kami",
  "Networking & Experience",
];
