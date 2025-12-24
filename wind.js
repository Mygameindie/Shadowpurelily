function applyWindEffect() {
  for (let i = 1; i <= 10; i++) {
    const pairs = [
      [`skirt1_${i}.png`,`skirt1_${i}w.png`],
      [`dress1_${i}.png`,`dress1_${i}w.png`],
      [`skirt2_${i}.png`,`skirt2_${i}w.png`],
      [`dress2_${i}.png`,`dress2_${i}w.png`],
      [`skirt3_${i}.png`,`skirt3_${i}w.png`],
      [`dress3_${i}.png`,`dress3_${i}w.png`],
    ];
    pairs.forEach(([normalId, windId]) => {
      const normal = document.getElementById(normalId);
      const wind = document.getElementById(windId);
      if (normal && wind && normal.style.visibility === 'visible') {
        normal.style.visibility = 'hidden';
        wind.style.visibility = 'visible';
      }
    });
  }
}
function removeWindEffect() {
  for (let i = 1; i <= 10; i++) {
    const pairs = [
      [`skirt1_${i}w.png`,`skirt1_${i}.png`],
      [`dress1_${i}w.png`,`dress1_${i}.png`],
      [`skirt2_${i}w.png`,`skirt2_${i}.png`],
      [`dress2_${i}w.png`,`dress2_${i}.png`],
      [`skirt3_${i}w.png`,`skirt3_${i}.png`],
      [`dress3_${i}w.png`,`dress3_${i}.png`],
    ];
    pairs.forEach(([windId, normalId]) => {
      const wind = document.getElementById(windId);
      const normal = document.getElementById(normalId);
      if (wind && normal && wind.style.visibility === 'visible') {
        wind.style.visibility = 'hidden';
        normal.style.visibility = 'visible';
      }
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const windButton = document.getElementById("wind-button");
  if (!windButton) return;
  windButton.addEventListener("mousedown", applyWindEffect);
  windButton.addEventListener("mouseup", removeWindEffect);
  windButton.addEventListener("mouseleave", removeWindEffect);
  windButton.addEventListener("touchstart", e => { e.preventDefault(); applyWindEffect(); }, { passive: false });
  windButton.addEventListener("touchend",   e => { e.preventDefault(); removeWindEffect(); }, { passive: false });
});
