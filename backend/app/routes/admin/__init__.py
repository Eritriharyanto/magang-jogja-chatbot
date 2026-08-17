from flask import Blueprint

bp = Blueprint("admin", __name__, url_prefix="/api/admin")

from . import divisi, konten, intents, knowledge, riwayat, pengaturan, upload  # noqa: E402,F401

for sub_bp in (divisi.bp, konten.bp, intents.bp, knowledge.bp, riwayat.bp, pengaturan.bp, upload.bp):
    bp.register_blueprint(sub_bp)
