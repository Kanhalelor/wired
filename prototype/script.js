import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ==========================================================
   SignSight — conceptual smart glasses 3D prototype
   Pure Three.js, procedural geometry (no external models).
   ========================================================== */

const canvas = document.getElementById("glCanvas");
const stage = document.querySelector(".stage");

let currentTheme = "dark";

const scene = new THREE.Scene();
setBackground();

const camera = new THREE.PerspectiveCamera(40, stage.clientWidth / stage.clientHeight, 0.1, 100);
camera.position.set(0, 0.4, 5.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.6;
controls.maxDistance = 9;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;

/* ---------------- Lighting ---------------- */
const key = new THREE.DirectionalLight(0xffffff, 1.4);
key.position.set(3, 4, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x7c9dff, 1.1);
rim.position.set(-4, 2, -3);
scene.add(rim);

const fill = new THREE.AmbientLight(0x8899aa, 0.55);
scene.add(fill);

const glow = new THREE.PointLight(0x4fd1c5, 2.2, 6);
glow.position.set(0, 0.2, 1.6);
scene.add(glow);

/* ---------------- Materials ---------------- */
const frameMat = new THREE.MeshPhysicalMaterial({
  color: 0x1a1f26,
  metalness: 0.65,
  roughness: 0.28,
  clearcoat: 0.6,
  clearcoatRoughness: 0.25,
});

const lensMat = new THREE.MeshPhysicalMaterial({
  color: 0x0d2b2b,
  metalness: 0.1,
  roughness: 0.05,
  transmission: 0.75,
  thickness: 0.4,
  transparent: true,
  opacity: 0.85,
  clearcoat: 1,
});

const accentMat = new THREE.MeshStandardMaterial({
  color: 0x4fd1c5,
  emissive: 0x2fb3a8,
  emissiveIntensity: 1.2,
  metalness: 0.3,
  roughness: 0.3,
});

const cameraLensMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a0a,
  metalness: 0.9,
  roughness: 0.15,
});

/* ---------------- Glasses group ---------------- */
const glasses = new THREE.Group();
scene.add(glasses);

function lensShape() {
  const shape = new THREE.Shape();
  const w = 0.62, h = 0.46, r = 0.22;
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return shape;
}

function buildLensAssembly(xOffset) {
  const group = new THREE.Group();

  const frameGeo = new THREE.ExtrudeGeometry(lensShape(), {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 3,
    curveSegments: 12,
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(xOffset, 0, 0);
  group.add(frame);

  const lensGeo = new THREE.ExtrudeGeometry(lensShape(), {
    depth: 0.02,
    bevelEnabled: false,
    curveSegments: 12,
  });
  // shrink slightly so it sits inside frame visually
  lensGeo.scale(0.88, 0.88, 1);
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.position.set(xOffset, 0, 0.035);
  group.add(lens);

  return group;
}

const leftLens = buildLensAssembly(-0.42);
const rightLens = buildLensAssembly(0.42);
glasses.add(leftLens, rightLens);

// Bridge
const bridgeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 12);
const bridge = new THREE.Mesh(bridgeGeo, frameMat);
bridge.rotation.z = Math.PI / 2;
bridge.position.set(0, 0.05, 0.02);
glasses.add(bridge);

// Temples (arms)
function buildTemple(side) {
  const group = new THREE.Group();
  const armGeo = new THREE.CapsuleGeometry(0.028, 1.05, 4, 8);
  const arm = new THREE.Mesh(armGeo, frameMat);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(side * (0.42 + 0.55), 0, -0.05);
  group.add(arm);

  // ear tip
  const tipGeo = new THREE.CapsuleGeometry(0.03, 0.18, 4, 8);
  const tip = new THREE.Mesh(tipGeo, frameMat);
  tip.rotation.x = Math.PI / 2.6;
  tip.position.set(side * (0.42 + 1.08), -0.08, -0.16);
  group.add(tip);

  return group;
}
glasses.add(buildTemple(-1), buildTemple(1));

// Front camera module (on right lens frame, wearer's right)
const camModule = new THREE.Group();
const camBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 20), frameMat);
camBody.rotation.x = Math.PI / 2;
camModule.add(camBody);
const camGlass = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), cameraLensMat);
camGlass.position.z = 0.026;
camModule.add(camGlass);
camModule.position.set(0.72, 0.22, 0.05);
glasses.add(camModule);

// Speaker / bone-conduction pad (near left temple tip)
const speakerPad = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.12, 4, 10), accentMat.clone());
speakerPad.material.emissiveIntensity = 0.5;
speakerPad.rotation.z = Math.PI / 2;
speakerPad.position.set(-1.42, -0.08, -0.16);
glasses.add(speakerPad);

// Battery module (opposite temple, slightly thicker section)
const batteryMod = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.22, 4, 10), frameMat);
batteryMod.rotation.z = Math.PI / 2;
batteryMod.position.set(1.42, -0.02, -0.1);
glasses.add(batteryMod);

// Connectivity chip glow (small accent near bridge top)
const connChip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), accentMat.clone());
connChip.position.set(0.18, 0.16, 0.05);
glasses.add(connChip);

// AI processor accent (subtle glowing strip along inner right frame)
const aiChip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.02), accentMat.clone());
aiChip.position.set(-0.42, -0.18, 0.06);
glasses.add(aiChip);

// Soft floating glow ring behind glasses for "futuristic" feel
const ringGeo = new THREE.TorusGeometry(1.35, 0.006, 8, 100);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x4fd1c5, transparent: true, opacity: 0.35 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.position.z = -0.3;
scene.add(ring);

glasses.scale.setScalar(1.15);

/* ---------------- Hotspot 3D anchor points ----------------
   For simplicity/perf we project fixed 3D anchor points to screen space
   every frame so the HTML hotspot buttons track the rotating model. */
const anchors = {
  camera: new THREE.Object3D(),
  ai: new THREE.Object3D(),
  speaker: new THREE.Object3D(),
  battery: new THREE.Object3D(),
  connectivity: new THREE.Object3D(),
};
anchors.camera.position.copy(camModule.position);
anchors.ai.position.copy(aiChip.position);
anchors.speaker.position.copy(speakerPad.position);
anchors.battery.position.copy(batteryMod.position);
anchors.connectivity.position.copy(connChip.position);
Object.values(anchors).forEach((a) => glasses.add(a));

const hotspotEls = {};
document.querySelectorAll(".hotspot").forEach((el) => {
  hotspotEls[el.dataset.part] = el;
});

function updateHotspotPositions() {
  const rect = stage.getBoundingClientRect();
  for (const key of Object.keys(anchors)) {
    const world = new THREE.Vector3();
    anchors[key].getWorldPosition(world);
    world.project(camera);
    const visible = world.z < 1;
    const x = (world.x * 0.5 + 0.5) * 100;
    const y = (-(world.y * 0.5) + 0.5) * 100;
    const el = hotspotEls[key];
    if (!el) continue;
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.display = visible ? "flex" : "none";
  }
}

/* ---------------- Resize ---------------- */
function onResize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", onResize);

/* ---------------- Render loop ---------------- */
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  glow.intensity = 1.8 + Math.sin(t * 2) * 0.4;
  ring.rotation.z = t * 0.05;
  connChip.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4;
  controls.update();
  updateHotspotPositions();
  renderer.render(scene, camera);
}
animate();

/* ==========================================================
   Hotspot info content
   ========================================================== */
const PARTS = {
  camera: {
    title: "Miniature Camera",
    body: "A discreet, forward‑facing camera captures the wearer's hand shape, orientation and motion in real time, feeding frames to the on‑device recognition model.",
    specs: ["<b>Field of view:</b> ~90° wide‑angle", "<b>Frame rate:</b> 30–60 fps (concept target)", "<b>Placement:</b> upper‑right rim, out of the line of sight"],
  },
  ai: {
    title: "On‑device AI",
    body: "A lightweight gesture‑recognition model runs locally, matching motion patterns against a small vocabulary of basic signs — no internet connection required.",
    specs: ["<b>Vocabulary (demo):</b> Hello, Thank you, Yes, No, Help", "<b>Processing:</b> fully on‑device for privacy and low latency", "<b>Target latency:</b> under 1 second per sign"],
  },
  speaker: {
    title: "Bone‑Conduction Speaker",
    body: "Recognised phrases are spoken aloud through a bone‑conduction transducer resting near the temple, leaving the ear canal open for ambient classroom sound.",
    specs: ["<b>Type:</b> bone‑conduction (open‑ear)", "<b>Benefit:</b> doesn't block hearing aids or ambient audio", "<b>Output:</b> browser Web Speech API in this demo"],
  },
  battery: {
    title: "Battery Module",
    body: "A slim battery is integrated into the temple arm, balanced for all‑day classroom wear without adding noticeable weight.",
    specs: ["<b>Target life:</b> full school day (concept goal)", "<b>Charging:</b> USB‑C, opposite temple tip", "<b>Weight budget:</b> kept under standard eyewear norms"],
  },
  connectivity: {
    title: "Connectivity",
    body: "An optional low‑power wireless link allows the glasses to sync vocabulary updates or pair with a companion app, while core recognition stays fully offline.",
    specs: ["<b>Link:</b> Bluetooth Low Energy (concept)", "<b>Offline‑first:</b> core translation needs no network", "<b>Use case:</b> vocabulary packs, classroom pairing"],
  },
};

const panelDefault = document.getElementById("panelDefault");
const panelDetail = document.getElementById("panelDetail");
const detailTitle = document.getElementById("detailTitle");
const detailBody = document.getElementById("detailBody");
const detailSpecs = document.getElementById("detailSpecs");
const backBtn = document.getElementById("backBtn");

function showPart(key) {
  const data = PARTS[key];
  if (!data) return;
  detailTitle.textContent = data.title;
  detailBody.textContent = data.body;
  detailSpecs.innerHTML = data.specs.map((s) => `<li>${s}</li>`).join("");
  panelDefault.hidden = true;
  panelDetail.hidden = false;
}
backBtn.addEventListener("click", () => {
  panelDetail.hidden = true;
  panelDefault.hidden = false;
});
Object.values(hotspotEls).forEach((el) => {
  el.addEventListener("click", () => showPart(el.dataset.part));
});

/* ==========================================================
   Demo Mode — simulated recognition + Web Speech API
   ========================================================== */
const demoBtn = document.getElementById("demoBtn");
const demoStatus = document.getElementById("demoStatus");
const demoWordEl = document.getElementById("demoWord");
const hudText = document.getElementById("hudText");
const hudCaption = document.getElementById("hudCaption");

const DEMO_SEQUENCE = [
  { sign: "Hello", phrase: "Hello!" },
  { sign: "Thank you", phrase: "Thank you." },
  { sign: "Yes", phrase: "Yes." },
  { sign: "No", phrase: "No." },
  { sign: "Help", phrase: "I need help." },
];

let demoRunning = false;

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.98;
  utter.pitch = 1.0;
  window.speechSynthesis.speak(utter);
}

function flashAccent() {
  connChip.material.emissiveIntensity = 3;
  glow.intensity = 4;
}

async function runDemo() {
  demoRunning = true;
  demoBtn.disabled = true;
  demoBtn.textContent = "Running demo…";
  demoStatus.hidden = false;

  for (const step of DEMO_SEQUENCE) {
    if (!demoRunning) break;
    demoWordEl.textContent = step.sign;
    hudText.textContent = `Recognised: "${step.sign}"`;
    hudCaption.style.borderColor = "rgba(79,209,197,0.9)";
    flashAccent();
    await wait(650);
    hudText.textContent = `🔊 "${step.phrase}"`;
    speak(step.phrase);
    await wait(1400);
  }

  hudText.textContent = "Point at a sign to begin…";
  hudCaption.style.borderColor = "rgba(79,209,197,0.4)";
  demoWordEl.textContent = "—";
  demoBtn.disabled = false;
  demoBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Start Demo Mode`;
  demoRunning = false;
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

demoBtn.addEventListener("click", () => {
  if (!demoRunning) runDemo();
});

/* ==========================================================
   View toggle: Classroom vs Everyday
   ========================================================== */
const viewToggle = document.getElementById("viewToggle");
viewToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".segmented-btn");
  if (!btn) return;
  viewToggle.querySelectorAll(".segmented-btn").forEach((b) => {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
  });
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");

  if (btn.dataset.view === "classroom") {
    key.intensity = 1.4;
    fill.intensity = 0.55;
    controls.autoRotateSpeed = 0.8;
  } else {
    // Everyday: warmer, brighter, slightly faster spin to suggest mobility
    key.intensity = 1.7;
    fill.intensity = 0.8;
    controls.autoRotateSpeed = 1.4;
  }
});

/* ==========================================================
   Theme toggle
   ========================================================== */
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.classList.toggle("theme-light", currentTheme === "light");
  document.body.classList.toggle("theme-dark", currentTheme === "dark");
  setBackground();
});

function setBackground() {
  scene.background = null; // keep transparent so CSS gradient shows through
  scene.fog = new THREE.Fog(currentTheme === "dark" ? 0x0b0f14 : 0xf4f7fa, 6, 14);
}

/* Pause autorotate while user is interacting */
controls.addEventListener("start", () => (controls.autoRotate = false));
controls.addEventListener("end", () => {
  setTimeout(() => (controls.autoRotate = true), 2500);
});
