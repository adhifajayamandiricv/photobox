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
    img.onerror = reject;
    img.src = src;
  });
}

// 🔥 COVER FIT (biar ga gepeng)
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const slotRatio = w / h;

  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > slotRatio) {
    sw = img.height * slotRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / slotRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

// 🔥 MASK PER SLOT
function drawWithMask(
  mainCtx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: Slot,
  templateCanvas: HTMLCanvasElement
) {
  const temp = document.createElement("canvas");
  temp.width = slot.w;
  temp.height = slot.h;

  const tctx = temp.getContext("2d")!;

  // 1. draw foto (cover)
  drawCover(tctx, img, slot.w, slot.h);

  // 2. ambil mask dari template
  const maskCtx = templateCanvas.getContext("2d")!;
  const maskData = maskCtx.getImageData(slot.x, slot.y, slot.w, slot.h);
  const imgData = tctx.getImageData(0, 0, slot.w, slot.h);

  for (let i = 0; i < maskData.data.length; i += 4) {
    const r = maskData.data[i];
    const g = maskData.data[i + 1];
    const b = maskData.data[i + 2];

    const isGreen = g > 200 && r < 120 && b < 120;

    if (!isGreen) {
      imgData.data[i + 3] = 0;
    }
  }

  tctx.putImageData(imgData, 0, 0);

  // 3. draw ke canvas utama
  mainCtx.drawImage(temp, slot.x, slot.y);
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

  const templateImg = await loadImage(templateSrc);

  // 🔥 canvas template (buat mask)
  const templateCanvas = document.createElement("canvas");
  templateCanvas.width = width;
  templateCanvas.height = height;
  const tctx = templateCanvas.getContext("2d")!;
  tctx.drawImage(templateImg, 0, 0);

  // 1. background putih
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // 2. draw foto pakai mask
  for (let i = 0; i < slots.length; i++) {
    const photo = photos[i];
    if (!photo) continue;

    const img = await loadImage(photo);

    drawWithMask(ctx, img, slots[i], templateCanvas);
  }

  // 3. overlay (paling atas)
  ctx.drawImage(templateImg, 0, 0);

  return canvas.toDataURL("image/png");
}