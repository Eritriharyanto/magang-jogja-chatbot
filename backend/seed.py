"""
Isi data awal DB (magangjog.db): 18 posisi magang, syarat, dan fasilitas —
disalin dari frontend/src/data/content.js supaya landing page yang tadinya
statis tetap tampil sama persis setelah dipindah ke backend.

Jalankan SEKALI SAJA setelah `python run.py` pertama kali bikin tabel:
    python seed.py

Aman dijalankan ulang (idempotent) — kalau data sudah ada, tidak dobel.
"""
from app import create_app
from app.extensions import db
from app.models import Divisi, KontenItem

GFORM_DEFAULT = "https://forms.gle/GANTI-DENGAN-LINK-GFORM-KAMU"

SYARAT = [
    "Mengisi Form Pendaftaran Magang (bs minta ke Admin Magangjogja di 0895 2900 2944)",
    "Membawa surat keterangan atau surat pengantar dari sekolah/kampus",
    "Direstui orangtua atau sudah ijin orangtua",
    "Memiliki niat positif untuk mencari skill & pengalaman selama magang berjalan",
    "Mau latihan hidup mandiri, dewasa dan latihan jauh dari orangtua.\nJadi lulus dari magang sudah siap hidup mandiri",
    "Mau berinteraksi dengan karyawan, menjaga nama baik perusahaan, kampus/sekolah, dan diri sendiri",
]

FASILITAS = [
    "Bimbingan dari staff / asisten kami",
    "Ada pelatihan diluar jam kerja",
    "Mendapatkan sertifikat + seragam magangjogja.com",
    "Koneksi Internet Free (bagi yang WFO)",
    "Bagi yang jauh dari luar kota diberikan info kost murah",
    "Free drink (Coffee & Tea)",
    "Mendapat surat rekomendasi",
    "Mendapatkan kesempatan untuk bergabung dan\nbekerjasama di project-project team kami",
    "Networking & Experience",
]

# icon_filename kosong -> frontend fallback ke SVG lokal di /assets/posisi/{slug}.svg
POSISI = [
    dict(slug="administrasi", label="Administrasi", sub=None,
         deskripsi="Membantu operasional administratif harian perusahaan, mulai dari pengelolaan data hingga surat-menyurat.",
         jobdesk=["Input dan mengelola data administrasi perusahaan", "Mengarsipkan dokumen dan surat masuk/keluar",
                   "Membantu proses rekapitulasi laporan harian", "Mendukung kebutuhan operasional tim lain"]),
    dict(slug="uiux-designer", label="UI/UX Designer", sub=None,
         deskripsi="Merancang tampilan dan pengalaman pengguna untuk produk digital perusahaan, mulai dari riset hingga prototipe.",
         jobdesk=["Membuat wireframe dan prototype desain aplikasi/website", "Melakukan riset kebutuhan dan pengalaman pengguna",
                   "Berkolaborasi dengan tim programmer untuk implementasi desain", "Menjaga konsistensi visual (design system)"]),
    dict(slug="programmer", label="Programmer", sub="Frontend/Backend",
         deskripsi="Mengembangkan dan memelihara aplikasi web/mobile, baik dari sisi tampilan (frontend) maupun sistem (backend).",
         jobdesk=["Menulis dan menguji kode program sesuai kebutuhan project", "Memperbaiki bug dan melakukan optimasi performa",
                   "Berkolaborasi dengan tim desain dan project manager", "Mendokumentasikan kode dan alur sistem"]),
    dict(slug="human-resource", label="Human Resource", sub=None,
         deskripsi="Mendukung proses pengelolaan sumber daya manusia, mulai dari rekrutmen hingga administrasi karyawan.",
         jobdesk=["Membantu proses rekrutmen dan seleksi kandidat", "Mengelola data dan administrasi karyawan/peserta magang",
                   "Membantu penyelenggaraan pelatihan internal", "Menjaga komunikasi dan hubungan antar tim"]),
    dict(slug="social-media-specialist", label="Social Media", sub="Specialist",
         deskripsi="Mengelola akun media sosial perusahaan agar tetap aktif, menarik, dan sesuai dengan strategi branding.",
         jobdesk=["Merencanakan dan menjadwalkan konten media sosial", "Memantau interaksi, komentar, dan pesan followers",
                   "Menganalisis performa konten dan insight akun", "Berkoordinasi dengan tim desain dan content writer"]),
    dict(slug="photographer-videographer", label="Photographer/", sub="Videographer",
         deskripsi="Menghasilkan konten foto dan video untuk kebutuhan promosi, dokumentasi, dan media sosial perusahaan.",
         jobdesk=["Melakukan sesi foto dan pengambilan video (shooting)", "Mengedit foto dan video sesuai kebutuhan konten",
                   "Mengelola dan merawat peralatan dokumentasi", "Berkoordinasi dengan tim kreatif untuk konsep konten"]),
    dict(slug="content-writer", label="Content Writer", sub=None,
         deskripsi="Menulis berbagai jenis konten untuk kebutuhan promosi, blog, dan media sosial perusahaan.",
         jobdesk=["Menulis artikel, caption, dan copywriting promosi", "Melakukan riset topik dan kata kunci (SEO dasar)",
                   "Menyunting dan memastikan kualitas tulisan", "Berkoordinasi dengan tim desain dan social media"]),
    dict(slug="marketing-sales", label="Marketing & Sales", sub=None,
         deskripsi="Mendukung kegiatan pemasaran dan penjualan produk/jasa perusahaan ke calon pelanggan.",
         jobdesk=["Membantu strategi pemasaran produk/jasa", "Melakukan follow up dan komunikasi dengan calon klien",
                   "Membuat laporan penjualan dan progres target", "Membantu riset pasar dan kompetitor"]),
    dict(slug="desain-grafis", label="Desain Grafis", sub=None,
         deskripsi="Membuat berbagai materi visual untuk kebutuhan promosi, media sosial, dan branding perusahaan.",
         jobdesk=["Mendesain materi promosi (poster, feed, banner, dll)", "Menjaga konsistensi identitas visual perusahaan",
                   "Berkolaborasi dengan tim content & social media", "Menyiapkan aset desain untuk berbagai kebutuhan tim"]),
    dict(slug="digital-market", label="Digital Market", sub=None,
         deskripsi="Menjalankan strategi pemasaran digital untuk meningkatkan awareness dan penjualan secara online.",
         jobdesk=["Membantu strategi iklan digital (ads) dan campaign", "Menganalisis data performa pemasaran digital",
                   "Riset tren dan peluang pasar digital", "Berkoordinasi dengan tim kreatif dan sales"]),
    dict(slug="marcomm-public-relation", label="Marcomm/", sub="Public Relation",
         deskripsi="Mengelola komunikasi dan citra perusahaan, baik ke publik, media, maupun mitra kerja.",
         jobdesk=["Menyusun materi komunikasi dan publikasi perusahaan", "Menjaga hubungan dengan media dan mitra",
                   "Membantu penyelenggaraan event/acara perusahaan", "Memantau citra dan reputasi perusahaan di publik"]),
    dict(slug="host-presenter", label="Host / Presenter", sub=None,
         deskripsi="Menjadi pembawa acara/host untuk kebutuhan konten live, event, maupun video promosi perusahaan.",
         jobdesk=["Membawakan acara atau konten live (livestream/event)", "Mempelajari dan menyampaikan materi/script dengan baik",
                   "Berkoordinasi dengan tim produksi dan kreatif", "Menjaga citra dan profesionalisme saat tampil"]),
    dict(slug="tiktok-creator", label="TikTok Creator", sub=None,
         deskripsi="Membuat konten kreatif untuk platform TikTok guna meningkatkan engagement dan awareness brand.",
         jobdesk=["Membuat ide dan konsep konten TikTok", "Syuting dan mengedit video pendek",
                   "Memantau tren dan algoritma TikTok terkini", "Menganalisis performa konten yang sudah tayang"]),
    dict(slug="voice-over-talent", label="Voice Over Talent", sub=None,
         deskripsi="Mengisi suara untuk kebutuhan konten video, iklan, maupun materi promosi perusahaan.",
         jobdesk=["Mengisi suara (voice over) untuk video/konten promosi", "Berlatih intonasi dan artikulasi sesuai kebutuhan naskah",
                   "Berkoordinasi dengan tim produksi video", "Membantu proses rekaman dan revisi audio"]),
    dict(slug="content-planner", label="Content Planner", sub=None,
         deskripsi="Merencanakan strategi dan kalender konten untuk berbagai platform milik perusahaan.",
         jobdesk=["Menyusun kalender dan strategi konten bulanan", "Berkoordinasi dengan writer, desainer, dan videografer",
                   "Memantau tren konten yang relevan dengan brand", "Mengevaluasi performa konten yang sudah tayang"]),
    dict(slug="project-manager", label="Project Manager", sub=None,
         deskripsi="Mengoordinasikan jalannya sebuah project agar selesai tepat waktu sesuai target yang ditentukan.",
         jobdesk=["Menyusun timeline dan pembagian tugas project", "Memantau progres kerja tiap anggota tim",
                   "Menjadi penghubung komunikasi antar divisi", "Membuat laporan progres project secara berkala"]),
    dict(slug="las", label="LAS", sub=None,
         deskripsi="Divisi teknis yang mendukung kebutuhan operasional dan produksi sesuai bidang keahlian LAS.",
         jobdesk=["Membantu proses kerja teknis sesuai penugasan", "Menjaga kualitas dan keamanan hasil kerja",
                   "Berkoordinasi dengan tim terkait kebutuhan project", "Mengikuti standar operasional yang berlaku"]),
    dict(slug="animasi", label="Animasi", sub=None,
         deskripsi="Membuat konten animasi untuk kebutuhan promosi, edukasi, maupun hiburan sesuai kebutuhan perusahaan.",
         jobdesk=["Membuat motion graphic/animasi untuk konten promosi", "Menyusun storyboard sebelum proses animasi",
                   "Berkolaborasi dengan tim desain dan content writer", "Mengedit dan menyempurnakan hasil animasi"]),
]


def run():
    app = create_app()
    with app.app_context():
        if Divisi.query.count() == 0:
            for i, p in enumerate(POSISI):
                d = Divisi(
                    slug=p["slug"],
                    label=p["label"],
                    sub=p["sub"],
                    deskripsi=p["deskripsi"],
                    gform_link=GFORM_DEFAULT,
                    urutan=i,
                    aktif=True,
                )
                d.set_jobdesk(p["jobdesk"])
                d.set_skill([])
                db.session.add(d)
            print(f"[seed] {len(POSISI)} posisi magang ditambahkan.")
        else:
            print("[seed] Tabel divisi sudah ada isinya, dilewati.")

        if KontenItem.query.filter_by(kategori="syarat").count() == 0:
            for i, s in enumerate(SYARAT):
                db.session.add(KontenItem(kategori="syarat", isi=s, urutan=i))
            print(f"[seed] {len(SYARAT)} syarat ditambahkan.")
        else:
            print("[seed] Syarat sudah ada isinya, dilewati.")

        if KontenItem.query.filter_by(kategori="fasilitas").count() == 0:
            for i, f in enumerate(FASILITAS):
                db.session.add(KontenItem(kategori="fasilitas", isi=f, urutan=i))
            print(f"[seed] {len(FASILITAS)} fasilitas ditambahkan.")
        else:
            print("[seed] Fasilitas sudah ada isinya, dilewati.")

        db.session.commit()
        print("[seed] Selesai.")


if __name__ == "__main__":
    run()
