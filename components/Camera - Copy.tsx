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
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "3:4" | "unknown">("unknown")

  // slider filter
  const [filterIndex, setFilterIndex] = useState(0)
  const itemsPerPage = 8

  const visibleFilters = filters.slice(filterIndex, filterIndex + itemsPerPage)

  const nextFilter = () => {
    if (filterIndex + itemsPerPage < filters.length) {
      setFilterIndex(prev => prev + itemsPerPage)
    }
  }

  const prevFilter = () => {
    const detectRatio = (video: HTMLVideoElement) => {
  const w = video.videoWidth
  const h = video.videoHeight

  if (!w || !h) return

  const r = w / h

  if (Math.abs(r - 9/16) < 0.05) {
    setAspectRatio("9:16")
  } else if (Math.abs(r - 3/4) < 0.05) {
    setAspectRatio("3:4")
  } else {
    setAspectRatio("unknown")
  }
}
    if (filterIndex - itemsPerPage >= 0) {
      setFilterIndex(prev => prev - itemsPerPage)
    }
  }
  

  // init camera
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

  // start camera
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

  // capture
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

  const image = canvas.toDataURL("image/jpeg") // 🔥 INI YANG KURANG

  return image // 🔥 sekarang aman
}

const flashEffect = () => {
  setFlash(true)
  setTimeout(() => setFlash(false), 60) // lebih cepat & natural
}

  // 🔥 FIX TOTAL COUNTDOWN
const startCapture = async () => {
  if (isCapturing) return
  setIsCapturing(true)
  setPhotos([])

  let captured: string[] = []

  for (let i = 0; i < totalShots; i++) {

    // countdown tiap foto
    for (let t = timer; t > 0; t--) {
      setCountdown(t)
      await new Promise(r => setTimeout(r, 1000))
    }

    setCountdown(0)

    flashEffect()

    const photo = takePhoto() // ambil hasil foto
    captured.push(photo)      // simpan ke array manual

    setPhotos([...captured])  // update preview (tetap jalan)

    if (i < totalShots - 1) {
      await new Promise(r => setTimeout(r, delay * 1000))
    }
  }

  setIsCapturing(false)

  // kirim hasil ke parent
  onComplete && onComplete(captured)
}

  return (
<div className="w-full h-screen flex flex-col bg-white p-4 gap-4 overflow-hidden">

      <div className="bg-blue-500 text-white px-6 py-3 text-xl font-bold rounded-xl shadow">
        Adhifa Studio
      </div>

<div className="flex flex-1 gap-6 min-h-0 overflow-hidden">

        {/* SETTINGS */}
        <div className="w-[320px] border-2 border-blue-400 rounded-2xl p-5 shadow space-y-5">
          <h2 className="font-semibold text-lg">Settings</h2>

          <div>
            <p>Timer</p>
            <div className="flex gap-2">
              {[3,5,7].map(n => (
                <button key={n}
                  onClick={()=>setTimer(n)}
                  className={`px-3 py-1 rounded ${timer===n?"bg-blue-500 text-white":"bg-gray-200"}`}>
                  {n}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <p>Delay</p>
            <div className="flex gap-2">
              {[1,2,3].map(n => (
                <button key={n}
                  onClick={()=>setDelay(n)}
                  className={`px-3 py-1 rounded ${delay===n?"bg-blue-500 text-white":"bg-gray-200"}`}>
                  {n}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <p>Mirror</p>
            <button onClick={()=>setMirror(!mirror)}
              className={`px-3 py-1 rounded ${mirror?"bg-blue-500 text-white":"bg-gray-300"}`}>
              {mirror?"ON":"OFF"}
            </button>
          </div>

          <div>
            <p>Kamera</p>
            <select
              value={selectedDevice}
              onChange={(e)=>setSelectedDevice(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || "Camera"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CAMERA */}
<div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">

          <h2 className="text-center text-xl font-semibold">
            📸 Harap menghadap kamera dan pastikan wajah terlihat jelas
          </h2>

         <div className="relative flex-1 border-2 border-blue-400 rounded-3xl bg-black overflow-hidden flex items-center justify-center">

  <div className="w-full h-full aspect-[4/3]">

<div className="absolute inset-0 flex items-center justify-center">

<video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className={`${mirror ? "scale-x-[-1]" : ""} w-full h-full`}
  style={{
    objectFit: "cover",
    filter: activeFilter.css
  }}
/>

</div>
</div>
            

            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-7xl font-bold z-50">
                {countdown}
              </div>
            )}

            {flash && (
              <div className="absolute inset-0 bg-white opacity-80 z-40"></div>
            )}

            <div
              onClick={startCapture}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-xl border flex items-center justify-center cursor-pointer z-50"
            >
              <div className="w-10 h-10 border-2 border-blue-500 rounded-full"></div>
            </div>

          </div>

          {/* FILTER SLIDER */}
          <div className="border-2 border-blue-400 rounded-2xl px-4 py-3 flex items-center gap-4">

            <button onClick={prevFilter} className="w-10 h-10 rounded-full bg-gray-200">◀</button>

<div className="flex gap-3 flex-1 justify-center overflow-hidden">
              {visibleFilters.map(f => (
                <button
                  key={f.name}
                  onClick={()=>setActiveFilter(f)}
                  className={`px-4 py-2 rounded ${
                    activeFilter.name===f.name
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            <button onClick={nextFilter} className="w-10 h-10 rounded-full bg-gray-200">▶</button>

          </div>

        </div>

        {/* PREVIEW */}
        <div className="w-[320px] border-2 border-blue-400 rounded-2xl p-5 shadow">
          <h2 className="font-semibold mb-4 text-lg">Preview</h2>

          <div className="grid grid-cols-2 gap-3">
{Array.from({ length: totalShots }).map((_, i) => (
    <div
      key={i}
      className="h-24 bg-gray-200 rounded overflow-hidden flex items-center justify-center text-center text-gray-500 font-medium"
    >
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