"""CRUD untuk intents.json — FAQ statis chatbot.
Setiap perubahan langsung ditulis ke file + reload_runtime_state(),
persis seperti perilaku referensi: gak perlu restart server."""
from flask import Blueprint, request, jsonify

from ... import state
from ...routes.auth import admin_login_required

bp = Blueprint("admin_intents", __name__, url_prefix="/intents")


@bp.get("")
@admin_login_required
def list_intents():
    return jsonify(state.INTENTS)


@bp.post("")
@admin_login_required
def create_intent():
    data = request.get_json(force=True) or {}
    required = {"intent", "contoh_pertanyaan", "jawaban_default"}
    if not required.issubset(data):
        return jsonify({"error": f"Field wajib: {sorted(required)}"}), 400

    new_intent = {
        "intent": data["intent"],
        "contoh_pertanyaan": data["contoh_pertanyaan"],
        "context_set": data.get("context_set", ""),
        "jawaban_default": data["jawaban_default"],
        "keywords": data.get("keywords", []),
    }

    intents = state.INTENTS + [new_intent]
    state.save_intents(intents)
    return jsonify(new_intent), 201


@bp.put("/<nama_intent>")
@admin_login_required
def update_intent(nama_intent):
    data = request.get_json(force=True) or {}
    intents = state.INTENTS
    found = False
    for it in intents:
        if it["intent"] == nama_intent:
            for field in ("contoh_pertanyaan", "context_set", "jawaban_default", "keywords"):
                if field in data:
                    it[field] = data[field]
            found = True
            break

    if not found:
        return jsonify({"error": "Intent tidak ditemukan"}), 404

    state.save_intents(intents)
    return jsonify({"ok": True})


@bp.delete("/<nama_intent>")
@admin_login_required
def delete_intent(nama_intent):
    intents = [it for it in state.INTENTS if it["intent"] != nama_intent]
    if len(intents) == len(state.INTENTS):
        return jsonify({"error": "Intent tidak ditemukan"}), 404

    state.save_intents(intents)
    return jsonify({"ok": True})
