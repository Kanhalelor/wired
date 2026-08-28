/* ==========================================================
   Wired Technologies — SignSight site scripts
   ========================================================== */

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

// ---------- Active nav link ----------
(function highlightActive() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
    if (a.dataset.page === path) a.classList.add("active");
  });
})();

// ---------- Scroll reveal ----------
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && reveals.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// ---------- Caption ticker (signature element) ----------
// Mirrors the HUD caption from the SignSight 3D demo: a sign recognised,
// translated into a short spoken phrase.
const TICKER_SEQUENCE = [
  { sign: "HELLO", phrase: "Hello!" },
  { sign: "THANK YOU", phrase: "Thank you." },
  { sign: "YES", phrase: "Yes." },
  { sign: "NO", phrase: "No." },
  { sign: "HELP", phrase: "I need help." },
];

function initTicker(el) {
  const signEl = el.querySelector(".ticker-sign");
  const phraseEl = el.querySelector(".ticker-phrase");
  if (!signEl || !phraseEl) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = 0;

  function step() {
    const item = TICKER_SEQUENCE[i % TICKER_SEQUENCE.length];
    signEl.textContent = item.sign;
    phraseEl.textContent = `"${item.phrase}"`;
    i++;
  }
  step();
  if (!prefersReduced) setInterval(step, 2200);
}
document.querySelectorAll("[data-ticker]").forEach(initTicker);

// ---------- Footer year ----------
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
