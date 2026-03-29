import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "templates");

    const files = fs.readdirSync(dir);

    // 🔥 ambil JSON (BUKAN PNG)
    const templates = files
      .filter(file => file.endsWith(".json"))
      .map(file => file.replace(".json", ""));

    return NextResponse.json(templates);
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json([]);
  }
}