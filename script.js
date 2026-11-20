// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
menuBtn.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", false);
  })
);

// Hero animation: three beacons send out signal rings,
// and a point is estimated where the rings meet (indoor positioning idea).
const canvas = document.getElementById("signalCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const beacons = [
  { x: 90, y: 90 },
  { x: W - 90, y: 120 },
  { x: W / 2, y: H - 70 },
];
const target = { x: W / 2 + 20, y: H / 2 - 10 };
const radii = beacons.map((b) => Math.hypot(b.x - target.x, b.y - target.y));
const css = getComputedStyle(document.documentElement);
const ACCENT = css.getPropertyValue("--accent").trim();
const SIGNAL = css.getPropertyValue("--signal").trim();
const LINE = css.getPropertyValue("--line").trim();
const INK = css.getPropertyValue("--ink").trim();

function draw(t) {
  ctx.clearRect(0, 0, W, H);

  // faint grid (floor plan)
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // progress 0..1 for the ring growth, then hold
  const p = Math.min(t / 2500, 1);

  beacons.forEach((b, i) => {
    // pulsing outer rings
    for (let k = 0; k < 2; k++) {
      const phase = ((t / 2500 + k * 0.5) % 1);
      ctx.strokeStyle = ACCENT;
      ctx.globalAlpha = 0.25 * (1 - phase);
      ctx.beginPath();
      ctx.arc(b.x, b.y, 20 + phase * 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, radii[i] * p, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // estimated position appears once the rings meet
  if (p >= 1) {
    ctx.fillStyle = SIGNAL;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) {
  draw(5000); // show the final picture without animating
} else {
  const start = performance.now();
  (function loop(now) {
    draw(now - start);
    requestAnimationFrame(loop);
  })(start);
}
