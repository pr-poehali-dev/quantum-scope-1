import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

interface TrackMapProps {
  lat: number
  lng: number
  cityName: string
  accuracy: number
  lastSeen: string
  blinkOn: boolean
}

export function TrackMap({ lat, lng, cityName, accuracy, lastSeen, blinkOn }: TrackMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (leafletMap.current) {
      leafletMap.current.remove()
      leafletMap.current = null
    }

    // Инициализация карты
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    })

    // Тёмный тайл OpenStreetMap (Stadia Dark)
    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map)

    // Круг точности
    const circle = L.circle([lat, lng], {
      radius: 500,
      color: "#00ff41",
      fillColor: "#00ff41",
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: "6 4",
    }).addTo(map)

    // Кастомный маркер — зелёная пульсирующая точка
    const icon = L.divIcon({
      html: `
        <div style="position:relative;width:32px;height:32px;transform:translate(-50%,-50%)">
          <div style="position:absolute;inset:0;border-radius:50%;border:1px solid #00ff41;animation:ping 2s ease-out infinite;opacity:0.6"></div>
          <div style="position:absolute;inset:6px;border-radius:50%;border:1px solid #00ff41;animation:ping 2s ease-out infinite 0.5s;opacity:0.4"></div>
          <div style="position:absolute;inset:11px;border-radius:50%;background:#00ff41;box-shadow:0 0 12px #00ff41,0 0 24px #00ff4180"></div>
        </div>
        <style>
          @keyframes ping{0%{transform:scale(1);opacity:0.6}100%{transform:scale(3);opacity:0}}
        </style>
      `,
      className: "",
      iconSize: [0, 0],
    })

    const marker = L.marker([lat, lng], { icon }).addTo(map)
    marker.bindPopup(`<b style="color:#00ff41">${cityName}</b><br/><span style="color:#888;font-size:11px">Объект обнаружен</span>`)

    leafletMap.current = map
    markerRef.current = marker
    circleRef.current = circle

    return () => {
      map.remove()
      leafletMap.current = null
    }
  }, [lat, lng, cityName])

  // Анимация движения маркера
  useEffect(() => {
    if (!leafletMap.current || !markerRef.current || !circleRef.current) return
    const interval = setInterval(() => {
      const newLat = lat + (Math.random() - 0.5) * 0.003
      const newLng = lng + (Math.random() - 0.5) * 0.003
      markerRef.current?.setLatLng([newLat, newLng])
      circleRef.current?.setLatLng([newLat, newLng])
    }, 1800)
    return () => clearInterval(interval)
  }, [lat, lng])

  return (
    <div className="relative rounded-2xl overflow-hidden mb-4" style={{ height: 320, border: "1px solid rgba(0,255,65,0.3)" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* HUD поверх карты */}
      <div className="absolute top-3 left-3 z-[1000] text-[10px] space-y-0.5 pointer-events-none"
        style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,255,65,0.2)", color: "rgba(0,255,65,0.8)" }}>
        <div>LAT: {lat.toFixed(4)}° N</div>
        <div>LNG: {lng.toFixed(4)}° E</div>
        <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="flex items-center gap-1">
          <span>▶</span> TRACKING...
        </motion.div>
      </div>

      <div className="absolute top-3 right-12 z-[1000] text-[10px] text-right pointer-events-none"
        style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,255,65,0.2)", color: "rgba(0,255,65,0.8)" }}>
        <div>ТОЧНОСТЬ: {accuracy}%</div>
        <div>{lastSeen}</div>
        <motion.div animate={{ opacity: blinkOn ? 1 : 0.2 }} transition={{ duration: 0.3 }}
          style={{ color: "#00ff41", fontWeight: "bold" }}>● СИГНАЛ</motion.div>
      </div>
    </div>
  )
}
