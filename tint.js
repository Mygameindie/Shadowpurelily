(() => {
  const clamp = (v,min,max)=>Math.min(max,Math.max(min,v));
  const toHex = v => v.toString(16).padStart(2,'0');
  const rgbToHex = (r,g,b) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  function hsvToRgb(h, s, v){
    h = ((h % 360) + 360) % 360;
    s = clamp(s,0,1); v = clamp(v,0,1);
    const c = v * s, x = c * (1 - Math.abs((h/60)%2 - 1)), m = v - c;
    let r=0,g=0,b=0;
    if (0<=h && h<60)   [r,g,b]=[c,x,0];
    else if (60<=h&&h<120) [r,g,b]=[x,c,0];
    else if (120<=h&&h<180)[r,g,b]=[0,c,x];
    else if (180<=h&&h<240)[r,g,b]=[0,x,c];
    else if (240<=h&&h<300)[r,g,b]=[x,0,c];
    else                    [r,g,b]=[c,0,x];
    return [Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255)];
  }
  function hexToHsv(hex){
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(!m) return [0,0,1];
    let r = parseInt(m[1],16)/255, g = parseInt(m[2],16)/255, b = parseInt(m[3],16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min;
    let h = 0;
    if (d !== 0) {
      switch(max){
        case r: h = ((g-b)/d) % 6; break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h *= 60; if (h<0) h+=360;
    }
    const s = max === 0 ? 0 : d/max;
    const v = max;
    return [h,s,v];
  }
  const TINT_CACHE = new Map(); 
  function ensureLoaded(img){
    return new Promise(res=>{
      if (img.complete && img.naturalWidth) return res();
      img.addEventListener('load', () => res(), {once:true});
      img.addEventListener('error', () => res(), {once:true}); 
    });
  }
  async function tintImageToDataURL(img, hex){
    await ensureLoaded(img);
    const orig = img.dataset.originalSrc || img.src;
    const key = `${orig}|${hex}`;
    if (TINT_CACHE.has(key)) return TINT_CACHE.get(key);
    const w = img.naturalWidth || 1, h = img.naturalHeight || 1;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(img, 0, 0);
    let url;
    try {
      url = cv.toDataURL('image/png');
    } catch {
      url = null; 
    }
    if (url) TINT_CACHE.set(key, url);
    return url;
  }
  async function applyHexToItem(itemId, hex){
    const id = itemId || window.currentlySelectedItem;
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.dataset.originalSrc) el.dataset.originalSrc = el.src;
    const dataUrl = await tintImageToDataURL(el, hex);
    if (dataUrl) {
      el.style.filter = '';
      el.src = dataUrl;
      return;
    }
    const [h] = hexToHsv(hex);
    el.style.filter = `hue-rotate(${Math.round(h)}deg)`;
  }
  async function resetItem(itemId){
    const id = itemId || window.currentlySelectedItem;
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const orig = el.dataset.originalSrc;
    if (orig) el.src = orig;
    el.style.filter = '';
  }
  window.setItemCustomColor = (itemIdOrHex, maybeHex) => {
    if (maybeHex) return applyHexToItem(itemIdOrHex, maybeHex);
    return applyHexToItem(null, itemIdOrHex);
  };
  window.resetItemColor = resetItem;
  window.setItemNamedColor = async (itemId, name) => {
    const MAP = {
      Original: null,
      Red: '#ff3b30',
      Orange: '#ff9500',
      Yellow: '#ffcc00',
      Green: '#34c759',
      Cyan: '#32ade6',
      Blue: '#007aff',
      Purple: '#af52de',
      Pink: '#ff2d55'
    };
    const hex = MAP[name] ?? null;
    if (!hex) return resetItem(itemId);
    return applyHexToItem(itemId, hex);
  };
  function injectStyles(){
    if (document.getElementById('color-wheel-styles')) return;
    const css = `
      .custom-color-wrap{margin-top:10px;display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}
      .wheel-col{display:flex;flex-direction:column;align-items:center;gap:8px}
      .color-wheel{width:220px;height:220px;touch-action:none;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.1)}
      .value-row{display:flex;align-items:center;gap:8px;width:220px}
      .value-row input[type="range"]{flex:1}
      .preview-chip{width:36px;height:36px;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.15)}
      .custom-actions{display:flex;gap:8px;flex-wrap:wrap}
      .native-color{width:36px;height:36px;border:none;padding:0;background:transparent}
      .visually-hidden{position:absolute!important;height:1px;width:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap}
    `;
    const style = document.createElement('style');
    style.id = 'color-wheel-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }
  function buildWheelOnce(){
    const picker = document.querySelector('.color-picker-container');
    if (!picker || picker.querySelector('.custom-color-wrap')) return false;
    injectStyles();
    const title = document.createElement('h4');
    title.textContent = 'Custom Color:';
    picker.appendChild(title);
    const wrap = document.createElement('div');
    wrap.className = 'custom-color-wrap';
    const wheelCol = document.createElement('div');
    wheelCol.className = 'wheel-col';
    const canvas = document.createElement('canvas');
    canvas.className = 'color-wheel';
    canvas.width = 220; canvas.height = 220;
    const valRow = document.createElement('div');
    valRow.className = 'value-row';
    const valLabel = document.createElement('span');
    valLabel.textContent = 'Brightness';
    valLabel.style.fontSize='12px';
    const val = document.createElement('input');
    val.type='range'; val.min='0'; val.max='100'; val.value='100';
    valRow.appendChild(valLabel); valRow.appendChild(val);
    const preview = document.createElement('div');
    preview.className = 'preview-chip'; preview.title = 'Preview';
    wheelCol.appendChild(canvas);
    wheelCol.appendChild(valRow);
    const ctlCol = document.createElement('div');
    ctlCol.className = 'wheel-col';
    const nativeLabel = document.createElement('span');
    nativeLabel.style.fontSize='12px';
    nativeLabel.textContent = 'Or pick:';
    const nativeColor = document.createElement('input');
    nativeColor.className = 'native-color';
    nativeColor.type = 'color';
    nativeColor.value = '#ff3b30';
    const actions = document.createElement('div');
    actions.className = 'custom-actions';
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    actions.appendChild(applyBtn);
    actions.appendChild(resetBtn);
    ctlCol.appendChild(preview);
    ctlCol.appendChild(nativeLabel);
    ctlCol.appendChild(nativeColor);
    ctlCol.appendChild(actions);
    wrap.appendChild(wheelCol);
    wrap.appendChild(ctlCol);
    picker.appendChild(wrap);
    const ctx = canvas.getContext('2d');
    const R = canvas.width/2;
    const C = {x:R, y:R};
    let sel = {h:0, s:1, v:1};
    function drawWheel(){
      const img = ctx.createImageData(canvas.width, canvas.height);
      for (let y=0; y<canvas.height; y++){
        for (let x=0; x<canvas.width; x++){
          const dx = x - C.x, dy = y - C.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const idx = (y*canvas.width + x) * 4;
          if (dist <= R){
            const h = (Math.atan2(dy, dx) * 180/Math.PI + 360) % 360;
            const s = clamp(dist / R, 0, 1);
            const [rr, gg, bb] = hsvToRgb(h, s, sel.v);
            img.data[idx]   = rr;
            img.data[idx+1] = gg;
            img.data[idx+2] = bb;
            img.data[idx+3] = 255;
          } else {
            img.data[idx+3] = 0;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      updatePreview();
    }
    function updatePreview(){
      const [r,g,b] = hsvToRgb(sel.h, sel.s, sel.v);
      const hex = rgbToHex(r,g,b);
      preview.style.background = hex;
      nativeColor.value = hex;
    }
    function pickAt(evt){
      const rect = canvas.getBoundingClientRect();
      const px = (evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left;
      const py = (evt.touches ? evt.touches[0].clientY : evt.clientY) - rect.top;
      const dx = px - C.x, dy = py - C.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > R) return;
      sel.h = (Math.atan2(dy, dx) * 180/Math.PI + 360) % 360;
      sel.s = clamp(dist / R, 0, 1);
      updatePreview();
    }
    let dragging = false;
    const start = (e)=>{ dragging = true; pickAt(e); e.preventDefault(); };
    const move  = (e)=>{ if(!dragging) return; pickAt(e); };
    const end   = ()=> dragging = false;
    canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, {passive:false});
    window.addEventListener('touchmove', move, {passive:false});
    window.addEventListener('touchend', end);
    val.addEventListener('input', () => { sel.v = parseInt(val.value,10)/100; drawWheel(); });
    nativeColor.addEventListener('input', () => {
      const [h,s,v] = hexToHsv(nativeColor.value);
      sel.h = h; sel.s = s; sel.v = v;
      drawWheel();
    });
    applyBtn.addEventListener('click', async () => {
      const [r,g,b] = hsvToRgb(sel.h, sel.s, sel.v);
      const hex = rgbToHex(r,g,b);
      await window.setItemCustomColor(hex);
      window.hideColorPicker?.();
    });
    resetBtn.addEventListener('click', async () => {
      await window.resetItemColor();
      window.hideColorPicker?.();
    });
    drawWheel();
    return true;
  }
  const tryBuild = () => {
    const ok = buildWheelOnce();
    return ok;
  };
  window.addEventListener('load', tryBuild);
  const mo = new MutationObserver(() => tryBuild());
  mo.observe(document.documentElement, {childList:true, subtree:true});
})();

(() => {
  const NAMED = {
    Original: null,
    Red: '#ff3b30',
    Orange: '#ff9500',
    Yellow: '#ffcc00',
    Green: '#34c759',
    Cyan: '#32ade6',
    Blue: '#007aff',
    Purple: '#af52de',
    Pink: '#ff2d55'
  };
  function ensureOverlay(img) {
    if (!img || !img.id) return null;
    const overlayId = img.id + '__pureTint';
    let ov = document.getElementById(overlayId);
    if (ov) return ov;
    const base = document.querySelector('.base-container') || img.parentElement || document.body;
    ov = document.createElement('div');
    ov.id = overlayId;
    ov.style.position = 'absolute';
    ov.style.pointerEvents = 'none';
    ov.style.mixBlendMode = 'color';               
    ov.style.opacity = '1';
    ov.style.willChange = 'transform, width, height';
    ov.style.transform = 'translate3d(0,0,0)';
    ov.style.background = 'transparent';
    ov.style.isolation = 'isolate';                
    const setMask = () => {
      const url = img.currentSrc || img.src;
      ov.style.maskImage = `url("${url}")`;
      ov.style.maskRepeat = 'no-repeat';
      ov.style.maskSize = '100% 100%';
      ov.style.webkitMaskImage = `url("${url}")`;
      ov.style.webkitMaskRepeat = 'no-repeat';
      ov.style.webkitMaskSize = '100% 100%';
    };
    setMask();
    const sync = () => {
      const baseRect = (document.querySelector('.base-container') || document.body).getBoundingClientRect();
      const r = img.getBoundingClientRect();
      ov.style.left = (r.left - baseRect.left) + 'px';
      ov.style.top  = (r.top  - baseRect.top)  + 'px';
      ov.style.width  = r.width  + 'px';
      ov.style.height = r.height + 'px';
      ov.style.visibility = img.style.visibility || 'hidden';
      const z = parseInt(img.style.zIndex || '0', 10);
      ov.style.zIndex = String(z + 1);
      requestAnimationFrame(sync);
    };
    requestAnimationFrame(sync);
    new MutationObserver(() => setMask())
      .observe(img, { attributes: true, attributeFilter: ['src'] });
    base.appendChild(ov);
    return ov;
  }
  function applyPureColor(itemId, hex) {
    const id = itemId || window.currentlySelectedItem;
    if (!id) return;
    const img = document.getElementById(id);
    if (!img) return;
    if (!img.dataset._origFilter) img.dataset._origFilter = img.style.filter || '';
    const baseFilters = (img.dataset._origFilter || '').split(' ').filter(Boolean).filter(f => !/^saturate\(/.test(f));
    baseFilters.push('saturate(0)'); 
    img.style.filter = baseFilters.join(' ').trim();
    const ov = ensureOverlay(img);
    if (!ov) return;
    ov.style.mixBlendMode = ('mixBlendMode' in ov.style) ? 'color' : 'multiply';
    ov.style.background = hex;
    ov.style.visibility = img.style.visibility || 'hidden';
  }
  function resetPureColor(itemId) {
    const id = itemId || window.currentlySelectedItem;
    if (!id) return;
    const img = document.getElementById(id);
    if (!img) return;
    const ov = document.getElementById(id + '__pureTint');
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    if (img.dataset._origFilter != null) {
      img.style.filter = img.dataset._origFilter;
      delete img.dataset._origFilter;
    } else {
      img.style.filter = '';
    }
  }
  function _argsToIdHex(a, b) {
    if (b) return [a, b];
    return [null, a];
  }
  const prevSetCustom = window.setItemCustomColor;
  const prevSetNamed  = window.setItemNamedColor;
  const prevReset     = window.resetItemColor;
  window.setItemCustomColor = (a, b) => {
    const [id, hex] = _argsToIdHex(a, b);
    if (!hex) return;
    try { applyPureColor(id, hex); }
    catch(e){ prevSetCustom?.(a, b); }
  };
  window.setItemNamedColor = (itemId, name) => {
    const hex = NAMED[name] ?? null;
    if (!hex) { window.resetItemColor?.(itemId); return; }
    try { applyPureColor(itemId, hex); }
    catch(e){ prevSetNamed?.(itemId, name); }
  };
  window.resetItemColor = (itemId) => {
    try { resetPureColor(itemId); }
    catch(e){ prevReset?.(itemId); }
  };
  const visMo = new MutationObserver((muts) => {
    muts.forEach(m => {
      if (m.type === 'attributes' && m.attributeName === 'style' && m.target.id) {
        const img = m.target;
        const ov = document.getElementById(img.id + '__pureTint');
        if (ov) ov.style.visibility = img.style.visibility || 'hidden';
      }
    });
  });
  visMo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['style'] });
})();

(() => {
  if (window.__windMirrorInstalled) return;
  window.__windMirrorInstalled = true;
  function asPair(id){
    const m = String(id).match(/^((?:skirt|dress)[123]_\d+)(w?)\.png$/);
    if (!m) return null;
    const base = m[1], isW = !!m[2];
    return { normal: `${base}.png`, wind: `${base}w.png`, sibling: isW ? `${base}.png` : `${base}w.png` };
  }
  function rememberColor(el, token){
    if (!el) return;
    if (typeof token === 'string' && token.startsWith('#')) el.dataset.colorHex = token;
    else el.dataset.colorName = token || 'Original';
  }
  if (typeof window.setItemNamedColor === 'function') {
    const orig = window.setItemNamedColor;
    window.__windOrigSetItemNamedColor = orig;
    window.setItemNamedColor = async function(itemId, colorName){
      const r = await orig(itemId, colorName);
      const p = asPair(itemId); if (!p) return r;
      rememberColor(document.getElementById(itemId), colorName);
      rememberColor(document.getElementById(p.sibling), colorName);
      if (document.getElementById(p.sibling)) {
        await window.__windOrigSetItemNamedColor(p.sibling, colorName);
      }
      return r;
    };
  }
  if (typeof window.setItemCustomColor === 'function') {
    const origC = window.setItemCustomColor;
    window.__windOrigSetItemCustomColor = origC;
    window.setItemCustomColor = async function(a, b){
      const id  = (b ? a : window.currentlySelectedItem);
      const hex = (b ? b : a);
      const r = await origC(a, b);
      const p = asPair(id); if (!p) return r;
      rememberColor(document.getElementById(id), hex);
      rememberColor(document.getElementById(p.sibling), hex);
      if (document.getElementById(p.sibling)) {
        await window.__windOrigSetItemCustomColor(p.sibling, hex);
      }
      return r;
    };
  }
  function tokenFor(id){
    const el = document.getElementById(id);
    return el?.dataset.colorHex || el?.dataset.colorName || 'Original';
  }
  async function syncVisiblePairs(){
    for (const kind of ['dress','skirt']){
      for (let phase = 1; phase <= 3; phase++){
        for (let i = 1; i <= 10; i++){
          const normalId = `${kind}${phase}_${i}.png`;
          const windId   = `${kind}${phase}_${i}w.png`;
          const n = document.getElementById(normalId);
          const w = document.getElementById(windId);
          if (!n || !w) continue;
          const tok = tokenFor(normalId); 
          const useHex = typeof tok === 'string' && tok.startsWith('#');
          if (w.style.visibility === 'visible' && n.style.visibility !== 'visible') {
            if (useHex) await window.__windOrigSetItemCustomColor?.(windId, tok);
            else        await window.__windOrigSetItemNamedColor?.(windId, tok);
          } else if (n.style.visibility === 'visible' && w.style.visibility !== 'visible') {
            if (useHex) await window.__windOrigSetItemCustomColor?.(normalId, tok);
            else        await window.__windOrigSetItemNamedColor?.(normalId, tok);
          }
        }
      }
    }
  }
  const btn = document.getElementById('wind-button'); 
  if (btn) {
    const after = () => setTimeout(syncVisiblePairs, 0);
    ['mousedown','mouseup','mouseleave','touchstart','touchend']
      .forEach(evt => btn.addEventListener(evt, after, { passive: false }));
  }
})();

(() => {
  const LAYER1 = 10;  
  const LAYER2 = 15;  
  const LAYER3 = 30;  
  const FACE_CLASSES = new Set(['face','face1','face2']);
  const isFaceCategory = (name) => FACE_CLASSES.has(String(name).replace(/\d+w?$/,''));
  const isFaceEl = (el) =>
    el &&
    (el.id === 'face-layer-container' ||
     [...(el.classList || [])].some(c => FACE_CLASSES.has(c)) ||
     el.closest?.('#face-layer-container'));
  const sanitizeFaceEl = (el) => {
    if (!el) return;
    el.style.filter = 'none';
    el.style.mixBlendMode = 'normal';
    el.style.opacity = '1';
    el.style.removeProperty('--tint');
    el.style.removeProperty('--hue');
    el.style.removeProperty('--saturation');
    el.style.removeProperty('--brightness');
    if (el.dataset) {
      delete el.dataset.tint;
      delete el.dataset.hue;
      delete el.dataset.saturation;
      delete el.dataset.brightness;
    }
  };
  window.addEventListener('load', () => {
    const b1 = document.getElementById('base-image');
    if (b1) {
      b1.style.position = b1.style.position || 'absolute';
      b1.style.left = b1.style.left || '0';
      b1.style.top  = b1.style.top  || '0';
      b1.style.zIndex = String(LAYER1);
    }
    ['base2-image', 'base3-image', 'base4-image'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.position = el.style.position || 'absolute';
      el.style.left = el.style.left || '0';
      el.style.top  = el.style.top  || '0';
      el.style.zIndex = String(LAYER3);
    });
  });
  try { jsonFiles.push('face1.json', 'face2.json','face3.json'); } catch(e) {}
  const _origGetZ = window.getZIndex || getZIndex;
  window.getZIndex = function(categoryName){
    const base = String(categoryName).replace(/\d+w?$/,''); 
    if (base === 'face') return LAYER2;
    return _origGetZ(categoryName);
  };
  window.addEventListener('load', () => {
    document.querySelectorAll('#face-layer-container img, .face, .face1, .face2').forEach(el => {
      el.style.position = el.style.position || 'absolute';
      el.style.left = el.style.left || '0';
      el.style.top  = el.style.top  || '0';
      el.style.zIndex = String(LAYER2);
      sanitizeFaceEl(el); 
    });
  });
  const wrapNoTint = (fnName) => {
    const fn = window[fnName];
    if (typeof fn !== 'function') return;
    window[fnName] = function(category, ...rest) {
      if (isFaceCategory(category)) return; 
      return fn.apply(this, [category, ...rest]);
    };
  };
  [
    'setColor','applyColor','tintCategory','setTint','setHue','setSaturation',
    'setBrightness','colorize','colorLayer','tintLayer','applyTintToCategory'
  ].forEach(wrapNoTint);
  const wrapStyleSetter = (fnName) => {
    const fn = window[fnName];
    if (typeof fn !== 'function') return;
    window[fnName] = function(category, styleObj = {}, ...rest) {
      if (isFaceCategory(category) && styleObj && typeof styleObj === 'object') {
        delete styleObj.filter;
        delete styleObj.mixBlendMode;
        delete styleObj.opacity;
        delete styleObj['--tint'];
        delete styleObj['--hue'];
        delete styleObj['--saturation'];
        delete styleObj['--brightness'];
      }
      return fn.apply(this, [category, styleObj, ...rest]);
    };
  };
  ['setItemStyle','applyStyleToCategory'].forEach(wrapStyleSetter);
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes') {
        const el = m.target;
        if (isFaceEl(el)) sanitizeFaceEl(el);
      }
      if (m.type === 'childList') {
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (isFaceEl(node)) sanitizeFaceEl(node);
          node.querySelectorAll?.('#face-layer-container img, .face, .face1, .face2, .face3')
            .forEach(sanitizeFaceEl);
        });
      }
    }
  });
  mo.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['style','class','data-tint','data-hue','data-saturation','data-brightness']
  });
})();
