"""Endpoint yang dipakai landing page publik (React frontend) — TIDAK butuh
login. Ini yang dipanggil Posisi.jsx / PosisiDetail.jsx / ChatWidget.jsx."""
import uuid

from flask import Blueprint, jsonify, request, session, current_app

from .. import state
from ..models import Divisi, KontenItem
from ..services.intent_matching import match_static_intent
from ..services.ollama_client import ask_ollama
from .. import db_chat

bp = Blueprint("public", __name__, url_prefix="/api")


@bp.get("/divisi")
def list_divisi():
    rows = (
        Divisi.query.filter_by(aktif=True)
        .order_by(Divisi.urutan.asc(), Divisi.id.asc())
        .all()
    )
    return jsonify([d.to_dict() for d in rows])


@bp.get("/divisi/<slug>")
def get_divisi(slug):
    d = Divisi.query.filter_by(slug=slug, aktif=True).first()
    if not d:
        return jsonify({"error": "Divisi tidak ditemukan"}), 404
    return jsonify(d.to_dict())


@bp.get("/syarat")
def list_syarat():
    rows = KontenItem.query.filter_by(kategori="syarat").order_by(KontenItem.urutan.asc()).all()
    return jsonify([r.to_dict() for r in rows])


@bp.get("/fasilitas")
def list_fasilitas():
    rows = KontenItem.query.filter_by(kategori="fasilitas").order_by(KontenItem.urutan.asc()).all()
    return jsonify([r.to_dict() for r in rows])


@bp.get("/visitor")
def visitor_status():
    """Dicek frontend pas ChatWidget dibuka, buat tau perlu nampilin form
    nama+WA atau langsung ke chat (kalau sesi ini udah pernah isi)."""
    nama = session.get("visitor_nama")
    return jsonify({"registered": bool(nama), "nama": nama})


@bp.post("/visitor")
def register_visitor():
    """Gerbang identitas: wajib isi nama + no. WhatsApp sebelum bisa chat."""
    data = request.get_json(force=True) or {}
    nama = (data.get("nama") or "").strip()
    no_telepon = (data.get("no_telepon") or "").strip()

    if not nama or not no_telepon:
        return jsonify({"error": "Nama dan nomor WhatsApp wajib diisi"}), 400
    if len(nama) > 100:
        return jsonify({"error": "Nama terlalu panjang"}), 400

    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())
    db_chat.upsert_visitor(session["session_id"], nama=nama, no_telepon=no_telepon)
    session["visitor_nama"] = nama

    return jsonify({"ok": True, "nama": nama})


@bp.post("/chat")
def chat():
    """Alur: identitas session -> coba static intent -> kalau gak yakin,
    fallback ke Ollama pakai system prompt hasil ringkasan knowledge base."""
    if not session.get("visitor_nama"):
        return (
            jsonify(
                {
                    "error": "Silakan isi nama dan nomor WhatsApp dulu sebelum chat.",
                    "code": "IDENTITY_REQUIRED",
                }
            ),
            400,
        )

    data = request.get_json(force=True) or {}
    pesan = (data.get("pesan") or "").strip()
    if not pesan:
        return jsonify({"error": "Pesan kosong"}), 400

    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())
    visitor_id = db_chat.upsert_visitor(session["session_id"])

    db_chat.log_message(visitor_id, "user", pesan)

    hasil_static = match_static_intent(
        pesan, state.INTENTS, threshold=current_app.config.get("INTENT_MATCH_THRESHOLD", 72)
    )

    if hasil_static:
        jawaban = hasil_static["jawaban"]
        sumber = "static"
    else:
        try:
            jawaban = ask_ollama(
                host=current_app.config["OLLAMA_HOST"],
                model=current_app.config["OLLAMA_MODEL"],
                system_prompt=state.SYSTEM_PROMPT,
                pesan_user=pesan,
            )
            sumber = "ollama"
        except Exception:
            # Ollama belum jalan / error koneksi -> jangan crash, kasih fallback
            # yang tetap masuk akal buat user, dan tetap dicatat ke riwayat.
            jawaban = (
                "Maaf, aku belum bisa jawab pertanyaan itu secara detail saat ini. "
                "Coba tanyakan hal seputar posisi magang, syarat, atau fasilitas, "
                "atau langsung hubungi Admin Magang Jogja di 0895-2900-2944 ya."
            )
            sumber = "fallback_error"

    db_chat.log_message(visitor_id, "bot", jawaban, source=sumber)

    return jsonify({"jawaban": jawaban, "sumber": sumber})
