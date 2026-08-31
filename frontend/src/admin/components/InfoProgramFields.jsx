import ListFieldEditor from "@/admin/components/ListFieldEditor";

/** Field-field `informasi_program` (knowledge_base.json) dikelompokkan biar
 * gak jadi satu list datar 37 baris yang bikin scroll panjang. Field yang
 * gak kesebut di sini (mis. kalau nanti ada field baru ditambah lewat kode
 * lain) otomatis nyangkut ke grup "Lainnya" di bawah — gak ada yang hilang. */
export const FIELD_GROUPS = [
  {
    title: "Identitas & Kontak",
    keys: [
      "nama_program",
      "website",
      "deskripsi",
      "kontak_admin",
      "media_sosial",
      "lokasi_penempatan",
      "alamat_kantor",
      "email_resmi",
    ],
  },
  {
    title: "Syarat & Cara Daftar",
    keys: [
      "target_peserta",
      "syarat_pendaftaran",
      "cara_daftar",
      "berkas_pendaftaran",
      "usia_minimal",
      "biaya_pendaftaran",
      "gelombang_pendaftaran",
      "kuota_peserta",
      "daftar_berkelompok",
      "kebijakan_daftar_ulang",
      "estimasi_proses_seleksi",
      "domisili_luar_kota",
    ],
  },
  {
    title: "Selama Magang Berjalan",
    keys: [
      "durasi_magang",
      "sistem_kerja",
      "jam_kerja",
      "aturan_presensi_izin",
      "dress_code",
      "alat_kerja",
      "keselamatan_kerja_las",
      "training_onboarding",
      "bimbingan_laporan_magang",
      "evaluasi_selama_magang",
      "mitra_kerja",
      "kebijakan_resign_ditengah_jalan",
    ],
  },
  {
    title: "Fasilitas & Setelah Magang",
    keys: ["fasilitas", "sertifikat", "uang_saku", "peluang_lanjut_karier"],
  },
  {
    title: "Lainnya",
    keys: ["catatan"],
  },
];

/** Bagi field-field di `data` (object informasi_program) ke dalam
 * FIELD_GROUPS di atas. Field yang namanya gak ketemu di daftar manapun
 * (mis. field baru yang belum sempat dikelompokkan) otomatis masuk ke grup
 * "Lainnya" biar gak hilang dari tampilan. */
export function groupFields(data) {
  const remaining = new Set(Object.keys(data));
  const groups = FIELD_GROUPS.map((g) => {
    const keys = g.keys.filter((k) => k in data);
    keys.forEach((k) => remaining.delete(k));
    return { title: g.title, keys };
  });
  const sisa = [...remaining];
  if (sisa.length > 0) {
    const lainnya = groups.find((g) => g.title === "Lainnya");
    if (lainnya) lainnya.keys.push(...sisa);
    else groups.push({ title: "Lainnya", keys: sisa });
  }
  return groups.filter((g) => g.keys.length > 0);
}

export function humanize(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function FieldLabel({ children }) {
  return (
    <label className='mb-1 block text-sm font-semibold text-mj-ink'>
      {children}
    </label>
  );
}

export function TextField({ label, value, onChange, multiline }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green'
        />
      ) : (
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green'
        />
      )}
    </div>
  );
}

export function ToggleField({ label, value, onChange }) {
  return (
    <label className='flex items-center gap-2 text-sm font-semibold text-mj-ink'>
      <input
        type='checkbox'
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className='size-4 accent-mj-green'
      />
      {label}
    </label>
  );
}

export function NumberField({ label, value, onChange }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type='number'
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className='w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-mj-green'
      />
    </div>
  );
}

/** Grup field buat value yang berbentuk object (mis. durasi_magang punya
 * minimal_bulan + maksimal_bulan + keterangan). Kalau objectnya cuma punya
 * satu field "keterangan" doang, tampilin langsung sebagai textarea biasa
 * (gak usah dibungkus kotak + sub-label yang bikin ribet dilihat). */
export function ObjectFieldGroup({ label, value, onChange }) {
  const entries = Object.entries(value);

  if (entries.length === 1 && entries[0][0] === "keterangan") {
    return (
      <TextField
        label={label}
        value={entries[0][1] ?? ""}
        multiline
        onChange={(v) => onChange({ ...value, keterangan: v })}
      />
    );
  }

  return (
    <div className='rounded-lg border border-slate-200 p-4'>
      <p className='mb-3 text-sm font-bold text-mj-ink'>{label}</p>
      <div className='space-y-3'>
        {entries.map(([k, v]) => {
          const subLabel =
            k === "keterangan" ? "Keterangan / Penjelasan" : humanize(k);
          const setSub = (nv) => onChange({ ...value, [k]: nv });

          if (typeof v === "boolean") {
            return (
              <ToggleField
                key={k}
                label={subLabel}
                value={v}
                onChange={setSub}
              />
            );
          }
          if (typeof v === "number") {
            return (
              <NumberField
                key={k}
                label={subLabel}
                value={v}
                onChange={setSub}
              />
            );
          }
          if (Array.isArray(v)) {
            return (
              <ListFieldEditor
                key={k}
                label={subLabel}
                items={v}
                onChange={setSub}
              />
            );
          }
          return (
            <TextField
              key={k}
              label={subLabel}
              value={v ?? ""}
              multiline={k === "keterangan" || String(v ?? "").length > 60}
              onChange={setSub}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Render 1 field top-level `informasi_program`, milih komponen yang cocok
 * otomatis berdasarkan tipe datanya (dipakai bareng oleh tiap grup accordion). */
export function InfoField({ fieldKey, value, onChange }) {
  const label = humanize(fieldKey);
  if (Array.isArray(value)) {
    return <ListFieldEditor label={label} items={value} onChange={onChange} />;
  }
  if (isPlainObject(value)) {
    return <ObjectFieldGroup label={label} value={value} onChange={onChange} />;
  }
  return (
    <TextField
      label={label}
      value={value ?? ""}
      multiline={String(value ?? "").length > 60}
      onChange={onChange}
    />
  );
}
 