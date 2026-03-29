"use client"

import { useState } from "react"
import { detectSlotsFromImage } from "@/lib/detectSlots"

export default function DetectPage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("template.png")
  const [slots, setSlots] = useState<any[]>([])
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 })
  const [copied, setCopied] = useState(false)

  const handleUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImage(url)
    setFileName(file.name)
    setSlots([])
  }

  const handleDetect = async () => {
    if (!image) return
    const result = await detectSlotsFromImage(image)
    setSlots(result)
  }

  const DISPLAY_WIDTH = 360
  const scale = DISPLAY_WIDTH / imgSize.width

  // 🔥 EXPAND SLOT (KIRI -5, KANAN +5, ATAS -5, BAWAH +5)
  const OFFSET = 5

  const adjustedSlots = slots.map(s => {
    const x = Math.max(0, s.x - OFFSET)
    const y = Math.max(0, s.y - OFFSET)

    const w = s.w + OFFSET * 2
    const h = s.h + OFFSET * 2

    return { x, y, w, h }
  })

  // 🔥 AUTO JSON
  const jsonOutput = {
    width: imgSize.width,
    height: imgSize.height,
    overlay: `/templates/${fileName}`,
    slots: adjustedSlots,
  }

  const copyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-6">

      <div className="w-full max-w-6xl flex gap-8">

        {/* LEFT */}
        <div className="bg-white p-4 rounded-xl shadow">

          <input type="file" onChange={handleUpload} />

          {image && (
            <div className="relative mt-4">
              <img
                src={image}
                className="w-[360px] rounded-lg"
                onLoad={(e) => {
                  const img = e.currentTarget
                  setImgSize({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  })
                }}
              />

              {/* SLOT PREVIEW (SUDAH EXPAND) */}
              {adjustedSlots.map((s, i) => (
                <div
                  key={i}
                  className="absolute border-2 border-red-500"
                  style={{
                    left: s.x * scale,
                    top: s.y * scale,
                    width: s.w * scale,
                    height: s.h * scale,
                  }}
                />
              ))}
            </div>
          )}

        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col gap-4">

          <div className="bg-white p-4 rounded-xl shadow">

            {/* DETECT BUTTON */}
            <button
              onClick={handleDetect}
              className="w-full py-3 mb-3 bg-green-600 text-white rounded-xl font-semibold text-lg active:scale-95 transition"
            >
              🔍 Detect Slot
            </button>

            {/* COPY JSON */}
            <button
              onClick={copyJSON}
              className="w-full mb-3 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg active:scale-95 transition"
            >
              {copied ? "✅ Copied!" : "📋 Copy JSON"}
            </button>

            {/* JSON OUTPUT */}
            <pre className="bg-black text-green-400 p-3 text-xs rounded h-[500px] overflow-auto">
{JSON.stringify(jsonOutput, null, 2)}
            </pre>

          </div>

        </div>

      </div>
    </div>
  )
}