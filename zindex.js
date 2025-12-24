// zindex.js

window.getZIndex = function getZIndex(categoryName) {
  const base = String(categoryName).replace(/\d+w?$/,'');
  const zIndexMap = {
    stocking: 20,
    bottomunderwear: 30,
    topunderwear: 40,
    onepiece: 50,
    socks: 55,
    boxers: 60,
    sweatshirt: 70,
    shoes: 80,
    pants: 90,
    skirt: 100,
    top: 110,
    dress: 130,
    jacket: 140,
    accessories: 150,
    hat: 160,
    mask: 170,
    bow: 180,
	bunnysuitbow: 190
	
  };
  return zIndexMap[base] || 0;
};

// --- keep original override exactly as in your file ---
const _origGetZ = window.getZIndex;
window.getZIndex = function(categoryName){
  const base = String(categoryName).replace(/\d+w?$/,'');
  if (base === 'face') return 8;
  return _origGetZ(categoryName);
};