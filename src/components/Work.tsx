import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import Icon from "@/components/ui/icon"
import { SlotModal } from "@/components/SlotModal"

const games = [
  {
    title: "Sweet Bonanza",
    category: "Pragmatic Play",
    image: "https://cdn.poehali.dev/templates/liquid-glass-agency/neon-finance-app-interface-dark-mode.jpg",
    color: "from-pink-500/20 to-purple-500/20",
    description: "Один из самых популярных слотов в мире. Взрывные выплаты и яркая графика.",
    tags: ["Слот", "Популярный"],
    rtp: "96.48%",
    hot: true,
  },
  {
    title: "Перун's Thunder",
    category: "LuckyFan Original",
    image: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/ac8d15a5-e9e0-4cb8-9c30-34b945946c46.jpg",
    color: "from-red-500/20 to-orange-500/20",
    description: "Славянские боги, молнии Перуна и тёмная магия Велеса. Оригинальный слот LuckyFan с механикой кластеров.",
    tags: ["Оригинал", "Эксклюзив"],
    rtp: "96.50%",
    hot: true,
  },
  {
    title: "Big Bass Bonanza",
    category: "Pragmatic Play",
    image: "https://cdn.poehali.dev/templates/liquid-glass-agency/meditation-app-interface-soft-gradients.jpg",
    color: "from-blue-500/20 to-cyan-500/20",
    description: "Рыбалка за большими выигрышами. Расслабляющий геймплей с горячими фриспинами.",
    tags: ["Слот", "Фриспины"],
    rtp: "96.71%",
    hot: false,
  },
]

export function Work() {
  const [activeGame, setActiveGame] = useState<typeof games[0] | null>(null)

  return (
    <section id="games" className="py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-yellow-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-yellow-400 font-semibold uppercase tracking-widest text-sm mb-4"
            >
              Популярные игры
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Топ слоты
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/60 max-w-md"
            >
              Лучшие слоты от Pragmatic Play и других провайдеров — играй на фантики.
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="px-6 py-3 rounded-full border border-yellow-400/30 hover:bg-yellow-400/10 transition-colors text-sm font-medium text-yellow-400"
          >
            Все 200+ игр
          </motion.button>
        </div>

        <div className="space-y-20" id="leaderboard">
          {games.map((game, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <GlassCard className="p-0 overflow-hidden group">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className={`p-12 flex flex-col justify-center relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-medium text-white/50 uppercase tracking-wider">
                          {game.category}
                        </span>
                        {game.hot && (
                          <span className="px-2 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-xs font-bold flex items-center gap-1">
                            🔥 Горячий
                          </span>
                        )}
                      </div>
                      <h3 className="text-4xl md:text-5xl font-bold mb-4 group-hover:translate-x-2 transition-transform duration-500">
                        {game.title}
                      </h3>
                      <p className="text-white/70 mb-6 max-w-md">
                        {game.description}
                      </p>
                      <div className="flex items-center gap-3 mb-8 text-sm">
                        <span className="text-white/50">RTP:</span>
                        <span className="text-green-400 font-semibold">{game.rtp}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium flex-wrap">
                        {game.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            {tag}
                          </span>
                        ))}
                        <button
                          onClick={() => setActiveGame(game)}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                        >
                          <Icon name="Play" size={14} />
                          Играть
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    className="relative h-[400px] md:h-auto overflow-hidden cursor-pointer"
                    onClick={() => setActiveGame(game)}
                  >
                    <img
                      src={game.image}
                      alt={game.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="Play" size={24} className="text-black ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Топ игроков */}
        <div id="top" className="mt-32">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-12 text-center"
          >
            🏆 Таблица лидеров
          </motion.h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { rank: 1, name: "DragonSlayer", score: "128 500", badge: "🥇" },
              { rank: 2, name: "LuckyAce", score: "97 200", badge: "🥈" },
              { rank: 3, name: "SpinMaster", score: "84 700", badge: "🥉" },
              { rank: 4, name: "GoldenFox", score: "71 300", badge: "4️⃣" },
              { rank: 5, name: "NightWolf", score: "63 100", badge: "5️⃣" },
            ].map((player, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard className={`flex items-center justify-between py-4 px-6 ${i === 0 ? "border-yellow-400/30 bg-yellow-400/5" : ""}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{player.badge}</span>
                    <span className="font-semibold text-lg">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Coins" size={16} className="text-yellow-400" fallback="Star" />
                    <span className="text-yellow-400 font-bold">{player.score}</span>
                    <span className="text-white/40 text-sm">фантиков</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <SlotModal game={activeGame} onClose={() => setActiveGame(null)} />
    </section>
  )
}