# MagangJogja Chatbot — Frontend

Landing page + dashboard admin + widget chatbot untuk program **Magang
Jogja**. Dibangun dengan **React 19 + Vite + Tailwind CSS v4**, berkomunikasi
dengan backend Flask lewat REST API berbasis session cookie.

> Dokumentasi backend & alur gabungan frontend↔backend ada di README utama
> repository (root project), bukan di file ini.

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Struktur Direktori](#struktur-direktori)
3. [Alur Kerja](#alur-kerja)
4. [Setup & Menjalankan](#setup--menjalankan)
5. [Environment Variable](#environment-variable)
6. [Ringkasan Fungsi API yang Dipakai](#ringkasan-fungsi-api-yang-dipakai)

---

## Tech Stack

| Bagian | Teknologi |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Komunikasi ke backend | `fetch` native (`credentials: "include"` untuk session cookie) |

---

## Struktur Direktori

```
frontend/
├── index.html                      # entry HTML, mount point #root
├── vite.config.js                  # konfigurasi Vite + alias "@" -> src/
├── package.json
├── .env (buat sendiri)             # VITE_API_URL=http://localhost:5000
│
├── public/
│   └── robots.txt
│
└── src/
    ├── main.jsx                    # root render: BrowserRouter + semua <Route>
    ├── App.jsx                     # susunan landing page publik (Header, Hero, dst)
    ├── index.css                   # Tailwind import + custom theme (warna mj-*)
    │
    ├── components/                 # komponen landing page publik
    │   ├── Header.jsx              # navbar
    │   ├── Hero.jsx                # section hero atas
    │   ├── Bar.jsx                 # garis pembatas warna
    │   ├── Stripes.jsx             # dekorasi garis-garis warna
    │   ├── Syarat.jsx              # section syarat & ketentuan (fetch /api/syarat)
    │   ├── Posisi.jsx              # section daftar posisi magang (fetch /api/divisi)
    │   ├── Fasilitas.jsx           # section fasilitas (fetch /api/fasilitas)
    │   ├── Footer.jsx
    │   ├── ChatWidget.jsx          # widget chatbot mengambang
    │   ├── Reveal.jsx              # wrapper animasi scroll-reveal
    │   └── ScrollToHash.jsx        # auto-scroll ke #hash saat pindah halaman
    │
    ├── pages/
    │   └── PosisiDetail.jsx        # halaman detail 1 posisi (/posisi/:slug)
    │
    ├── data/
    │   ├── content.js               # data statis fallback
    │   └── posisiIcons.js
    │
    ├── hooks/
    │   └── useInView.js             # hook IntersectionObserver buat animasi Reveal
    │
    ├── lib/
    │   ├── api.js                   # semua fetch endpoint PUBLIK (divisi, syarat, chat, dst)
    │   └── adminApi.js              # semua fetch endpoint ADMIN (butuh login/session)
    │
    ├── assets/                      # gambar & ikon statis
    │
    └── admin/                       # dashboard admin (area /admin/*)
        ├── AdminAuthContext.jsx     # context: status login admin (cek /api/admin/me)
        ├── AdminLayout.jsx          # layout sidebar + header khusus admin
        ├── RequireAdmin.jsx         # guard: redirect ke /admin/login kalau belum login
        │
        ├── components/
        │   └── InfoProgramFields.jsx
        │
        └── pages/
            ├── Login.jsx             # form login admin
            ├── DashboardPage.jsx     # ringkasan/statistik
            ├── DivisiPage.jsx        # CRUD posisi magang
            ├── SyaratPage.jsx        # CRUD syarat & ketentuan
            ├── FasilitasPage.jsx     # CRUD fasilitas
            ├── KnowledgePage.jsx     # wrapper 2 tab di bawah
            ├── KnowledgeInfoTab.jsx  # edit info program (system prompt Ollama)
            ├── KnowledgePosisiTab.jsx# edit detail per-posisi buat knowledge base AI
            ├── IntentsPage.jsx       # CRUD intent statis chatbot (FAQ)
            ├── RiwayatPage.jsx       # lihat & export riwayat chat pengunjung
            └── PengaturanPage.jsx    # ganti password admin
```

---

## Alur Kerja

### 1. Landing page publik (`/`)

`main.jsx` merender `<App />` di route `/`. `App.jsx` menyusun section demi
section (`Header → Hero → Syarat → Posisi → Fasilitas → Footer`), dengan
`<ChatWidget />` ditumpuk di atasnya sebagai widget mengambang (fixed
position).

Setiap section komponen (`Syarat.jsx`, `Posisi.jsx`, `Fasilitas.jsx`) memanggil
fungsi dari `lib/api.js` saat mount (`useEffect`) untuk mengambil data:

```js
useEffect(() => {
  getDivisi().then(setDivisiList);
}, []);
```

Klik salah satu posisi di `Posisi.jsx` mengarahkan ke `/posisi/:slug` →
dirender `PosisiDetail.jsx`, yang memanggil `getDivisiBySlug(slug)` untuk
menampilkan detail lengkap (deskripsi, jobdesk, skill, link Google Form).

### 2. Widget Chatbot (`ChatWidget.jsx`)

1. User klik ikon chat → widget terbuka.
2. Panggil `getVisitorStatus()` (`GET /api/visitor`) untuk cek apakah sesi
   (cookie) ini sudah pernah mengisi nama + no. WhatsApp.
3. Kalau **belum**, tampilkan form "Nama" + "No. WhatsApp" → submit memanggil
   `registerVisitor(nama, noTelepon)` (`POST /api/visitor`).
4. Kalau **sudah** (atau setelah submit form), tampilan berubah ke jendela
   chat biasa.
5. Setiap pesan dikirim lewat `sendChatMessage(pesan)` (`POST /api/chat`),
   jawaban bot ditampilkan sebagai bubble baru.
6. Response juga membawa field `aksi` (mis. arahkan ke posisi tertentu /
   nomor WA admin) yang bisa dipakai widget untuk tombol aksi cepat.

Karena semua fetch di `lib/api.js` pakai `credentials: "include"`, cookie
session backend otomatis ikut terkirim tanpa perlu menyimpan token manual.

### 3. Dashboard Admin (`/admin/*`)

- `AdminAuthProvider` (dibungkus di `main.jsx`) menyimpan status login admin
  di React Context, cek `me()` (`GET /api/admin/me`) saat aplikasi pertama
  dimuat.
- Semua route di bawah `/admin` (kecuali `/admin/login`) dibungkus
  `<RequireAdmin>` — redirect ke `/admin/login` kalau belum login.
- `Login.jsx` memanggil `login(username, password)` (`POST /api/admin/login`)
  → context diperbarui → redirect ke dashboard.
- Setiap halaman admin memanggil fungsi CRUD dari `lib/adminApi.js`, pola
  umum: `list...()` saat mount, `create...()`/`update...()` dari form, lalu
  refresh list, `delete...()` dari tombol hapus.
- Upload ikon/gambar pakai `uploadIcon(file)` yang mengirim `FormData` ke
  `POST /api/admin/upload/icon`.
- `RiwayatPage.jsx`: tombol export navigasi langsung ke URL dari
  `exportRiwayatUrl()` / `exportAllRiwayatUrl()` (bukan `fetch()`) supaya
  browser menangani unduhan file sambil tetap membawa cookie sesi admin.

### 4. Alias `@` dan styling

`vite.config.js` mengatur alias `@` → `src/`, sehingga import bisa memakai
`@/components/...`, `@/lib/...` tanpa path relatif panjang. Styling pakai
Tailwind v4 dengan warna custom bertema (`bg-mj-green`, `bg-mj-blue`, dst)
didefinisikan di `index.css`.

---

## Setup & Menjalankan

```bash
cd frontend
npm install
cp .env.example .env      # kalau belum ada, buat manual (lihat env di bawah)
npm run dev
```

Frontend jalan di **http://localhost:5173** (default Vite).

> **Penting:** backend Flask harus sudah jalan duluan (default di port
> 5000), kalau tidak semua fetch data (divisi, syarat, chat, dll) akan
> gagal.

Script lain yang tersedia:

```bash
npm run build      # build production ke folder dist/
npm run preview    # preview hasil build
npm run lint       # jalankan ESLint
```

---

## Environment Variable

Buat file `.env` di root folder `frontend/`:

```
VITE_API_URL=http://localhost:5000
```

Dibaca di `src/lib/api.js`:

```js
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

Kalau env var tidak diisi, otomatis fallback ke `http://localhost:5000`.

---

## Ringkasan Fungsi API yang Dipakai

### `src/lib/api.js` (publik)

| Fungsi | Endpoint |
|---|---|
| `getDivisi()` | `GET /api/divisi` |
| `getDivisiBySlug(slug)` | `GET /api/divisi/<slug>` |
| `getSyarat()` | `GET /api/syarat` |
| `getFasilitas()` | `GET /api/fasilitas` |
| `getVisitorStatus()` | `GET /api/visitor` |
| `registerVisitor(nama, noTelepon)` | `POST /api/visitor` |
| `sendChatMessage(pesan)` | `POST /api/chat` |

### `src/lib/adminApi.js` (butuh login admin)

| Fungsi | Endpoint |
|---|---|
| `login`, `logout`, `me` | `/api/admin/login`, `/logout`, `/me` |
| `uploadIcon(file)` | `POST /api/admin/upload/icon` |
| `listDivisi`, `createDivisi`, `updateDivisi`, `deleteDivisi` | `/api/admin/divisi` |
| `listKonten`, `createKonten`, `updateKonten`, `deleteKonten` | `/api/admin/konten/...` |
| `listIntents`, `createIntent`, `updateIntent`, `deleteIntent` | `/api/admin/intents` |
| `listRiwayat`, `getTranscript`, `deleteRiwayat`, `bulkDeleteRiwayat`, `deleteAllRiwayat` | `/api/admin/riwayat` |
| `exportRiwayatUrl`, `exportAllRiwayatUrl` | `/api/admin/riwayat/.../export` |
| `getKnowledge`, `updateInformasiProgram`, `listPosisiKnowledge`, `createPosisiKnowledge`, `updatePosisiKnowledge`, `deletePosisiKnowledge` | `/api/admin/knowledge/...` |
| `updatePassword` | `PUT /api/admin/pengaturan/password` |
