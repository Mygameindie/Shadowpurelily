// bootstrap.js

window.loadItemsInBatches = async function loadItemsInBatches(batchSize = 5, delay = 50) {
  const baseContainer = document.querySelector('.base-container');
  const controlsContainer = document.querySelector('.controls');
  if (!baseContainer) return;

  // keep original call
  window.createColorPicker?.();

  for (let i = 0; i < window.jsonFiles.length; i += batchSize) {
    const batch = window.jsonFiles.slice(i, i + batchSize);

    await Promise.all(batch.map(async file => {
      const data = await window.loadItemFile(file);
      const categoryName = file.replace('.json', '');
      const fragment = document.createDocumentFragment();

      data.forEach(item => {
        const itemId = item.id.endsWith('.png') ? item.id : `${item.id}.png`;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.id = itemId;
        img.src = item.src;
        img.alt = item.alt || itemId;
        img.className = categoryName;
        img.setAttribute('data-file', file);
        img.style.visibility = item.visibility === "visible" ? "visible" : "hidden";
        img.style.position = 'absolute';
        img.style.zIndex = window.getZIndex(categoryName);

        fragment.appendChild(img);

        if (controlsContainer) {
          let panel = document.getElementById(`panel-${categoryName}`);
          if (!panel) {
            panel = document.createElement('div');
            panel.id = `panel-${categoryName}`;

            const h3 = document.createElement('h3');
            h3.textContent = categoryName;
            panel.appendChild(h3);

            controlsContainer.appendChild(panel);
          }

          const buttonContainer = document.createElement('div');
          buttonContainer.classList.add('button-container');

          const buttonWrap = document.createElement('div');
          buttonWrap.classList.add('button-wrap');

          const button = document.createElement('img');
          const buttonFile = item.src.replace('.png', 'b.png');
          button.src = buttonFile;
          button.alt = (item.alt || '') + ' Button';
          button.classList.add('item-button');
          button.onclick = () => window.toggleVisibility(itemId, categoryName);
          buttonWrap.appendChild(button);

          const colorButton = document.createElement('button');
          colorButton.textContent = '🎨';
          colorButton.classList.add('color-change-button');
          colorButton.onclick = (e) => {
            e.stopPropagation();
            const targetItem = document.getElementById(itemId);
            if (targetItem && targetItem.style.visibility === 'hidden') {
              window.toggleVisibility(itemId, categoryName);
            }
            window.showColorPicker(itemId);
          };
          buttonWrap.appendChild(colorButton);

          buttonContainer.appendChild(buttonWrap);
          panel.appendChild(buttonContainer);
        }
      });

      baseContainer.appendChild(fragment);
    }));

    await new Promise(res => setTimeout(res, delay));
  }

  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
  window.adjustCanvasLayout?.();
});

window.addEventListener('load', () => {
  window.loadItemsInBatches?.();
  window.adjustCanvasLayout?.();
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
});