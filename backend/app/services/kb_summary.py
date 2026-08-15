"""Ubah knowledge_base.json (dict bersarang) jadi teks ringkas yang muat
disisipkan sebagai system prompt Ollama, supaya jawaban LLM selalu
berpijak pada data asli, bukan ngarang."""


def summarize_knowledge_base(kb: dict) -> str:
    info = kb.get("informasi_program", {})
    posisi_list = kb.get("posisi_magang", [])

    lines = [
        "Kamu adalah asisten chat resmi untuk program magang bernama "
        f"{info.get('nama_program', 'program magang ini')}.",
        "Jawab HANYA berdasarkan data berikut. Kalau tidak ada datanya, "
        "arahkan user menghubungi admin, jangan mengarang jawaban.",
        "",
        f"Deskripsi: {info.get('deskripsi', '')}",
        f"Kontak admin: {info.get('kontak_admin', '')}",
        f"Lokasi penempatan: {info.get('lokasi_penempatan', '')}",
    ]

    durasi = info.get("durasi_magang", {})
    if durasi:
        lines.append(
            f"Durasi magang: {durasi.get('minimal_bulan')}-{durasi.get('maksimal_bulan')} bulan. "
            f"{durasi.get('keterangan', '')}"
        )

    syarat = info.get("syarat_pendaftaran", [])
    if syarat:
        lines.append("Syarat pendaftaran: " + "; ".join(syarat))

    biaya = info.get("biaya_pendaftaran", {})
    if biaya:
        lines.append(f"Biaya pendaftaran: {'Gratis' if not biaya.get('berbayar') else 'Berbayar'}. "
                      f"{biaya.get('keterangan', '')}")

    fasilitas = info.get("fasilitas", [])
    if fasilitas:
        lines.append("Fasilitas: " + "; ".join(fasilitas))

    if posisi_list:
        lines.append("")
        lines.append("Daftar posisi magang yang tersedia beserta jobdesk singkat:")
        for p in posisi_list:
            nama = p.get("nama_posisi", "")
            deskripsi = p.get("deskripsi", "")
            jobdesk = ", ".join(p.get("jobdesk", []))
            lines.append(f"- {nama}: {deskripsi} (jobdesk: {jobdesk})")

    lines.append("")
    lines.append(
        "Gaya bicara: ramah, santai tapi sopan, singkat dan jelas, pakai "
        "Bahasa Indonesia. Kalau user tanya hal yang jelas-jelas di luar "
        "topik magang, arahkan balik dengan sopan."
    )

    return "\n".join(lines)
