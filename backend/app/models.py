"""
Model untuk data yang sifatnya tabular & sering di-CRUD satu-satu lewat
dashboard admin: Divisi (posisi magang), Syarat, Fasilitas, Admin.

Data chatbot (knowledge_base.json & intents.json) SENGAJA TIDAK di sini —
itu tetap berupa file JSON yang di-load ke memori (lihat app/state.py),
supaya persis strukturnya seperti file yang sudah kamu punya sekarang,
dan gampang di-summarize jadi system prompt buat Ollama.
"""
import json
from datetime import datetime, timezone

from .extensions import db


class Divisi(db.Model):
    __tablename__ = "divisi"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    label = db.Column(db.String(120), nullable=False)
    sub = db.Column(db.String(120))                  # contoh: "Frontend/Backend"
    icon_filename = db.Column(db.String(200))         # nama file di /uploads/icons
    deskripsi = db.Column(db.Text, nullable=False)
    jobdesk_json = db.Column(db.Text, nullable=False, default="[]")   # list string, disimpan JSON
    skill_json = db.Column(db.Text, nullable=False, default="[]")     # list string, disimpan JSON
    gform_link = db.Column(db.String(300))
    urutan = db.Column(db.Integer, default=0)          # buat atur urutan tampil
    aktif = db.Column(db.Boolean, default=True)         # bisa "sembunyikan" tanpa hapus

    def jobdesk(self):
        return json.loads(self.jobdesk_json or "[]")

    def set_jobdesk(self, items):
        self.jobdesk_json = json.dumps(items, ensure_ascii=False)

    def skill(self):
        return json.loads(self.skill_json or "[]")

    def set_skill(self, items):
        self.skill_json = json.dumps(items, ensure_ascii=False)

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "label": self.label,
            "sub": self.sub,
            "icon": f"/uploads/icons/{self.icon_filename}" if self.icon_filename else None,
            "icon_filename": self.icon_filename,
            "deskripsi": self.deskripsi,
            "jobdesk": self.jobdesk(),
            "skill_dibutuhkan": self.skill(),
            "gformLink": self.gform_link,
            "urutan": self.urutan,
            "aktif": self.aktif,
        }


class KontenItem(db.Model):
    """Satu baris teks untuk Syarat & Ketentuan atau Fasilitas (bisa dibedakan lewat `kategori`)."""
    __tablename__ = "konten_item"

    id = db.Column(db.Integer, primary_key=True)
    kategori = db.Column(db.String(20), nullable=False)   # "syarat" | "fasilitas"
    isi = db.Column(db.Text, nullable=False)
    urutan = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {"id": self.id, "isi": self.isi, "urutan": self.urutan}


class AdminUser(db.Model):
    __tablename__ = "admin_user"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
