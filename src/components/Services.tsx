import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import { Code2, Palette, Rocket, Smartphone } from 'lucide-react'

const services = [
  {
    icon: <Palette className="w-8 h-8 text-blue-400" />,
    title: "Брендинг",
    description: "Создаем визуальные системы, которые говорят громче слов. Строим бренды, которые запоминаются и живут долго.",
  },
  {
    icon: <Smartphone className="w-8 h-8 text-purple-400" />,
    title: "Цифровые продукты",
    description: "Пользовательские интерфейсы, созданные для ясности и удовольствия. От мобильных приложений до сложных дашбордов.",
  },
  {
    icon: <Code2 className="w-8 h-8 text-indigo-400" />,
    title: "Разработка",
    description: "Чистый, масштабируемый код, воплощающий ваше видение. Создаем надежные решения на современных технологиях.",
  },
  {
    icon: <Rocket className="w-8 h-8 text-pink-400" />,
    title: "Стратегия роста",
    description: "Аналитика и данные для масштабирования вашего присутствия. Помогаем находить и вовлекать аудиторию.",
  },
]

export function Services() {
  return (
    <section id="services" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Наша экспертиза
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col justify-between group">
                <div>
                  <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-white/10 transition-colors">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-white/60 leading-relaxed">{service.description}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-white/40 group-hover:text-white transition-colors">
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
