import { useEffect, useRef, useState } from "react";
import { getVisitorStatus, registerVisitor, sendChatMessage } from "@/lib/api";

const ADMIN_WA_NUMBER = "0895-2900-2944";

function waLink(prefillText) {
  const digits = ADMIN_WA_NUMBER.replace(/\D/g, "").replace(/^0/, "62");
  const text = encodeURIComponent(
    prefillText || "Halo Admin Magang Jogja, saya mau tanya-tanya",
  );
  return `https://wa.me/${digits}?text=${text}`;
}

function welcomeMessage(nama) {
  return {
    role: "bot",
    text: `Halo${nama ? `, ${nama}` : ""}! Aku Asisten Magang Jogja. Tanya-tanya soal posisi magang, syarat, atau fasilitas ya.`,
    aksi: null,
  };
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  // --- Gerbang identitas (nama + no. WhatsApp) ---
  const [checkingIdentity, setCheckingIdentity] = useState(true);
  const [identityOk, setIdentityOk] = useState(false);
  const [namaForm, setNamaForm] = useState("");
  const [teleponForm, setTeleponForm] = useState("");
  const [identityError, setIdentityError] = useState("");
  const [submittingIdentity, setSubmittingIdentity] = useState(false);

  useEffect(() => {
    getVisitorStatus()
      .then((res) => {
        if (res.registered) {
          setIdentityOk(true);
          setMessages([welcomeMessage(res.nama)]);
        }
      })
      .catch(() => {
        // Gagal cek status gapapa — anggap belum registrasi, form gerbang tetap tampil.
      })
      .finally(() => setCheckingIdentity(false));
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function handleIdentitySubmit(e) {
    e.preventDefault();
    const nama = namaForm.trim();
    const telepon = teleponForm.trim();
    setIdentityError("");

    if (!nama) {
      setIdentityError("Nama wajib diisi ya.");
      return;
    }
    if (!/^[0-9+\s-]{8,15}$/.test(telepon)) {
      setIdentityError(
        "Nomor WhatsApp gak valid, cek lagi ya (mis. 08123456789).",
      );
      return;
    }

    setSubmittingIdentity(true);
    try {
      await registerVisitor(nama, telepon);
      setIdentityOk(true);
      setMessages([welcomeMessage(nama)]);
    } catch (err) {
      setIdentityError(err.message || "Gagal menyimpan data, coba lagi ya.");
    } finally {
      setSubmittingIdentity(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const pesan = input.trim();
    if (!pesan || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: pesan }]);
    setInput("");
    setSending(true);

    try {
      const res = await sendChatMessage(pesan);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: res.jawaban, aksi: res.aksi || null },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Maaf, server chatbot sedang tidak bisa dihubungi. Coba lagi sebentar lagi ya.",
          aksi: null,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className='fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3'>
      {open ? (
        <div className='flex h-[28rem] w-[20rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:w-[22rem]'>
          <div className='flex items-center justify-between bg-mj-green px-4 py-3 text-white'>
            <span className='font-semibold'>Chat Magang Jogja</span>
            <button
              type='button'
              onClick={() => setOpen(false)}
              aria-label='Tutup chat'
              className='rounded px-2 text-lg leading-none hover:bg-white/10'
            >
              &times;
            </button>
          </div>

          {checkingIdentity ? (
            <div className='flex flex-1 items-center justify-center bg-mj-green/5'>
              <p className='text-sm text-mj-ink/50'>Memuat...</p>
            </div>
          ) : !identityOk ? (
            <form
              onSubmit={handleIdentitySubmit}
              className='flex flex-1 flex-col justify-center gap-3 bg-mj-green/5 px-5 py-4'
            >
              <p className='text-sm font-semibold text-mj-ink'>
                Kenalan dulu yuk, sebelum mulai chat 👋
              </p>
              <p className='text-xs text-mj-ink/60'>
                Data ini dipakai admin buat follow up soal magang kamu.
              </p>

              {identityError ? (
                <p className='rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600'>
                  {identityError}
                </p>
              ) : null}

              <div>
                <label
                  className='mb-1 block text-xs font-semibold text-mj-ink'
                  htmlFor='chat-nama'
                >
                  Nama
                </label>
                <input
                  id='chat-nama'
                  type='text'
                  value={namaForm}
                  onChange={(e) => setNamaForm(e.target.value)}
                  placeholder='Nama kamu'
                  className='w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-mj-green'
                />
              </div>

              <div>
                <label
                  className='mb-1 block text-xs font-semibold text-mj-ink'
                  htmlFor='chat-telepon'
                >
                  Nomor WhatsApp
                </label>
                <input
                  id='chat-telepon'
                  type='tel'
                  value={teleponForm}
                  onChange={(e) => setTeleponForm(e.target.value)}
                  placeholder='08xxxxxxxxxx'
                  className='w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-mj-green'
                />
              </div>

              <button
                type='submit'
                disabled={submittingIdentity}
                className='mt-1 rounded-full bg-mj-green py-2 text-sm font-semibold text-white disabled:opacity-50'
              >
                {submittingIdentity ? "Menyimpan..." : "Mulai Chat"}
              </button>
            </form>
          ) : (
            <>
              <div
                ref={listRef}
                className='flex-1 space-y-3 overflow-y-auto bg-mj-green/5 px-4 py-3'
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user" ? "ml-auto max-w-[85%]" : "max-w-[85%]"
                    }
                  >
                    <div
                      className={`rounded-2xl px-3 py-2 text-[0.85rem] leading-relaxed ${
                        m.role === "user"
                          ? "bg-mj-green text-white"
                          : "bg-white text-mj-ink shadow"
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.role === "bot" && m.aksi ? (
                      <a
                        href={m.aksi.type === "daftar" ? m.aksi.url : waLink()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='mt-1.5 inline-block rounded-full bg-mj-yellow px-3 py-1.5 text-[0.75rem] font-semibold text-mj-ink shadow hover:brightness-95'
                      >
                        {m.aksi.type === "daftar"
                          ? m.aksi.label
                          : "Chat Admin via WhatsApp"}
                      </a>
                    ) : null}
                  </div>
                ))}
                {sending ? (
                  <div className='max-w-[70%] rounded-2xl bg-white px-3 py-2 text-[0.85rem] text-mj-ink/60 shadow'>
                    Mengetik...
                  </div>
                ) : null}
              </div>

              <form
                onSubmit={handleSend}
                className='flex gap-2 border-t border-black/5 p-3'
              >
                <input
                  type='text'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Tulis pertanyaan...'
                  className='flex-1 rounded-full border border-black/10 px-3 py-2 text-[0.85rem] outline-none focus:border-mj-green'
                />
                <button
                  type='submit'
                  disabled={sending || !input.trim()}
                  className='rounded-full bg-mj-green px-4 py-2 text-[0.85rem] font-semibold text-white disabled:opacity-50'
                >
                  Kirim
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}

      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='flex size-14 items-center justify-center rounded-full bg-mj-green text-sm font-semibold text-white shadow-xl transition-transform duration-300 hover:scale-105'
        aria-label={open ? "Tutup chat" : "Buka chat"}
      >
        {open ? "×" : "Chat"}
      </button>
    </div>
  );
}

export default ChatWidget;
