"""Rekap chat: daftar pengunjung yang pernah chat + transkrip percakapan."""
import re
from datetime import datetime, timezone

from flask import Blueprint, Response, jsonify, request

from ... import db_chat
from ...routes.auth import admin_login_required

bp = Blueprint("admin_riwayat", __name__, url_prefix="/riwayat")


def _nama_tampilan(visitor: dict) -> str:
    return visitor.get("nama") or f"Pengunjung #{visitor['id']}"


def _format_transkrip_text(visitor: dict, messages: list[dict]) -> str:
    lines = [
        f"Riwayat Chat - {_nama_tampilan(visitor)}",
        f"No. WhatsApp: {visitor.get('no_telepon') or '-'}",
        f"Total pesan  : {len(messages)}",
        "-" * 50,
    ]
    for m in messages:
        pengirim = "User" if m["role"] == "user" else "Bot"
        sumber = f" ({m['source']})" if m.get("source") else ""
        lines.append(f"[{m['created_at']}] {pengirim}{sumber}: {m['content']}")
    if not messages:
        lines.append("(belum ada pesan)")
    return "\n".join(lines)


def _safe_filename(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9_-]+", "-", text).strip("-")
    return text or "pengunjung"


def _download_response(text: str, filename: str) -> Response:
    return Response(
        text,
        mimetype="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@bp.get("")
@admin_login_required
def list_visitors():
    return jsonify(db_chat.list_visitors())


@bp.get("/export-all")
@admin_login_required
def export_all():
    """Download SEMUA riwayat chat (semua pengunjung) jadi 1 file .txt."""
    visitors = db_chat.list_visitors()
    if not visitors:
        text = "Belum ada riwayat chat."
    else:
        blocks = []
        for v in visitors:
            messages = db_chat.get_transcript(v["id"])
            blocks.append(_format_transkrip_text(v, messages))
        text = f"\n\n{'=' * 60}\n\n".join(blocks)
    tanggal = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    return _download_response(text, f"riwayat-chat-semua-{tanggal}.txt")


@bp.get("/<int:visitor_id>")
@admin_login_required
def transcript(visitor_id):
    return jsonify(db_chat.get_transcript(visitor_id))


@bp.get("/<int:visitor_id>/export")
@admin_login_required
def export_one(visitor_id):
    """Download riwayat chat 1 pengunjung jadi file .txt."""
    visitors = {v["id"]: v for v in db_chat.list_visitors()}
    visitor = visitors.get(visitor_id)
    if not visitor:
        return jsonify({"error": "Pengunjung tidak ditemukan"}), 404
    messages = db_chat.get_transcript(visitor_id)
    text = _format_transkrip_text(visitor, messages)
    filename = f"riwayat-{_safe_filename(_nama_tampilan(visitor))}.txt"
    return _download_response(text, filename)


@bp.delete("/all")
@admin_login_required
def delete_all():
    jumlah = db_chat.delete_all_visitors()
    return jsonify({"ok": True, "deleted": jumlah})


@bp.post("/bulk-delete")
@admin_login_required
def bulk_delete():
    data = request.get_json(force=True) or {}
    ids = data.get("ids") or []
    ids = [int(i) for i in ids if str(i).isdigit()]
    jumlah = db_chat.delete_visitors(ids)
    return jsonify({"ok": True, "deleted": jumlah})


@bp.delete("/<int:visitor_id>")
@admin_login_required
def delete_one(visitor_id):
    deleted = db_chat.delete_visitor(visitor_id)
    if not deleted:
        return jsonify({"error": "Pengunjung tidak ditemukan"}), 404
    return jsonify({"ok": True})
