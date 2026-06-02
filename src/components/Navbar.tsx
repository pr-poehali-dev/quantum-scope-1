import { useState } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"
import Icon from "@/components/ui/icon"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  const navLinks = [
    { name: "Слоты", href: "#games" },
    { name: "Рейтинг", href: "#leaderboard" },
    { name: "Как играть", href: "#how" },
    { name: "Топ игроки", href: "#top" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "py-4" : "py-6"
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto rounded-full transition-all duration-300 flex items-center justify-between px-6 py-3",
          "glass bg-black/40"
        )}
      >
        <a href="/" className="text-2xl font-bold tracking-tighter relative z-50 flex items-center gap-2">
          <span className="text-yellow-400">🎰</span>
          <span className="text-white">Lucky<span className="text-yellow-400">Fan</span></span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-white/70 hover:text-yellow-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a href="/tracker" className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
            👁 Трекер
          </a>
          <button className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
            Войти / Регистрация
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden relative z-50 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Icon name={isMobileMenuOpen ? "X" : "Menu"} />
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40 flex items-center justify-center md:hidden"
          >
            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl font-light text-white hover:text-yellow-400 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a href="/tracker" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-light text-green-400 hover:text-green-300 transition-colors">
                👁 Трекер
              </a>
              <button className="mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 py-3 rounded-full text-lg font-bold">
                Войти / Регистрация
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}