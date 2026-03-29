"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Camera from "@/components/Camera"
import { renderPhotostrip } from "@/lib/renderPhotostrip"

export default function Page() {
  const params = useSearchParams()
  const templatePath = params.get("template")

  const [template, setTemplate] = useState<any>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (templatePath) {
      fetch(templatePath)
        .then(res => res.json())
        .then(setTemplate)
    }
  }, [templatePath])

  if (!template) return <div>Loading...</div>

  const handleComplete = async (photos: string[]) => {
    try {
      setIsProcessing(true)

      console.log("PHOTOS:", photos)

      const output = await renderPhotostrip({
        templateSrc: template.overlay,
        photos: photos,
        slots: template.slots,
        width: template.width,
        height: template.height,
      })

      console.log("OUTPUT:", output)

      setResult(output)

    } catch (err) {
      console.error("ERROR RENDER:", err)
      alert("Render gagal!")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">

      {/* 🔥 LOADING */}
      {isProcessing && <div>Processing...</div>}

      {/* 🔥 HASIL */}
      {result && !isProcessing && (
        <>
          <img src={result} className="w-[300px]" />

          <button
            onClick={() => setResult(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded-xl"
          >
            Ulangi
          </button>

          <a
            href={result}
            download="photostrip.png"
            className="px-4 py-2 bg-green-600 text-white rounded-xl"
          >
            Download
          </a>
        </>
      )}

      {/* 🔥 CAMERA */}
      {!result && !isProcessing && (
        <Camera
          totalShots={template.slots.length}
          template={template}
          onComplete={handleComplete}
        />
      )}

    </div>
  )
}