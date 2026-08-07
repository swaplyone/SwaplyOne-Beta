/**
 * 2K High-Definition Single-Atlas Generator for 3D Lanyard Card & Band.
 * Matches card.glb UV map: Left Half = Front Card, Right Half = Back Card (Swaply Logo).
 */

export function generateFullCardAtlasAsync({
  name = 'swaplyone',
  title = 'FOUNDER & CREATOR',
  photoSrc = '/PHOTO-2026-06-30-10-57-17.jpg',
  logoSrc = '/swaply-logo.jpeg'
}) {
  return new Promise((resolve) => {
    const W = 2048;
    const H = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // -------------------------------------------------------------
    // LEFT HALF (0 -> 1024): FRONT FACE
    // -------------------------------------------------------------
    ctx.fillStyle = '#FBF5EC';
    ctx.fillRect(0, 0, 1024, 1546);

    ctx.lineWidth = 28;
    ctx.strokeStyle = '#1B242A';
    ctx.strokeRect(20, 20, 984, 1506);

    // Front Top Bar
    ctx.fillStyle = '#FFE569';
    ctx.fillRect(40, 40, 944, 160);
    ctx.strokeRect(40, 40, 944, 160);

    ctx.fillStyle = '#1B242A';
    ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PRIVATE BETA PASS', 512, 120);

    // Front Photo Circle (Huge)
    const fx = 512;
    const fy = 500;
    const fr = 240;

    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(fx, fy, fr + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 18;
    ctx.stroke();

    // -------------------------------------------------------------
    // RIGHT HALF (1024 -> 2048): BACK FACE (SWAPLY LOGO)
    // -------------------------------------------------------------
    ctx.fillStyle = '#1B242A';
    ctx.fillRect(1024, 0, 1024, 1546);

    ctx.lineWidth = 28;
    ctx.strokeStyle = '#FFE569';
    ctx.strokeRect(1044, 20, 984, 1506);

    // Back Top Bar
    ctx.fillStyle = '#FFE569';
    ctx.fillRect(1064, 40, 944, 160);
    ctx.strokeRect(1064, 40, 944, 160);

    ctx.fillStyle = '#1B242A';
    ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SWAPLY OFFICIAL', 1536, 120);

    // Back Logo Frame
    const bx = 1536;
    const by = 500;
    const br = 240;

    ctx.fillStyle = '#C49A62';
    ctx.beginPath();
    ctx.arc(bx, by, br + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#FFE569';
    ctx.stroke();

    // Load Images Simultaneously
    let photoLoaded = false;
    let logoLoaded = false;

    const photoImg = new Image();
    photoImg.crossOrigin = 'anonymous';

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    const drawRemainingText = () => {
      if (!photoLoaded || !logoLoaded) return;

      // FRONT GIANT TEXT (SWAPLYONE)
      ctx.fillStyle = '#1B242A';
      ctx.font = '900 110px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(name.toUpperCase(), 512, 880);

      // Front Title Pill
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(120, 930, 784, 120);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#1B242A';
      ctx.strokeRect(120, 930, 784, 120);

      ctx.fillStyle = '#1B242A';
      ctx.font = '900 54px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title.toUpperCase(), 512, 1010);

      // Front Info Box
      ctx.fillStyle = '#F3E9DD';
      ctx.fillRect(60, 1100, 904, 380);
      ctx.strokeRect(60, 1100, 904, 380);

      ctx.fillStyle = '#1B242A';
      ctx.font = '900 44px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('ID: #P2P-001-FOUNDER', 100, 1190);
      ctx.fillText('ROLE: CORE CREATOR', 100, 1270);
      ctx.fillText('ACCESS: UNRESTRICTED VIP', 100, 1350);
      ctx.fillText('STATUS: VERIFIED ✓', 100, 1430);

      // BACK GIANT TEXT (SWAPLYONE)
      ctx.fillStyle = '#FFE569';
      ctx.font = '900 110px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name.toUpperCase(), 1536, 880);

      // Back Title Pill
      ctx.fillStyle = '#D96B52';
      ctx.fillRect(1144, 930, 784, 120);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#FFE569';
      ctx.strokeRect(1144, 930, 784, 120);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 54px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FOUNDER PASS SEAL', 1536, 1010);

      // Back Info Box
      ctx.fillStyle = '#2A353D';
      ctx.fillRect(1084, 1100, 904, 380);
      ctx.strokeRect(1084, 1100, 904, 380);

      ctx.fillStyle = '#FFE569';
      ctx.font = '900 44px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('ISSUED BY: SWAPLY LABS', 1124, 1190);
      ctx.fillText('ENGINE: WEBRTC P2P v0.9', 1124, 1270);
      ctx.fillText('AUTHENTICITY: 100% ORIGINAL', 1124, 1350);
      ctx.fillText('OWNER: @SWAPLYONE ✓', 1124, 1430);

      resolve(canvas.toDataURL('image/png'));
    };

    // Load Photo
    photoImg.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.clip();
      const minS = Math.min(photoImg.width, photoImg.height);
      const sx = (photoImg.width - minS) / 2;
      const sy = (photoImg.height - minS) / 2;
      ctx.drawImage(photoImg, sx, sy, minS, minS, fx - fr, fy - fr, fr * 2, fr * 2);
      ctx.restore();
      photoLoaded = true;
      drawRemainingText();
    };
    photoImg.onerror = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#C49A62';
      ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
      ctx.restore();
      photoLoaded = true;
      drawRemainingText();
    };

    // Load Logo
    logoImg.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, bx - br, by - br, br * 2, br * 2);
      ctx.restore();
      logoLoaded = true;
      drawRemainingText();
    };
    logoImg.onerror = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#FFE569';
      ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      ctx.restore();
      logoLoaded = true;
      drawRemainingText();
    };

    photoImg.src = photoSrc;
    logoImg.src = logoSrc;
  });
}

// Generate High-Res Repeating Lanyard Strap Texture with "SWAPLYONE"
export function generateLanyardBandTexture({ text = 'swaplyone' }) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Dark Neobrutalist Black Base Band
  ctx.fillStyle = '#1B242A';
  ctx.fillRect(0, 0, 2048, 128);

  // Top & Bottom Yellow Border Lines
  ctx.fillStyle = '#FFE569';
  ctx.fillRect(0, 0, 2048, 12);
  ctx.fillRect(0, 116, 2048, 12);

  // Horizontal Repeating Text: "✦ SWAPLYONE ✦ SWAPLY"
  ctx.font = '900 54px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const uppercaseText = text.toUpperCase();
  const segment = `✦  ${uppercaseText}  ✦  SWAPLY  `;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FFE569';
  ctx.lineWidth = 4;

  let x = 40;
  while (x < 2048) {
    ctx.strokeText(segment, x, 64);
    ctx.fillText(segment, x, 64);
    x += ctx.measureText(segment).width + 60;
  }

  return canvas.toDataURL('image/png');
}
