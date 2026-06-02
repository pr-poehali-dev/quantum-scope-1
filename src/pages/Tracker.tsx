import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Icon from "@/components/ui/icon"

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

const NICKNAMES = ["Тень","Серый","Лис","Скала","Крот","Призрак","Клык","Змей","Леший","Тихий"]
const JOBS = [
  "Официально не трудоустроен","ИП — деятельность приостановлена","Частный извозчик",
  "Охранник (уволен в 2022)","Строительные работы (неофициально)","Грузоперевозки",
  "Без определённого рода занятий","Мелкая торговля на рынке",
]
const CRIMES_LIST = [
  { art: "ст. 158 УК РФ", desc: "Кража", year: () => rndInt(2015,2022), result: "Условный срок 1 год" },
  { art: "ст. 161 УК РФ", desc: "Грабёж", year: () => rndInt(2016,2023), result: "Штраф 80 000 ₽" },
  { art: "ст. 228 УК РФ", desc: "Хранение наркотических средств", year: () => rndInt(2017,2023), result: "Условный срок 2 года" },
  { art: "ст. 318 УК РФ", desc: "Применение насилия к представителю власти", year: () => rndInt(2018,2023), result: "Штраф 120 000 ₽" },
  { art: "ст. 264 УК РФ", desc: "Нарушение ПДД, повлёкшее вред здоровью", year: () => rndInt(2019,2023), result: "Лишение прав на 2 года" },
  { art: "ст. 119 УК РФ", desc: "Угроза убийством", year: () => rndInt(2018,2023), result: "Обязательные работы 200 ч." },
  { art: "ст. 213 УК РФ", desc: "Хулиганство", year: () => rndInt(2016,2022), result: "Административный штраф" },
  { art: "ст. 111 УК РФ", desc: "Умышленное причинение тяжкого вреда здоровью", year: () => rndInt(2017,2023), result: "Реальный срок 3 года" },
]
const ASSOC = [
  "ОПГ «Северные» (не доказано)","Связи с нелегальным игорным бизнесом",
  "Предполагаемый контакт с группой по сбыту ПАВ","Окружение — лица с судимостями",
  "Установлены контакты с фигурантами дела №2021-***","Предполагаемое участие в схемах обналичивания",
]
const VEHICLES = [
  "ВАЗ-2114, г/н А***ОС 77 (снят с учёта)","Toyota Camry 2017, г/н В***ЕК 116",
  "Hyundai Solaris 2019, г/н К***РТ 63","Не установлено","Ford Focus 2015, г/н Н***МП 78",
  "Kia Rio 2020, г/н С***АВ 52 (зарегистрирована на третье лицо)",
]
const STATUSES = ["РАЗЫСКИВАЕТСЯ","ПОД НАБЛЮДЕНИЕМ","СУДИМОСТЬ ПОГАШЕНА","АКТИВНОЕ ДЕЛО","ОПЕРАТИВНЫЙ ИНТЕРЕС"]
const STATUS_COLORS: Record<string, string> = {
  "РАЗЫСКИВАЕТСЯ": "#EF5350",
  "ПОД НАБЛЮДЕНИЕМ": "#FFA726",
  "СУДИМОСТЬ ПОГАШЕНА": "#66BB6A",
  "АКТИВНОЕ ДЕЛО": "#EF5350",
  "ОПЕРАТИВНЫЙ ИНТЕРЕС": "#FFA726",
}

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randomCity() { return RUSSIA_CITIES[Math.floor(Math.random() * RUSSIA_CITIES.length)] }
function randomIP() { return `${rndInt(10,220)}.${rndInt(0,255)}.${rndInt(0,255)}.${rndInt(0,255)}` }
function randomOperator() { return rnd(["МТС","Билайн","МегаФон","Tele2","Ростелеком"]) }
function randomProvider() { return rnd(["Ростелеком","Дом.ру","МТС Интернет","Билайн Бизнес","МГТС"]) }
function randomIMEI() { return Array.from({length:15}, () => rndInt(0,9)).join("") }
function randomPhone() { return `+7 (${rndInt(900,999)}) ${rndInt(100,999)}-${rndInt(10,99)}-${rndInt(10,99)}` }
function randomDate() {
  const y = rndInt(1985, 2003)
  const m = String(rndInt(1,12)).padStart(2,"0")
  const d = String(rndInt(1,28)).padStart(2,"0")
  return `${d}.${m}.${y}`
}
function randomScore() { return rndInt(3, 10) }

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(); osc.stop(ctx.currentTime + 0.15)
  } catch { /* not supported */ }
}

type Tab = "tracker" | "dossier"
type SearchType = "phone" | "ip" | "imei" | "fio"

interface TrackResult {
  city: { name: string; lat: number; lng: number; region: string }
  ip: string; operator: string; provider: string; accuracy: number; lastSeen: string
}

interface DossierResult {
  name: string
  nickname: string
  dob: string
  birthplace: string
  city: string
  address: string
  phone: string
  ip: string
  imei: string
  job: string
  vehicle: string
  crimes: { art: string; desc: string; year: number; result: string }[]
  associations: string[]
  status: string
  caseNumber: string
  dangerScore: number
  lastActivity: string
}

const GlassBox = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-5 ${className}`} style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.15)" }}>
    {children}
  </div>
)

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] uppercase tracking-widest text-green-700 mb-1">{children}</div>
)
const Value = ({ children }: { children: React.ReactNode }) => (
  <div className="text-green-300 font-bold text-sm">{children}</div>
)

export default function TrackerPage() {
  const [tab, setTab] = useState<Tab>("tracker")

  // --- TRACKER ---
  const [searchType, setSearchType] = useState<SearchType>("phone")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null)
  const [dotPos, setDotPos] = useState({ x: 50, y: 50 })
  const [blinkOn, setBlinkOn] = useState(true)
  const beepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const moveRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // --- DOSSIER ---
  const [dossierName, setDossierName] = useState("")
  const [dossierLoading, setDossierLoading] = useState(false)
  const [dossierStep, setDossierStep] = useState("")
  const [dossier, setDossier] = useState<DossierResult | null>(null)

  useEffect(() => () => {
    if (beepRef.current) clearInterval(beepRef.current)
    if (moveRef.current) clearInterval(moveRef.current)
  }, [])

  useEffect(() => {
    if (!trackResult) return
    beepRef.current = setInterval(() => { playBeep(); setBlinkOn(b => !b) }, 2000)
    moveRef.current = setInterval(() => {
      setDotPos(prev => ({
        x: Math.max(10, Math.min(90, prev.x + (Math.random() - 0.5) * 3)),
        y: Math.max(10, Math.min(90, prev.y + (Math.random() - 0.5) * 3)),
      }))
    }, 1500)
    return () => {
      if (beepRef.current) clearInterval(beepRef.current)
      if (moveRef.current) clearInterval(moveRef.current)
    }
  }, [trackResult])

  const TRACK_STEPS = ["Подключение к серверам...","Обход защиты...","Запрос в базы данных...","Триангуляция сигнала...","Определение местоположения...","Получение данных...","Финализация..."]
  const DOSSIER_STEPS = ["Поиск в открытых источниках...","Сканирование соцсетей...","Анализ активности...","Составление профиля...","Классификация угрозы...","Формирование досье..."]

  const handleTrack = async () => {
    if (!query.trim()) return
    setTrackResult(null); setLoading(true)
    for (const step of TRACK_STEPS) {
      setLoadingStep(step)
      await new Promise(r => setTimeout(r, 550 + Math.random() * 400))
    }
    setLoading(false)
    const city = randomCity()
    setTrackResult({ city, ip: randomIP(), operator: randomOperator(), provider: randomProvider(), accuracy: rndInt(70, 99), lastSeen: new Date().toLocaleTimeString("ru-RU") })
    setDotPos({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 })
    playBeep()
  }

  const handleDossier = async () => {
    if (!dossierName.trim()) return
    setDossier(null); setDossierLoading(true)
    for (const step of DOSSIER_STEPS) {
      setDossierStep(step)
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    }
    setDossierLoading(false)
    const city = randomCity()
    const birthCity = randomCity()
    const streets = ["ул. Ленина","ул. Гагарина","пр. Мира","ул. Советская","ул. Кирова","ул. Победы","ул. Садовая"]
    const crimesCount = rndInt(1, 3)
    const shuffledCrimes = [...CRIMES_LIST].sort(() => Math.random() - 0.5).slice(0, crimesCount)
    const assocCount = rndInt(1, 2)
    const shuffledAssoc = [...ASSOC].sort(() => Math.random() - 0.5).slice(0, assocCount)
    const statusKey = rnd(STATUSES)
    setDossier({
      name: dossierName.trim(),
      nickname: rnd(NICKNAMES),
      dob: randomDate(),
      birthplace: birthCity.name,
      city: city.name,
      address: `${city.name}, ${rnd(streets)}, д. ${rndInt(1,150)}, кв. ${rndInt(1,200)}`,
      phone: randomPhone(),
      ip: randomIP(),
      imei: randomIMEI(),
      job: rnd(JOBS),
      vehicle: rnd(VEHICLES),
      crimes: shuffledCrimes.map(c => ({ ...c, year: c.year() })),
      associations: shuffledAssoc,
      status: statusKey,
      caseNumber: `№ ${rndInt(10,99)}-${rndInt(100000,999999)}/${rndInt(20,24)}`,
      dangerScore: rndInt(5, 10),
      lastActivity: new Date().toLocaleString("ru-RU"),
    })
    playBeep()
  }

  const searchTypes: { key: SearchType; label: string; placeholder: string; icon: string }[] = [
    { key: "phone", label: "Телефон", placeholder: "+7 (999) 123-45-67", icon: "Phone" },
    { key: "ip", label: "IP адрес", placeholder: "192.168.1.1", icon: "Globe" },
    { key: "imei", label: "IMEI", placeholder: "354879061234567", icon: "Smartphone" },
    { key: "fio", label: "ФИО", placeholder: "Иванов Иван Иванович", icon: "User" },
  ]

  const G = "#00ff41"

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-x-hidden">
      {/* Сканлайны */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,0,0.5) 2px,rgba(0,255,0,0.5) 4px)" }} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-xs uppercase tracking-widest">Система активна</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black" style={{ color: G, textShadow: `0 0 40px ${G}50` }}>
            👁 ТРЕКЕР
          </h1>
        </motion.div>

        {/* Табы */}
        <div className="flex gap-2 mb-6">
          {([["tracker","📡 Слежка"],["dossier","🗂 Досье"]] as [Tab,string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: tab === key ? "rgba(0,255,65,0.15)" : "rgba(0,255,65,0.03)",
                border: tab === key ? `1px solid ${G}` : "1px solid rgba(0,255,65,0.15)",
                color: tab === key ? G : "rgba(0,255,65,0.4)",
                boxShadow: tab === key ? `0 0 20px rgba(0,255,65,0.15)` : "none",
              }}
            >{label}</button>
          ))}
        </div>

        {/* ===== ТРЕКЕР ===== */}
        <AnimatePresence mode="wait">
        {tab === "tracker" && (
          <motion.div key="tracker" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <GlassBox className="mb-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {searchTypes.map(t => (
                  <button key={t.key} onClick={() => { setSearchType(t.key); setQuery(""); setTrackResult(null) }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: searchType === t.key ? "rgba(0,255,65,0.15)" : "rgba(0,255,65,0.03)",
                      border: searchType === t.key ? `1px solid ${G}` : "1px solid rgba(0,255,65,0.1)",
                      color: searchType === t.key ? G : "rgba(0,255,65,0.4)",
                    }}>
                    <Icon name={t.icon} size={13} fallback="Search" />{t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTrack()}
                  placeholder={searchTypes.find(t => t.key === searchType)?.placeholder}
                  className="flex-1 bg-transparent rounded-xl px-4 py-3 outline-none text-sm"
                  style={{ border: "1px solid rgba(0,255,65,0.25)", color: G }} />
                <button onClick={handleTrack} disabled={loading || !query.trim()}
                  className="px-6 py-3 rounded-xl font-black text-black text-sm disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg,${G},#00cc34)` }}>
                  {loading ? "..." : "НАЙТИ"}
                </button>
              </div>
            </GlassBox>

            {/* Загрузка */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassBox className="mb-5 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 rounded-full border-2 border-t-transparent" style={{ borderColor: `${G} transparent ${G} ${G}` }} />
                      <span className="text-sm" style={{ color: G }}>{loadingStep}</span>
                    </div>
                    <div className="w-full h-1 rounded-full" style={{ background: "rgba(0,255,65,0.1)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: G }}
                        initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4.5, ease: "linear" }} />
                    </div>
                  </GlassBox>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Результат трекера */}
            <AnimatePresence>
              {trackResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* Карта */}
                  <div className="rounded-2xl mb-4 overflow-hidden relative" style={{ border: "1px solid rgba(0,255,65,0.25)", background: "#020c02", height: 280 }}>
                    <svg viewBox="0 0 800 400" className="w-full h-full opacity-25">
                      <path d="M100 200 Q200 100 400 150 Q600 100 700 180 Q750 220 680 280 Q600 320 500 300 Q400 320 300 290 Q200 300 150 260 Z" fill="none" stroke={G} strokeWidth="1.5" />
                      <path d="M200 200 Q300 170 400 180 Q500 170 600 200 Q620 230 580 250 Q500 260 400 255 Q300 260 220 240 Z" fill="rgba(0,255,65,0.04)" stroke={G} strokeWidth="0.8" />
                      {[0,1,2,3,4,5,6,7].map(i => <line key={`h${i}`} x1="50" y1={50+i*40} x2="750" y2={50+i*40} stroke={G} strokeWidth="0.3" opacity="0.3" />)}
                      {[0,1,2,3,4,5,6,7,8,9].map(i => <line key={`v${i}`} x1={50+i*80} y1="50" x2={50+i*80} y2="370" stroke={G} strokeWidth="0.3" opacity="0.3" />)}
                      <text x="400" y="385" textAnchor="middle" fill={G} fontSize="11" opacity="0.4">РОССИЯ</text>
                    </svg>
                    {/* Точка */}
                    <motion.div animate={{ left: `${dotPos.x}%`, top: `${dotPos.y}%` }} transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="absolute" style={{ transform: "translate(-50%,-50%)" }}>
                      <motion.div animate={{ scale: [1,3], opacity: [0.5,0] }} transition={{ duration: 2, repeat: Infinity }}
                        className="absolute rounded-full" style={{ width:40,height:40,marginLeft:-20,marginTop:-20,border:`1px solid ${G}` }} />
                      <motion.div animate={{ scale: [1,2.2], opacity: [0.3,0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        className="absolute rounded-full" style={{ width:24,height:24,marginLeft:-12,marginTop:-12,border:`1px solid ${G}` }} />
                      <motion.div animate={{ opacity: blinkOn ? 1 : 0.2, scale: blinkOn ? 1.3 : 1 }} transition={{ duration: 0.3 }}
                        className="w-4 h-4 rounded-full" style={{ background: G, boxShadow: `0 0 20px ${G}, 0 0 40px ${G}60` }} />
                    </motion.div>
                    {/* Инфо на карте */}
                    <div className="absolute top-3 left-3 text-[10px] space-y-0.5" style={{ color: "rgba(0,255,65,0.6)" }}>
                      <div>LAT: {trackResult.city.lat.toFixed(4)}° N</div>
                      <div>LNG: {trackResult.city.lng.toFixed(4)}° E</div>
                      <motion.div animate={{ opacity: [1,0,1] }} transition={{ duration: 1, repeat: Infinity }} className="flex items-center gap-1">
                        <span>▶</span> TRACKING...
                      </motion.div>
                    </div>
                    <div className="absolute top-3 right-3 text-[10px] text-right" style={{ color: "rgba(0,255,65,0.6)" }}>
                      <div>ТОЧНОСТЬ: {trackResult.accuracy}%</div>
                      <div>{trackResult.lastSeen}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "МЕСТОПОЛОЖЕНИЕ", value: `${trackResult.city.name}, ${trackResult.city.region}`, icon: "MapPin" },
                      { label: "IP АДРЕС", value: trackResult.ip, icon: "Globe" },
                      { label: "ОПЕРАТОР", value: trackResult.operator, icon: "Signal" },
                      { label: "ПРОВАЙДЕР", value: trackResult.provider, icon: "Wifi" },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay: i*0.08 }}>
                        <GlassBox className="flex items-center gap-3 !p-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,255,65,0.08)" }}>
                            <Icon name={item.icon} size={15} className="text-green-400" fallback="Info" />
                          </div>
                          <div><Label>{item.label}</Label><Value>{item.value}</Value></div>
                        </GlassBox>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== ДОСЬЕ ===== */}
        {tab === "dossier" && (
          <motion.div key="dossier" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassBox className="mb-5">
              <p className="text-green-600 text-xs mb-3 uppercase tracking-widest">Введи имя объекта</p>
              <div className="flex gap-3">
                <input type="text" value={dossierName} onChange={e => setDossierName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleDossier()}
                  placeholder="Например: Коля, Маша, Босс..."
                  className="flex-1 bg-transparent rounded-xl px-4 py-3 outline-none text-sm"
                  style={{ border: "1px solid rgba(0,255,65,0.25)", color: G }} />
                <button onClick={handleDossier} disabled={dossierLoading || !dossierName.trim()}
                  className="px-6 py-3 rounded-xl font-black text-black text-sm disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg,${G},#00cc34)` }}>
                  {dossierLoading ? "..." : "ПРОБИТЬ"}
                </button>
              </div>
            </GlassBox>

            {/* Загрузка досье */}
            <AnimatePresence>
              {dossierLoading && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                  <GlassBox className="mb-5 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 rounded-full border-2 border-t-transparent" style={{ borderColor: `${G} transparent ${G} ${G}` }} />
                      <span className="text-sm" style={{ color: G }}>{dossierStep}</span>
                    </div>
                    <div className="w-full h-1 rounded-full" style={{ background: "rgba(0,255,65,0.1)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: G }}
                        initial={{ width:"0%" }} animate={{ width:"100%" }} transition={{ duration: 4, ease: "linear" }} />
                    </div>
                  </GlassBox>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Карточка досье */}
            <AnimatePresence>
              {dossier && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-3">

                  {/* Гриф */}
                  <div className="text-center">
                    <span className="px-4 py-1 text-xs font-black tracking-[0.3em] rounded"
                      style={{ background:"rgba(239,83,80,0.1)", border:"1px solid rgba(239,83,80,0.4)", color:"#EF5350" }}>
                      СЕКРЕТНО // ОПЕРАТИВНОЕ ДОСЬЕ
                    </span>
                  </div>

                  {/* Шапка */}
                  <GlassBox>
                    <div className="flex items-start gap-4">
                      {/* Фото-заглушка */}
                      <div className="w-20 h-24 rounded-xl shrink-0 flex flex-col items-center justify-center gap-1"
                        style={{ background:"rgba(0,255,65,0.05)", border:"2px solid rgba(0,255,65,0.2)" }}>
                        <div className="text-3xl">👤</div>
                        <div className="text-[8px] text-green-700 uppercase tracking-wider">фото</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-green-700 uppercase tracking-widest mb-1">Объект наблюдения</div>
                        <div className="text-lg font-black text-white uppercase">{dossier.name}</div>
                        <div className="text-sm text-green-500 mt-0.5">кличка: «{dossier.nickname}»</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider"
                            style={{ background: STATUS_COLORS[dossier.status] + "20", border:`1px solid ${STATUS_COLORS[dossier.status]}60`, color: STATUS_COLORS[dossier.status] }}>
                            ● {dossier.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-green-800 mt-2">Дело {dossier.caseNumber}</div>
                      </div>
                    </div>
                  </GlassBox>

                  {/* Личные данные */}
                  <GlassBox>
                    <Label>ПЕРСОНАЛЬНЫЕ ДАННЫЕ</Label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-3">
                      {[
                        { label: "Дата рождения", value: dossier.dob },
                        { label: "Место рождения", value: dossier.birthplace },
                        { label: "Фактический адрес", value: dossier.address },
                        { label: "Место работы", value: dossier.job },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="text-[9px] uppercase tracking-widest text-green-800 mb-0.5">{item.label}</div>
                          <div className="text-green-300 text-xs font-semibold">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </GlassBox>

                  {/* Технические данные */}
                  <GlassBox>
                    <Label>ТЕХНИЧЕСКИЕ ИДЕНТИФИКАТОРЫ</Label>
                    <div className="space-y-2 mt-3">
                      {[
                        { label: "Номер телефона", value: dossier.phone },
                        { label: "IP-адрес (последний)", value: dossier.ip },
                        { label: "IMEI устройства", value: dossier.imei.slice(0,8)+"·······" },
                        { label: "Транспортное средство", value: dossier.vehicle },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-green-900/30 last:border-0">
                          <span className="text-[10px] uppercase tracking-wider text-green-700">{item.label}</span>
                          <span className="text-green-300 text-xs font-mono font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </GlassBox>

                  {/* Судимости */}
                  <GlassBox>
                    <Label>КРИМИНАЛЬНАЯ ИСТОРИЯ</Label>
                    <div className="space-y-3 mt-3">
                      {dossier.crimes.map((c, i) => (
                        <motion.div key={i} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.2+i*0.12 }}
                          className="rounded-xl p-3" style={{ background:"rgba(239,83,80,0.05)", border:"1px solid rgba(239,83,80,0.2)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-[10px] font-black tracking-wider" style={{ color:"#EF5350" }}>{c.art}</div>
                              <div className="text-white text-xs font-semibold mt-0.5">{c.desc}</div>
                              <div className="text-green-700 text-[10px] mt-1">{c.result}</div>
                            </div>
                            <div className="text-[10px] text-green-700 shrink-0">{c.year} г.</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassBox>

                  {/* Связи */}
                  <GlassBox>
                    <Label>ОПЕРАТИВНЫЕ СВЯЗИ</Label>
                    <div className="space-y-2 mt-3">
                      {dossier.associations.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span style={{ color:"#FFA726" }}>▸</span>
                          <span className="text-green-400">{a}</span>
                        </div>
                      ))}
                    </div>
                  </GlassBox>

                  {/* Уровень опасности */}
                  <GlassBox className="text-center">
                    <Label>ОПЕРАТИВНАЯ ОЦЕНКА УГРОЗЫ</Label>
                    <div className="text-4xl font-black mt-2" style={{ color: dossier.dangerScore >= 8 ? "#EF5350" : dossier.dangerScore >= 6 ? "#FFA726" : G }}>
                      {dossier.dangerScore}/10
                    </div>
                    <div className="flex gap-1.5 justify-center mt-3">
                      {Array.from({length:10}).map((_,i) => (
                        <div key={i} className="h-3 rounded-sm flex-1"
                          style={{ background: i < dossier.dangerScore
                            ? (dossier.dangerScore >= 8 ? "#EF5350" : dossier.dangerScore >= 6 ? "#FFA726" : G)
                            : "rgba(255,255,255,0.05)" }} />
                      ))}
                    </div>
                    <div className="text-[10px] text-green-700 mt-2 uppercase tracking-widest">
                      Последняя активность: {dossier.lastActivity}
                    </div>
                  </GlassBox>

                  {/* Кнопка сбросить */}
                  <button onClick={() => { setDossier(null); setDossierName("") }}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-colors"
                    style={{ border:"1px solid rgba(0,255,65,0.2)", color:"rgba(0,255,65,0.4)" }}>
                    ↩ Новый запрос
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  )
}