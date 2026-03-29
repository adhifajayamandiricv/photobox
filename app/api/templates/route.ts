import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "templates");

  const files = fs.readdirSync(dir);

  // ambil hanya PNG
  const templates = files
    .filter(file => file.endsWith(".png"))
    .map(file => file.replace(".png", ""));

  return NextResponse.json(templates);
}