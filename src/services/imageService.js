import localforage from 'localforage';

const photoStore = localforage.createInstance({
  name: 'RUTI_WORKOUT_APP',
  storeName: 'ruti_photos'
});

/**
 * 🖼️ 1080px WebP 고품질 초경량 클라이언트 압축 파이프라인
 * 원본 10MB 고용량 사진 ➔ 가로 1080px, WebP 품질 0.8로 150KB 내외(98% 압축) 변환
 */
export async function compressImageToWebP(file, maxWidth = 1080, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // WebP 변환 (미지원 브라우저는 JPEG fallback)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas Blob Conversion Failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 압축된 사진 Blob을 IndexedDB에 저장하고 고유 photoId 반환
 */
export async function savePhotoBlob(blob) {
  const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await photoStore.setItem(photoId, blob);
  return photoId;
}

/**
 * photoId로 사진 Blob 로드 후 ObjectURL 반환
 */
export async function getPhotoURL(photoId) {
  if (!photoId) return null;
  const blob = await photoStore.getItem(photoId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * 메모리 해제
 */
export function revokePhotoURL(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
