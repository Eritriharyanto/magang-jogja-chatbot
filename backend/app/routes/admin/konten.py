"""CRUD untuk Syarat & Ketentuan dan Fasilitas (list teks + gambar opsional)."""
import os

from flask import Blueprint, request, jsonify, current_app

from ...extensions import db
from ...models import KontenItem
from ...routes.auth import admin_login_required

bp = Blueprint("admin_konten", __name__, url_prefix="/konten")


def _delete_gambar_file(filename):
    """Hapus file gambar lama dari disk kalau sudah gak dipakai (diganti/dihapus)."""
    if not filename:
        return
    try:
        path = os.path.join(current_app.config["ICON_UPLOAD_DIR"], filename)
        if os.path.isfile(path):
            os.remove(path)
    except OSError:
        pass


@bp.get("/<kategori>")
@admin_login_required
def list_items(kategori):
    rows = KontenItem.query.filter_by(kategori=kategori).order_by(KontenItem.urutan.asc()).all()
    return jsonify([r.to_dict() for r in rows])


@bp.post("/<kategori>")
@admin_login_required
def create_item(kategori):
    data = request.get_json(force=True) or {}
    item = KontenItem(
        kategori=kategori,
        isi=data.get("isi", ""),
        urutan=data.get("urutan", 0),
        gambar_filename=data.get("gambar_filename"),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@bp.put("/item/<int:item_id>")
@admin_login_required
def update_item(item_id):
    item = KontenItem.query.get_or_404(item_id)
    data = request.get_json(force=True) or {}
    old_gambar_filename = item.gambar_filename

    if "isi" in data:
        item.isi = data["isi"]
    if "urutan" in data:
        item.urutan = data["urutan"]
    if "gambar_filename" in data:
        item.gambar_filename = data["gambar_filename"]

    db.session.commit()

    if "gambar_filename" in data and old_gambar_filename and old_gambar_filename != item.gambar_filename:
        _delete_gambar_file(old_gambar_filename)

    return jsonify(item.to_dict())


@bp.delete("/item/<int:item_id>")
@admin_login_required
def delete_item(item_id):
    item = KontenItem.query.get_or_404(item_id)
    gambar_filename = item.gambar_filename
    db.session.delete(item)
    db.session.commit()
    _delete_gambar_file(gambar_filename)
    return jsonify({"ok": True})
