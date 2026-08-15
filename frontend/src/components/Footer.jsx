import footerIllustration from "@/assets/beges.png";

function Footer() {
  return (
    <footer
      id="tentang"
      className="relative min-h-[520px] overflow-hidden bg-mj-orange sm:min-h-[620px] md:min-h-[760px]"
    >
      <img
        src={footerIllustration}
        alt="Peserta magang merayakan keberhasilan"
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-top"
      />
      <div className="relative z-10 mx-auto max-w-[900px] px-5 pt-16 text-center">
        <p className="mj-title text-[3rem] normal-case tracking-tight text-white md:text-[4.2rem]">
          magangjogja.com
        </p>
        <p className="mt-4 text-[0.95rem] font-medium uppercase text-white">More Info</p>
        <p className="text-[0.95rem] font-bold text-white">Kontak</p>
        <a
          href="tel:+6289529002944"
          className="mt-1 block text-[2rem] font-bold text-mj-pink transition-opacity hover:opacity-80"
        >
          0895 2900 2944
        </a>
        <p className="mt-2 text-[0.9rem] font-semibold text-white">
          <span className="font-bold">Alamat kantor pusat</span> Jl. Janti Gg. Arjuna No. 59,
          Karangjambe, Banguntapan, Bantul, Yogyakarta 55198
        </p>
      </div>
    </footer>
  );
}

export default Footer;
