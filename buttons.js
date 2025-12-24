// buttons.js

window.enterGame = function enterGame() {
  document.querySelector('.main-menu')?.style && (document.querySelector('.main-menu').style.display = 'none');
  document.querySelector('.game-container')?.style && (document.querySelector('.game-container').style.display = 'block');

  const audio = document.getElementById("backgroundMusic");
  const musicBtn = document.getElementById("musicToggleButton");
  if (audio && musicBtn && audio.paused) musicBtn.click();
};

function blurButton(event) {
  event.preventDefault();
  event.target.blur();
}

function handleButtonPressRelease(buttonClass, imageId) {
  const button = document.querySelector(buttonClass);
  if (!button) return;

  const press = e => {
    blurButton(e);
    const el = document.getElementById(imageId);
    if (el) el.style.display = 'block';
  };

  const release = e => {
    blurButton(e);
    const el = document.getElementById(imageId);
    if (el) el.style.display = 'none';
  };

  button.addEventListener('mousedown', press);
  button.addEventListener('mouseup', release);
  button.addEventListener('touchstart', press, { passive: false });
  button.addEventListener('touchend', release, { passive: false });
}

document.addEventListener('DOMContentLoaded', () => {
  handleButtonPressRelease('.button-1', 'base2-image');
  handleButtonPressRelease('.button-2', 'base3-image');
  handleButtonPressRelease('.button-3', 'base4-image');
});