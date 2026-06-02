import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Icon from "@/components/ui/icon"

// 5 богов — каждый занимает ВЕСЬ столбец (3 одинаковых ячейки)
const GODS = [
  {
    id: "perun", name: "Перун",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/ac8d15a5-e9e0-4cb8-9c30-34b945946c46.jpg",
    value: 50, color: "#4FC3F7", glow: "rgba(79,195,247,0.8)",
  },
  {
    id: "veles", name: "Велес",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/f45aa3a9-691a-472c-b283-55f4d67e083e.jpg",
    value: 25, color: "#66BB6A", glow: "rgba(102,187,106,0.8)",
  },
  {
    id: "wild", name: "Wild",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/f9180b85-40e1-42b0-b8a4-7300e1532bc3.jpg",
    value: 100, color: "#FFD700", glow: "rgba(255,215,0,0.9)",
  },
  {
    id: "axe", name: "Топор",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/35736db8-78be-4bc2-bb2e-062667961c03.jpg",
    value: 15, color: "#FFA726", glow: "rgba(255,167,38,0.8)",
  },
  {
    id: "rune", name: "Руна",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/c058b9e3-b998-41d0-bfaa-fa7ea31f6906.jpg",
    value: 10, color: "#EF5350", glow: "rgba(239,83,80,0.8)",
  },
]

const ROWS = 3
const COLS = GODS.length
const MULT_VALUES = [2, 3, 5, 10, 25, 50]

// Каждая колонка — один бог (индекс 0..4), все 3 строки одинаковые
// При кручении показываем рандомных богов, при остановке — финальный бог
type Columns = number[] // длина COLS, каждый элемент = индекс бога
type Multipliers = (number | null)[]

function randomGodIdx() {
  return Math.floor(Math.random() * COLS)
}

function generateColumns(): Columns {
  return Array.from({ length: COLS }, randomGodIdx)
}

function randomMult(): number | null {
  return Math.random() < 0.35 ? MULT_VALUES[Math.floor(Math.random() * MULT_VALUES.length)] : null
}

function generateMultipliers(): Multipliers {
  return Array.from({ length: COLS }, randomMult)
}

// Выигрыш: 3+ подряд одинаковых соседних столбца
function findWins(cols: Columns, mults: Multipliers): { winCols: number[]; totalWin: number } {
  const winCols: number[] = []
  let totalWin = 0

  // Ищем группы соседних одинаковых богов (минимум 3)
  let i = 0
  while (i < COLS) {
    let j = i
    while (j < COLS && (cols[j] === cols[i] || cols[j] === 2)) j++ // wild (idx 2) = любой
    const len = j - i
    if (len >= 2) {
      const godIdx = cols[i] === 2 ? cols[i + 1] ?? 2 : cols[i]
      const god = GODS[godIdx]
      // суммируем множители выигрышных колонок
      let totalMult = 1
      for (let k = i; k < j; k++) {
        winCols.push(k)
        totalMult *= (mults[k] ?? 1)
      }
      totalWin += god.value * len * Math.max(totalMult, 1)
    }
    i = j === i ? i + 1 : j
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
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
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
  } catch { /* not supported */ }
}

interface SlotModalProps {
  game: { title: string; category: string } | null
  onClose: () => void
}

export function SlotModal({ game, onClose }: SlotModalProps) {
  const [columns, setColumns] = useState<Columns>(generateColumns)
  const [multipliers, setMultipliers] = useState<Multipliers>(generateMultipliers)
  const [spinning, setSpinning] = useState(false)
  const [spinningCols, setSpinningCols] = useState<boolean[]>(Array(COLS).fill(false))
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const [winCols, setWinCols] = useState<number[]>([])
  const [winAmount, setWinAmount] = useState<number | null>(null)
  const [droppingMults, setDroppingMults] = useState<Multipliers>(Array(COLS).fill(null))
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  useEffect(() => () => intervalsRef.current.forEach(clearInterval), [])

  const spin = useCallback(() => {
    if (spinning || balance < bet) return
    setBalance((b) => b - bet)
    setWinCols([])
    setWinAmount(null)
    setDroppingMults(Array(COLS).fill(null))
    setSpinning(true)
    playSound("spin")

    const finalCols = generateColumns()
    const finalMults = generateMultipliers()

    intervalsRef.current.forEach(clearInterval)
    intervalsRef.current = []

    const startDelays = [0, 100, 200, 300, 400]
    const stopDelays  = [900, 1050, 1200, 1350, 1500]

    startDelays.forEach((startDelay, col) => {
      setTimeout(() => {
        setSpinningCols((prev) => { const n = [...prev]; n[col] = true; return n })

        const id = setInterval(() => {
          setColumns((prev) => {
            const n = [...prev]; n[col] = randomGodIdx(); return n
          })
        }, 60)
        intervalsRef.current[col] = id

        setTimeout(() => {
          clearInterval(id)
          setSpinningCols((prev) => { const n = [...prev]; n[col] = false; return n })
          setColumns((prev) => { const n = [...prev]; n[col] = finalCols[col]; return n })

          if (finalMults[col] !== null) {
            setDroppingMults((prev) => { const n = [...prev]; n[col] = finalMults[col]; return n })
          }

          if (col === COLS - 1) {
            setTimeout(() => {
              setMultipliers(finalMults)
              setDroppingMults(Array(COLS).fill(null))
              setSpinning(false)
              const { winCols: wc, totalWin } = findWins(finalCols, finalMults)
              if (wc.length > 0) {
                setWinCols(wc)
                const actualWin = Math.round(totalWin * (bet / 10))
                setWinAmount(actualWin)
                setBalance((b) => b + actualWin)
                playSound(actualWin >= bet * 20 ? "bigwin" : "win")
              } else {
                setWinAmount(0)
              }
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
            background: "linear-gradient(180deg,#1a0505 0%,#0d0202 60%,#1a0505 100%)",
            border: "2px solid rgba(255,80,50,0.3)",
            boxShadow: "0 0 100px -15px rgba(255,60,0,0.4),0 0 50px -20px rgba(80,160,255,0.2)",
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
                <p className="text-[10px] text-red-300/50 uppercase tracking-widest">Slavic Gods • Zeus Style</p>
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
              className="rounded-2xl p-4 relative"
              style={{
                background: "linear-gradient(180deg,#0d0000,#1a0303)",
                border: "1px solid rgba(255,80,50,0.2)",
                boxShadow: "inset 0 0 60px rgba(200,30,0,0.12)",
              }}
            >
              {/* Множители сверху */}
              <div className="grid mb-3" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: "12px" }}>
                {GODS.map((god, col) => {
                  const mult = multipliers[col]
                  const dropping = droppingMults[col]
                  return (
                    <div key={col} className="flex justify-center items-center h-8">
                      <AnimatePresence mode="wait">
                        {dropping !== null ? (
                          <motion.div
                            key={`drop-${col}-${dropping}`}
                            initial={{ y: -20, opacity: 0, scale: 1.4 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="px-3 py-1 rounded-xl font-black text-sm"
                            style={{
                              background: `linear-gradient(135deg,${god.color}30,${god.color}10)`,
                              border: `1.5px solid ${god.color}`,
                              color: god.color,
                              boxShadow: `0 0 14px ${god.glow}`,
                            }}
                          >
                            ×{dropping}
                          </motion.div>
                        ) : mult !== null ? (
                          <motion.div
                            key={`mult-${col}-${mult}`}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-3 py-1 rounded-xl font-black text-sm"
                            style={{
                              background: `${god.color}18`,
                              border: `1px solid ${god.color}50`,
                              color: god.color,
                            }}
                          >
                            ×{mult}
                          </motion.div>
                        ) : (
                          <div key="empty" className="w-10 h-7 rounded-xl bg-white/3 border border-white/5" />
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              {/* Столбцы — каждый бог = весь столбец из ROWS одинаковых ячеек */}
              <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: "12px" }}>
                {GODS.map((god, col) => {
                  const currentGodIdx = columns[col]
                  const currentGod = GODS[currentGodIdx]
                  const isWin = winCols.includes(col)
                  const isSpinning = spinningCols[col]

                  return (
                    <motion.div
                      key={col}
                      className="flex flex-col gap-2 rounded-2xl overflow-hidden p-1"
                      animate={isWin ? { scale: [1, 1.04, 1] } : {}}
                      transition={isWin ? { duration: 0.7, repeat: Infinity } : {}}
                      style={{
                        background: isWin
                          ? `radial-gradient(ellipse at center, ${god.color}20, transparent)`
                          : "transparent",
                        border: isWin ? `2px solid ${god.color}` : "2px solid transparent",
                        boxShadow: isWin ? `0 0 30px ${god.glow}` : "none",
                      }}
                    >
                      {/* 3 одинаковых ячейки = один бог на весь столбец */}
                      {Array.from({ length: ROWS }).map((_, row) => (
                        <motion.div
                          key={row}
                          className="relative rounded-xl overflow-hidden"
                          style={{ aspectRatio: "1/1" }}
                          animate={isSpinning ? { y: [0, -10, 10, 0] } : {}}
                          transition={isSpinning ? { duration: 0.1, repeat: Infinity, ease: "linear" } : {}}
                        >
                          <img
                            src={currentGod.img}
                            alt={currentGod.name}
                            className={`w-full h-full object-cover select-none transition-all duration-75 ${
                              isSpinning ? "blur-[2px] brightness-40" : "brightness-100"
                            }`}
                            draggable={false}
                          />
                          {/* Свечение при выигрыше */}
                          {isWin && (
                            <motion.div
                              className="absolute inset-0"
                              animate={{ opacity: [0, 0.5, 0] }}
                              transition={{ duration: 0.9, repeat: Infinity }}
                              style={{ background: `radial-gradient(circle, ${god.color}70, transparent)` }}
                            />
                          )}
                          {/* Wild badge на каждой ячейке */}
                          {currentGod.id === "wild" && !isSpinning && (
                            <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-black py-0.5 tracking-widest bg-black/70 text-yellow-400">
                              WILD
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Название бога под столбцом */}
                      <div
                        className="text-center text-[11px] font-bold py-1 rounded-lg"
                        style={{
                          color: isWin ? god.color : god.color + "80",
                          background: isWin ? god.color + "15" : "transparent",
                        }}
                      >
                        {god.name}
                      </div>
                    </motion.div>
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
                      background: "linear-gradient(135deg,rgba(255,100,50,0.12),rgba(255,200,50,0.12))",
                      border: "1px solid rgba(255,150,50,0.4)",
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
              <div className="flex items-center gap-2 flex-1">
                <span className="text-white/40 text-xs shrink-0">Ставка:</span>
                <button onClick={() => setBet((b) => Math.max(b - 5, 5))} disabled={bet <= 5 || spinning}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center disabled:opacity-30 transition-colors">
                  <Icon name="Minus" size={12} />
                </button>
                <span className="text-yellow-400 font-bold w-10 text-center text-sm">{bet}</span>
                <button onClick={() => setBet((b) => Math.min(b + 5, 100, balance))} disabled={bet >= 100 || bet >= balance || spinning}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center disabled:opacity-30 transition-colors">
                  <Icon name="Plus" size={12} />
                </button>
                <div className="flex gap-1">
                  {[10, 25, 50, 100].map((v) => (
                    <button key={v} onClick={() => setBet(Math.min(v, balance))} disabled={spinning}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30 ${
                        bet === v ? "bg-yellow-400 text-black" : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={spin}
                disabled={spinning || balance < bet}
                whileTap={!spinning ? { scale: 0.93 } : {}}
                className="relative px-8 py-3 rounded-2xl font-black text-base disabled:cursor-not-allowed shrink-0"
                style={{
                  background: spinning ? "linear-gradient(135deg,#444,#222)" : "linear-gradient(135deg,#c0392b,#e74c3c,#c0392b)",
                  color: spinning ? "rgba(255,255,255,0.4)" : "#fff",
                  boxShadow: spinning ? "none" : "0 0 30px rgba(231,76,60,0.6),0 4px 12px rgba(0,0,0,0.5)",
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
                ) : "⚡ ПЕРУН!"}
              </motion.button>
            </div>

            {balance < bet && (
              <button onClick={() => { setBalance(1000); setWinAmount(null); setWinCols([]) }}
                className="w-full mt-3 py-2.5 rounded-xl border border-red-400/30 text-red-400 font-semibold text-sm hover:bg-red-400/10 transition-colors">
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
