"""
Runtime state untuk chatbot: isi knowledge_base.json & intents.json yang
sedang aktif dipakai, plus system prompt hasil ringkasan buat Ollama.

Kenapa di-load ke memori (bukan baca file tiap ada chat masuk)?
- Lebih cepat (gak buka file tiap request)
- Begitu admin ubah data lewat dashboard, panggil reload_runtime_state()
  supaya perubahan langsung aktif TANPA restart server Flask.
"""
import json
import threading

from .config import KB_PATH, INTENTS_PATH

_lock = threading.Lock()

KB: dict = {}
INTENTS: list = []
SYSTEM_PROMPT: str = ""


def _load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def build_system_prompt(kb: dict) -> str:
    """Ringkas knowledge_base.json jadi teks yang disisipkan sebagai system
    prompt Ollama. Diletakkan di sini (bukan di services/) karena dipanggil
    tiap kali state di-reload."""
    from .services.kb_summary import summarize_knowledge_base
    return summarize_knowledge_base(kb)


def reload_runtime_state():
    """Baca ulang kedua file JSON dari disk dan bangun ulang system prompt.
    Dipanggil otomatis setelah admin simpan perubahan di dashboard
    (lihat app/routes/admin/knowledge.py & intents.py)."""
    global KB, INTENTS, SYSTEM_PROMPT
    with _lock:
        KB = _load_json(KB_PATH)
        INTENTS = _load_json(INTENTS_PATH)["intents"]
        SYSTEM_PROMPT = build_system_prompt(KB)


def save_kb(new_kb: dict):
    _save_json(KB_PATH, new_kb)
    reload_runtime_state()


def save_intents(new_intents: list):
    _save_json(INTENTS_PATH, {"intents": new_intents})
    reload_runtime_state()
