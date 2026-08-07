const TOTAL_FRAMES = 192;
const padNum = (num) => String(num).padStart(3, '0');

export const frameImagesCache = new Array(TOTAL_FRAMES);
export let isFramesPreloaded = false;

export function checkIsPreloaded() {
  if (isFramesPreloaded) return true;
  if (typeof window !== 'undefined' && sessionStorage.getItem('swaply_frames_preloaded') === 'true') {
    return true;
  }
  return false;
}

export function preloadAllFrames(onProgress) {
  if (checkIsPreloaded() && frameImagesCache[0] && frameImagesCache[0].complete) {
    if (onProgress) onProgress(100, TOTAL_FRAMES);
    return Promise.resolve(frameImagesCache);
  }

  let count = 0;

  const loadAndDecodeImage = (index) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = `/frames/ezgif-frame-${padNum(index + 1)}.jpg`;

      const onDecoded = () => {
        count += 1;
        if (onProgress) {
          const pct = Math.min(100, Math.floor((count / TOTAL_FRAMES) * 100));
          onProgress(pct, count);
        }
        resolve();
      };

      const tryDecode = () => {
        if (img.decode) {
          img.decode().then(onDecoded).catch(onDecoded);
        } else {
          onDecoded();
        }
      };

      if (img.complete && img.naturalWidth > 0) {
        tryDecode();
      } else {
        img.onload = tryDecode;
        img.onerror = onDecoded;
      }

      frameImagesCache[index] = img;
    });
  };

  return Promise.all(
    Array.from({ length: TOTAL_FRAMES }, (_, i) => loadAndDecodeImage(i))
  ).then(() => {
    isFramesPreloaded = true;
    try {
      sessionStorage.setItem('swaply_frames_preloaded', 'true');
    } catch (e) {
      // Storage fallback
    }
    return frameImagesCache;
  });
}
