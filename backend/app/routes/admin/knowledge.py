"""Edit knowledge_base.json.

Dua mode, sama seperti referensi:
- Mode form/terarah: edit khusus daftar `posisi_magang` (list yang paling
  sering berubah — nama posisi, deskripsi, jobdesk, skill).
- Mode lanjutan: kirim seluruh objek JSON buat overwrite penuh
  `informasi_program` (field yang jarang berubah: kontak, syarat, dll)."""
import os

from flask import Blueprint, current_app, request, jsonify

from ... import state
from ...routes.auth import admin_login_required

bp = Blueprint("admin_knowledge", __name__, url_prefix="/knowledge")


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
def get_all():
    return jsonify(state.KB)


@bp.put("/informasi-program")
@admin_login_required
def update_informasi_program():
    """Mode lanjutan: overwrite penuh objek informasi_program dgn JSON mentah."""
    data = request.get_json(force=True) or {}
    kb = dict(state.KB)
    kb["informasi_program"] = data
    state.save_kb(kb)
    return jsonify(kb["informasi_program"])


@bp.get("/posisi")
@admin_login_required
def list_posisi():
    return jsonify(state.KB.get("posisi_magang", []))


@bp.post("/posisi")
@admin_login_required
def create_posisi():
    data = request.get_json(force=True) or {}
    if not data.get("nama_posisi"):
        return jsonify({"error": "nama_posisi wajib diisi"}), 400

    kb = dict(state.KB)
    posisi_list = list(kb.get("posisi_magang", []))
    posisi_list.append({
        "nama_posisi": data["nama_posisi"],
        "deskripsi": data.get("deskripsi", ""),
        "jobdesk": data.get("jobdesk", []),
        "skill_dibutuhkan": data.get("skill_dibutuhkan", []),
        "icon_filename": data.get("icon_filename"),
    })
    kb["posisi_magang"] = posisi_list
    state.save_kb(kb)
    return jsonify(posisi_list[-1]), 201


@bp.put("/posisi/<nama_posisi>")
@admin_login_required
def update_posisi(nama_posisi):
    data = request.get_json(force=True) or {}
    kb = dict(state.KB)
    posisi_list = list(kb.get("posisi_magang", []))
    found = False
    for p in posisi_list:
        if p["nama_posisi"] == nama_posisi:
            old_icon_filename = p.get("icon_filename")
            for field in ("nama_posisi", "deskripsi", "jobdesk", "skill_dibutuhkan", "icon_filename"):
                if field in data:
                    p[field] = data[field]
            found = True
            break

    if not found:
        return jsonify({"error": "Posisi tidak ditemukan di knowledge base"}), 404

    kb["posisi_magang"] = posisi_list
    state.save_kb(kb)

    if "icon_filename" in data and old_icon_filename and old_icon_filename != data["icon_filename"]:
        _delete_icon_file(old_icon_filename)

    return jsonify({"ok": True})


@bp.delete("/posisi/<nama_posisi>")
@admin_login_required
def delete_posisi(nama_posisi):
    kb = dict(state.KB)
    posisi_list = kb.get("posisi_magang", [])
    to_delete = next((p for p in posisi_list if p["nama_posisi"] == nama_posisi), None)
    if to_delete is None:
        return jsonify({"error": "Posisi tidak ditemukan"}), 404

    kb["posisi_magang"] = [p for p in posisi_list if p["nama_posisi"] != nama_posisi]
    state.save_kb(kb)
    _delete_icon_file(to_delete.get("icon_filename"))
    return jsonify({"ok": True})
