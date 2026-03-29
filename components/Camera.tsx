"use client"

import { useEffect, useRef, useState } from "react"

const filters = [
  { name: "None", css: "" },
  { name: "Classic Sepia", css: "brightness(0.95) contrast(1.1) saturate(0.2) sepia(0.6)" },
  { name: "VHS Glitch", css: "contrast(1.15) saturate(1.2) blur(1px)" },
  { name: "Golden Hour", css: "brightness(1.15) contrast(0.9) saturate(1.25) sepia(0.3)" },
  { name: "Muted Forest", css: "brightness(0.9) contrast(1.15) saturate(0.6) hue-rotate(20deg)" },
  { name: "Lomo Pop", css: "brightness(1.1) contrast(1.5) saturate(1.6)" },
  { name: "90s Magazine", css: "contrast(0.85) brightness(1.1) saturate(0.9)" },
  { name: "Technicolor", css: "contrast(1.3) saturate(1.5)" },
  { name: "Bleached Denim", css: "brightness(1.2) saturate(0.5) hue-rotate(200deg)" },
  { name: "Ethereal Glow", css: "brightness(1.3) contrast(0.6) blur(1px)" },
  { name: "Dusty Noir", css: "grayscale(1) contrast(1.3)" },
  { name: "Retro Sun-Kissed", css: "brightness(1.05) sepia(0.4)" },
  { name: "Urban Gritty", css: "contrast(1.4) grayscale(0.4)" },
  { name: "Pale Pastel", css: "brightness(1.4) saturate(0.7)" },
  { name: "Deep Analog", css: "contrast(1.25) brightness(0.9)" },
  { name: "Faded Polar", css: "contrast(0.7) brightness(1.2)" },
  { name: "Summer Haze", css: "brightness(1.15) saturate(1.1)" },
  { name: "Matte Black", css: "contrast(0.8) brightness(0.95)" },
  { name: "Vibrant Retro", css: "contrast(1.2) saturate(1.4)" },
  { name: "Cold Winter", css: "brightness(1.05) hue-rotate(180deg)" },
  { name: "Rustic Grain", css: "contrast(1.1) brightness(0.95)" },
]

export default function Camera({
  totalShots = 8,
  onComplete,
  template
}: {
  totalShots?: number
  onComplete?: (photos: string[]) => void
  template?: any
}) {

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState("")
  const [photos, setPhotos] = useState<string[]>([])

  const [countdown, setCountdown] = useState(0)
  const [flash, setFlash] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const [timer, setTimer] = useState(5)
  const [delay, setDelay] = useState(2)
  const [mirror, setMirror] = useState(true)
  const [activeFilter, setActiveFilter] = useState(filters[0])

  const [filterIndex, setFilterIndex] = useState(0)
  const itemsPerPage = 4

  const visibleFilters = filters.slice(filterIndex, filterIndex + itemsPerPage)

  const nextFilter = () => {
    if (filterIndex + itemsPerPage < filters.length) {
      setFilterIndex(prev => prev + itemsPerPage)
    }
  }

  const prevFilter = () => {
    if (filterIndex - itemsPerPage >= 0) {
      setFilterIndex(prev => prev - itemsPerPage)
    }
  }

  useEffect(() => {
    async function init() {
      await navigator.mediaDevices.getUserMedia({ video: true })
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cams = devices.filter(d => d.kind === "videoinput")

      setDevices(cams)
      if (cams.length > 0) setSelectedDevice(cams[0].deviceId)
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedDevice) return

    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDevice } }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    }

    startCamera()
  }, [selectedDevice])

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return ""

    const ctx = canvas.getContext("2d")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (ctx) {
      ctx.save()

      if (mirror) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }

      ctx.filter = activeFilter.css
      ctx.drawImage(video, 0, 0)

      ctx.restore()
    }

    return canvas.toDataURL("image/jpeg")
  }

  const flashEffect = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 60)
  }

  const startCapture = async () => {
    if (isCapturing) return
    setIsCapturing(true)
    setPhotos([])

    let captured: string[] = []

    for (let i = 0; i < totalShots; i++) {
      for (let t = timer; t > 0; t--) {
        setCountdown(t)
        await new Promise(r => setTimeout(r, 1000))
      }

      setCountdown(0)
      flashEffect()

      const photo = takePhoto()
      captured.push(photo)
      setPhotos([...captured])

      if (i < totalShots - 1) {
        await new Promise(r => setTimeout(r, delay * 1000))
      }
    }

    setIsCapturing(false)
    onComplete && onComplete(captured)
  }

  return (
    <div className="w-screen h-[100dvh] flex flex-col bg-white overflow-hidden pb-4 md:pb-6">

      {/* HEADER */}
      <div className="bg-blue-500 text-white px-5 py-3 text-lg md:text-xl font-bold rounded-xl shadow flex-shrink-0 mx-2 mt-2">
        Adhifa Studio
      </div>

      {/* MAIN */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row gap-4 md:gap-6 p-3 md:p-4">

        {/* SETTINGS */}
        <div className="w-full md:w-[260px] border rounded-xl p-4 space-y-4 overflow-auto text-sm md:text-base">
          <h2 className="font-semibold text-lg">Settings</h2>

          <div>
            <p className="mb-1">Timer</p>
            <div className="flex gap-2">
              {[3,5,7].map(n => (
                <button key={n} onClick={()=>setTimer(n)}
                  className={`px-3 py-1 rounded ${timer===n?"bg-blue-500 text-white":"bg-gray-200"}`}>
                  {n}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1">Delay</p>
            <div className="flex gap-2">
              {[1,2,3].map(n => (
                <button key={n} onClick={()=>setDelay(n)}
                  className={`px-3 py-1 rounded ${delay===n?"bg-blue-500 text-white":"bg-gray-200"}`}>
                  {n}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1">Mirror</p>
            <button onClick={()=>setMirror(!mirror)} className="px-3 py-1 bg-gray-200 rounded">
              {mirror?"ON":"OFF"}
            </button>
          </div>

          <div>
            <p className="mb-1">Kamera</p>
            <select value={selectedDevice} onChange={(e)=>setSelectedDevice(e.target.value)}
              className="w-full border rounded px-2 py-1">
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || "Camera"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CAMERA */}
        <div className="flex-1 flex flex-col min-h-0 gap-3">

          <div className="relative flex-1 bg-black rounded-xl overflow-hidden">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`${mirror ? "scale-x-[-1]" : ""} w-full h-full object-cover`}
              style={{ filter: activeFilter.css }}
            />

            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-[clamp(50px,10vw,130px)] font-bold">
                {countdown}
              </div>
            )}

            {flash && (
              <div className="absolute inset-0 bg-white opacity-80"></div>
            )}

            <div
              onClick={startCapture}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow flex items-center justify-center"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-blue-500 rounded-full"></div>
            </div>

          </div>

          {/* FILTER */}
          {/* FILTER MODERN */}
<div className="flex items-center gap-3 px-2 py-2 rounded-2xlbg-white/60 backdrop-blur-xl shadow-inner">

  {/* LEFT BUTTON */}
  <button
    onClick={prevFilter}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:scale-110 active:scale-95 transition"
  >
    ◀
  </button>

  {/* FILTER LIST */}
  <div className="flex gap-2 flex-1 overflow-hidden justify-center">

    {visibleFilters.map(f => (
  <button
    key={f.name}
    onClick={() => setActiveFilter(f)}
    className={`w-[110px] md:w-[130px] px-3 py-2 text-xs md:text-sm rounded-xl text-center truncate transition-all duration-200

      ${activeFilter.name === f.name
        ? "bg-blue-500 text-white shadow-lg scale-105"
        : "bg-white/80 text-gray-700 hover:bg-gray-200 active:scale-95"
      }
    `}
  >
    {f.name}
  </button>
))}

  </div>

  {/* RIGHT BUTTON */}
  <button
    onClick={nextFilter}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:scale-110 active:scale-95 transition"
  >
    ▶
  </button>

</div>

        </div>

        {/* PREVIEW */}
        <div className="w-full md:w-[260px] border rounded-xl p-4 overflow-auto text-sm md:text-base">
          <h2 className="font-semibold text-lg mb-3">Preview</h2>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: totalShots }).map((_, i) => (
              <div key={i} className="h-[clamp(70px,10vh,110px)] bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                {photos[i]
                  ? <img src={photos[i]} className="w-full h-full object-cover"/>
                  : `Foto ${i + 1}`}
              </div>
            ))}
          </div>
        </div>

      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}