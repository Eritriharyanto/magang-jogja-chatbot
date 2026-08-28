"""Rekap chat: daftar pengunjung yang pernah chat + transkrip percakapan."""
from flask import Blueprint, jsonify

from ... import db_chat
from ...routes.auth import admin_login_required

bp = Blueprint("admin_riwayat", __name__, url_prefix="/riwayat")


@bp.get("")
@admin_login_required
def list_visitors():
    return jsonify(db_chat.list_visitors())


@bp.get("/export")
@admin_login_required
def export_all():
    return jsonify(db_chat.get_all_transcripts())


@bp.get("/<int:visitor_id>")
@admin_login_required
def transcript(visitor_id):
    return jsonify(db_chat.get_transcript(visitor_id))


@bp.delete("/<int:visitor_id>")
@admin_login_required
def delete_visitor(visitor_id):
    db_chat.delete_visitor(visitor_id)
    return "", 204
