// visibility.js

window.currentlySelectedItem = null;

window.hideSpecificCategories = function hideSpecificCategories(categories) {
  categories.forEach(category => {
    document.querySelectorAll(`.${category}`).forEach(item => {
      item.style.visibility = 'hidden';
    });
  });
};

window.toggleVisibility = function toggleVisibility(itemId, categoryName) {
  document.querySelectorAll(`.${categoryName}`).forEach(item => {
    if (item.id !== itemId) item.style.visibility = 'hidden';
  });

  const selectedItem = document.getElementById(itemId);
  if (!selectedItem) return;

  selectedItem.style.visibility =
    selectedItem.style.visibility === 'visible' ? 'hidden' : 'visible';

  if (selectedItem.style.visibility === 'visible') {
    const hideMap = {
      onepiece1: ['topunderwear1','bottomunderwear1'],
      onepiece3: ['topunderwear3','bottomunderwear3'],
      topunderwear1: ['onepiece1'],
      bottomunderwear1: ['onepiece1'],
      topunderwear3: ['onepiece3'],
      bottomunderwear3: ['onepiece3'],
      dress1: ['top1','pants1','skirt1','sweatshirt1','bunnysuitbow1'],
      dress2: ['top2','pants2','skirt2','sweatshirt2','bunnysuitbow2'],
      dress3: ['top3','pants3','skirt3','sweatshirt3','bunnysuitbow3'],
      bunnysuitbow1: ['dress1','jacket1'],
      bunnysuitbow2: ['dress2','jacket2'],
      bunnysuitbow3: ['dress3','jacket3'],
      jacket1: ['bunnysuitbow1'],
      jacket2: ['bunnysuitbow2'],
      jacket3: ['bunnysuitbow3'],
      stocking1: ['socks1'],
      socks1: ['stocking1'],
      stocking2: ['socks2'],
      socks2: ['stocking2'],
      stocking3: ['socks3'],
      socks3: ['stocking3'],
      pants1: ['skirt1'],
      skirt1: ['pants1'],
      pants2: ['skirt2'],
      skirt2: ['pants2'],
      pants3: ['skirt3'],
      skirt3: ['pants3']
    };

    if (hideMap[categoryName]) {
      window.hideSpecificCategories(hideMap[categoryName]);
    } else if (
      categoryName.startsWith('top1') || categoryName.startsWith('pants1') ||
      categoryName.startsWith('skirt1') || categoryName.startsWith('sweatshirt1')
    ) {
      window.hideSpecificCategories(['dress1']);
    } else if (
      categoryName.startsWith('top2') || categoryName.startsWith('pants2') ||
      categoryName.startsWith('skirt2') || categoryName.startsWith('sweatshirt2')
    ) {
      window.hideSpecificCategories(['dress2']);
    } else if (
      categoryName.startsWith('top3') || categoryName.startsWith('pants3') ||
      categoryName.startsWith('skirt3') || categoryName.startsWith('sweatshirt3')
    ) {
      window.hideSpecificCategories(['dress3']);
    }
  }
};