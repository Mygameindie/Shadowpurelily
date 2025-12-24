/**************************************************
 * TOY SYSTEM - toy.js (NO LOCK / RELEASE ON LEAVE)
 * - Drag freely
 * - Enter button zone → SHOW base
 * - Stay in zone → KEEP base
 * - Leave zone → HIDE base
 * - Wrapper as anchor (stable position)
 **************************************************/

const TOY_SCROLL_BAR_ID = "toyScrollBar";
const TOY_Z_INDEX = 9999;

/* ---------- CONFIG ---------- */
const SNAP_DISTANCE = 35;     // trigger radius
const FOLLOW_SMOOTH = 0.35;

/* ---------- TOY DATA ---------- */
const toys = [
  { id: "toy1", img: "toy1.png", button: 1, size: 50 },
  { id: "toy2", img: "toy2.png",  button: 2, size: 50 },
  { id: "toy3", img: "toy3.png", button: 3, size: 50 }
];

const activeToys = {}; // id -> { wrapper, toy, state }

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  hideAllSmallButtons();
  buildToyBar();
});

/* ---------------- TOY BAR ---------------- */
function buildToyBar() {
  const bar = document.getElementById(TOY_SCROLL_BAR_ID);
  if (!bar) return;

  bar.innerHTML = "";
  toys.forEach(toy => {
    const btn = document.createElement("button");
    btn.textContent = toy.id;
    btn.onclick = () => toggleToy(toy);
    bar.appendChild(btn);
  });
}

/* ---------------- TOGGLE ---------------- */
function toggleToy(toy) {
  if (activeToys[toy.id]) {
    removeToy(toy.id);
  } else {
    spawnToy(toy);
  }
}

/* ---------------- SPAWN ---------------- */
function spawnToy(toy) {
  /* --- WRAPPER (ANCHOR) --- */
  const wrapper = document.createElement("div");
  wrapper.className = "toy-wrapper";

  const size = toy.size || 100;
  wrapper.style.width = size + "px";
  wrapper.style.height = size + "px";

  wrapper.style.position = "fixed";
  wrapper.style.left = "50%";
  wrapper.style.top = "50%";
  wrapper.style.transform = "translate(-50%, -50%)";
  wrapper.style.zIndex = TOY_Z_INDEX;
  wrapper.style.touchAction = "none";
  wrapper.style.cursor = "grab";
  wrapper.style.userSelect = "none";

  /* --- IMAGE --- */
  const img = document.createElement("img");
  img.src = toy.img;
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";
  img.style.pointerEvents = "none";
  img.draggable = false;

  wrapper.appendChild(img);
  document.body.appendChild(wrapper);

  const state = {
    dragging: false,
    rafId: null,
    offsetX: 0,
    offsetY: 0,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    pressed: false   // true = inside button zone
  };

  activeToys[toy.id] = { wrapper, toy, state };

  enableSmoothDrag(wrapper, toy, state);
  showSmallButton(toy.button);
}

/* ---------------- REMOVE ---------------- */
function removeToy(id) {
  const entry = activeToys[id];
  if (!entry) return;

  // ensure base is released
  if (entry.state.pressed) {
    releaseButton(entry.toy.button);
  }

  entry.wrapper.remove();
  hideSmallButton(entry.toy.button);
  delete activeToys[id];
}

/* ---------------- DRAG ---------------- */
function enableSmoothDrag(el, toy, state) {
  const render = () => {
    state.currentX += (state.targetX - state.currentX) * FOLLOW_SMOOTH;
    state.currentY += (state.targetY - state.currentY) * FOLLOW_SMOOTH;

    el.style.left = state.currentX + "px";
    el.style.top  = state.currentY + "px";

    handleTrigger(el, toy, state);

    if (state.dragging) {
      state.rafId = requestAnimationFrame(render);
    }
  };

  el.addEventListener("pointerdown", e => {
    const r = el.getBoundingClientRect();
    state.dragging = true;

    state.offsetX = e.clientX - r.left;
    state.offsetY = e.clientY - r.top;

    state.currentX = r.left;
    state.currentY = r.top;
    state.targetX = state.currentX;
    state.targetY = state.currentY;

    el.style.transform = "none";
    el.setPointerCapture(e.pointerId);

    state.rafId = requestAnimationFrame(render);
  });

  window.addEventListener("pointermove", e => {
    if (!state.dragging) return;
    state.targetX = e.clientX - state.offsetX;
    state.targetY = e.clientY - state.offsetY;
  });

  window.addEventListener("pointerup", () => {
    if (!state.dragging) return;
    state.dragging = false;
    if (state.rafId) cancelAnimationFrame(state.rafId);
  });
}

/* ---------------- ENTER / LEAVE ZONE ---------------- */
function handleTrigger(wrapper, toy, state) {
  const btn = document.querySelector(".button-" + toy.button);
  if (!btn || btn.classList.contains("hidden")) return;

  const tr = wrapper.getBoundingClientRect();
  const br = btn.getBoundingClientRect();

  const toyCX = tr.left + tr.width / 2;
  const toyCY = tr.top + tr.height / 2;
  const btnCX = br.left + br.width / 2;
  const btnCY = br.top + br.height / 2;

  const dist = Math.hypot(btnCX - toyCX, btnCY - toyCY);

  /* ENTER → SHOW BASE */
  if (!state.pressed && dist <= SNAP_DISTANCE) {
    state.pressed = true;
    pressButton(toy.button);
  }

  /* LEAVE → HIDE BASE */
  if (state.pressed && dist > SNAP_DISTANCE) {
    state.pressed = false;
    releaseButton(toy.button);
  }
}

/* ---------------- BUTTON HELPERS ---------------- */
function pressButton(num) {
  const btn = document.querySelector(".button-" + num);
  if (!btn) return;
  btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
}

function releaseButton(num) {
  const btn = document.querySelector(".button-" + num);
  if (!btn) return;
  btn.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
}

/* ---------------- SMALL BUTTON VISIBILITY ---------------- */
function hideAllSmallButtons() {
  document.querySelectorAll(".small-button")
    .forEach(b => b.classList.add("hidden"));
}

function showSmallButton(num) {
  document.querySelector(".button-" + num)
    ?.classList.remove("hidden");
}

function hideSmallButton(num) {
  document.querySelector(".button-" + num)
    ?.classList.add("hidden");
}