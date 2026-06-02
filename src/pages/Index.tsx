import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/Hero"
import { Services } from "@/components/Services"
import { Work } from "@/components/Work"
import { Footer } from "@/components/Footer"

const Index = () => {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      <Navbar />
      <Hero />
      <Services />
      <Work />

      {/* Call to Action Section */}
      <section id="contact" className="py-32 relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="text-yellow-400 font-semibold uppercase tracking-widest text-sm mb-6">Присоединяйся</p>
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Готов к<br />
            <span className="text-gradient">большому выигрышу?</span>
          </h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Регистрируйся прямо сейчас, получай 1000 фантиков и начинай крутить слоты. Это бесплатно!
          </p>
          <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_50px_-10px_rgba(251,191,36,0.6)]">
            🎰 Начать играть бесплатно
          </button>
        </div>

        {/* Background Gradient for CTA */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-yellow-900/10 to-transparent pointer-events-none" />
      </section>

      <Footer />
    </main>
  )
}

export default Index
