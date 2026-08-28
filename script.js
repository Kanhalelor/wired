/* ==========================================================
   Lightweight Prezi-style zoom/pan presentation engine.
   Each .slide carries data-scale / data-x / data-y. We move a
   large canvas under a fixed viewport, scaling + translating
   it so the target slide's coordinates land centred at 1x.
   ========================================================== */

const canvas = document.getElementById("canvas");
const slides = Array.from(document.querySelectorAll(".slide"));
const progress = document.getElementById("progress");
const slideCount = document.getElementById("slideCount");
const viewport = document.getElementById("viewport");

let index = 0;

// Place each slide at its own data-x / data-y position within the canvas.
// (Without this, every slide sits at 0,0 and they all stack on top of
// each other — the canvas transform below only pans/zooms the "camera",
// it doesn't spread the slides out.)
slides.forEach((slide) => {
  const x = parseFloat(slide.dataset.x || "0");
  const y = parseFloat(slide.dataset.y || "0");
  slide.style.left = `${x}px`;
  slide.style.top = `${y}px`;
});

function goTo(i) {
  index = Math.max(0, Math.min(slides.length - 1, i));
  const slide = slides[index];
  const scale = parseFloat(slide.dataset.scale || "1");
  const x = parseFloat(slide.dataset.x || "0");
  const y = parseFloat(slide.dataset.y || "0");

  // Translate the whole canvas so the slide's (x,y) sits at origin,
  // then scale up — this produces the "zoom toward a point" feel.
  canvas.style.transform =
    `translate(${-x * scale}px, ${-y * scale}px) scale(${scale})`;

  slides.forEach((s, si) => s.classList.toggle("active", si === index));
  progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  slideCount.textContent = `${index + 1} / ${slides.length}`;
}

function next() { goTo(index + 1); }
function prev() { goTo(index - 1); }

window.addEventListener("keydown", (e) => {
  if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); next(); }
  if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
  if (e.key === "Home") goTo(0);
  if (e.key === "End") goTo(slides.length - 1);
});

// Click right half = next, left half = previous (ignore clicks on links/placeholders text selection)
viewport.addEventListener("click", (e) => {
  const w = window.innerWidth;
  if (e.clientX > w / 2) next(); else prev();
});

// Basic touch swipe support
let touchStartX = null;
viewport.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
viewport.addEventListener("touchend", (e) => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  touchStartX = null;
}, { passive: true });

// Initial position
goTo(0);
