import { useEffect, useState } from "react";
import Bar from "@/components/Bar";
import Reveal from "@/components/Reveal";
import { getSyarat, API_BASE } from "@/lib/api";
import { SYARAT as SYARAT_FALLBACK } from "@/data/content";

function Syarat() {
  const [syarat, setSyarat] = useState(SYARAT_FALLBACK.map((isi) => ({ isi })));

  useEffect(() => {
    let cancelled = false;
    getSyarat()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setSyarat(data);
      })
      .catch(() => {
        // biarkan fallback statis tampil kalau backend belum jalan
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section id="syarat" className="bg-mj-yellow py-6">
        <h2 className="mj-display text-center text-xl text-white md:text-[1.35rem]">
          Syarat dan Ketentuan
        </h2>
      </section>
      <Bar color="bg-mj-red" />
      <Bar color="bg-mj-purple" />

      <section className="bg-mj-green py-16">
        <div className="mx-auto grid max-w-[1200px] gap-x-8 gap-y-16 px-5 md:grid-cols-3">
          {syarat.map((s, i) => (
            <Reveal
              key={s.id ?? s.isi}
              delay={i * 100}
              className="flex flex-col items-center justify-end text-center"
            >
              {s.gambar ? (
                <img
                  src={`${API_BASE}${s.gambar}`}
                  alt=""
                  className="mb-4 size-16 rounded-xl object-cover"
                />
              ) : null}
              <p className="max-w-xs whitespace-pre-line text-[0.95rem] leading-relaxed text-white">
                {s.isi}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export default Syarat;
