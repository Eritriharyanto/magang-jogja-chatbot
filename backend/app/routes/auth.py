from functools import wraps

from flask import Blueprint, request, jsonify, session

from ..services.auth_service import verify_login

bp = Blueprint("auth", __name__, url_prefix="/api/admin")


def admin_login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            return jsonify({"error": "Belum login"}), 401
        return fn(*args, **kwargs)
    return wrapper


@bp.post("/login")
def login():
    data = request.get_json(force=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")

    if verify_login(username, password):
        session["is_admin"] = True
        session["username"] = username
        return jsonify({"ok": True, "username": username})

    return jsonify({"error": "Username atau password salah"}), 401


@bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@bp.get("/me")
def me():
    if session.get("is_admin"):
        return jsonify({"username": session.get("username")})
    return jsonify({"error": "Belum login"}), 401
