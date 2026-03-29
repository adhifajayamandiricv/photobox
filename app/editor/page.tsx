"use client";

import { useState } from "react";
import { detectSlotsFromImage } from "@/lib/detectSlots";

type Slot = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export default function DetectPage() {
  const [templateFile, setTemplateFile] = useState("bless.png");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 🔥 JSON OUTPUT
  const jsonData = {
    width: 1080,
    height: 1920,
    overlay: `/templates/${templateFile}`,
    slots,
  };

  // 🔥 DETECT SLOT
  const handleDetect = async () => {
    setLoading(true);
    try {
      const result = await detectSlotsFromImage(`/templates/${templateFile}`);
      setSlots(result);
    } catch (err) {
      alert("Gagal detect slot");
    }
    setLoading(false);
  };

  // 🔥 COPY JSON
  const copyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-6">

      <div className="w-full max-w-6xl flex gap-8">

        {/* LEFT - TEMPLATE PREVIEW */}
        <div className="bg-white p-4 rounded-xl shadow flex justify-center items-start">
          <div className="relative">

            <img
              src={`/templates/${templateFile}`}
              className="w-[360px] rounded-lg"
            />

            {/* SLOT OVERLAY */}
            {slots.map((s, i) => (
              <div
                key={i}
                className="absolute border-2 border-red-500"
                style={{
                  left: s.x,
                  top: s.y,
                  width: s.w,
                  height: s.h,
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col gap-4">

          {/* TEMPLATE INPUT */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Template File</h2>

            <input
              type="text"
              value={templateFile}
              onChange={(e) => setTemplateFile(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* ACTION BUTTON */}
          <div className="bg-white p-4 rounded-xl shadow flex gap-3">

            <button
              onClick={handleDetect}
              className="flex-1 py-2 bg-green-600 text-white rounded font-semibold"
            >
              {loading ? "Detecting..." : "🔍 Detect Slot"}
            </button>

            <button
              onClick={copyJSON}
              className="flex-1 py-2 bg-blue-600 text-white rounded font-semibold"
            >
              {copied ? "✅ Copied!" : "📋 Copy JSON"}
            </button>

          </div>

          {/* JSON OUTPUT */}
          <div className="bg-black text-green-400 p-4 rounded-xl shadow flex-1 overflow-auto text-sm">
            <pre>
{JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
}