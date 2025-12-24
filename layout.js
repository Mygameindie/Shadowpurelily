// layout.js

window.adjustCanvasLayout = function adjustCanvasLayout() {
  const base = document.querySelector('.base-container');
  const controls = document.querySelector('.controls');
  if (!base || !controls) return;

  const isMobile = window.innerWidth <= 600;
  base.classList.toggle('mobile-layout', isMobile);
  base.classList.toggle('desktop-layout', !isMobile);
  controls.classList.toggle('mobile-controls', isMobile);
  controls.classList.toggle('desktop-controls', !isMobile);
};

window.addEventListener('resize', window.adjustCanvasLayout);