"use client";

import { useRouter } from "next/navigation";

const templates = [
  "bless",
  "wedding",
  "birthday",
  "graduation"
];

export default function TemplatePicker() {
  const router = useRouter();

  const handleSelect = (name: string) => {
    router.push(`/photobooth?template=${name}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-6">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        🎞 Pilih Template Photobooth
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">

        {templates.map((name) => (
          <div
            key={name}
            onClick={() => handleSelect(name)}
            className="bg-white rounded-xl shadow cursor-pointer hover:scale-105 transition"
          >
            <img
              src={`/templates/${name}.png`}
              className="w-full rounded-t-xl"
            />

            <div className="p-3 text-center font-semibold capitalize">
              {name}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}