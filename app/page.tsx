"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useRef, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isTransition, setIsTransition] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: isTransition ? 0 : 1,
        scale: isTransition ? 1.1 : 1,
        filter: isTransition ? "blur(8px)" : "blur(0px)",
      }}
      transition={{ duration: 0.5 }}
      className="w-screen h-screen flex items-center justify-center relative overflow-hidden"
    >

      {/* AUDIO */}
      <audio ref={audioRef} src="/sounds/click.mp3" preload="auto" />

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700" />

      {/* LIGHT */}
      <div className="absolute w-[600px] h-[600px] bg-red-400/20 blur-[160px] rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-red-300/20 blur-[140px] rounded-full bottom-[-150px] right-[-150px]" />

      {/* 🎞️ PHOTO STRIP */}
<motion.img
  src="/ornaments/photostrip.png"
  animate={{ y: [0, -10, 0], rotate: [-12, -14, -12] }}
  transition={{ duration: 6, repeat: Infinity }}
  className="
    absolute left-[8%] top-[45%]
    w-[240px]

    opacity-30   /* 🔥 dinaikkan */
    rotate-[-12deg]

    pointer-events-none
  "
/>

{/* 🖨️ PRINTER */}
<motion.img
  src="/ornaments/printer.png"
  animate={{ y: [0, 8, 0], rotate: [3, 6, 3] }}
  transition={{ duration: 7, repeat: Infinity }}
  className="
    absolute right-[12%] bottom-[18%]
    w-[200px]

    opacity-25
    rotate-[5deg]

    pointer-events-none
  "
/>

{/* 📸 CAMERA */}
<motion.img
  src="/ornaments/camera.png"
  animate={{ y: [0, -12, 0], rotate: [6, 10, 6] }}
  transition={{ duration: 5, repeat: Infinity }}
  className="
    absolute left-[20%] top-[18%]
    w-[160px]

    opacity-20
    rotate-[8deg]

    pointer-events-none
  "
/>

{/* 👥 PEOPLE */}
<motion.img
  src="/ornaments/people.png"
  animate={{ y: [0, 12, 0], rotate: [-3, -6, -3] }}
  transition={{ duration: 8, repeat: Infinity }}
  className="
    absolute right-[10%] top-[25%]
    w-[340px]

    opacity-15
    rotate-[-5deg]

    pointer-events-none
  "
/>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-white">

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <h1 className="text-[48px] md:text-[60px] font-semibold tracking-[12px]">
            ADHIFA
          </h1>

          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="w-14 h-[2px] bg-white/70" />
            <span className="text-sm tracking-[8px] text-white/80">
              STUDIO
            </span>
            <div className="w-14 h-[2px] bg-white/70" />
          </div>
        </motion.div>

        {/* ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="mb-16"
        >
          <div className="w-24 h-24 border-[6px] border-white/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
            <Camera size={38} />
          </div>
        </motion.div>

        {/* BUTTON */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }

              document.body.classList.add("flash");
              setIsTransition(true);

              setTimeout(() => {
                router.push("/templates");
              }, 600);
            }}
            className="
  relative
  bg-black text-white

  px-20 py-6
  rounded-full

  text-lg
  font-semibold
  tracking-[4px]

  shadow-[0_10px_0_rgb(20,20,20),0_20px_25px_rgba(0,0,0,0.3)]

  hover:translate-y-[3px]
  hover:shadow-[0_6px_0_rgb(20,20,20),0_15px_20px_rgba(0,0,0,0.25)]

  active:translate-y-[8px]
  active:shadow-[0_2px_0_rgb(20,20,20)]

  transition-all duration-150
"
          >
            MULAI FOTO
            <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 hover:opacity-100 transition pointer-events-none" />
          </button>
        </motion.div>

        {/* TITLE */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-14 text-[34px] font-bold tracking-[10px]"
        >
          PHOTO <span className="border border-white px-5 py-1">BOOTH</span>
        </motion.h2>

        {/* DESC */}
        <p className="mt-6 text-[14px] text-white/90 max-w-md text-center leading-relaxed">
          Ambil foto seru bersama temanmu dengan sekali sentuh
        </p>

      </div>

    </motion.div>
  );
}