import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent   # .../backend
DATA_DIR = BASE_DIR / "data"

KB_PATH = DATA_DIR / "knowledge_base.json"
INTENTS_PATH = DATA_DIR / "intents.json"
ADMIN_CONFIG_PATH = DATA_DIR / "admin_config.json"

UPLOAD_ROOT = DATA_DIR / "uploads"
ICON_UPLOAD_DIR = UPLOAD_ROOT / "icons"
ALLOWED_ICON_EXTENSIONS = {"png", "jpg", "jpeg", "svg", "webp"}


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-ganti-ini")

    SQLALCHEMY_DATABASE_URI = "sqlite:///" + str(DATA_DIR / "magangjog.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CHAT_HISTORY_DB_PATH = str(DATA_DIR / "chat_history.db")

    UPLOAD_ROOT = str(UPLOAD_ROOT)
    ICON_UPLOAD_DIR = str(ICON_UPLOAD_DIR)
    ALLOWED_ICON_EXTENSIONS = ALLOWED_ICON_EXTENSIONS
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB, batas ukuran upload icon

    OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
    OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:0.5b")

    CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "http://localhost:5173")

    # Ambang batas skor fuzzy-match (0-100) supaya static intent dianggap "cocok"
    INTENT_MATCH_THRESHOLD = 72
