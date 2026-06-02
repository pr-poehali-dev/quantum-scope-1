import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Icon from "@/components/ui/icon"

const SYMBOLS = ["🍒", "🍋", "🍇", "💎", "7️⃣", "🔔", "⭐", "🎰"]
const REEL_SIZE = 5

const PAYOUTS: Record<string, number> = {
  "7️⃣": 50,
  "💎": 30,
  "🎰": 20,
  "⭐": 15,
  "🔔": 10,
  "🍇": 8,
  "🍋": 5,
  "🍒": 3,
}

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
}

function generateReel() {
  return Array.from({ length: REEL_SIZE }, randomSymbol)
}

interface SlotModalProps {
  game: { title: string; category: string } | null
  onClose: () => void
}

export function SlotModal({ game, onClose }: SlotModalProps) {
  const [reels, setReels] = useState([generateReel(), generateReel(), generateReel()])
  const [spinning, setSpinning] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const [result, setResult] = useState<{ win: number; message: string } | null>(null)
  const [spinCount, setSpinCount] = useState(0)
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([])

  useEffect(() => {
    return () => intervalRefs.current.forEach(clearInterval)
  }, [])

  const spin = () => {
    if (spinning || balance < bet) return
    setBalance((b) => b - bet)
    setResult(null)
    setSpinning(true)
    setSpinCount((c) => c + 1)

    // Анимация барабанов с разной задержкой остановки
    const newReels = [generateReel(), generateReel(), generateReel()]
    const stopTimes = [800, 1200, 1600]

    intervalRefs.current.forEach(clearInterval)

    reels.forEach((_, i) => {
      const id = setInterval(() => {
        setReels((prev) => {
          const updated = [...prev]
          updated[i] = generateReel()
          return updated
        })
      }, 80)
      intervalRefs.current[i] = id

      setTimeout(() => {
        clearInterval(id)
        setReels((prev) => {
          const updated = [...prev]
          updated[i] = newReels[i]
          return updated
        })

        if (i === 2) {
          setSpinning(false)
          // Проверяем выигрыш по центральной строке (индекс 2)
          const line = [newReels[0][2], newReels[1][2], newReels[2][2]]
          const allSame = line[0] === line[1] && line[1] === line[2]
          const twoPairs = line[0] === line[1] || line[1] === line[2] || line[0] === line[2]

          if (allSame) {
            const multiplier = PAYOUTS[line[0]] || 5
            const win = bet * multiplier
            setBalance((b) => b + win)
            setResult({ win, message: `🎉 ДЖЕКПОТ! ${line[0]}${line[0]}${line[0]} × ${multiplier}` })
          } else if (twoPairs) {
            const win = Math.floor(bet * 1.5)
            setBalance((b) => b + win)
            setResult({ win, message: `✨ Пара! +${win} фантиков` })
          } else {
            setResult({ win: 0, message: "Не повезло... Крути ещё!" })
          }
        }
      }, stopTimes[i])
    })
  }

  const changeBet = (delta: number) => {
    setBet((b) => Math.min(Math.max(b + delta, 5), Math.min(100, balance)))
  }

  if (!game) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative w-full max-w-lg bg-[#0d0d0d] border border-yellow-400/20 rounded-3xl overflow-hidden shadow-[0_0_80px_-20px_rgba(251,191,36,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div>
              <h2 className="text-xl font-bold text-white">{game.title}</h2>
              <p className="text-xs text-white/40 mt-0.5">{game.category}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                <span className="text-yellow-400 text-sm">🪙</span>
                <span className="text-yellow-400 font-bold text-sm">{balance.toLocaleString()}</span>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
          </div>

          {/* Slot Machine */}
          <div className="px-6 py-8">
            {/* Барабаны */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-4 mb-6 relative overflow-hidden">
              {/* Центральная линия */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[1px] bg-yellow-400/30 pointer-events-none" />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400/60" />

              <div className="grid grid-cols-3 gap-3">
                {reels.map((reel, reelIdx) => (
                  <div key={reelIdx} className="flex flex-col items-center gap-1 overflow-hidden h-[180px] relative">
                    {reel.map((symbol, symIdx) => (
                      <motion.div
                        key={`${spinCount}-${reelIdx}-${symIdx}`}
                        className={`flex items-center justify-center w-full rounded-xl text-4xl flex-shrink-0 h-[52px] ${
                          symIdx === 2
                            ? "bg-white/10 border border-yellow-400/30"
                            : "bg-white/5"
                        }`}
                        animate={spinning ? { y: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 0.15, repeat: spinning ? Infinity : 0 }}
                      >
                        {symbol}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Результат */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-center py-3 px-4 rounded-xl mb-4 font-semibold text-sm ${
                    result.win > 0
                      ? "bg-yellow-400/15 border border-yellow-400/30 text-yellow-400"
                      : "bg-white/5 border border-white/10 text-white/60"
                  }`}
                >
                  {result.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ставка */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/50 text-sm">Ставка:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => changeBet(-5)}
                  disabled={bet <= 5}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center disabled:opacity-30"
                >
                  <Icon name="Minus" size={14} />
                </button>
                <span className="text-yellow-400 font-bold text-lg w-16 text-center">{bet} 🪙</span>
                <button
                  onClick={() => changeBet(5)}
                  disabled={bet >= 100 || bet >= balance}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center disabled:opacity-30"
                >
                  <Icon name="Plus" size={14} />
                </button>
              </div>
              <div className="flex gap-2">
                {[10, 25, 50].map((v) => (
                  <button
                    key={v}
                    onClick={() => setBet(Math.min(v, balance))}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                      bet === v ? "bg-yellow-400 text-black" : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопка Spin */}
            <button
              onClick={spin}
              disabled={spinning || balance < bet}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_-5px_rgba(251,191,36,0.5)]"
            >
              {spinning ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}>
                    🎰
                  </motion.span>
                  Крутим...
                </span>
              ) : balance < bet ? (
                "Недостаточно фантиков"
              ) : (
                "🎰 КРУТИТЬ!"
              )}
            </button>

            {balance === 0 && (
              <button
                onClick={() => { setBalance(1000); setResult(null) }}
                className="w-full mt-3 py-3 rounded-2xl border border-yellow-400/30 text-yellow-400 font-semibold text-sm hover:bg-yellow-400/10 transition-colors"
              >
                🔄 Получить ещё 1000 фантиков
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
