"""Ganti password admin."""
from flask import Blueprint, request, jsonify, session

from ...services.auth_service import change_password, verify_login
from ...routes.auth import admin_login_required

bp = Blueprint("admin_pengaturan", __name__, url_prefix="/pengaturan")


@bp.put("/password")
@admin_login_required
def update_password():
    data = request.get_json(force=True) or {}
    username = session.get("username")
    password_lama = data.get("password_lama", "")
    password_baru = data.get("password_baru", "")

    if not verify_login(username, password_lama):
        return jsonify({"error": "Password lama salah"}), 400
    if len(password_baru) < 6:
        return jsonify({"error": "Password baru minimal 6 karakter"}), 400

    change_password(username, password_baru)
    return jsonify({"ok": True})
