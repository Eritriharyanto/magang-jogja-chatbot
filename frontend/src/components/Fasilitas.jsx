import { useEffect, useState } from "react";
import fasilitasBg from "@/assets/fasilitas-bg.png";
import Reveal from "@/components/Reveal";
import { getFasilitas, API_BASE } from "@/lib/api";
import { FASILITAS as FASILITAS_FALLBACK } from "@/data/content";

function Fasilitas() {
  const [fasilitas, setFasilitas] = useState(
    FASILITAS_FALLBACK.map((isi) => ({ isi })),
  );

  useEffect(() => {
    let cancelled = false;
    getFasilitas()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0)
          setFasilitas(data);
      })
      .catch(() => {
        // biarkan fallback statis tampil kalau backend belum jalan
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id='fasilitas'
      className='relative overflow-hidden bg-mj-red bg-cover bg-center bg-no-repeat py-16'
      style={{ backgroundImage: `url(${fasilitasBg})` }}
    >
      <div className='relative mx-auto max-w-3xl px-5'>
        <h2 className='mj-display text-center text-[1.6rem] leading-tight text-white md:text-[1.8rem]'>
          Fasilitas yang
          <br />
          didapat
        </h2>
        <div className='mx-auto mt-6 h-px w-[22rem] max-w-full bg-white/70' />
        <div className='mx-auto mt-6 h-px w-[14rem] max-w-full bg-white/70' />
        <ul className='mt-12 space-y-5'>
          {fasilitas.map((f, i) => (
            <Reveal key={f.id ?? f.isi} delay={i * 70} as='li'>
              <div className='flex items-center gap-4 rounded-[1.75rem] border-b-[6px] border-[#7a4a4a] bg-mj-yellow px-6 py-3 text-center text-[0.95rem] font-bold leading-snug text-mj-ink transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'>
                {f.gambar ? (
                  <img
                    src={`${API_BASE}${f.gambar}`}
                    alt=''
                    className='size-10 shrink-0 rounded-full object-cover'
                  />
                ) : null}
                <span className='flex-1 whitespace-pre-line'>{f.isi}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Fasilitas;
