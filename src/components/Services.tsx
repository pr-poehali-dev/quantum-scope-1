import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import Icon from "@/components/ui/icon"

const features = [
  {
    iconName: "Gamepad2",
    iconColor: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    title: "Слоты без риска",
    description: "Более 200 слотов от ведущих провайдеров. Играй в любимые игры совершенно бесплатно — только на фантики.",
  },
  {
    iconName: "Coins",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-400/10",
    title: "Система фантиков",
    description: "Каждый новый игрок получает 1000 фантиков на старт. Выигрывай больше и трать на новые игры.",
  },
  {
    iconName: "Trophy",
    iconColor: "text-purple-400",
    bgColor: "bg-purple-400/10",
    title: "Турниры и рейтинг",
    description: "Соревнуйся с другими игроками в еженедельных турнирах. Лучшие попадают в зал славы.",
  },
  {
    iconName: "Shield",
    iconColor: "text-green-400",
    bgColor: "bg-green-400/10",
    title: "Честная игра",
    description: "Никаких реальных денег — только азарт и удовольствие. Честный генератор случайных чисел.",
  },
]

export function Services() {
  return (
    <section id="how" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-yellow-400 font-semibold uppercase tracking-widest text-sm mb-4"
          >
            Почему LuckyFan
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Всё лучшее —
            <br />
            <span className="text-gradient">бесплатно</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col justify-between group">
                <div>
                  <div className={`mb-6 p-4 rounded-2xl ${feature.bgColor} w-fit group-hover:scale-110 transition-transform`}>
                    <Icon name={feature.iconName} size={32} className={feature.iconColor} fallback="Star" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">{feature.description}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-white/40 group-hover:text-yellow-400 transition-colors">
                  Подробнее <div className="w-4 h-[1px] bg-current transition-all group-hover:w-8" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
