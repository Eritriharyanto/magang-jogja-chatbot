"""CRUD untuk Syarat & Ketentuan dan Fasilitas (list teks sederhana)."""
from flask import Blueprint, request, jsonify

from ...extensions import db
from ...models import KontenItem
from ...routes.auth import admin_login_required

bp = Blueprint("admin_konten", __name__, url_prefix="/konten")


@bp.get("/<kategori>")
@admin_login_required
def list_items(kategori):
    rows = KontenItem.query.filter_by(kategori=kategori).order_by(KontenItem.urutan.asc()).all()
    return jsonify([r.to_dict() for r in rows])


@bp.post("/<kategori>")
@admin_login_required
def create_item(kategori):
    data = request.get_json(force=True) or {}
    item = KontenItem(kategori=kategori, isi=data.get("isi", ""), urutan=data.get("urutan", 0))
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@bp.put("/item/<int:item_id>")
@admin_login_required
def update_item(item_id):
    item = KontenItem.query.get_or_404(item_id)
    data = request.get_json(force=True) or {}
    if "isi" in data:
        item.isi = data["isi"]
    if "urutan" in data:
        item.urutan = data["urutan"]
    db.session.commit()
    return jsonify(item.to_dict())


@bp.delete("/item/<int:item_id>")
@admin_login_required
def delete_item(item_id):
    item = KontenItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})
