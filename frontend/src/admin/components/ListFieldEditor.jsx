import { useState } from "react";

/** Editor sederhana buat field array-of-string (mis. jobdesk, skill, keywords). */
function ListFieldEditor({ label, items, onChange }) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  }

  function removeItem(idx) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-mj-ink">{label}</label>
      <ul className="mb-2 space-y-1">
        {items.map((it, i) => (
          <li
            key={`${it}-${i}`}
            className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm"
          >
            <span className="break-words">{it}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="shrink-0 text-red-600 hover:text-red-800"
              aria-label={`Hapus ${it}`}
            >
              &times;
            </button>
          </li>
        ))}
        {items.length === 0 ? <li className="text-sm text-slate-400">Belum ada item.</li> : null}
      </ul>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="Tambah item, lalu Enter"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-mj-green"
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg bg-mj-green px-3 py-1.5 text-sm font-semibold text-white hover:bg-mj-green-dark"
        >
          Tambah
        </button>
      </div>
    </div>
  );
}

export default ListFieldEditor;
