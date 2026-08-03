// lib/compressImage.ts

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  outputType?: "image/jpeg" | "image/webp" | "image/png";
}

/**
 * Compresses an image file client‑side using Canvas.
 * Returns a File object (or Blob) with reduced size.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    outputType = "image/jpeg",
  } = options;

  // 1. Read the file as an Image
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

  // 2. Calculate new dimensions (preserve aspect ratio)
  let width = image.width;
  let height = image.height;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 3. Draw resized image on canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, width, height);

  // 4. Convert to blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), outputType, quality);
  });

  // 5. Return as a File (preserve original name, change extension if needed)
  const ext = outputType.split("/")[1]; // "jpeg" or "webp" or "png"
  const originalName = file.name.replace(/\.[^.]+$/, "");
  const newFileName = `${originalName}.${ext}`;

  return new File([blob], newFileName, { type: outputType });
}
