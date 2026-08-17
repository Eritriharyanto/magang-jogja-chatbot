"""CRUD Divisi (posisi magang) — dipakai dashboard admin buat
tambah/edit/hapus/sembunyikan posisi magang yang tampil di landing page."""
import os

from flask import Blueprint, request, jsonify, current_app

from ...extensions import db
from ...models import Divisi
from ...routes.auth import admin_login_required

bp = Blueprint("admin_divisi", __name__, url_prefix="/divisi")


def _delete_icon_file(filename):
    """Hapus file icon lama dari disk kalau sudah gak dipakai (diganti/dihapus)."""
    if not filename:
        return
    try:
        path = os.path.join(current_app.config["ICON_UPLOAD_DIR"], filename)
        if os.path.isfile(path):
            os.remove(path)
    except OSError:
        pass


@bp.get("")
@admin_login_required
def list_all():
    rows = Divisi.query.order_by(Divisi.urutan.asc(), Divisi.id.asc()).all()
    return jsonify([d.to_dict() for d in rows])


@bp.post("")
@admin_login_required
def create():
    data = request.get_json(force=True) or {}
    if Divisi.query.filter_by(slug=data.get("slug")).first():
        return jsonify({"error": "Slug sudah dipakai"}), 400

    d = Divisi(
        slug=data["slug"],
        label=data["label"],
        sub=data.get("sub"),
        icon_filename=data.get("icon_filename"),
        deskripsi=data.get("deskripsi", ""),
        gform_link=data.get("gformLink"),
        urutan=data.get("urutan", 0),
        aktif=data.get("aktif", True),
    )
    d.set_jobdesk(data.get("jobdesk", []))
    d.set_skill(data.get("skill_dibutuhkan", []))
    db.session.add(d)
    db.session.commit()
    return jsonify(d.to_dict()), 201


@bp.put("/<int:divisi_id>")
@admin_login_required
def update(divisi_id):
    d = Divisi.query.get_or_404(divisi_id)
    data = request.get_json(force=True) or {}
    old_icon_filename = d.icon_filename

    for field in ("slug", "label", "sub", "icon_filename", "deskripsi", "urutan", "aktif"):
        if field in data:
            setattr(d, field, data[field])
    if "gformLink" in data:
        d.gform_link = data["gformLink"]
    if "jobdesk" in data:
        d.set_jobdesk(data["jobdesk"])
    if "skill_dibutuhkan" in data:
        d.set_skill(data["skill_dibutuhkan"])

    db.session.commit()

    if "icon_filename" in data and old_icon_filename and old_icon_filename != d.icon_filename:
        _delete_icon_file(old_icon_filename)

    return jsonify(d.to_dict())


@bp.delete("/<int:divisi_id>")
@admin_login_required
def delete(divisi_id):
    d = Divisi.query.get_or_404(divisi_id)
    icon_filename = d.icon_filename
    db.session.delete(d)
    db.session.commit()
    _delete_icon_file(icon_filename)
    return jsonify({"ok": True})
