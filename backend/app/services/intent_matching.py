"""Semua logic pencocokan intent berbasis keyword: deteksi pesan di luar
topik, intent sensitif (komplain/keluhan), sapaan, intent statis bawaan
kode (info program magang), dan intent custom per posisi yang keyword-nya
diisi lewat admin panel (field "keywords" di intents.json, mis. posisi
Programmer / UI-UX Designer / dst beserta jobdesk & skill yang dibutuhkan).

Menggantikan pendekatan fuzzy-matching (rapidfuzz) yang sebelumnya dipakai
di modul ini, supaya alur & gaya kodenya konsisten dengan contoh yang
diberikan: keyword list eksplisit per intent, dicek pakai substring match.
"""
import re

from .. import state

OFF_TOPIC_PHRASES = [
    "nyanyi", "lagu", "film", "nonton", "series", "netflix",
    "catering", "kuliner", "resep masakan", "resep makanan", "masakin",
    "pinjem duit", "pinjam duit", "pinjemin duit", "pinjol", "hutang", "utang",
    "kenalan", "kenlan", "pacar", "jodoh", "kencan",
    "robot beneran", "kamu manusia", "orang asli", "chatbot beneran",
    "jam tidur kamu", "chat wa ku gak dibales", "chat wa ku ga dibales",
    "gaji artis", "scam", "penipu", "penipuan",
    "cuaca", "berita hari ini", "politik", "presiden",
    "python", "coding", "kode program",
    "tugas sekolah", "pr sekolah", "kuliah dimana",
    "resep dokter",
    "qwerty", "asdfgh", "sadfgh",
    "masak", "resep masak", "resepin",
    "puisi", "pantun", "cerita dong", "dongeng",
    "sejarah indonesia", "sejarah dunia",
    "musik apa", "lagu apa", "penyanyi",
    "diet", "olahraga apa",
    "terjemahin", "translate",
    "zodiak", "ramalan", "ramal",
    "matematika", "hitungan matematika",
]

_REPEATED_CHAR_RE = re.compile(r"(.)\1{5,}")  # mis. "aaaaaaaaaa"
_REPEATED_PAIR_RE = re.compile(r"(..)\1{3,}")  # mis. "wkwkwkwk"


def _looks_like_gibberish(token: str) -> bool:
    """Kata >=6 huruf tanpa vokal sama sekali biasanya bukan kata Indonesia
    yang valid (mis. 'bhjasdf'). Juga tangkep spam huruf berulang (mis.
    'aaaaaaaaaa', 'wkwkwkwkwk') yang lolos dari cek vokal karena tetap ada
    huruf hidupnya."""
    if not token.isalpha():
        return False
    if len(token) >= 6 and not re.search(r"[aeiou]", token):
        return True
    if len(token) >= 6 and (_REPEATED_CHAR_RE.search(token) or _REPEATED_PAIR_RE.search(token)):
        return True
    return False


def is_off_topic(message: str) -> bool:
    lower = message.lower()
    tokens = [t.strip(".,!?-") for t in lower.split()]
    tokens = [t for t in tokens if t]

    if not tokens:
        # pesan cuma tanda baca/spam karakter (mis. "?!!!?!", "....")
        return True

    if any(_looks_like_gibberish(t) for t in tokens):
        return True

    if any(phrase in lower for phrase in OFF_TOPIC_PHRASES):
        # kecuali kalau di kalimat yang sama juga ada kata kunci domain
        # magang yang jelas, biar aman diserahin ke LLM daripada ditolak
        if any(kw in lower for kw in state.DOMAIN_KEYWORDS):
            return False
        return True

    return False


SENSITIVE_INTENT_KEYWORDS = [
    ("komplain_keluhan", [
        "komplain", "keluhan", "ngadu", "kecewa", "kurang memuaskan",
        "pelayanannya kurang", "gak dibales", "ga dibales", "lama banget balesnya",
        "lama banget balesin", "kok gini banget pelayanannya",
    ]),
]


def _keyword_matches(kw_lower: str, lower_message: str) -> bool:
    """Forward match: True kalau `kw_lower` "ada di dalam" pesan.

    Buat keyword yang PANJANG (>3 huruf, biasanya frasa beberapa kata kayak
    "sistem kerja" atau "cara daftar"), substring biasa udah cukup aman —
    kecil kemungkinan nyantol gak sengaja di tengah kata lain.

    Tapi buat keyword PENDEK (<=3 huruf, mis. "wa", "sip", "las", "pkl"),
    substring biasa BAHAYA: gampang ketemu nyempil di tengah kata yang gak
    ada hubungannya sama sekali. Nemu kejadian nyata pas testing:
    - keyword "wa" (buat kontak WhatsApp) nyantol di "kawasan", "jawaban",
      "dewasa", "diawasin", "wawancara", "jawa", "bawaannya", dst.
    - keyword "sip" (buat "makasih/oke sip") nyantol di "prinsip", "arsip".
    - keyword "las" (posisi Las/pengelasan) nyantol di "kelas", "balas",
      "jelas", "malas", "gelas" — kata-kata umum banget di bahasa Indonesia.
    Makanya buat keyword pendek, wajib dicek sebagai KATA UTUH (dibatasi
    word boundary \\b), bukan sekadar rangkaian huruf yang kebetulan nyempil.
    """
    if len(kw_lower) <= 3:
        return re.search(rf"\b{re.escape(kw_lower)}\b", lower_message) is not None
    return kw_lower in lower_message


def _find_tag(lower_message: str, groups: list[tuple[str, list[str]]]) -> str | None:
    """Cari tag intent yang paling cocok dari sekumpulan (tag, keywords),
    dicek 3 tingkat prioritas (biar gak salah nyantol ke intent lain):

    1. EXACT: pesan user sama persis dengan salah satu keyword. Prioritas
       tertinggi supaya mis. pesan "sertifikat" pasti ke tanya_sertifikat,
       bukan ke intent lain yang keyword-nya cuma KEBETULAN mengandung kata
       "sertifikat" di tengah frasa (mis. "selain sertifikat" di keyword
       fasilitas/benefit).
    2. FORWARD: keyword (frasa) ada di dalam pesan — ini cara matching yang
       dipakai dari awal, cocok buat pesan yang panjang/lengkap. Keyword
       pendek (<=3 huruf) dicek sebagai kata utuh, lihat _keyword_matches().
    3. FALLBACK: pesan (min. 4 karakter, biar kata ambigu kayak "wa"/"hr"
       gak asal nyantol) ada di dalam salah satu keyword — nolong pesan
       pendek 1-2 kata (mis. "lokasi", "divisi") yang keyword-nya berupa
       frasa lebih panjang, sehingga forward match di atas gak kena.
    """
    for tag, keywords in groups:
        if any(kw.lower() == lower_message for kw in keywords):
            return tag
    for tag, keywords in groups:
        if any(_keyword_matches(kw.lower(), lower_message) for kw in keywords):
            return tag
    if len(lower_message) >= 4:
        for tag, keywords in groups:
            if any(lower_message in kw.lower() for kw in keywords):
                return tag
    return None


def match_sensitive_intent(message: str) -> str | None:
    tag = _find_tag(message.lower(), SENSITIVE_INTENT_KEYWORDS)
    if tag:
        intent = state.INTENTS_BY_TAG.get(tag)
        if intent:
            return intent["jawaban_default"]
    return None


def match_sensitive_intent_tag(message: str) -> str | None:
    return _find_tag(message.lower(), SENSITIVE_INTENT_KEYWORDS)


GREETING_WORDS = [
    "halo", "hallo", "hai", "haii", "hi", "hey", "helo", "hello",
    "pagi", "siang", "sore", "malam", "met pagi", "met siang", "met sore", "met malam",
    "selamat pagi", "selamat siang", "selamat sore", "selamat malam",
    "assalamualaikum", "permisi", "min", "kak", "woy", "woi",
]


def try_greeting_answer(message: str) -> str | None:
    lower = message.lower().strip()
    tokens = [t.strip(".,!?-") for t in lower.split()]
    tokens = [t for t in tokens if t]
    if not tokens or len(tokens) > 5:
        return None
    if all(any(g == t or t in g or g in t for g in GREETING_WORDS) for t in tokens):
        sapaan_intent = state.INTENTS_BY_TAG.get("sapaan")
        if sapaan_intent:
            return sapaan_intent["jawaban_default"]
    return None


STATIC_INTENT_KEYWORDS = [
    ("tanya_daftar_posisi", [
        "posisi apa aja", "posisi yang bisa dilamar", "formasi magang",
        "list posisi", "daftar posisi magang", "bagian apa aja buat magang",
        "divisi apa aja", "jurusan apa aja", "posisi magangnya apa aja",
        "semua formasi magang", "posisi magang buat mahasiswa apa aja", "divisi apa aja",
    ]),
    ("tanya_syarat_pendaftaran", [
        "syarat daftar", "syarat pendaftaran", "syarat magang", "butuh syarat apa",
        "kelengkapan apa yang perlu disiapin", "berkas apa aja yang perlu disiapin",
        "dokumen yang dibutuhin", "surat pengantar", "wajib bawa apa aja",
        "kudu punya cv", "syarat ikut pkl", "syarat umum magang",
        "batas umur atau jurusan tertentu",
    ]),
    ("tanya_cara_daftar", [
        "cara daftar", "cara daftar magang", "step by step daftar", "proses pendaftaran",
        "gimana caranya daftar", "daftarnya lewat mana", "langkah-langkah daftar",
        "abis chat admin terus ngapain", "kalo tertarik salah satu posisi, harus ngapain",
        "mau apply magang", "alur seleksinya", "mulai dari mana",
    ]),
    ("tanya_durasi_magang", [
        "durasi magang", "durasinya fix apa bisa nego", "minimal berapa bulan",
        "maksimal magang disini berapa lama", "magang cuma seminggu", "diperpanjang gak",
        "boleh magang cuma sebentar", "waktu magang mepet", "disesuain sama jadwal kuliah",
        "magang 6 bulan",
    ]),
    ("tanya_sistem_kerja", [
        "wfo", "wfh", "hybrid", "sistem kerja", "onsite atau remote",
        "dateng ke kantor apa bisa dari rumah", "magang online", "bisa remote",
        "ngantor tiap hari apa fleksibel", "jam kerjanya gimana kalo wfo",
    ]),
    ("tanya_lokasi_magang", [
        "lokasi magang", "alamat kantornya", "penempatan magang", "khusus daerah jogja",
        "kantor/mitra magangnya dimana", "lokasi magangnya dimana", "daerah mana",
        "lokasi dimana", "lokasinya dimana", "dimana lokasinya", "lokasi magang dimana",
        "tempat magang dimana", "dimana lokasi magangnya", "dimana tempatnya",
        "alamatnya dimana", "kantornya dimana", "magangnya dimana",
    ]),
    ("tanya_target_peserta", [
        "siswa smk", "siswa sma", "boleh daftar gak", "fresh graduate",
        "anak sekolah", "pkl", "yang bisa daftar magang disini siapa aja",
        "udah lulus kuliah masih bisa daftar", "mahasiswa doang apa siswa",
    ]),
    ("tanya_fasilitas_benefit", [
        "benefit", "fasilitas", "dapet apa lagi", "dapet apa aja kalo magang",
        "selain sertifikat", "untungnya ikut magang", "worth it gak magang",
        "uang saku gak buat anak magang",
    ]),
    ("tanya_sertifikat", [
        "sertifikat", "syarat dapet sertifikat", "sertifikatnya dikasih kapan",
        "sertifikat magang bisa dipake buat syarat kuliah",
    ]),
    ("tanya_biaya_pendaftaran", [
        "biaya pendaftaran", "bayar gak", "dipungut biaya", "ada biaya lagi",
        "modal awal buat daftar", "magang disini gratis", "biaya daftar magang",
    ]),
    ("tanya_kontak_admin", [
        "nomor admin", "kontak admin", "nomor wa", "no wa", "nomor whatsapp",
        "instagram", "cara hubungi admin", "minta nomor admin", "kontak yang bisa dihubungi", "wa"
    ]),
    ("tanya_posisi_lainnya", [
        "liat semua posisi magang lengkapnya", "cek lowongan terbaru",
        "posisi magang selain itu ada lagi", "info detail tiap posisi",
        "website resmi", "web resmi", "info lain soal magang jogja",
    ]),
    ("tanya_gelombang_pendaftaran", [
        "gelombang pendaftaran", "pendaftaran dibuka kapan", "daftar bulan depan",
        "lagi buka pendaftaran", "tutup pendaftaran, kapan buka lagi",
        "daftar dari jauh-jauh hari",
    ]),
    ("tanya_kuota_peserta", [
        "kuota", "slot magang terbatas", "kuota tiap posisi berapa orang",
        "berapa banyak yang diterima tiap posisi",
    ]),
    ("tanya_uang_saku", [
        "uang saku", "murni volunteer apa dibayar", "magang disini dibayar gak",
        "nominal uang sakunya",
    ]),
    ("tanya_domisili_luar_kota", [
        "luar kota", "luar jogja", "luar pulau", "disediain kos", "penginapan",
        "anak rantau", "gak punya tempat tinggal di jogja",
    ]),
    ("tanya_mitra_kerja", [
        "mitra kerja", "ditempatin di perusahaan mana", "nyalurin ke perusahaan mana",
        "kerja sama sama bisnis apa", "ditempatin dimana kalo magang",
    ]),
    ("tanya_peluang_karier", [
        "direkrut jadi karyawan", "peluang karier", "peluang lanjut kerja",
        "ditawarin kerja", "lanjut kerja abis magang",
    ]),
    ("tanya_evaluasi_magang", [
        "evaluasi kinerja", "ditegur gak", "dipantau sama pembimbing",
        "laporan progress", "gimana cara ngukur berhasil",
    ]),
    ("tanya_daftar_lebih_dari_satu_posisi", [
        "lebih dari satu posisi", "dua posisi sekaligus", "apply dua posisi",
        "bingung mau pilih posisi yang mana",
    ]),
    ("tanya_belum_ada_pengalaman", [
        "gak punya skill apa-apa", "ga punya skill apa-apa", "modal nekat doang",
        "belum jago", "masih newbie", "belum punya pengalaman",
    ]),
    ("tanya_testimoni", [
        "testimoni", "kata orang-orang", "review magang jogja", "banyak yang puas",
    ]),
    ("rekomendasi_posisi_sesuai_jurusan", [
        "disaranin apa", "disaranin posisi apa", "cocoknya jadi apa", "posisi yang cocok",
        "gak punya basic apa-apa", "cocoknya kemana", "mending ambil posisi apa",
        "jurusan apa buat magang",
    ]),
    ("aturan_tata_tertib", [
        "jam kerjanya jam berapa", "dress code", "izin mendadak", "peraturan yang wajib dipatuhi",
        "tata tertib", "izin sakit", "daftar ulang abis gagal",
    ]),
    ("tanya_alat_kerja_laptop", [
        "laptop", "alat kerja disediain", "bawa alat sendiri", "disediain laptop",
        "software desain disediain", "printer", "spek nya rendah",
    ]),
    ("penutup_terima_kasih", [
        "makasih", "makasi", "terima kasih", "terimakasih", "trims",
        "thanks", "thank you", "oke deh", "sip",
    ]),
    # Ditaruh PALING TERAKHIR di list ini dengan sengaja: ini intent umum/generik
    # (nanya "magang jogja itu apa" secara garis besar), jadi kalau pesan user
    # ternyata juga nyerempet ke intent yang lebih spesifik (mis. sekalian nanya
    # syarat/posisi), intent yang lebih spesifik itu harus menang duluan karena
    # dicek lebih dulu (lihat urutan looping di _find_tag()).
    ("tanya_info_umum_magang", [
        "info magang jogja", "info magang", "magang jogja itu apa",
        "magang jogja itu apaan", "magangjogja itu apa", "magangjogja.com itu apa",
        "ceritain soal magang jogja", "ceritain magang jogja",
        "jelasin magang jogja", "jelasin soal magang jogja",
        "tentang magang jogja", "soal magang jogja", "program magang jogja ini",
        "kenalin magang jogja", "gambaran umum magang jogja",
        "overview magang jogja", "magang jogja ini tentang apa",
        "magang jogja ini apa", "magang jogja tuh apa", "magang jogja itu gimana",
        "apa itu magang jogja", "magang jogja itu resmi", "magang jogja terpercaya",
        "magang jogja penipuan", "bukan penipuan kan", "visi misi magang jogja",
        "tujuan magang jogja", "kenapa harus ikut magang jogja",
        "bedanya magang jogja", "magang jogja bergerak di bidang",
        "magang jogja ngapain aja", "isinya magang jogja apa aja",
        "baru denger magang jogja", "penasaran sama magang jogja",
    ]),
]


def match_static_intent(message: str) -> str | None:
    tag = _find_tag(message.lower(), STATIC_INTENT_KEYWORDS)
    if tag:
        intent = state.INTENTS_BY_TAG.get(tag)
        if intent:
            return intent["jawaban_default"]
    return None


def match_static_intent_tag(message: str) -> str | None:
    """Sama seperti match_static_intent, tapi return NAMA TAG intent-nya
    (bukan teks jawaban). Dipakai buat nentuin apakah balasan ini perlu
    ditempeli elemen interaktif tambahan (tombol WA admin, tombol daftar
    posisi tertentu, dsb)."""
    return _find_tag(message.lower(), STATIC_INTENT_KEYWORDS)


def _slug_from_context_set(context_set):
    """'posisi_magang.photographer__videographer.jobdesk' -> 'photographer-videographer'
    (cocok sama slug yang dipakai di tabel Divisi/halaman Posisi Magang)."""
    if not context_set:
        return None
    parts = context_set.split(".")
    if len(parts) < 2 or parts[0] != "posisi_magang":
        return None
    return parts[1].replace("__", "-").replace("_", "-")


def detect_chat_action(user_message: str, matched_tag: str | None) -> dict | None:
    """Tentukan elemen interaktif tambahan apa (kalau ada) yang perlu
    ditampilkan di bawah bubble jawaban asisten:
    - {'type': 'kontak'} -> tombol chat WhatsApp Admin
    - {'type': 'daftar', 'url': ..., 'label': ...} -> tombol buka Google Form
      pendaftaran KHUSUS posisi yang lagi dibahas (kalau linknya sudah
      diisi admin di halaman Posisi Magang)
    - None -> tidak ada elemen tambahan
    """
    if not matched_tag:
        return None

    if matched_tag in ("tanya_kontak_admin", "tanya_cara_daftar", "komplain_keluhan", "tanya_info_umum_magang"):
        return {"type": "kontak"}

    if matched_tag.startswith("tanya_jobdesk_") or matched_tag.startswith("tanya_skill_"):
        intent = state.INTENTS_BY_TAG.get(matched_tag)
        slug = _slug_from_context_set(intent.get("context_set") if intent else None)
        if slug:
            from ..models import Divisi

            divisi = Divisi.query.filter_by(slug=slug, aktif=True).first()
            if divisi and divisi.gform_link:
                return {
                    "type": "daftar",
                    "url": divisi.gform_link,
                    "label": f"Daftar posisi {divisi.label}",
                }
        return {"type": "kontak"}

    return None


_GENERIC_KEYWORD_MIN_INTENTS = 4
"""Ambang batas buat nentuin sebuah keyword itu 'generik' (bukan pembeda
posisi) apa 'spesifik' (nama posisi tertentu). Nama posisi kayak
'programmer' cuma nongol di 2 intent (pasangan jobdesk+skill posisi itu
sendiri), sedangkan kata umum kayak 'syarat'/'skill' sengaja ditaruh admin
di SEMUA intent tanya_skill_* (19 posisi) biar bisa jadi bonus poin combo.
4 dipilih supaya aman di antara keduanya (2 vs 19) dan gak hardcode
kata-kata tertentu — jadi tetap kepakai walau admin nambah keyword generik
lain lewat dashboard di masa depan."""


def _generic_keywords(intents) -> set[str]:
    """Keyword yang muncul di >= _GENERIC_KEYWORD_MIN_INTENTS intent
    berbeda dianggap 'generik' — gak cukup buat nunjukin posisi/topik
    tertentu kalau berdiri sendiri, cuma valid jadi BONUS kalau pesan juga
    match keyword lain yang lebih spesifik dari intent yang sama."""
    counts: dict[str, int] = {}
    for intent in intents:
        seen_in_this_intent = {kw.lower() for kw in (intent.get("keywords") or [])}
        for kw in seen_in_this_intent:
            counts[kw] = counts.get(kw, 0) + 1
    return {kw for kw, cnt in counts.items() if cnt >= _GENERIC_KEYWORD_MIN_INTENTS}


def _best_custom_intent(message: str) -> dict | None:
    """Cari intent dengan 'keywords' (diisi lewat admin panel) yang paling
    banyak cocok dengan pesan user. Dipakai buat intent per posisi magang
    (tanya_jobdesk_* dan tanya_skill_*), karena tiap posisi sudah dikasih
    keyword sendiri (mis. 'programmer', 'ui/ux designer', 'syarat', 'skill')
    lewat dashboard admin, TANPA perlu edit kode ini tiap ada posisi baru.
    Kalau pesan menyebut nama posisi + kata 'syarat'/'skill' sekaligus,
    intent tanya_skill_* menang karena hits-nya lebih banyak dibanding
    tanya_jobdesk_* (yang cuma match nama posisinya saja).

    PENTING: kata generik kayak 'syarat'/'skill' (lihat _generic_keywords())
    cuma dihitung sebagai BONUS, bukan skor utama. Kalau pesan cuma
    ngandung kata generik itu doang TANPA nyebut nama posisi apa pun (mis.
    "yang jelas syaratnya apa aja"), skornya harus 0 — jangan sampai nyasar
    ke posisi acak yang kebetulan urutannya paling awal. Bonus generik cuma
    kepake kalau intent itu juga udah punya minimal 1 match dari keyword
    SPESIFIK-nya sendiri (biasanya nama posisi)."""
    lower = message.lower()
    generic = _generic_keywords(state.INTENTS)
    best_intent = None
    best_score = 0
    for intent in state.INTENTS:
        keywords = intent.get("keywords") or []
        if not keywords:
            continue
        anchor_score = 0  # dari keyword SPESIFIK (mis. nama posisi)
        bonus_score = 0   # dari keyword GENERIK (mis. "syarat", "skill")
        for kw in keywords:
            kw_lower = kw.lower()
            if kw_lower == lower:
                pts = 3  # exact match: paling kuat, gak boleh kalah sama
                # keyword lain yang cuma kebetulan MENGANDUNG kata ini
            elif _keyword_matches(kw_lower, lower):
                pts = 2  # keyword ketemu utuh di dalam pesan (normal case)
            elif len(lower) >= 4 and lower in kw_lower:
                pts = 1  # fallback: pesan pendek ketemu di dalam keyword
            else:
                continue
            if kw_lower in generic:
                bonus_score += pts
            else:
                anchor_score += pts
        # bonus generik cuma dihitung kalau ada anchor spesifik yang match
        score = anchor_score + (bonus_score if anchor_score > 0 else 0)
        if score > best_score:
            best_score = score
            best_intent = intent
    return best_intent


def match_custom_intent(message: str) -> str | None:
    """Return teks jawaban dari intent custom (keyword admin) yang paling
    cocok, atau None kalau tidak ada yang match."""
    intent = _best_custom_intent(message)
    return intent["jawaban_default"] if intent else None


def match_custom_intent_tag(message: str) -> str | None:
    """Sama seperti match_custom_intent, tapi return NAMA TAG-nya. Dipakai
    bareng detect_chat_action() supaya intent per posisi (jobdesk/skill)
    juga bisa ditempeli tombol 'Daftar posisi ini' kalau linknya sudah
    diisi admin."""
    intent = _best_custom_intent(message)
    return intent["intent"] if intent else None