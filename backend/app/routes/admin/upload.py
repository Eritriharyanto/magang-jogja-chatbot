"""Upload icon/gambar buat posisi magang (dipakai form Tambah/Edit Posisi
di dashboard admin). File disimpan di data/uploads/icons dan disajikan
lewat route statis /uploads/<path:filename> (lihat app/__init__.py)."""
import os
import uuid

from flask import Blueprint, current_app, jsonify, request

from ...routes.auth import admin_login_required

bp = Blueprint("admin_upload", __name__, url_prefix="/upload")


@bp.post("/icon")
@admin_login_required
def upload_icon():
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "File tidak ditemukan"}), 400

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in current_app.config["ALLOWED_ICON_EXTENSIONS"]:
        return jsonify({"error": "Format gak didukung. Pakai PNG, JPG, SVG, atau WEBP."}), 400

    filename = f"{uuid.uuid4().hex}.{ext}"
    dest_dir = current_app.config["ICON_UPLOAD_DIR"]
    os.makedirs(dest_dir, exist_ok=True)
    file.save(os.path.join(dest_dir, filename))

    return jsonify({"filename": filename, "url": f"/uploads/icons/{filename}"}), 201
