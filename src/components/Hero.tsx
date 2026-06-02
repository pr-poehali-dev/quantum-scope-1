import { motion } from "framer-motion"
import Icon from "@/components/ui/icon"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Liquid Elements — золотые и пурпурные */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-500/15 rounded-full blur-[120px] animate-blob mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-amber-600/15 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-purple-700/15 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
              🎮 Онлайн сейчас: 47 игроков
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-8"
        >
          <span className="text-gradient">Lucky</span>
          <br />
          <span className="text-white">Fan</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Лучшие слоты от топовых провайдеров — без риска!
          Играй на фантики, соревнуйся с друзьями и занимай место в топе.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_-5px_rgba(251,191,36,0.5)]">
            <span className="relative z-10 flex items-center gap-2">
              Играть бесплатно <Icon name="ArrowRight" size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button className="px-8 py-4 glass rounded-full font-semibold text-lg text-white hover:bg-white/10 transition-all hover:scale-105">
            Смотреть слоты
          </button>
        </motion.div>

        {/* Счётчики */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          className="mt-20 grid grid-cols-3 gap-6 max-w-xl mx-auto"
        >
          {[
            { value: "200+", label: "Слотов" },
            { value: "1 000", label: "Фантиков старт" },
            { value: "100+", label: "Игроков" },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl py-5 px-3 text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">{stat.value}</div>
              <div className="text-xs text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/40 uppercase tracking-widest">Листайте</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-yellow-400/40 to-white/0" />
      </motion.div>
    </section>
  )
}
