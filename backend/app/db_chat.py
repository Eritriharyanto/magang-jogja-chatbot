"""SQLite bawaan Python (bukan lewat SQLAlchemy) khusus buat riwayat chat.
Dipisah dari magangjog.db (data divisi/konten) supaya gampang dibedakan
mana data "konten" vs data "log/privasi pengunjung".

CATATAN PRIVASI: file ini akan berisi identitas pengunjung (kalau kamu
pakai gerbang nama+WA seperti referensi). Jangan commit ke repo publik."""
import sqlite3
from datetime import datetime, timezone

from .config import Config


def get_conn():
    conn = sqlite3.connect(Config.CHAT_HISTORY_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_chat_db():
    conn = get_conn()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS visitor (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            nama TEXT,
            no_telepon TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS chat_message (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_id INTEGER NOT NULL,
            role TEXT NOT NULL,           -- 'user' | 'bot'
            content TEXT NOT NULL,
            source TEXT,                  -- 'static' | 'ollama'
            created_at TEXT NOT NULL,
            FOREIGN KEY (visitor_id) REFERENCES visitor(id)
        );
        """
    )
    conn.commit()
    conn.close()


def upsert_visitor(session_id: str, nama: str | None = None, no_telepon: str | None = None) -> int:
    conn = get_conn()
    row = conn.execute("SELECT id FROM visitor WHERE session_id = ?", (session_id,)).fetchone()
    if row:
        if nama or no_telepon:
            conn.execute(
                "UPDATE visitor SET nama = COALESCE(?, nama), no_telepon = COALESCE(?, no_telepon) WHERE id = ?",
                (nama, no_telepon, row["id"]),
            )
            conn.commit()
        visitor_id = row["id"]
    else:
        cur = conn.execute(
            "INSERT INTO visitor (session_id, nama, no_telepon, created_at) VALUES (?, ?, ?, ?)",
            (session_id, nama, no_telepon, datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
        visitor_id = cur.lastrowid
    conn.close()
    return visitor_id


def log_message(visitor_id: int, role: str, content: str, source: str | None = None):
    conn = get_conn()
    conn.execute(
        "INSERT INTO chat_message (visitor_id, role, content, source, created_at) VALUES (?, ?, ?, ?, ?)",
        (visitor_id, role, content, source, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()


def list_visitors():
    conn = get_conn()
    rows = conn.execute(
        """
        SELECT v.id, v.nama, v.no_telepon, v.created_at,
               COUNT(m.id) AS jumlah_pesan,
               MAX(m.created_at) AS terakhir_aktif
        FROM visitor v
        LEFT JOIN chat_message m ON m.visitor_id = v.id
        GROUP BY v.id
        ORDER BY terakhir_aktif DESC
        """
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_transcript(visitor_id: int):
    conn = get_conn()
    rows = conn.execute(
        "SELECT role, content, source, created_at FROM chat_message WHERE visitor_id = ? ORDER BY id ASC",
        (visitor_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_transcripts():
    conn = get_conn()
    rows = conn.execute(
        """
        SELECT v.id AS visitor_id, v.nama, v.no_telepon,
               m.role, m.content, m.source, m.created_at
        FROM visitor v
        LEFT JOIN chat_message m ON m.visitor_id = v.id
        ORDER BY v.id ASC, m.id ASC
        """
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_visitor(visitor_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM chat_message WHERE visitor_id = ?", (visitor_id,))
    conn.execute("DELETE FROM visitor WHERE id = ?", (visitor_id,))
    conn.commit()
    conn.close()
