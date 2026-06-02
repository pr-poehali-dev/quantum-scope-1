import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Icon from "@/components/ui/icon"

const COLS = 5
const ROWS = 3

// Каждый столбец «принадлежит» своему богу/символу
const COL_SYMBOLS = [
  {
    id: "perun", name: "Перун",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/ac8d15a5-e9e0-4cb8-9c30-34b945946c46.jpg",
    value: 50, color: "#4FC3F7", glow: "rgba(79,195,247,0.7)",
  },
  {
    id: "veles", name: "Велес",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/f45aa3a9-691a-472c-b283-55f4d67e083e.jpg",
    value: 25, color: "#66BB6A", glow: "rgba(102,187,106,0.7)",
  },
  {
    id: "wild", name: "Wild",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/f9180b85-40e1-42b0-b8a4-7300e1532bc3.jpg",
    value: 100, color: "#FFD700", glow: "rgba(255,215,0,0.8)",
  },
  {
    id: "axe", name: "Топор",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/35736db8-78be-4bc2-bb2e-062667961c03.jpg",
    value: 15, color: "#FFA726", glow: "rgba(255,167,38,0.7)",
  },
  {
    id: "rune", name: "Руна",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/c058b9e3-b998-41d0-bfaa-fa7ea31f6906.jpg",
    value: 10, color: "#EF5350", glow: "rgba(239,83,80,0.7)",
  },
]

// Множители которые падают сверху на колонки
const MULT_VALUES = [2, 3, 5, 10, 15, 25, 50, 100]

type ColMultipliers = (number | null)[]
type Grid = number[][] // grid[row][col] — индекс символа (0..4 = символ колонки, или рандом)

function randomRow(): number[] {
  // Каждая ячейка — символ своей колонки (75%) или рандомный сосед (25%)
  return Array.from({ length: COLS }, (_, col) => {
    return Math.random() < 0.75 ? col : Math.floor(Math.random() * COLS)
  })
}

function generateGrid(): Grid {
  return Array.from({ length: ROWS }, randomRow)
}

function randomMult(): number | null {
  if (Math.random() > 0.3) return null
  return MULT_VALUES[Math.floor(Math.random() * MULT_VALUES.length)]
}

function generateMultipliers(): ColMultipliers {
  return Array.from({ length: COLS }, randomMult)
}

// Выигрыш: если вся колонка из одного символа — выигрыш
function findWins(grid: Grid, multipliers: ColMultipliers): { winCols: number[]; totalWin: number } {
  const winCols: number[] = []
  let totalWin = 0

  for (let col = 0; col < COLS; col++) {
    const allSame = grid.every((row) => row[col] === col)
    const hasWild = grid.some((row) => row[col] === 2) // wild = col 2
    const nonWild = grid.filter((row) => row[col] !== 2)
    const nonWildSame = nonWild.length === 0 || nonWild.every((row) => row[col] === col)

    if (allSame || (hasWild && nonWildSame)) {
      winCols.push(col)
      const sym = COL_SYMBOLS[col]
      const mult = multipliers[col] ?? 1
      totalWin += sym.value * mult * 2
    }
  }
  return { winCols, totalWin }
}

function playSound(type: "spin" | "win" | "bigwin") {
  try {
    const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (type === "spin") {
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start(); osc.stop(ctx.currentTime + 0.35)
    } else if (type === "win") {
      [0, 0.12, 0.24].forEach((d, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.setValueAtTime([523, 659, 784][i], ctx.currentTime + d)
        g.gain.setValueAtTime(0.15, ctx.currentTime + d)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.3)
        o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.3)
      })
    } else {
      [0, 0.1, 0.2, 0.35, 0.5, 0.65].forEach((d, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.setValueAtTime([523, 659, 784, 1047, 1175, 1319][i], ctx.currentTime + d)
        g.gain.setValueAtTime(0.2, ctx.currentTime + d)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.35)
        o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.35)
      })
    }
  } catch { /* AudioContext not supported */ }
}

interface SlotModalProps {
  game: { title: string; category: string } | null
  onClose: () => void
}

export function SlotModal({ game, onClose }: SlotModalProps) {
  const [grid, setGrid] = useState<Grid>(generateGrid)
  const [multipliers, setMultipliers] = useState<ColMultipliers>(generateMultipliers)
  const [spinning, setSpinning] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const [winCols, setWinCols] = useState<number[]>([])
  const [winAmount, setWinAmount] = useState<number | null>(null)
  const [spinningCols, setSpinningCols] = useState<boolean[]>(Array(COLS).fill(false))
  const [droppingMults, setDroppingMults] = useState<ColMultipliers>(Array(COLS).fill(null))
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  useEffect(() => () => intervalsRef.current.forEach(clearInterval), [])

  const spin = useCallback(() => {
    if (spinning || balance < bet) return
    setBalance((b) => b - bet)
    setWinCols([])
    setWinAmount(null)
    setSpinning(true)
    setDroppingMults(Array(COLS).fill(null))
    playSound("spin")

    const finalGrid = generateGrid()
    const finalMults = generateMultipliers()

    intervalsRef.current.forEach(clearInterval)
    intervalsRef.current = []

    const startDelays = [0, 100, 200, 300, 400]
    const stopDelays =  [900, 1050, 1200, 1350, 1500]

    startDelays.forEach((startDelay, col) => {
      setTimeout(() => {
        setSpinningCols((prev) => { const n = [...prev]; n[col] = true; return n })

        const id = setInterval(() => {
          setGrid((prev) => {
            const next = prev.map((row) => [...row])
            for (let r = 0; r < ROWS; r++) next[r][col] = Math.floor(Math.random() * COLS)
            return next
          })
        }, 60)
        intervalsRef.current[col] = id

        setTimeout(() => {
          clearInterval(id)
          setSpinningCols((prev) => { const n = [...prev]; n[col] = false; return n })
          setGrid((prev) => {
            const next = prev.map((row) => [...row])
            for (let r = 0; r < ROWS; r++) next[r][col] = finalGrid[r][col]
            return next
          })

          // Показываем падающий множитель для колонки
          if (finalMults[col] !== null) {
            setDroppingMults((prev) => { const n = [...prev]; n[col] = finalMults[col]; return n })
          }

          if (col === COLS - 1) {
            setTimeout(() => {
              setMultipliers(finalMults)
              setSpinning(false)
              const { winCols: wc, totalWin } = findWins(finalGrid, finalMults)
              if (wc.length > 0) {
                setWinCols(wc)
                const actualWin = Math.round(totalWin * (bet / 10))
                setWinAmount(actualWin)
                setBalance((b) => b + actualWin)
                playSound(actualWin >= bet * 20 ? "bigwin" : "win")
              } else {
                setWinAmount(0)
              }
              setDroppingMults(Array(COLS).fill(null))
            }, 200)
          }
        }, stopDelays[col] - startDelay)
      }, startDelay)
    })
  }, [spinning, balance, bet])

  if (!game) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(180deg, #1a0505 0%, #0d0202 60%, #1a0505 100%)",
            border: "2px solid rgba(255,80,50,0.3)",
            boxShadow: "0 0 100px -15px rgba(255,60,0,0.4), 0 0 50px -20px rgba(80,160,255,0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-red-900/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h2 className="text-base font-black text-white tracking-wide">ПЕРУН'S THUNDER</h2>
                <p className="text-[10px] text-red-300/50 uppercase tracking-widest">Slavic Gods • Cluster Pays</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                <span className="text-xs">🪙</span>
                <motion.span key={balance} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-black text-sm text-yellow-400">
                  {balance.toLocaleString()}
                </motion.span>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
          </div>

          {/* Игровое поле */}
          <div className="px-5 pt-5 pb-3">
            <div
              className="rounded-2xl overflow-visible p-3 relative"
              style={{
                background: "linear-gradient(180deg, #0d0000, #1a0303)",
                border: "1px solid rgba(255,80,50,0.2)",
                boxShadow: "inset 0 0 60px rgba(200,30,0,0.15)",
              }}
            >
              {/* Множители сверху колонок */}
              <div className="grid mb-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: "10px" }}>
                {Array.from({ length: COLS }).map((_, col) => {
                  const mult = multipliers[col]
                  const dropping = droppingMults[col]
                  const sym = COL_SYMBOLS[col]
                  return (
                    <div key={col} className="flex justify-center">
                      <AnimatePresence mode="wait">
                        {dropping !== null ? (
                          <motion.div
                            key={`drop-${col}`}
                            initial={{ y: -30, opacity: 0, scale: 1.3 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", damping: 14 }}
                            className="px-2.5 py-1 rounded-lg font-black text-sm"
                            style={{
                              background: `linear-gradient(135deg, ${sym.color}30, ${sym.color}15)`,
                              border: `1px solid ${sym.color}`,
                              color: sym.color,
                              boxShadow: `0 0 12px ${sym.glow}`,
                            }}
                          >
                            ×{dropping}
                          </motion.div>
                        ) : mult !== null ? (
                          <motion.div
                            key={`mult-${col}-${mult}`}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-2.5 py-1 rounded-lg font-black text-sm"
                            style={{
                              background: `linear-gradient(135deg, ${sym.color}25, ${sym.color}10)`,
                              border: `1px solid ${sym.color}60`,
                              color: sym.color,
                            }}
                          >
                            ×{mult}
                          </motion.div>
                        ) : (
                          <div key="empty" className="px-2.5 py-1 rounded-lg text-sm text-white/10 border border-white/5">
                            ×1
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              {/* Сетка 5×3 — большие символы */}
              <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: "10px" }}>
                {Array.from({ length: COLS }).map((_, col) => {
                  const sym = COL_SYMBOLS[col]
                  const isWinCol = winCols.includes(col)
                  const isColSpinning = spinningCols[col]

                  return (
                    <div key={col} className="flex flex-col gap-2.5">
                      {Array.from({ length: ROWS }).map((_, row) => {
                        const cellSymIdx = grid[row]?.[col] ?? col
                        const cellSym = COL_SYMBOLS[cellSymIdx]

                        return (
                          <motion.div
                            key={`${col}-${row}`}
                            className="relative rounded-2xl overflow-hidden"
                            style={{ aspectRatio: "1 / 1" }}
                            animate={
                              isColSpinning
                                ? { y: [0, -8, 8, 0] }
                                : isWinCol
                                ? { scale: [1, 1.06, 1] }
                                : {}
                            }
                            transition={
                              isColSpinning
                                ? { duration: 0.1, repeat: Infinity, ease: "linear" }
                                : isWinCol
                                ? { duration: 0.7, repeat: Infinity }
                                : {}
                            }
                            style={{
                              aspectRatio: "1 / 1",
                              background: isWinCol
                                ? `radial-gradient(circle, ${sym.color}30, #12010100)`
                                : "rgba(255,255,255,0.04)",
                              border: isWinCol
                                ? `2px solid ${sym.color}`
                                : "1px solid rgba(255,80,50,0.12)",
                              boxShadow: isWinCol
                                ? `0 0 24px ${sym.glow}, inset 0 0 12px ${sym.color}20`
                                : "none",
                            }}
                          >
                            <img
                              src={cellSym.img}
                              alt={cellSym.name}
                              className={`w-full h-full object-cover select-none transition-all duration-75 ${
                                isColSpinning ? "blur-[2px] brightness-50" : "brightness-100"
                              }`}
                              draggable={false}
                            />

                            {/* Подсветка при выигрыше */}
                            {isWinCol && (
                              <motion.div
                                className="absolute inset-0"
                                animate={{ opacity: [0, 0.5, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                style={{ background: `radial-gradient(circle, ${sym.color}80, transparent)` }}
                              />
                            )}

                            {/* Wild badge */}
                            {cellSym.id === "wild" && !isColSpinning && (
                              <div
                                className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-black py-0.5 tracking-widest"
                                style={{ background: "rgba(0,0,0,0.7)", color: "#FFD700" }}
                              >
                                WILD
                              </div>
                            )}
                          </motion.div>
                        )
                      })}

                      {/* Название символа под колонкой */}
                      <div className="text-center text-[10px] font-semibold mt-0.5" style={{ color: sym.color + "99" }}>
                        {sym.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Результат */}
            <div className="min-h-[52px] flex items-center justify-center mt-3">
              <AnimatePresence mode="wait">
                {winAmount !== null && winAmount > 0 ? (
                  <motion.div
                    key="win"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="w-full text-center py-3 px-4 rounded-2xl relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,100,50,0.12), rgba(255,200,50,0.12))",
                      border: "1px solid rgba(255,150,50,0.35)",
                    }}
                  >
                    <motion.div
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-yellow-400/10 to-red-500/10"
                    />
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <span className="text-xl">{winAmount >= bet * 20 ? "🏆" : "⚡"}</span>
                      <span className="font-black text-xl text-white">
                        {winAmount >= bet * 20 ? "ГРОМ ПЕРУНА! " : ""}+{winAmount.toLocaleString()} 🪙
                      </span>
                    </div>
                  </motion.div>
                ) : winAmount === 0 && !spinning ? (
                  <motion.p key="lose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-white/25 text-sm"
                  >
                    Боги молчат... Крути ещё!
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Панель управления */}
          <div className="px-5 pb-5 pt-1 border-t border-red-900/20">
            <div className="flex items-center gap-3 mt-3">
              {/* Ставка */}
              <div className="flex items-center gap-2 flex-1">
                <span className="text-white/40 text-xs shrink-0">Ставка:</span>
                <button
                  onClick={() => setBet((b) => Math.max(b - 5, 5))}
                  disabled={bet <= 5 || spinning}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center disabled:opacity-30 transition-colors"
                >
                  <Icon name="Minus" size={12} />
                </button>
                <span className="text-yellow-400 font-bold w-10 text-center text-sm">{bet}</span>
                <button
                  onClick={() => setBet((b) => Math.min(b + 5, 100, balance))}
                  disabled={bet >= 100 || bet >= balance || spinning}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center disabled:opacity-30 transition-colors"
                >
                  <Icon name="Plus" size={12} />
                </button>
                <div className="flex gap-1">
                  {[10, 25, 50, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setBet(Math.min(v, balance))}
                      disabled={spinning}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30 ${
                        bet === v ? "bg-yellow-400 text-black" : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Кнопка SPIN */}
              <motion.button
                onClick={spin}
                disabled={spinning || balance < bet}
                whileTap={!spinning ? { scale: 0.93 } : {}}
                className="relative px-8 py-3 rounded-2xl font-black text-base disabled:cursor-not-allowed shrink-0"
                style={{
                  background: spinning ? "linear-gradient(135deg,#444,#222)" : "linear-gradient(135deg,#c0392b,#e74c3c,#c0392b)",
                  color: spinning ? "rgba(255,255,255,0.4)" : "#fff",
                  boxShadow: spinning ? "none" : "0 0 30px rgba(231,76,60,0.6), 0 4px 12px rgba(0,0,0,0.5)",
                  minWidth: 140,
                }}
              >
                {spinning ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}>⚡</motion.span>
                    Крутим...
                  </span>
                ) : balance < bet ? (
                  <span className="text-xs">Мало фантиков</span>
                ) : (
                  "⚡ ПЕРУН!"
                )}
              </motion.button>
            </div>

            {balance < bet && (
              <button
                onClick={() => { setBalance(1000); setWinAmount(null); setWinCols([]) }}
                className="w-full mt-3 py-2.5 rounded-xl border border-red-400/30 text-red-400 font-semibold text-sm hover:bg-red-400/10 transition-colors"
              >
                🔄 Получить ещё 1000 фантиков
              </button>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
