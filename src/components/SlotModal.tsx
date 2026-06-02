import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Icon from "@/components/ui/icon"

const COLS = 6
const ROWS = 5

const SYMBOLS = [
  {
    id: "perun",
    name: "Перун",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/ac8d15a5-e9e0-4cb8-9c30-34b945946c46.jpg",
    value: 50,
    color: "#4FC3F7",
  },
  {
    id: "wild",
    name: "Wild",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/f9180b85-40e1-42b0-b8a4-7300e1532bc3.jpg",
    value: 40,
    color: "#FFD700",
  },
  {
    id: "veles",
    name: "Велес",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/f45aa3a9-691a-472c-b283-55f4d67e083e.jpg",
    value: 25,
    color: "#66BB6A",
  },
  {
    id: "axe",
    name: "Топор",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/35736db8-78be-4bc2-bb2e-062667961c03.jpg",
    value: 15,
    color: "#FFA726",
  },
  {
    id: "chalice",
    name: "Чаша",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/17d5ac4a-f06d-4020-bdd9-5d6aa5c1cd1c.jpg",
    value: 10,
    color: "#AB47BC",
  },
  {
    id: "rune",
    name: "Руна",
    img: "https://cdn.poehali.dev/projects/491be8c0-1357-457e-923b-781a7838a115/files/c058b9e3-b998-41d0-bfaa-fa7ea31f6906.jpg",
    value: 5,
    color: "#EF5350",
  },
]

type Grid = number[][]
type WinCell = { row: number; col: number; color: string }

function randomSymbolIdx() {
  const weights = [2, 3, 8, 12, 15, 20]
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return 5
}

function generateGrid(): Grid {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, randomSymbolIdx)
  )
}

function findWins(grid: Grid): { cells: WinCell[]; totalWin: number; multiplier: number } {
  const winCells: WinCell[] = []
  let totalWin = 0
  const counted = new Set<string>()

  for (let symIdx = 0; symIdx < SYMBOLS.length; symIdx++) {
    if (symIdx === 1) continue // wild не считаем отдельно
    const ownSymbols: { row: number; col: number }[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === symIdx || grid[r][c] === 1) {
          ownSymbols.push({ row: r, col: c })
        }
      }
    }
    const own = ownSymbols.filter(({ row, col }) => grid[row][col] === symIdx)
    if (own.length >= 8) {
      const mult =
        own.length >= 20 ? 100 :
        own.length >= 15 ? 50 :
        own.length >= 12 ? 20 :
        own.length >= 8 ? 8 : 0
      if (mult > 0) {
        own.forEach(({ row, col }) => {
          const key = `${row}-${col}`
          if (!counted.has(key)) {
            counted.add(key)
            winCells.push({ row, col, color: SYMBOLS[symIdx].color })
          }
        })
        totalWin += SYMBOLS[symIdx].value * mult
      }
    }
  }

  const multiplier = totalWin > 0 ? Math.ceil(totalWin / 10) : 0
  return { cells: winCells, totalWin, multiplier }
}

function playSound(type: "spin" | "win" | "bigwin") {
  try {
    const AudioCtx = (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (type === "spin") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(200, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(); osc.stop(ctx.currentTime + 0.3)
    } else if (type === "win") {
      [0, 0.1, 0.2].forEach((delay, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.setValueAtTime([523, 659, 784][i], ctx.currentTime + delay)
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25)
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.25)
      })
    } else {
      [0, 0.1, 0.2, 0.35, 0.5].forEach((delay, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.setValueAtTime([523, 659, 784, 1047, 1319][i], ctx.currentTime + delay)
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3)
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.3)
      })
    }
  } catch {
    // AudioContext not supported
  }
}

interface SlotModalProps {
  game: { title: string; category: string } | null
  onClose: () => void
}

export function SlotModal({ game, onClose }: SlotModalProps) {
  const [grid, setGrid] = useState<Grid>(generateGrid)
  const [spinning, setSpinning] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const [winCells, setWinCells] = useState<WinCell[]>([])
  const [winAmount, setWinAmount] = useState<number | null>(null)
  const [multiplier, setMultiplier] = useState<number | null>(null)
  const [spinningCols, setSpinningCols] = useState<boolean[]>(Array(COLS).fill(false))
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  useEffect(() => {
    return () => intervalsRef.current.forEach(clearInterval)
  }, [])

  const spin = useCallback(() => {
    if (spinning || balance < bet) return
    setBalance((b) => b - bet)
    setWinCells([])
    setWinAmount(null)
    setMultiplier(null)
    setSpinning(true)
    playSound("spin")

    const finalGrid = generateGrid()
    const startDelays = [0, 120, 240, 360, 480, 600]
    const spinDurations = [900, 1100, 1300, 1500, 1700, 1950]

    intervalsRef.current.forEach(clearInterval)
    intervalsRef.current = []

    startDelays.forEach((startDelay, col) => {
      setTimeout(() => {
        setSpinningCols((prev) => { const n = [...prev]; n[col] = true; return n })

        const id = setInterval(() => {
          setGrid((prev) => {
            const next = prev.map((row) => [...row])
            for (let r = 0; r < ROWS; r++) next[r][col] = randomSymbolIdx()
            return next
          })
        }, 55)
        intervalsRef.current[col] = id

        setTimeout(() => {
          clearInterval(id)
          setSpinningCols((prev) => { const n = [...prev]; n[col] = false; return n })
          setGrid((prev) => {
            const next = prev.map((row) => [...row])
            for (let r = 0; r < ROWS; r++) next[r][col] = finalGrid[r][col]
            return next
          })

          if (col === COLS - 1) {
            setTimeout(() => {
              setSpinning(false)
              const { cells, totalWin, multiplier: mult } = findWins(finalGrid)
              if (cells.length > 0) {
                setWinCells(cells)
                const actualWin = Math.round(totalWin * (bet / 10))
                setWinAmount(actualWin)
                setMultiplier(mult)
                setBalance((b) => b + actualWin)
                playSound(actualWin >= bet * 10 ? "bigwin" : "win")
              } else {
                setWinAmount(0)
              }
            }, 150)
          }
        }, spinDurations[col] - startDelay)
      }, startDelay)
    })
  }, [spinning, balance, bet])

  if (!game) return null

  const isCellWin = (row: number, col: number) =>
    winCells.some((c) => c.row === row && c.col === col)
  const getWinColor = (row: number, col: number) =>
    winCells.find((c) => c.row === row && c.col === col)?.color ?? null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(180deg, #1a0505 0%, #0d0202 50%, #1a0505 100%)",
            border: "2px solid rgba(255,80,50,0.3)",
            boxShadow: "0 0 80px -10px rgba(255,60,0,0.35), 0 0 40px -20px rgba(80,160,255,0.25)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-red-900/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-lg">⚡</div>
              <div>
                <h2 className="text-lg font-bold text-white">Перун's Thunder</h2>
                <p className="text-xs text-red-300/60">Slavic Gods • Cluster Pays • RTP 96.50%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                <span className="text-sm">🪙</span>
                <motion.span key={balance} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-bold text-sm text-yellow-400">
                  {balance.toLocaleString()}
                </motion.span>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
          </div>

          {/* Сетка 6×5 */}
          <div className="px-4 pt-4 pb-2">
            <div
              className="relative rounded-2xl overflow-hidden p-3"
              style={{
                background: "linear-gradient(180deg, #0d0000, #1a0303)",
                border: "1px solid rgba(255,80,50,0.25)",
                boxShadow: "inset 0 0 50px rgba(200,30,0,0.2)",
              }}
            >
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                {Array.from({ length: COLS }).map((_, col) => (
                  <div key={col} className="flex flex-col gap-1.5">
                    {Array.from({ length: ROWS }).map((_, row) => {
                      const symIdx = grid[row]?.[col] ?? 0
                      const sym = SYMBOLS[symIdx]
                      const isWin = isCellWin(row, col)
                      const winColor = getWinColor(row, col)
                      const isColSpinning = spinningCols[col]

                      return (
                        <motion.div
                          key={`${col}-${row}`}
                          className="relative rounded-xl overflow-hidden aspect-square"
                          animate={
                            isColSpinning ? { y: [0, -6, 6, 0] } :
                            isWin ? { scale: [1, 1.07, 1] } : {}
                          }
                          transition={
                            isColSpinning
                              ? { duration: 0.1, repeat: Infinity, ease: "linear" }
                              : isWin
                              ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
                              : {}
                          }
                          style={{
                            background: isWin
                              ? `radial-gradient(circle, ${winColor}35, #12022a)`
                              : "rgba(255,255,255,0.04)",
                            border: isWin
                              ? `2px solid ${winColor}`
                              : "1px solid rgba(150,80,255,0.15)",
                            boxShadow: isWin
                              ? `0 0 18px ${winColor}70, inset 0 0 8px ${winColor}25`
                              : "none",
                          }}
                        >
                          <img
                            src={sym.img}
                            alt={sym.name}
                            className={`w-full h-full object-cover select-none transition-all duration-75 ${
                              isColSpinning ? "blur-[1.5px] brightness-60" : "brightness-100"
                            }`}
                            draggable={false}
                          />
                          {isWin && (
                            <motion.div
                              className="absolute inset-0"
                              animate={{ opacity: [0, 0.45, 0] }}
                              transition={{ duration: 0.9, repeat: Infinity }}
                              style={{ background: `radial-gradient(circle, ${winColor}90, transparent)` }}
                            />
                          )}
                          {sym.id === "wild" && !isColSpinning && (
                            <div className="absolute bottom-0 left-0 right-0 text-center text-[7px] font-black text-cyan-300 bg-black/70 py-0.5 leading-tight tracking-widest">
                              WILD
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Тени сверху/снизу при кручении */}
              {spinning && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#0a0118] to-transparent pointer-events-none z-10" />
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0118] to-transparent pointer-events-none z-10" />
                </>
              )}
            </div>

            {/* Результат */}
            <div className="min-h-[60px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {winAmount !== null && winAmount > 0 ? (
                  <motion.div
                    key="win"
                    initial={{ opacity: 0, scale: 0.5, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-full text-center py-3 px-4 rounded-2xl relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,200,50,0.12), rgba(180,120,255,0.12))",
                      border: "1px solid rgba(255,200,50,0.35)",
                    }}
                  >
                    <motion.div
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-purple-400/10 to-yellow-400/10"
                    />
                    <div className="relative z-10">
                      <div className={`font-black mb-0.5 ${winAmount >= bet * 10 ? "text-2xl text-yellow-400" : "text-lg text-yellow-300"}`}>
                        {winAmount >= bet * 10 ? "🏆 БОЛЬШОЙ ВЫИГРЫШ!" : "⚡ Выигрыш!"}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-black text-white">+{winAmount.toLocaleString()} 🪙</span>
                        {multiplier && (
                          <span className="px-2 py-0.5 rounded-lg bg-purple-500/30 text-purple-300 text-sm font-bold border border-purple-500/30">
                            ×{multiplier}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : winAmount === 0 && !spinning ? (
                  <motion.p key="lose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-white/25 text-sm"
                  >
                    Нет совпадений — попробуй снова!
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Панель управления */}
          <div className="px-4 pb-5 border-t border-red-900/30 pt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <span className="text-white/40 text-xs">Ставка:</span>
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

              <motion.button
                onClick={spin}
                disabled={spinning || balance < bet}
                whileTap={!spinning ? { scale: 0.94 } : {}}
                className="relative px-7 py-3 rounded-2xl font-black text-base disabled:cursor-not-allowed overflow-hidden shrink-0"
                style={{
                  background: spinning ? "linear-gradient(135deg,#444,#222)" : "linear-gradient(135deg,#c0392b,#e74c3c,#c0392b)",
                  color: spinning ? "rgba(255,255,255,0.4)" : "#fff",
                  boxShadow: spinning ? "none" : "0 0 35px rgba(231,76,60,0.6), 0 4px 15px rgba(0,0,0,0.4)",
                  minWidth: 130,
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

            {/* Легенда символов */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SYMBOLS.map((sym) => (
                <div key={sym.id} className="flex flex-col items-center gap-1 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                    <img src={sym.img} alt={sym.name} className="w-full h-full object-cover" draggable={false} />
                  </div>
                  <span className="text-[8px] text-white/40 font-medium">×{sym.value}</span>
                </div>
              ))}
            </div>

            {balance < bet && (
              <button
                onClick={() => { setBalance(1000); setWinAmount(null); setWinCells([]) }}
                className="w-full mt-3 py-2.5 rounded-xl border border-yellow-400/30 text-yellow-400 font-semibold text-sm hover:bg-yellow-400/10 transition-colors"
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