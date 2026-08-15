import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { POSISI } from "@/data/content";

function PosisiDetail() {
  const { slug } = useParams();
  const posisi = POSISI.find((p) => p.slug === slug);

  // Selalu mulai dari atas halaman saat pindah ke halaman detail.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Kalau slug di URL tidak cocok dengan divisi manapun, lempar balik ke beranda.
  if (!posisi) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="overflow-x-hidden bg-mj-green font-body">
      <Header />

      <section className="bg-mj-yellow py-14">
        <div className="mx-auto max-w-[900px] px-5 text-center">
          <Link
            to="/#posisi"
            className="mb-6 inline-block text-[0.9rem] font-semibold text-white/90 transition-colors hover:text-mj-green-dark"
          >
            &larr; Kembali ke semua posisi
          </Link>

          <div className="mx-auto flex h-28 items-center justify-center">
            <img src={posisi.icon} alt="" aria-hidden="true" className="size-24 object-contain" />
          </div>

          <h1 className="mj-display mt-4 text-2xl leading-tight text-white md:text-3xl">
            {posisi.label} {posisi.sub}
          </h1>
        </div>
      </section>

      <section className="bg-mj-green py-14">
        <div className="mx-auto max-w-[720px] px-5">
          <div className="rounded-2xl bg-mj-green-dark p-8 text-white">
            <h2 className="mj-display text-lg">Tentang Posisi</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed">{posisi.deskripsi}</p>

            <h2 className="mj-display mt-8 text-lg">Jobdesk</h2>
            <ul className="mt-3 space-y-2">
              {posisi.jobdesk.map((j) => (
                <li key={j} className="flex gap-3 text-[0.95rem] leading-relaxed">
                  <span className="mt-1 text-mj-yellow">&#9679;</span>
                  <span>{j}</span>
                </li>
              ))}
            </ul>

            <a
              href={posisi.gformLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block w-full rounded-full bg-mj-yellow py-3 text-center text-[0.95rem] font-bold uppercase text-mj-ink transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Daftar Posisi Ini
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default PosisiDetail;
