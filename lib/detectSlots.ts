export type Slot = {
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

export async function detectSlotsFromImage(src: string): Promise<Slot[]> {
  const img = await loadImage(src);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const visited = new Set<string>();
  const slots: Slot[] = [];

  function isGreen(r: number, g: number, b: number) {
    return g > 200 && r < 120 && b < 120;
  }

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      const i = (y * canvas.width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (!isGreen(r, g, b)) continue;

      let minX = x, maxX = x;
      let minY = y, maxY = y;

      const stack: [number, number][] = [[x, y]];

      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const k = `${cx},${cy}`;
        if (visited.has(k)) continue;
        visited.add(k);

        const idx = (cy * canvas.width + cx) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (!isGreen(r, g, b)) continue;

        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ];

        for (const [nx, ny] of neighbors) {
          if (
            nx >= 0 &&
            ny >= 0 &&
            nx < canvas.width &&
            ny < canvas.height
          ) {
            stack.push([nx, ny]);
          }
        }
      }

      let w = maxX - minX;
      let h = maxY - minY;

      // 🔥 PADDING FIX (hilangin pinggiran bocor)
      const padding = 4;

      if (w > 50 && h > 50) {
        slots.push({
          x: minX + padding,
          y: minY + padding,
          w: w - padding * 2,
          h: h - padding * 2,
        });
      }
    }
  }

  // SORT
  slots.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 50) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  return slots;
}