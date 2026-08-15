"""Klien tipis buat manggil Ollama (harus sudah jalan di localhost:11434,
lihat README). Dipanggil hanya kalau static intent matching gak nemu
kecocokan yang cukup yakin."""
import requests


def ask_ollama(host: str, model: str, system_prompt: str, pesan_user: str,
                riwayat: list[dict] | None = None, timeout: int = 60) -> str:
    messages = [{"role": "system", "content": system_prompt}]
    for m in (riwayat or []):
        messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": pesan_user})

    resp = requests.post(
        f"{host}/api/chat",
        json={"model": model, "messages": messages, "stream": False},
        timeout=timeout,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("message", {}).get("content", "").strip()
