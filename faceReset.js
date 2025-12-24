// faceReset.js

(() => {
  function hideFaces() {
    document.querySelectorAll('.face1, .face2, .face3').forEach(el => el.style.visibility = 'hidden');
  }

  function showFaceGroup(groupClass) {
    hideFaces();
    document.querySelectorAll('.' + groupClass).forEach(el => el.style.visibility = 'visible');
  }

  // keep exactly as your original: only resetToBase1 is exposed
  window.resetToBase1 = function() {
    document.getElementById('base-image').style.display = 'block';
    document.getElementById('base2-image').style.display = 'none';
	    if (document.getElementById('base4-image')) {
    document.getElementById('base3-image').style.display = 'none';

      document.getElementById('base4-image').style.display = 'none';
    }

    // reset counters
    base2ClickCount = 0;
    base4ShowCount = 0;

    hideFaces();
  };
})();