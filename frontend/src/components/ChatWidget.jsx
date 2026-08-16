import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/api";

const WELCOME = {
  role: "bot",
  text: "Halo! Aku Asisten Magang Jogja. Tanya-tanya soal posisi magang, syarat, atau fasilitas ya.",
};

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function handleSend(e) {
    e.preventDefault();
    const pesan = input.trim();
    if (!pesan || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: pesan }]);
    setInput("");
    setSending(true);

    try {
      const res = await sendChatMessage(pesan);
      setMessages((prev) => [...prev, { role: "bot", text: res.jawaban }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Maaf, server chatbot sedang tidak bisa dihubungi. Coba lagi sebentar lagi ya.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {open ? (
        <div className="flex h-[28rem] w-[20rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:w-[22rem]">
          <div className="flex items-center justify-between bg-mj-green px-4 py-3 text-white">
            <span className="font-semibold">Chat Magang Jogja</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              className="rounded px-2 text-lg leading-none hover:bg-white/10"
            >
              &times;
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-mj-green/5 px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[0.85rem] leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-mj-green text-white"
                    : "bg-white text-mj-ink shadow"
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending ? (
              <div className="max-w-[70%] rounded-2xl bg-white px-3 py-2 text-[0.85rem] text-mj-ink/60 shadow">
                Mengetik...
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-black/5 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan..."
              className="flex-1 rounded-full border border-black/10 px-3 py-2 text-[0.85rem] outline-none focus:border-mj-green"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-full bg-mj-green px-4 py-2 text-[0.85rem] font-semibold text-white disabled:opacity-50"
            >
              Kirim
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-14 items-center justify-center rounded-full bg-mj-green text-sm font-semibold text-white shadow-xl transition-transform duration-300 hover:scale-105"
        aria-label={open ? "Tutup chat" : "Buka chat"}
      >
        {open ? "×" : "Chat"}
      </button>
    </div>
  );
}

export default ChatWidget;
