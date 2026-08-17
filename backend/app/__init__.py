from pathlib import Path

from flask import Flask, send_from_directory
from flask_cors import CORS

from .config import Config
from .extensions import db
from . import state
from . import db_chat


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, supports_credentials=True, origins=[app.config["CORS_ORIGIN"]])

    db.init_app(app)

    Path(app.config["ICON_UPLOAD_DIR"]).mkdir(parents=True, exist_ok=True)

    with app.app_context():
        from . import models  # noqa: F401  (wajib di-import supaya create_all() tahu tabelnya)
        db.create_all()  # bikin tabel magangjog.db kalau belum ada

        from .services.auth_service import ensure_default_admin
        ensure_default_admin()  # akun admin default: admin / admin123 (GANTI setelah login pertama)

        db_chat.init_chat_db()  # bikin tabel chat_history.db kalau belum ada
        state.reload_runtime_state()  # load knowledge_base.json & intents.json ke memori

    # --- Blueprints ---
    from .routes.auth import bp as auth_bp
    from .routes.public import bp as public_bp
    from .routes.admin import bp as admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)

    @app.get("/uploads/<path:filename>")
    def serve_upload(filename):
        """Nyajiin file yang diupload admin (mis. icon posisi magang)."""
        return send_from_directory(app.config["UPLOAD_ROOT"], filename)

    return app
