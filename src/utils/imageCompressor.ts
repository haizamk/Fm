/**
 * Client-Side High-Efficiency Image Compressor
 * Resizes large camera photos (3MB-15MB) into lightweight, high-clarity Web-ready JPEGs (30KB-80KB)
 * to prevent browser storage quota overflow and Firestore document size exceed errors.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; sizeBytes: number; width: number; height: number }> {
  const { maxWidth = 960, maxHeight = 960, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        reject(new Error('Gagal membaca fail imej.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scale
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
          // Fallback to original dataUrl if canvas context unavailable
          resolve({
            dataUrl: src,
            sizeBytes: file.size,
            width: img.width,
            height: img.height,
          });
          return;
        }

        // Fill clean background (handles transparent PNGs nicely)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate approximate size in bytes
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
        const sizeBytes = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          sizeBytes,
          width,
          height,
        });
      };

      img.onerror = () => {
        reject(new Error('Format imej tidak disokong atau fail rosak.'));
      };

      img.src = src;
    };

    reader.onerror = () => {
      reject(new Error('Gagal memuat naik fail dari peranti.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Safely resolves product image URL with fallback to product.image property
 */
export function getProductImageUrl(product?: { image?: string; mediaUrl?: string } | null): string {
  if (!product) return '';
  return product.image || product.mediaUrl || '';
}
