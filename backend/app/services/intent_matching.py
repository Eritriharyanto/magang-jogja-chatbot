"""
"Guard" statis: dicoba dulu SEBELUM panggil Ollama.

Cara kerja:
1. Untuk tiap intent, bandingkan pesan user dengan semua `contoh_pertanyaan`
   pakai fuzzy string matching (rapidfuzz) — bukan exact match, karena
   contoh pertanyaan kamu banyak variasi bahasa gaul/typo.
2. Kalau ada `keywords` diisi di intent, kecocokan keyword dianggap sinyal
   kuat (skor dinaikkan).
3. Ambil intent dengan skor tertinggi. Kalau skor >= threshold, balas pakai
   `jawaban_default` intent itu — TIDAK perlu panggil Ollama sama sekali
   (lebih cepat, gratis, konsisten).
4. Kalau skor di bawah threshold, return None -> caller lempar ke Ollama.
"""
from rapidfuzz import fuzz, process


def _best_score_against_examples(pesan: str, contoh_list: list[str]) -> float:
    if not contoh_list:
        return 0.0
    match = process.extractOne(pesan, contoh_list, scorer=fuzz.token_set_ratio)
    return match[1] if match else 0.0


def match_static_intent(pesan: str, intents: list[dict], threshold: float = 72):
    pesan = (pesan or "").strip().lower()
    if not pesan:
        return None

    best = None
    best_score = 0.0

    for intent in intents:
        score = _best_score_against_examples(pesan, intent.get("contoh_pertanyaan", []))

        # keyword match dianggap sinyal kuat tambahan
        for kw in intent.get("keywords", []):
            if kw and kw.lower() in pesan:
                score = max(score, 90.0)

        if score > best_score:
            best_score = score
            best = intent

    if best and best_score >= threshold:
        return {
            "intent": best["intent"],
            "jawaban": best["jawaban_default"],
            "score": best_score,
            "source": "static",
        }
    return None
