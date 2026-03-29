import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  const { image } = await req.json()

  const base64Data = image.replace(/^data:image\/png;base64,/, "")
  const fileName = `photo_${Date.now()}.png`

  const filePath = path.join(process.cwd(), "public/uploads", fileName)

  fs.writeFileSync(filePath, base64Data, "base64")

  return NextResponse.json({
    url: `/uploads/${fileName}`,
  })
}