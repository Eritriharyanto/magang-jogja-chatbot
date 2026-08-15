"""Login admin sederhana: 1 akun, password di-hash, session cookie Flask.
Cukup buat skala project ini. Kalau nanti deploy ke internet (bukan cuma
localhost), taruh di belakang HTTPS/reverse proxy."""
from werkzeug.security import generate_password_hash, check_password_hash

from ..models import AdminUser
from ..extensions import db


def ensure_default_admin(username="admin", password="admin123"):
    """Dipanggil sekali saat pertama kali app start: kalau belum ada admin
    sama sekali, buat akun default. GANTI PASSWORD-NYA lewat menu
    Pengaturan setelah login pertama kali."""
    if AdminUser.query.count() == 0:
        admin = AdminUser(username=username, password_hash=generate_password_hash(password))
        db.session.add(admin)
        db.session.commit()


def verify_login(username: str, password: str) -> bool:
    user = AdminUser.query.filter_by(username=username).first()
    if not user:
        return False
    return check_password_hash(user.password_hash, password)


def change_password(username: str, new_password: str):
    user = AdminUser.query.filter_by(username=username).first()
    if not user:
        return False
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return True
