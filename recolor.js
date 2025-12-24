// recolor.js

window._recolorCache = new Map();

function _rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2 - max - min) : d/(max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h*360, s, l];
}

function _hslToRgb(h,s,l){
  h/=360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = t => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const r = Math.round(hue2rgb(h + 1/3) * 255);
  const g = Math.round(hue2rgb(h) * 255);
  const b = Math.round(hue2rgb(h - 1/3) * 255);
  return [r,g,b];
}

function _ensureOriginalSrc(img){
  if (!img.dataset.originalSrc) {
    img.dataset.originalSrc = img.src || img.dataset.src || '';
  }
}

window.setItemNamedColor = async function setItemNamedColor(itemId, colorName){
  const el = document.getElementById(itemId);
  if (!el) return;

  if (!colorName || colorName === 'Original' || window.NAMED_HUES[colorName] == null) {
    _ensureOriginalSrc(el);
    const orig = el.dataset.originalSrc;
    if (orig) el.src = orig;
    el.style.filter = '';
    return;
  }

  if (!el.src && el.dataset && el.dataset.src) el.src = el.dataset.src;
  if (!el.crossOrigin) el.crossOrigin = 'anonymous';

  await new Promise(res => {
    if (el.complete && el.naturalWidth) res();
    else el.onload = () => res();
  });

  const targetHue = window.NAMED_HUES[colorName];
  const cacheKey = `${itemId}|${colorName}`;
  if (window._recolorCache.has(cacheKey)) {
    el.src = window._recolorCache.get(cacheKey);
    el.style.filter = '';
    return;
  }

  _ensureOriginalSrc(el);

  const w = el.naturalWidth, h = el.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  try {
    ctx.drawImage(el, 0, 0, w, h);
  } catch (e) {
    el.style.filter = `hue-rotate(${targetHue}deg) saturate(1.1)`;
    return;
  }

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const a = d[i+3];
    if (a === 0) continue;

    const r = d[i], g = d[i+1], b = d[i+2];
    const [hue, sat, light] = _rgbToHsl(r,g,b);
    if (light < 0.03 || light > 0.97) continue;

    const [nr, ng, nb] = _hslToRgb(targetHue, sat, light);
    d[i] = nr; d[i+1] = ng; d[i+2] = nb;
  }

  ctx.putImageData(imgData, 0, 0);
  const url = canvas.toDataURL('image/png');
  window._recolorCache.set(cacheKey, url);
  el.src = url;
  el.style.filter = '';
};