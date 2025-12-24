// colorpicker.js

// --- block 1: IIFE ที่ทำ buildPickerOnce + expose createColorPicker (เหมือนเดิม) ---
(() => {
  try {
    if (!('currentlySelectedItem' in window)) {
      Object.defineProperty(window, 'currentlySelectedItem', {
        get(){ try { return typeof window.currentlySelectedItem !== 'undefined' ? window.currentlySelectedItem : null; } catch(e){ return null; } },
        set(v){ try { window.currentlySelectedItem = v; } catch(e) { } }
      });
    }
  } catch (e) { }

  function buildPickerOnce() {
    if (document.querySelector('.color-picker-container')) return;
    const container = document.createElement('div');
    container.className = 'color-picker-container';
    container.style.display = 'none';

    const title = document.createElement('h4');
    title.textContent = 'Choose Color:';
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'color-grid';

    (window.colorPalette || []).forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'color-button';
      btn.textContent = c.name;
      btn.onclick = () => window.applyColorToItem?.(c.value);
      grid.appendChild(btn);
    });

    container.appendChild(grid);

    const close = document.createElement('button');
    close.className = 'close-color-picker';
    close.textContent = 'Close';
    close.onclick = () => window.hideColorPicker?.();
    container.appendChild(close);

    (document.querySelector('.controls') || document.body).appendChild(container);
  }

  window.createColorPicker = function() { buildPickerOnce(); };
  buildPickerOnce();
})();

// --- block 2: ฟังก์ชันชุดหลักที่คุณใช้จริง (show/hide + setItemNamedColor) ---
function createColorPicker() {
  if (document.querySelector('.color-picker-container')) return;

  const container = document.createElement('div');
  container.classList.add('color-picker-container');
  container.style.display = 'none';

  const title = document.createElement('h4');
  title.textContent = 'Choose Color:';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.classList.add('color-grid');

  (window.colorPalette || []).forEach(color => {
    const btn = document.createElement('button');
    btn.classList.add('color-button');
    btn.textContent = color.name;
    btn.onclick = () => {
      if (!window.currentlySelectedItem) return;
      window.setItemNamedColor(window.currentlySelectedItem, color.name);
      hideColorPicker();
    };
    grid.appendChild(btn);
  });

  container.appendChild(grid);

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.classList.add('close-color-picker');
  close.onclick = hideColorPicker;
  container.appendChild(close);

  const host = document.querySelector('.controls') || document.body;
  host.appendChild(container);
}

function ensureColorPicker() {
  if (!document.querySelector('.color-picker-container')) createColorPicker();
}

window.showColorPicker = function showColorPicker(itemId) {
  window.currentlySelectedItem = itemId;
  ensureColorPicker();
  const el = document.querySelector('.color-picker-container');
  if (el) el.style.display = 'block';
};

window.hideColorPicker = function hideColorPicker() {
  const el = document.querySelector('.color-picker-container');
  if (el) el.style.display = 'none';
  window.currentlySelectedItem = null;
};

document.addEventListener('DOMContentLoaded', ensureColorPicker);