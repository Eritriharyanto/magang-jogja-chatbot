import freeBadge from "@/assets/free-badge.png";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Bar from "@/components/Bar";
import Stripes from "@/components/Stripes";
import Syarat from "@/components/Syarat";
import Posisi from "@/components/Posisi";
import Fasilitas from "@/components/Fasilitas";
import Footer from "@/components/Footer";

function App() {
  return (
    <div className='overflow-x-hidden bg-mj-green font-body'>
      <Header />
      <Hero />
      <Bar color='bg-mj-blue' />

      <Syarat />

      <Stripes
        order={[
          "bg-mj-green-dark",
          "bg-mj-yellow",
          "bg-mj-red",
          "bg-mj-blue",
          "bg-mj-purple",
        ]}
      />

      <Posisi />

      <Stripes
        order={[
          "bg-mj-purple",
          "bg-mj-blue",
          "bg-mj-red",
          "bg-mj-yellow",
          "bg-mj-green-dark",
        ]}
      />

      <Fasilitas />
      <Footer />

      <img
        src={freeBadge}
        alt='Gratis 100% tanpa biaya'
        width={250}
        height={249}
        className='animate-mj-badge-pulse fixed bottom-6 right-6 z-50 w-32 md:w-56'
      />
    </div>
  );
}

export default App;
