type Slot = {
  x: number;
  y: number;
  w: number;
  h: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal load image: " + src));
    img.src = src;
  });
}

// crop tengah biar penuh
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const slotRatio = w / h;

  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;

  if (imgRatio > slotRatio) {
    sw = img.height * slotRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / slotRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

export async function renderPhotostrip({
  templateSrc,
  photos,
  slots,
  width,
  height,
}: {
  templateSrc: string;
  photos: string[];
  slots: Slot[];
  width: number;
  height: number;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;

  console.log("PHOTOS:", photos);
  console.log("SLOTS:", slots);

  // 🔥 load template
  const templateImg = await loadImage(templateSrc);

  // 🔥 canvas untuk mask
  const templateCanvas = document.createElement("canvas");
  templateCanvas.width = width;
  templateCanvas.height = height;

  const tctx = templateCanvas.getContext("2d")!;
  tctx.drawImage(templateImg, 0, 0, width, height);

  // =============================
  // 🔥 LAYER 1 → FOTO
  // =============================
  for (let i = 0; i < slots.length; i++) {
    if (!photos[i]) continue;

    const img = await loadImage(photos[i]);
    const slot = slots[i];

    console.log("DRAW SLOT:", slot);

    const temp = document.createElement("canvas");
    temp.width = slot.w;
    temp.height = slot.h;

    const tctx2 = temp.getContext("2d")!;

    // 🔥 gambar foto
    drawCover(tctx2, img, slot.w, slot.h);

    // 🔥 masking
    const maskData = tctx.getImageData(slot.x, slot.y, slot.w, slot.h);
    const imgData = tctx2.getImageData(0, 0, slot.w, slot.h);

    let greenCount = 0;

    for (let j = 0; j < imgData.data.length; j += 4) {
      const r = maskData.data[j];
      const g = maskData.data[j + 1];
      const b = maskData.data[j + 2];

      const isGreen =
        g > 80 &&
        g > r * 1.05 &&
        g > b * 1.05;

      if (isGreen) greenCount++;

      // 🔥 MATIKAN MASKING? tinggal comment ini
      if (!isGreen) {
        imgData.data[j + 3] = 0;
      }
    }

    console.log(`SLOT ${i} GREEN:`, greenCount);

    tctx2.putImageData(imgData, 0, 0);

    ctx.drawImage(temp, slot.x, slot.y);
  }
const frameCanvas = document.createElement("canvas");
frameCanvas.width = width;
frameCanvas.height = height;

const fctx = frameCanvas.getContext("2d")!;
fctx.drawImage(templateImg, 0, 0, width, height);

const frameData = fctx.getImageData(0, 0, width, height);

for (let i = 0; i < frameData.data.length; i += 4) {
  const r = frameData.data[i];
  const g = frameData.data[i + 1];
  const b = frameData.data[i + 2];

  const isGreen =
    g > 80 &&
    g > r * 1.05 &&
    g > b * 1.05;

  if (isGreen) {
    frameData.data[i + 3] = 0; // transparan
  }
}

fctx.putImageData(frameData, 0, 0);

// 🔥 pakai ini, bukan template asli
ctx.drawImage(frameCanvas, 0, 0);
  // =============================
  // 🔥 LAYER 2 → TEMPLATE (DEBUG 50%)
  // =============================


  return canvas.toDataURL("image/png");
}