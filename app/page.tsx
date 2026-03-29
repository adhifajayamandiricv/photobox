"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 100)
  }, [])

  return (
    <div className="relative w-screen h-[100dvh] flex items-center justify-center overflow-hidden bg-white">

      {/* 🔵 BACKGROUND HALUS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent_40%)]" />

      {/* ================= ORNAMEN BESAR ================= */}

      {/* 📸 KAMERA BESAR */}
      <div className="absolute top-10 left-10 opacity-20">
        <svg width="180" height="180" viewBox="0 0 24 24" fill="none" className="text-blue-600">
          <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="12" cy="13.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="8" y="4" width="8" height="3" rx="1.5" fill="currentColor"/>
        </svg>
      </div>

      {/* 🎞️ PHOTOSTRIP BESAR */}
      <div className="absolute bottom-10 left-20 opacity-20 rotate-6">
        <svg width="120" height="220" viewBox="0 0 80 160" fill="none" className="text-blue-600">
          <rect x="10" y="5" width="60" height="150" rx="8" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="18" y="15" width="44" height="30" rx="4" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="18" y="55" width="44" height="30" rx="4" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="18" y="95" width="44" height="30" rx="4" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      </div>

      {/* 🖼️ FRAME FOTO */}
      <div className="absolute top-1/4 right-16 opacity-20 -rotate-6">
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none" className="text-blue-500">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="9" cy="10" r="2" fill="currentColor"/>
          <path d="M21 16l-5-5L5 21" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* ✨ SPARK BESAR */}
      <div className="absolute top-1/3 left-1/3 opacity-20">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
          <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z"/>
        </svg>
      </div>

      {/* 🎉 CONFETTI DOT */}
      <div className="absolute top-20 right-1/3 w-6 h-6 bg-blue-400 rounded-full opacity-20" />
      <div className="absolute bottom-20 right-10 w-4 h-4 bg-blue-300 rounded-full opacity-20" />

      {/* 🔵 GLOW HALUS */}
      <div className="absolute w-[400px] h-[400px] bg-blue-200/30 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* ================= CONTENT ================= */}
      <div
        className={`
          relative z-10 flex flex-col items-center text-center px-6
          transition-all duration-700 ease-out
          ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >

        {/* TITLE */}
        <h1 className="text-4xl md:text-6xl font-semibold text-blue-600 mb-4 tracking-wide">
          Adhifa Studio
        </h1>

        {/* SUBTITLE */}
        <p className="text-gray-500 text-sm md:text-base mb-12 max-w-sm">
          Seru-seruan bareng temanmu dengan photobooth kekinian 📸
        </p>

        {/* BUTTON */}
        <button
          onClick={() => router.push("/templates")}
          className="
            px-12 py-4
            text-lg font-medium
            rounded-full
            bg-blue-600 text-white
            shadow-lg
            hover:scale-105 active:scale-95
            transition-all duration-200
          "
        >
          Mulai
        </button>

      </div>

    </div>
  )
}