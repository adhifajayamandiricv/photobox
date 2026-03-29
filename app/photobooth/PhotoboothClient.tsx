"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Camera from "@/components/Camera"
import { renderPhotostrip } from "@/lib/renderPhotostrip"
import QRCode from "qrcode"

export default function PhotoboothClient() {
  const params = useSearchParams()
  const templatePath = params.get("template")

  const [template, setTemplate] = useState<any>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // 🌐 DETECT ONLINE / OFFLINE
  useEffect(() => {
    setIsOnline(navigator.onLine)

    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)

    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)

    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  // LOAD TEMPLATE
  useEffect(() => {
    if (templatePath) {
      fetch(templatePath)
        .then(res => res.json())
        .then(setTemplate)
    }
  }, [templatePath])

  // PRINT + QR
  useEffect(() => {
    if (result) {
      setTimeout(() => setIsPrinting(true), 200)

      // 🔥 HANYA BUAT QR SAAT ONLINE
      if (navigator.onLine) {
        const url = window.location.origin + "/download?img=" + encodeURIComponent(result)

        QRCode.toDataURL(url)
          .then(setQr)
          .catch(() => setQr(null))
      } else {
        setQr(null)
      }
    }
  }, [result, isOnline])

  if (!template) return <div>Loading...</div>

  const handleComplete = async (photos: string[]) => {
    try {
      setIsProcessing(true)

      const output = await renderPhotostrip({
        templateSrc: template.overlay,
        photos: photos,
        slots: template.slots,
        width: template.width,
        height: template.height,
      })

      setResult(output)

    } catch (err) {
      console.error("ERROR RENDER:", err)
      alert("Render gagal!")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-screen h-screen bg-white flex flex-col overflow-hidden">

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 relative">

          {isProcessing && (
            <div className="text-red-500 text-lg font-semibold animate-pulse">
              Processing...
            </div>
          )}

          {result && !isProcessing && (
            <>
              {/* PRINTER */}
              <div className="w-[300px] h-[130px] bg-red-500 rounded-xl shadow-xl flex items-end justify-center relative z-10">
                <div className="absolute bottom-0 w-[75%] h-[6px] bg-black rounded" />
              </div>

              {/* PHOTO */}
              <img
                src={result}
                className={`
                  w-[300px]
                  bg-white
                  shadow-[0_25px_50px_rgba(0,0,0,0.25)]
                  rounded-md
                  transition-all duration-[1200ms] ease-out
                  ${isPrinting ? "translate-y-0 opacity-100" : "-translate-y-40 opacity-0"}
                `}
              />
            </>
          )}

          {!result && !isProcessing && (
            <Camera
              totalShots={template.slots.length}
              template={template}
              onComplete={handleComplete}
            />
          )}

        </div>

        {/* RIGHT PANEL */}
        {result && !isProcessing && (
          <div className="w-[320px] bg-white border-l flex flex-col items-center justify-center gap-6 p-6">

            {/* QR AREA */}
            <div className="flex flex-col items-center gap-2">

              {!isOnline && (
                <p className="text-red-500 text-sm font-medium text-center">
                  QR tidak muncul, Anda sedang offline
                </p>
              )}

              {isOnline && qr && (
                <>
                  <p className="text-sm text-gray-500">
                    Scan untuk download
                  </p>
                  <img
                    src={qr}
                    className="w-[170px] p-2 bg-white shadow rounded-lg"
                  />
                </>
              )}

            </div>

            {/* BUTTON */}
            <div className="flex flex-col gap-3 w-full">

              <a
                href={result}
                download="photostrip.png"
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-center shadow"
              >
                Download
              </a>

              <button
                onClick={() => {
                  setResult(null)
                  setQr(null)
                  setIsPrinting(false)
                }}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-xl"
              >
                Ulangi
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}