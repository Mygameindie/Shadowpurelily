// enhanceColorPicker.js

(() => {
  function enhanceColorPicker() {
    const picker = document.querySelector('.color-picker-container');
    if (!picker) return false;

    const grid = picker.querySelector('.color-grid');
    if (!grid) return false;

    const btns = Array.from(grid.querySelectorAll('.color-button'));
    if (!btns.length) return false;

    btns.forEach((btn) => {
      const name = (btn.textContent || '').trim();
      const hex = (window.SWATCH_HEX?.[name]) ?? null;

      btn.innerHTML = `<span class="visually-hidden">${name}</span>`;
      btn.setAttribute('aria-label', name);
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.title = name;

      if (name === 'Original') {
        btn.classList.add('original');
        btn.style.background = '';
      } else if (hex) {
        btn.style.background = hex;
      }

      const originalOnclick = btn.onclick;
      btn.onclick = async (e) => {
        e.stopPropagation();
        if (!window.currentlySelectedItem) {
          originalOnclick?.(e);
          return;
        }
        try {
          await window.setItemNamedColor(window.currentlySelectedItem, name);
        } catch {
          originalOnclick?.(e);
        }
        btns.forEach(b => b.setAttribute('aria-checked', 'false'));
        btn.setAttribute('aria-checked', 'true');
        window.hideColorPicker?.();
      };
    });

    grid.dataset.enhanced = '1';
    return true;
  }

  const tryEnhance = () => {
    if (document.querySelector('.color-grid[data-enhanced="1"]')) return;
    enhanceColorPicker();
  };

  window.addEventListener('load', tryEnhance);

  const mo = new MutationObserver(() => tryEnhance());
  mo.observe(document.body, { childList: true, subtree: true });
})();