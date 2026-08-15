# Backend Magang Jogja (Flask + SQLite + Ollama)

Arsitektur backend ini mengikuti pola dari referensi
[Chat-Bot-penyewaan-jas-sepatu-celana-versi-ollama-dan-statick](https://github.com/Eritriharyanto/Chat-Bot-penyewaan-jas-sepatu-celana-versi-ollama-dan-statick),
disesuaikan untuk kebutuhan MagangJogja: dashboard admin CRUD posisi
magang + chatbot statis & Ollama yang datanya bisa diedit lewat dashboard.

## 1. Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # lalu edit SECRET_KEY dsb kalau perlu
```

## 2. Install & jalankan Ollama (buat chatbot mode AI)

Download & install dari **https://ollama.com/download**, lalu:

```bash
ollama pull qwen2.5:0.5b
```

Kalau laptop terasa berat, ganti ke model lebih kecil (`qwen2.5:1.5b`) dan
update `OLLAMA_MODEL` di `.env`.

## 3. Jalankan server + seed data awal

```bash
python run.py        # sekali jalan dulu -> tabel SQLite otomatis dibuat
```

Di terminal lain (server tetap jalan), isi data awal (18 posisi magang,
syarat, fasilitas dari frontend yang sudah ada), sekali saja:

```bash
python seed.py
```

Server aktif di **http://localhost:5000**.

## 4. Login admin default

```
username: admin
password: admin123
```

**GANTI password ini** lewat `PUT /api/admin/pengaturan/password` setelah
login pertama kali.

## Struktur folder

```
backend/
├── run.py                      # entry point ("python run.py")
├── seed.py                     # isi awal DB dari data 18 posisi yang sudah ada
├── requirements.txt
├── .env.example
├── data/
│   ├── knowledge_base.json     # info program + posisi_magang (untuk system prompt Ollama)
│   ├── intents.json            # daftar intent + contoh pertanyaan + jawaban (static chatbot)
│   ├── magangjog.db            # SQLite: divisi, konten (syarat/fasilitas), admin_user
│   └── chat_history.db         # SQLite: visitor + riwayat chat (auto-dibuat)
└── app/
    ├── __init__.py             # create_app() — application factory
    ├── config.py                # path & konstanta (Ollama host/model, threshold, dll)
    ├── extensions.py            # instance db (SQLAlchemy)
    ├── models.py                 # Divisi, KontenItem, AdminUser (tabel SQL)
    ├── state.py                  # KB, INTENTS, SYSTEM_PROMPT + reload_runtime_state()
    ├── db_chat.py                 # akses chat_history.db (visitor & pesan)
    ├── services/
    │   ├── kb_summary.py          # ringkas knowledge_base.json -> system prompt
    │   ├── intent_matching.py     # fuzzy-match pesan vs contoh_pertanyaan (rapidfuzz)
    │   ├── ollama_client.py       # panggil Ollama /api/chat
    │   └── auth_service.py        # hash & verifikasi password admin
    └── routes/
        ├── auth.py                 # login/logout admin + decorator admin_login_required
        ├── public.py                # /api/divisi, /api/syarat, /api/fasilitas, /api/chat
        └── admin/                   # semua /api/admin/*, 1 file per submenu
            ├── divisi.py             # CRUD posisi magang
            ├── konten.py             # CRUD syarat & fasilitas
            ├── intents.py            # CRUD intents.json (FAQ chatbot statis)
            ├── knowledge.py          # edit knowledge_base.json
            ├── riwayat.py            # rekap chat pengunjung
            └── pengaturan.py         # ganti password admin
```

## Cara kerja chatbot

1. Pesan user masuk lewat `POST /api/chat`.
2. `intent_matching.py` coba cocokkan pesan dengan `contoh_pertanyaan` di
   `intents.json` pakai fuzzy matching (skor 0-100). Kalau skor >= 72,
   langsung balas pakai `jawaban_default` intent itu — **tanpa panggil
   Ollama sama sekali** (cepat, gratis, konsisten).
3. Kalau tidak ada yang cocok, pesan dilempar ke Ollama, dengan system
   prompt hasil ringkasan `knowledge_base.json` (dibangun oleh
   `kb_summary.py`) supaya jawaban AI tetap berpijak ke data asli.
4. Semua pesan (baik dari user maupun bot) dicatat ke `chat_history.db`,
   bisa dilihat admin di menu **Riwayat Chat**.

## Panel admin (dikonsumsi dari dashboard React, bukan Flask template)

- **Divisi** (`/api/admin/divisi`) — CRUD posisi magang: tambah, edit,
  hapus, atau sembunyikan (`aktif=false`) tanpa hapus data.
- **Konten** (`/api/admin/konten/<syarat|fasilitas>`) — CRUD baris syarat
  & fasilitas.
- **Intents** (`/api/admin/intents`) — CRUD FAQ statis chatbot. Setiap
  simpan otomatis ditulis ke `intents.json` + langsung aktif tanpa restart
  server (lewat `reload_runtime_state()`).
- **Knowledge** (`/api/admin/knowledge/...`) — edit daftar posisi di
  knowledge base (dipakai konteks Ollama) dan edit `informasi_program`
  (mode lanjutan, kirim JSON mentah).
- **Riwayat** (`/api/admin/riwayat`) — daftar pengunjung + transkrip chat.
- **Pengaturan** (`/api/admin/pengaturan/password`) — ganti password admin.

> **Catatan privasi:** `data/chat_history.db` bisa berisi identitas
> pengunjung kalau kamu tambahkan gerbang nama+WA. Jangan commit ke repo
> publik.

## Troubleshooting

- **"Ollama gak kepanggil"** → pastikan `ollama serve` jalan, dan
  `OLLAMA_HOST`/`OLLAMA_MODEL` di `.env` sudah benar. Endpoint `/api/chat`
  tetap balas (fallback pesan sopan), gak crash, kalau Ollama gak
  ketemu — cek log server buat detail error-nya.
- **CORS error dari frontend React** → pastikan `CORS_ORIGIN` di `.env`
  sama persis dengan URL dev server frontend (`http://localhost:5173`
  default Vite).
