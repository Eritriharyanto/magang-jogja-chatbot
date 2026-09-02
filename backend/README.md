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

## Alur Kerja Chatbot

Semua logika ada di dua tempat: endpoint `POST /api/chat`
(`app/routes/public.py`) sebagai "pengatur alur", dan
`app/services/intent_matching.py` sebagai kumpulan fungsi pengecek yang
dipanggil satu-satu secara berurutan. Setiap request chat **wajib** sudah
punya identitas pengunjung (nama + no. WA) — kalau belum, endpoint langsung
menolak sebelum masuk ke logika jawaban.

### Diagram alur

```
                POST /api/chat { pesan }
                          |
                          v
        ┌──────────────────────────────────┐
        │ 1. session["visitor_nama"] ada?   │
        └──────────────────────────────────┘
             |  tidak                 |  ya
             v                        v
   400 IDENTITY_REQUIRED     2. log pesan user -> chat_history.db
   (frontend suruh isi                |
    form nama+WA lagi)                v
                          ┌──────────────────────────────┐
                          │ 3. is_off_topic(pesan)?       │──yes──> jawaban = fallback_tidak_dikenali
                          └──────────────────────────────┘         sumber = "off_topic"
                                       | tidak
                                       v
                          ┌──────────────────────────────┐
                          │ 4. try_greeting_answer(pesan)?│──yes──> jawaban = balasan sapaan
                          └──────────────────────────────┘         sumber = "greeting"
                                       | tidak
                                       v
                          ┌──────────────────────────────────┐
                          │ 5. match_sensitive_intent_tag()?  │──yes──> jawaban = intent sensitif
                          └──────────────────────────────────┘         sumber = "sensitive"
                                       | tidak
                                       v
                          ┌──────────────────────────────────┐
                          │ 6. match_static_intent_tag()?     │──yes──> jawaban = intent statis (intents.json)
                          │    (fuzzy match RapidFuzz,        │         sumber = "static"
                          │    skor >= INTENT_MATCH_THRESHOLD)│
                          └──────────────────────────────────┘
                                       | tidak
                                       v
                          ┌──────────────────────────────────┐
                          │ 7. match_custom_intent_tag()?     │──yes──> jawaban = intent custom admin
                          └──────────────────────────────────┘         sumber = "custom"
                                       | tidak
                                       v
                          ┌──────────────────────────────────┐
                          │ 8. has_domain_signal(pesan)?      │
                          └──────────────────────────────────┘
                             | tidak                | ya
                             v                       v
                 jawaban = fallback        9. ask_ollama(SYSTEM_PROMPT, pesan)
                 default (Ollama TIDAK        |                    |
                 dipanggil)                   | sukses             | error/timeout/Ollama mati
                 sumber =                     v                    v
                 "off_topic_no_domain_signal" jawaban = balasan   jawaban = fallback default
                                              Ollama               sumber = "fallback_error"
                                              sumber = "ollama"
                                       |
                                       v
                    10. detect_chat_action(pesan, matched_tag) -> field "aksi" (opsional)
                                       |
                                       v
                    11. log jawaban bot -> chat_history.db (simpan juga "sumber")
                                       |
                                       v
                    12. return JSON { jawaban, sumber, aksi }
```

### Penjelasan tiap langkah

1. **Cek identitas sesi.** `session["visitor_nama"]` di-set sebelumnya lewat
   `POST /api/visitor` (form nama + no. WhatsApp di widget chat frontend).
   Kalau kosong, chat ditolak dengan `code: "IDENTITY_REQUIRED"` supaya
   frontend tahu harus menampilkan form registrasi lagi.
2. **Catat pesan user.** Setiap pesan masuk selalu dicatat dulu ke
   `chat_history.db` lewat `db_chat.log_message(visitor_id, "user", pesan)`,
   terlepas dari apapun hasil jawabannya nanti — supaya riwayat lengkap
   walau bot gagal jawab.
3. **`is_off_topic(pesan)`** — filter cepat untuk pesan yang jelas-jelas di
   luar konteks (mis. spam/uji-coba/karakter acak). Kalau kena, langsung
   pakai jawaban intent `fallback_tidak_dikenali` dari `intents.json`,
   tanpa proses lebih jauh.
4. **`try_greeting_answer(pesan)`** — deteksi sapaan umum ("halo", "pagi",
   "assalamualaikum", dst) lewat pencocokan kata kunci, balas dengan
   sapaan ramah sebelum masuk ke pencarian intent yang lebih berat.
5. **`match_sensitive_intent_tag(pesan)`** — cek dulu apakah pesan
   menyinggung topik sensitif (di luar wewenang bot menjawab bebas, mis.
   SARA, isu kontroversial, dsb) supaya bot tidak "asal jawab" lewat AI.
6. **`match_static_intent_tag(pesan)`** — inti dari chatbot statis:
   `intent_matching.py` membandingkan pesan user dengan seluruh
   `contoh_pertanyaan` di setiap intent (`intents.json`) memakai
   **fuzzy string matching** dari library **RapidFuzz**. Kalau skor
   kemiripan tertinggi ≥ `INTENT_MATCH_THRESHOLD` (default **72**, bisa
   diubah di `config.py`), tag intent itu dianggap "cocok" dan langsung
   dipakai jawabannya — **tanpa memanggil Ollama sama sekali** (cepat,
   gratis/tanpa beban komputasi, dan konsisten karena dikontrol admin).
7. **`match_custom_intent_tag(pesan)`** — sama prinsipnya dengan langkah 6,
   tapi untuk intent tambahan yang khusus dibuat admin lewat dashboard
   (di luar set intent bawaan), dicek terpisah supaya lebih fleksibel
   untuk dikelola/di-nonaktifkan.
8. **`has_domain_signal(pesan)`** — kalau sampai di sini artinya tidak ada
   satupun intent yang cocok. Sebelum melempar ke Ollama (yang lebih berat
   & lambat), backend cek dulu apakah pesan **masih mengandung kata kunci
   seputar topik magang** sama sekali. Kalau tidak (mis. "dimana rumah
   jokowi", "1+1 berapa"), backend langsung balas jawaban fallback default
   **tanpa** memanggil Ollama — ini penting supaya bot tetap responsif
   cepat dan tidak membuang resource untuk pertanyaan yang jelas di luar
   topik, sekaligus tetap jalan normal walau Ollama sedang mati/lambat.
9. **`ask_ollama(...)`** — kalau pesan masih relevan dengan topik magang
   tapi tidak cocok intent manapun (pertanyaan bebas/kompleks), baru
   di-lempar ke **Ollama** (`services/ollama_client.py`) memakai
   `SYSTEM_PROMPT` yang sudah disiapkan saat server start/reload
   (`state.SYSTEM_PROMPT`, hasil ringkasan `knowledge_base.json` oleh
   `kb_summary.py`). Ini membuat jawaban AI tetap berpijak ke data program
   & posisi magang yang sebenarnya, bukan mengarang bebas. Kalau Ollama
   gagal dipanggil (server mati, timeout, error koneksi), exception
   ditangkap dan backend tetap membalas dengan jawaban fallback yang sopan
   (`sumber: "fallback_error"`) — **tidak pernah crash** ke user.
10. **`detect_chat_action(pesan, matched_tag)`** — opsional, mendeteksi
    apakah dari pesan/tag yang cocok bisa disarankan sebuah "aksi" cepat ke
    frontend, misalnya arahkan user melihat halaman detail posisi tertentu,
    atau tampilkan tombol kontak WhatsApp admin.
11. **Catat jawaban bot.** Jawaban akhir (apapun sumbernya) dicatat ke
    `chat_history.db` lewat `log_message(visitor_id, "bot", jawaban, source=sumber)`,
    sehingga admin bisa melihat riwayat lengkap dan menganalisis dari
    sumber mana saja bot paling sering menjawab (menu **Riwayat Chat**).
12. **Response akhir** dikembalikan sebagai JSON
    `{ jawaban, sumber, aksi }` ke frontend, yang lalu ditampilkan sebagai
    bubble chat baru di widget.

### Kenapa urutannya seperti ini?

Urutan dirancang dari yang **paling murah & pasti** ke yang **paling
berat & fleksibel**:

| Urutan | Metode | Biaya komputasi | Konsistensi jawaban |
|---|---|---|---|
| 1–7 | Rule-based / fuzzy match (intents.json) | Sangat murah, instan | Pasti & bisa dikontrol penuh oleh admin |
| 8 | Filter domain (keyword check) | Murah, instan | Mencegah Ollama dipanggil sia-sia |
| 9 | Ollama (LLM lokal) | Lebih berat, butuh model jalan | Fleksibel tapi bisa bervariasi |

Sehingga mayoritas pertanyaan umum (syarat, fasilitas, cara daftar, jam
operasional, dst) akan dijawab lewat intent statis yang cepat & konsisten,
dan Ollama hanya dipakai sebagai "jaring pengaman" untuk pertanyaan yang
lebih spesifik/tidak terduga tapi masih relevan dengan topik magang.

### Bagaimana admin mengubah perilaku chatbot

- Tambah/edit/hapus **FAQ statis** → menu **Intents** di dashboard → simpan
  ke `intents.json` → `state.reload_runtime_state()` dipanggil otomatis →
  perubahan langsung aktif di request berikutnya, **tanpa restart server**.
- Tambah/edit **info program & posisi magang** yang jadi konteks Ollama →
  menu **Knowledge** di dashboard → simpan ke `knowledge_base.json` →
  `kb_summary.py` meringkas ulang jadi `SYSTEM_PROMPT` baru → juga langsung
  aktif tanpa restart.
- Naikkan/turunkan **sensitivitas fuzzy match** → ubah
  `INTENT_MATCH_THRESHOLD` di `app/config.py` (default 72; makin tinggi
  makin ketat/mirip persis, makin rendah makin longgar tapi rawan salah
  cocok).

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
- **Intent statis kok gak kepanggil terus?** → cek skor
  `INTENT_MATCH_THRESHOLD` di `app/config.py`, atau tambahkan lebih banyak
  variasi `contoh_pertanyaan` di intent terkait lewat menu **Intents**
  supaya fuzzy match lebih mudah menemukan kecocokan.