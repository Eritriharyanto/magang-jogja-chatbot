# MagangJogja Chatbot

Sistem lengkap **landing page + dashboard admin + chatbot** untuk program
Magang Jogja: **frontend React** dan **backend Flask** yang saling
terhubung lewat REST API berbasis session cookie.

```
magang-jogja-chatbot/
├── frontend/     # React + Vite + Tailwind — landing page, widget chat, dashboard admin
└── backend/      # Flask + SQLite + Ollama — REST API, database, logika chatbot
```

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Struktur Direktori Proyek](#struktur-direktori-proyek)
3. [Arsitektur & Alur Kerja Umum](#arsitektur--alur-kerja-umum)
4. [Alur Kerja Frontend](#alur-kerja-frontend)
5. [Alur Kerja Backend](#alur-kerja-backend)
6. [Alur End-to-End (Frontend ⇄ Backend)](#alur-end-to-end-frontend--backend)
7. [Cara Menjalankan (Frontend + Backend)](#cara-menjalankan-frontend--backend)
8. [Ringkasan Endpoint API](#ringkasan-endpoint-api)
9. [Tim Pengembang](#tim-pengembang)
10. [Lisensi](#lisensi)

---

## Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS v4 |
| Backend | Flask 3, Flask-SQLAlchemy, Flask-CORS, SQLite |
| Chatbot | Static intent matching (RapidFuzz) + Ollama (LLM lokal, model `qwen2.5:0.5b`) |
| Auth admin | Session cookie Flask (`werkzeug.security` untuk hash password) |

---

## Struktur Direktori Proyek

```
magang-jogja-chatbot/
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js              # alias "@" -> src/
│   ├── package.json
│   ├── .env                        # VITE_API_URL=http://localhost:5000
│   │
│   └── src/
│       ├── main.jsx                # root render + semua <Route>
│       ├── App.jsx                 # susunan landing page publik
│       ├── index.css               # Tailwind + tema warna mj-*
│       │
│       ├── components/             # Header, Hero, Syarat, Posisi, Fasilitas,
│       │                           # Footer, ChatWidget, dll (landing page publik)
│       ├── pages/
│       │   └── PosisiDetail.jsx    # halaman detail 1 posisi (/posisi/:slug)
│       ├── lib/
│       │   ├── api.js              # fetch endpoint publik
│       │   └── adminApi.js         # fetch endpoint admin (butuh login)
│       ├── data/, hooks/, assets/  # data statis, custom hook, gambar
│       │
│       └── admin/                  # dashboard admin (/admin/*)
│           ├── AdminAuthContext.jsx
│           ├── AdminLayout.jsx
│           ├── RequireAdmin.jsx
│           └── pages/              # Login, Dashboard, Divisi, Syarat, Fasilitas,
│                                    # Knowledge, Intents, Riwayat, Pengaturan
│
└── backend/
    ├── run.py                      # entry point -> "python run.py", server di :5000
    ├── seed.py                     # isi data awal (posisi magang, syarat, fasilitas)
    ├── requirements.txt
    ├── .env.example                # SECRET_KEY, OLLAMA_HOST, OLLAMA_MODEL, CORS_ORIGIN
    │
    ├── data/
    │   ├── knowledge_base.json     # info program + detail posisi -> system prompt Ollama
    │   ├── intents.json            # intent statis: tag, contoh_pertanyaan[], jawaban_default
    │   ├── magangjog.db            # SQLite: divisi, konten_item, admin_user
    │   ├── chat_history.db         # SQLite: visitor & pesan (auto-dibuat)
    │   └── uploads/icons/          # file hasil upload admin
    │
    └── app/
        ├── __init__.py             # create_app() — application factory
        ├── config.py               # path & konstanta
        ├── extensions.py           # instance SQLAlchemy `db`
        ├── models.py               # Divisi, KontenItem, AdminUser
        ├── state.py                # KB, INTENTS_BY_TAG, SYSTEM_PROMPT (in-memory)
        ├── db_chat.py              # akses chat_history.db
        │
        ├── services/
        │   ├── kb_summary.py       # ringkas knowledge_base.json -> system prompt
        │   ├── intent_matching.py  # fuzzy-match pesan vs contoh_pertanyaan
        │   ├── ollama_client.py    # panggil Ollama /api/chat
        │   └── auth_service.py     # hash/verifikasi password admin
        │
        └── routes/
            ├── auth.py             # admin_login_required decorator
            ├── public.py           # /api/divisi, /syarat, /fasilitas, /visitor, /chat
            └── admin/               # /api/admin/* (divisi, konten, intents,
                                      # knowledge, riwayat, pengaturan, upload)
```

---

## Arsitektur & Alur Kerja Umum

```
┌─────────────────────┐        REST API + cookie session        ┌──────────────────────┐
│   FRONTEND (React)  │ ───────────────────────────────────────▶│   BACKEND (Flask)     │
│  localhost:5173      │◀─────────────────────────────────────── │   localhost:5000       │
└─────────────────────┘             JSON response                └──────────────────────┘
                                                                         │
                                                        ┌────────────────┼────────────────┐
                                                        ▼                ▼                 ▼
                                               magangjog.db     chat_history.db     Ollama (LLM lokal)
                                             (divisi, konten,   (visitor, pesan)    knowledge_base.json
                                              admin_user)                          + intents.json
```

- **Frontend** tidak menyimpan data apa pun secara permanen — semua data
  (posisi magang, syarat, fasilitas, riwayat chat) diambil real-time dari
  backend lewat `fetch`.
- **Session** (identitas pengunjung chat & login admin) disimpan sebagai
  cookie yang di-set backend, dikirim otomatis oleh frontend berkat opsi
  `credentials: "include"` di setiap request.
- **Chatbot** bekerja hybrid: coba jawab dengan intent statis (cepat, pasti,
  dikelola admin) dulu, baru fallback ke Ollama (LLM lokal) kalau tidak ada
  yang cocok tapi pertanyaan masih relevan dengan topik magang.

---

## Alur Kerja Frontend

### 1. Landing page publik (`/`)

`main.jsx` merender `<App />` di route `/`, disusun dari
`Header → Hero → Syarat → Posisi → Fasilitas → Footer`, dengan
`<ChatWidget />` mengambang di atasnya. Section `Syarat.jsx`, `Posisi.jsx`,
`Fasilitas.jsx` memanggil `lib/api.js` saat mount untuk ambil data dari
backend. Klik posisi di `Posisi.jsx` → route `/posisi/:slug` →
`PosisiDetail.jsx` memanggil `getDivisiBySlug(slug)`.

### 2. Widget Chatbot (`ChatWidget.jsx`)

1. Buka widget → cek `getVisitorStatus()` (`GET /api/visitor`) — apakah
   sesi ini sudah terdaftar (nama + WA)?
2. Kalau belum → tampilkan form → submit `registerVisitor()`
   (`POST /api/visitor`).
3. Ketik pesan → `sendChatMessage(pesan)` (`POST /api/chat`) → tampilkan
   jawaban bot sebagai bubble baru, termasuk field `aksi` bila ada.

### 3. Dashboard Admin (`/admin/*`)

- `AdminAuthContext` cek sesi login lewat `me()` (`GET /api/admin/me`).
- `RequireAdmin` membungkus semua route admin, redirect ke `/admin/login`
  kalau belum login.
- Tiap halaman admin (Divisi, Syarat, Fasilitas, Knowledge, Intents,
  Riwayat, Pengaturan) memakai pola CRUD standar dari `lib/adminApi.js`:
  `list...()` saat mount, `create/update...()` dari form, `delete...()`
  dari tombol hapus, lalu refresh data.
- Upload gambar pakai `FormData` (`uploadIcon`), export riwayat pakai
  navigasi langsung ke URL (bukan `fetch`) supaya browser handle unduhan.

*(Detail lebih lengkap ada di `frontend/README.md`.)*

---

## Alur Kerja Backend

### 1. Saat server start (`create_app()`)

1. Load config (`config.py`) — path DB, host/model Ollama, dll.
2. Aktifkan CORS untuk origin frontend, `supports_credentials=True` (wajib
   supaya cookie session bisa lintas origin 5173 ↔ 5000).
3. `db.create_all()` — bikin tabel `magangjog.db` kalau belum ada + migrasi
   ringan untuk kolom baru pada DB lama.
4. `ensure_default_admin()` — pastikan akun admin default (`admin`/`admin123`)
   ada.
5. `db_chat.init_chat_db()` — bikin tabel `chat_history.db`.
6. `state.reload_runtime_state()` — load `knowledge_base.json` &
   `intents.json` ke memori (`state.KB`, `state.INTENTS_BY_TAG`,
   `state.SYSTEM_PROMPT`). Dipanggil ulang setiap admin mengubah
   knowledge/intents, jadi perubahan langsung berlaku tanpa restart.
7. Register blueprint `auth`, `public`, `admin`, plus route statis
   `GET /uploads/<filename>`.

### 2. Endpoint publik landing page

`GET /api/divisi`, `/divisi/<slug>`, `/syarat`, `/fasilitas` — query
langsung ke SQL (`Divisi`, `KontenItem`), filter `aktif=True`, urutkan
`urutan`, kembalikan JSON.

### 3. Registrasi pengunjung (gerbang chat)

```
GET  /api/visitor            → { registered, nama } dari session
POST /api/visitor {nama, no_telepon}
   → validasi wajib isi
   → generate session_id (uuid) kalau belum ada
   → db_chat.upsert_visitor(...)   # simpan ke chat_history.db
   → session["visitor_nama"] = nama
```

### 4. Inti chatbot: `POST /api/chat`

Urutan pengecekan (berhenti begitu ketemu jawaban):

```
1. Cek session["visitor_nama"] ada? Tidak -> 400 IDENTITY_REQUIRED
2. Log pesan user ke chat_history.db
3. is_off_topic(pesan)?              -> intent "fallback_tidak_dikenali"
4. try_greeting_answer(pesan)?       -> jawaban sapaan
5. match_sensitive_intent_tag(pesan)?-> jawaban topik sensitif
6. match_static_intent_tag(pesan)?   -> fuzzy match RapidFuzz vs intents.json
                                        (threshold: config.INTENT_MATCH_THRESHOLD)
7. match_custom_intent_tag(pesan)?   -> intent tambahan buatan admin
8. Kalau semua di atas gak ketemu:
     has_domain_signal(pesan)?
       Tidak -> jawaban fallback default (Ollama TIDAK dipanggil)
       Ya    -> ask_ollama(host, model, SYSTEM_PROMPT, pesan)
                error/Ollama mati -> tangkap exception, balas fallback
                yang sama, sumber="fallback_error"
9. detect_chat_action(pesan, matched_tag) -> field "aksi" (opsional)
10. Log jawaban bot ke chat_history.db (+ sumber)
11. Return { jawaban, sumber, aksi }
```

`sumber` menandakan asal jawaban: `off_topic`, `greeting`, `sensitive`,
`static`, `custom`, `ollama`, `off_topic_no_domain_signal`, atau
`fallback_error` — berguna untuk debugging/analitik lewat halaman Riwayat.

### 5. Dashboard admin

- **Login**: cek `username`+`password` (hash) di `admin_user` → set session
  admin → dicek oleh decorator `admin_login_required` di semua route
  `/api/admin/*`.
- **CRUD Divisi/Konten/Intents**: standar `GET`/`POST`/`PUT`/`DELETE` ke
  SQLite lewat SQLAlchemy.
- **Knowledge**: berbeda — nulis ulang file `knowledge_base.json`, lalu
  panggil `state.reload_runtime_state()` supaya `SYSTEM_PROMPT` Ollama
  langsung ter-update.
- **Intents**: sama pola dengan Knowledge, tapi ke `intents.json`.
- **Riwayat**: baca `chat_history.db`, tampilkan/transkrip/hapus
  (single/bulk/all), serta export (mengembalikan file, bukan JSON).
- **Pengaturan**: ganti password admin (verifikasi lama, hash baru).
- **Upload**: terima file multipart, validasi ekstensi, simpan ke
  `data/uploads/icons/` dengan nama unik (UUID).

*(Detail penuh tiap file ada di `backend/README.md`.)*

---

## Alur End-to-End (Frontend ⇄ Backend)

Contoh: **pengunjung membuka chat dan bertanya soal syarat magang**

```
[Browser]                    [Frontend React]                  [Backend Flask]
   |                               |                                  |
   | buka website                 |                                  |
   |------------------------------>|                                 |
   |                               | GET /api/divisi                 |
   |                               |--------------------------------->|
   |                               |         JSON list divisi         |
   |                               |<----------------------------------|
   | lihat daftar posisi          |                                  |
   |<-------------------------------|                                 |
   |                               |                                  |
   | klik ikon chat                |                                  |
   |------------------------------->|                                 |
   |                               | GET /api/visitor                 |
   |                               |--------------------------------->|
   |                               |     { registered: false }        |
   |                               |<----------------------------------|
   | isi form nama + no. WA        |                                  |
   |------------------------------->|                                 |
   |                               | POST /api/visitor                |
   |                               |--------------------------------->|
   |                               |  set cookie session,             |
   |                               |  simpan ke chat_history.db       |
   |                               |         { ok: true }             |
   |                               |<----------------------------------|
   | ketik: "syarat magang apa aja?"|                                 |
   |------------------------------->|                                 |
   |                               | POST /api/chat {pesan}           |
   |                               | (cookie ikut terkirim)           |
   |                               |--------------------------------->|
   |                               |    - cek identitas OK            |
   |                               |    - fuzzy match intent          |
   |                               |      "syarat" -> ketemu!         |
   |                               |    - log pesan user & bot        |
   |                               |  { jawaban, sumber:"static" }    |
   |                               |<----------------------------------|
   | lihat jawaban bot              |                                  |
   |<-------------------------------|                                 |
```

Kalau pertanyaan tidak cocok dengan intent manapun tapi masih seputar
topik magang, backend meneruskan ke **Ollama** dengan `SYSTEM_PROMPT` hasil
ringkasan seluruh knowledge base, sehingga jawaban tetap relevan dan
konsisten dengan data yang di-manage lewat dashboard admin.

---

## Cara Menjalankan (Frontend + Backend)

### 1. Backend (jalankan lebih dulu)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # sesuaikan SECRET_KEY, dll

# opsional, wajib untuk mode AI (pertanyaan di luar intent statis):
# install Ollama dari https://ollama.com/download, lalu:
ollama pull qwen2.5:0.5b

python run.py                      # server di http://localhost:5000
```

Di terminal lain (server tetap menyala), isi data awal sekali saja:

```bash
python seed.py
```

**Login admin default:** `admin` / `admin123` — segera ganti lewat menu
Pengaturan setelah login pertama.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # kalau belum ada, buat manual: VITE_API_URL=http://localhost:5000
npm run dev                # server di http://localhost:5173
```

Buka **http://localhost:5173** — pastikan backend di :5000 sudah menyala
lebih dulu.

---

## Ringkasan Endpoint API

### Publik (dipakai landing page & chat widget)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/divisi` | Daftar semua posisi magang aktif |
| GET | `/api/divisi/<slug>` | Detail satu posisi |
| GET | `/api/syarat` | Daftar syarat & ketentuan |
| GET | `/api/fasilitas` | Daftar fasilitas |
| GET | `/api/visitor` | Cek status registrasi sesi chat |
| POST | `/api/visitor` | Registrasi nama + no. WA sebelum chat |
| POST | `/api/chat` | Kirim pesan, terima jawaban bot |

### Admin (butuh login/session admin)

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/admin/login` | Login admin |
| POST | `/api/admin/logout` | Logout admin |
| GET | `/api/admin/me` | Cek sesi admin aktif |
| POST | `/api/admin/upload/icon` | Upload gambar (ikon posisi / konten) |
| GET/POST/PUT/DELETE | `/api/admin/divisi` (`/<id>`) | CRUD posisi magang |
| GET/POST/PUT/DELETE | `/api/admin/konten/<kategori>` (`/item/<id>`) | CRUD syarat/fasilitas |
| GET/POST/PUT/DELETE | `/api/admin/intents` (`/<nama>`) | CRUD intent statis chatbot |
| GET | `/api/admin/knowledge` | Ambil seluruh knowledge base |
| PUT | `/api/admin/knowledge/informasi-program` | Update info program |
| GET/POST/PUT/DELETE | `/api/admin/knowledge/posisi` (`/<nama>`) | CRUD detail posisi (knowledge AI) |
| GET/DELETE | `/api/admin/riwayat` (`/<visitor_id>`) | Lihat/hapus riwayat chat |
| POST | `/api/admin/riwayat/bulk-delete` | Hapus banyak riwayat sekaligus |
| DELETE | `/api/admin/riwayat/all` | Hapus semua riwayat |
| GET | `/api/admin/riwayat/<visitor_id>/export` | Export transkrip 1 visitor |
| GET | `/api/admin/riwayat/export-all` | Export semua riwayat |
| PUT | `/api/admin/pengaturan/password` | Ganti password admin |

---

## Tim Pengembang

| Nama | Peran |
|---|---|
| Eri | Frontend Developer |
| Reval | Frontend Developer |
| Johan | Backend Developer |
| Rega | Backend Developer |

---

## Lisensi

Proyek ini dilisensikan di bawah **MIT License** — bebas dipakai, disalin,
dimodifikasi, digabung, dipublikasikan, didistribusikan, dan/atau dijual,
selama pemberitahuan hak cipta di atas dan pemberitahuan izin ini disertakan
di semua salinan atau bagian penting dari perangkat lunak ini.

Perangkat lunak ini disediakan **"apa adanya"**, tanpa jaminan dalam bentuk
apa pun, tersurat maupun tersirat, termasuk namun tidak terbatas pada
jaminan kelayakan jual, kesesuaian untuk tujuan tertentu, dan tidak
melanggar hak pihak lain.

Lihat detail lengkap di file [`LICENSE`](./LICENSE).

---

*Dokumen ini dibuat otomatis berdasarkan struktur proyek
`magang-jogja-chatbot`. Simpan sebagai README.md di root repository, dan
gunakan `frontend/README.md` untuk dokumentasi yang lebih spesifik ke
frontend saja.*
