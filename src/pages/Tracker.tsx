import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Icon from "@/components/ui/icon"

// Города России с координатами
const RUSSIA_CITIES = [
  { name: "Москва", lat: 55.7558, lng: 37.6173, region: "Московская обл." },
  { name: "Санкт-Петербург", lat: 59.9311, lng: 30.3609, region: "Ленинградская обл." },
  { name: "Новосибирск", lat: 54.9884, lng: 82.9657, region: "Новосибирская обл." },
  { name: "Екатеринбург", lat: 56.8389, lng: 60.6057, region: "Свердловская обл." },
  { name: "Казань", lat: 55.8304, lng: 49.0661, region: "Республика Татарстан" },
  { name: "Нижний Новгород", lat: 56.2965, lng: 43.9361, region: "Нижегородская обл." },
  { name: "Краснодар", lat: 45.0355, lng: 38.9753, region: "Краснодарский край" },
  { name: "Челябинск", lat: 55.1644, lng: 61.4368, region: "Челябинская обл." },
  { name: "Омск", lat: 54.9885, lng: 73.3242, region: "Омская обл." },
  { name: "Ростов-на-Дону", lat: 47.2357, lng: 39.7015, region: "Ростовская обл." },
  { name: "Уфа", lat: 54.7388, lng: 55.9721, region: "Республика Башкортостан" },
  { name: "Самара", lat: 53.2001, lng: 50.1500, region: "Самарская обл." },
  { name: "Красноярск", lat: 56.0153, lng: 92.8932, region: "Красноярский край" },
  { name: "Воронеж", lat: 51.6720, lng: 39.1843, region: "Воронежская обл." },
  { name: "Пермь", lat: 58.0105, lng: 56.2502, region: "Пермский край" },
]

function randomCity() {
  return RUSSIA_CITIES[Math.floor(Math.random() * RUSSIA_CITIES.length)]
}

function randomIP() {
  return `${Math.floor(Math.random()*220)+10}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
}

function randomOperator() {
  const ops = ["МТС", "Билайн", "МегаФон", "Tele2", "Ростелеком"]
  return ops[Math.floor(Math.random() * ops.length)]
}

function randomProvider() {
  const providers = ["Ростелеком", "Дом.ру", "МТС Интернет", "Билайн Бизнес", "МГТС"]
  return providers[Math.floor(Math.random() * providers.length)]
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(); osc.stop(ctx.currentTime + 0.15)
  } catch { /* not supported */ }
}

type SearchType = "phone" | "ip" | "imei" | "fio"

interface TrackResult {
  city: { name: string; lat: number; lng: number; region: string }
  ip: string
  operator: string
  provider: string
  accuracy: number
  lastSeen: string
}

export default function TrackerPage() {
  const [searchType, setSearchType] = useState<SearchType>("phone")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [result, setResult] = useState<TrackResult | null>(null)
  const [dotPos, setDotPos] = useState({ x: 50, y: 50 })
  const [blinkOn, setBlinkOn] = useState(true)
  const beepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const moveRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (beepRef.current) clearInterval(beepRef.current)
      if (moveRef.current) clearInterval(moveRef.current)
    }
  }, [])

  useEffect(() => {
    if (!result) return

    // Звуковой сигнал каждые 2 сек
    beepRef.current = setInterval(() => {
      playBeep()
      setBlinkOn((b) => !b)
    }, 2000)

    // Движение точки
    moveRef.current = setInterval(() => {
      setDotPos((prev) => ({
        x: Math.max(5, Math.min(95, prev.x + (Math.random() - 0.5) * 3)),
        y: Math.max(5, Math.min(95, prev.y + (Math.random() - 0.5) * 3)),
      }))
    }, 1500)

    return () => {
      if (beepRef.current) clearInterval(beepRef.current)
      if (moveRef.current) clearInterval(moveRef.current)
    }
  }, [result])

  const LOADING_STEPS = [
    "Подключение к серверам...",
    "Обход защиты...",
    "Запрос в базы данных...",
    "Триангуляция сигнала...",
    "Определение местоположения...",
    "Получение данных...",
    "Финализация...",
  ]

  const handleSearch = async () => {
    if (!query.trim()) return
    setResult(null)
    setLoading(true)

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadingStep(LOADING_STEPS[i])
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))
    }

    setLoading(false)
    const city = randomCity()
    setResult({
      city,
      ip: randomIP(),
      operator: randomOperator(),
      provider: randomProvider(),
      accuracy: Math.floor(Math.random() * 30) + 70,
    lastSeen: new Date().toLocaleTimeString("ru-RU"),
    })
    // Рандомная позиция точки на карте
    setDotPos({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 })
    playBeep()
  }

  const searchTypes: { key: SearchType; label: string; placeholder: string; icon: string }[] = [
    { key: "phone", label: "Телефон", placeholder: "+7 (999) 123-45-67", icon: "Phone" },
    { key: "ip", label: "IP адрес", placeholder: "192.168.1.1", icon: "Globe" },
    { key: "imei", label: "IMEI", placeholder: "354879061234567", icon: "Smartphone" },
    { key: "fio", label: "ФИО", placeholder: "Иванов Иван Иванович", icon: "User" },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-x-hidden">
      {/* Сканлайны */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.5) 2px, rgba(0,255,0,0.5) 4px)" }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-xs uppercase tracking-widest">Система активна</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-2" style={{ color: "#00ff41", textShadow: "0 0 30px #00ff4160" }}>
            👁 ТРЕКЕР
          </h1>
          <p className="text-green-500/50 text-sm">⚠️ Шуточный сервис — все данные случайные</p>
        </motion.div>

        {/* Форма поиска */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "rgba(0,255,65,0.03)",
            border: "1px solid rgba(0,255,65,0.2)",
            boxShadow: "0 0 40px rgba(0,255,65,0.05)",
          }}
        >
          {/* Тип поиска */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            {searchTypes.map((t) => (
              <button
                key={t.key}
                onClick={() => { setSearchType(t.key); setQuery(""); setResult(null) }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: searchType === t.key ? "rgba(0,255,65,0.15)" : "rgba(0,255,65,0.03)",
                  border: searchType === t.key ? "1px solid rgba(0,255,65,0.6)" : "1px solid rgba(0,255,65,0.1)",
                  color: searchType === t.key ? "#00ff41" : "rgba(0,255,65,0.4)",
                  boxShadow: searchType === t.key ? "0 0 15px rgba(0,255,65,0.2)" : "none",
                }}
              >
                <Icon name={t.icon} size={14} fallback="Search" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Поле ввода */}
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={searchTypes.find(t => t.key === searchType)?.placeholder}
              className="flex-1 bg-transparent rounded-xl px-4 py-3 text-green-400 placeholder-green-900 outline-none text-sm"
              style={{ border: "1px solid rgba(0,255,65,0.25)" }}
            />
            <motion.button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-black text-black text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#00ff41,#00cc34)" }}
            >
              {loading ? "..." : "ПОИСК"}
            </motion.button>
          </div>
        </motion.div>

        {/* Загрузка */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-6 mb-6 text-center"
              style={{ border: "1px solid rgba(0,255,65,0.2)", background: "rgba(0,255,65,0.03)" }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2 border-green-500 border-t-transparent"
                />
                <span className="text-green-400 text-sm">{loadingStep}</span>
              </div>
              {/* Прогресс-бар */}
              <div className="w-full h-1 bg-green-900/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4.5, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Результат */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", damping: 16 }}
            >
              {/* Карта России SVG */}
              <div
                className="rounded-2xl mb-4 overflow-hidden relative"
                style={{
                  border: "1px solid rgba(0,255,65,0.3)",
                  background: "#020c02",
                  height: 320,
                }}
              >
                {/* Хаотичная "карта" */}
                <svg viewBox="0 0 800 400" className="w-full h-full opacity-30">
                  <path d="M 100 200 Q 200 100 400 150 Q 600 100 700 180 Q 750 220 680 280 Q 600 320 500 300 Q 400 320 300 290 Q 200 300 150 260 Z" fill="none" stroke="#00ff41" strokeWidth="1.5" />
                  <path d="M 200 200 Q 300 170 400 180 Q 500 170 600 200 Q 620 230 580 250 Q 500 260 400 255 Q 300 260 220 240 Z" fill="rgba(0,255,65,0.05)" stroke="#00ff41" strokeWidth="0.8" />
                  {/* Сетка */}
                  {[0,1,2,3,4,5,6,7].map(i => (
                    <line key={`h${i}`} x1="50" y1={50+i*40} x2="750" y2={50+i*40} stroke="#00ff41" strokeWidth="0.3" opacity="0.3" />
                  ))}
                  {[0,1,2,3,4,5,6,7,8,9].map(i => (
                    <line key={`v${i}`} x1={50+i*80} y1="50" x2={50+i*80} y2="370" stroke="#00ff41" strokeWidth="0.3" opacity="0.3" />
                  ))}
                  {/* Надпись */}
                  <text x="400" y="380" textAnchor="middle" fill="#00ff41" fontSize="12" opacity="0.4">РОССИЯ</text>
                </svg>

                {/* Движущаяся точка */}
                <motion.div
                  animate={{ left: `${dotPos.x}%`, top: `${dotPos.y}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute"
                  style={{ transform: "translate(-50%,-50%)" }}
                >
                  {/* Круги радара */}
                  <motion.div
                    animate={{ scale: [1, 3], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      width: 40, height: 40,
                      marginLeft: -20, marginTop: -20,
                      border: "1px solid #00ff41",
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      width: 24, height: 24,
                      marginLeft: -12, marginTop: -12,
                      border: "1px solid #00ff41",
                    }}
                  />
                  {/* Точка */}
                  <motion.div
                    animate={{ opacity: blinkOn ? 1 : 0.3, scale: blinkOn ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-4 h-4 rounded-full"
                    style={{
                      background: "#00ff41",
                      boxShadow: "0 0 20px #00ff41, 0 0 40px #00ff4180",
                    }}
                  />
                </motion.div>

                {/* Оверлей с данными */}
                <div className="absolute top-3 left-3 text-[10px] text-green-400/70 space-y-0.5">
                  <div>LAT: {result.city.lat.toFixed(4)}° N</div>
                  <div>LNG: {result.city.lng.toFixed(4)}° E</div>
                  <div className="flex items-center gap-1">
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>▶</motion.span>
                    TRACKING...
                  </div>
                </div>
                <div className="absolute top-3 right-3 text-[10px] text-green-400/70 text-right">
                  <div>ТОЧНОСТЬ: {result.accuracy}%</div>
                  <div>ОБНОВЛЕНО: {result.lastSeen}</div>
                </div>
              </div>

              {/* Данные */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {[
                  { label: "МЕСТОПОЛОЖЕНИЕ", value: `${result.city.name}, ${result.city.region}`, icon: "MapPin" },
                  { label: "IP АДРЕС", value: result.ip, icon: "Globe" },
                  { label: "ОПЕРАТОР", value: result.operator, icon: "Signal" },
                  { label: "ПРОВАЙДЕР", value: result.provider, icon: "Wifi" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{
                      background: "rgba(0,255,65,0.04)",
                      border: "1px solid rgba(0,255,65,0.15)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,255,65,0.1)" }}>
                      <Icon name={item.icon} size={16} className="text-green-400" fallback="Info" />
                    </div>
                    <div>
                      <div className="text-[10px] text-green-600 uppercase tracking-widest">{item.label}</div>
                      <div className="text-green-300 font-bold text-sm mt-0.5">{item.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Предупреждение */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl p-4 text-center"
                style={{ background: "rgba(255,200,0,0.05)", border: "1px solid rgba(255,200,0,0.2)" }}
              >
                <p className="text-yellow-400/70 text-xs">
                  😄 <strong>Напоминание:</strong> Все данные выше — случайные и выдуманные. Это шуточный сервис для развлечения!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Назад */}
        <div className="mt-8 text-center">
          <a href="/" className="text-green-600 hover:text-green-400 text-sm transition-colors">
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  )
}
