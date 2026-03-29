"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [templates, setTemplates] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch("/api/templates"); // ✅ FIX

        if (!res.ok) throw new Error("Fetch gagal");

        const data = await res.json();

        console.log("TEMPLATES:", data);

        setTemplates(data);
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setTemplates([]);
      } finally {
        setLoaded(true);
      }
    };

    loadTemplates();
  }, []);

  const handleSelect = (name: string) => {
    router.push(`/photobooth?template=/templates/${name}.json`);
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">

      {/* HEADER */}
      <div className="px-8 py-5 bg-blue-500 text-white shadow-md">
        <h1 className="text-xl font-semibold">
          Adhifa Studio
        </h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col items-center p-8 overflow-hidden">

        <h2 className="text-3xl font-bold mb-6">
          Pilih Template
        </h2>

        <div className="w-full max-w-6xl h-full overflow-auto">

          {!loaded && <div>Loading...</div>}

          {loaded && templates.length === 0 && (
            <div className="text-red-500">
              Tidak ada template
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {templates.map((name, i) => (
              <TemplateCard
                key={`${name}-${i}`}
                name={name}
                onClick={handleSelect}
              />
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}

function TemplateCard({ name, onClick }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "";

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${baseUrl}/templates/${name}.png`;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 🔥 hijau → transparan
          if (g > 200 && r < 120 && b < 120) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (err) {
        console.error("Canvas error:", err);
      }
    };

    img.onerror = () => {
      console.error("Gagal load image:", name);
    };
  }, [name]);

  return (
    <Card
      onClick={() => onClick(name)}
      className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition bg-white"
    >
      <CardContent className="p-0">

        <div className="h-[200px] flex items-center justify-center bg-white">
          <canvas ref={canvasRef} className="max-w-full max-h-full" />
        </div>

        <div className="p-3 text-center">
          <div className="font-semibold capitalize">{name}</div>

          <Button className="w-full mt-2 bg-blue-500 text-white">
            Use Template
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}