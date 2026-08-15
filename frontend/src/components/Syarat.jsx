import Bar from "@/components/Bar";
import Reveal from "@/components/Reveal";
import { SYARAT } from "@/data/content";

function Syarat() {
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
          {SYARAT.map((s, i) => (
            <Reveal
              key={s}
              delay={i * 100}
              className="flex flex-col items-center justify-end text-center"
            >
              <p className="max-w-xs whitespace-pre-line text-[0.95rem] leading-relaxed text-white">
                {s}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export default Syarat;
