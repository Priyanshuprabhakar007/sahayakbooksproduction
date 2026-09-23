/**
 * Image processing utilities for client-side upload, preview, and safe storage
 */

export interface ProcessedImage {
  dataUrl: string;
  name: string;
  size: string;
  dimensions: string;
  width: number;
  height: number;
  fileSizeRaw: number;
}

/**
 * Formats byte size into human readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Safely processes a local File object into an optimized base64 data URL
 * and extracts natural dimensions and file weight.
 */
export function processImageFile(
  file: File,
  maxWidth: number = 1400,
  maxHeight: number = 1400,
  quality: number = 0.85
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // If it's a vector SVG, keep SVG as-is without canvas rasterization
        if (file.type === 'image/svg+xml') {
          resolve({
            dataUrl: src,
            name: file.name,
            size: formatBytes(file.size),
            dimensions: `${width}x${height}`,
            width,
            height,
            fileSizeRaw: file.size,
          });
          return;
        }

        // Calculate scaled dimensions to preserve browser localStorage limits
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            dataUrl: src,
            name: file.name,
            size: formatBytes(file.size),
            dimensions: `${img.width}x${img.height}`,
            width: img.width,
            height: img.height,
            fileSizeRaw: file.size,
          });
          return;
        }

        // Smooth rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Output optimized format
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(outputMime, quality);

        // Calculate approximate base64 payload size
        const stringLength = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.562489633438347;

        resolve({
          dataUrl: compressedDataUrl,
          name: file.name,
          size: formatBytes(sizeInBytes > 0 ? sizeInBytes : file.size),
          dimensions: `${width}x${height}`,
          width,
          height,
          fileSizeRaw: sizeInBytes > 0 ? sizeInBytes : file.size,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to read image buffer.'));
      };

      img.src = src;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsDataURL(file);
  });
}
