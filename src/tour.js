// src/tour.js
// Tour Guide controller — manages tour state, UI, and zoom navigation.

import { TOUR_STEPS, TOUR_REGIONS } from "./tour-data.js";
import "./tour.css";

// ---- Helpers ----

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Convert simple markdown text to HTML (paragraphs + blockquotes). */
function markdownToHtml(raw) {
  if (!raw) return "";
  const blocks = raw.split(/\n\n+/);
  return blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    // Blockquote
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.replace(/^> ?/gm, "");
      return `<blockquote>${escapeHtml(quoteText)}</blockquote>`;
    }
    // Regular paragraph — convert single newlines to <br>
    return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br>")}</p>`;
  }).join("");
}

// ---- Constants ----
const MAX_VISIBLE_DOTS = 7;

// ---- State ----
let _tourActive = false;
let _tourStep = 0;
let _zoomToRegion = null;     // injected from main.js
let _getViewDomain = null;    // injected from main.js
let _contextualStepIndex = -1; // which step the contextual label refers to

// ---- DOM refs ----
let els = {};

export function initTour({ zoomToRegion, vd }) {
  _zoomToRegion = zoomToRegion;
  _getViewDomain = vd;

  els = {
    header:      document.getElementById("tour-header"),
    box:         document.getElementById("tour-box"),
    close:       document.getElementById("tour-close"),
    content:     document.getElementById("tour-content"),
    title:       document.getElementById("tour-title"),
    text:        document.getElementById("tour-text"),
    prev:        document.getElementById("tour-prev"),
    nextLabel:   document.getElementById("tour-next-label"),
    dots:        document.getElementById("tour-dots"),
    startBtn:    document.getElementById("tour-start-btn"),
    startLabel:  document.getElementById("tour-start-label"),
  };

  // Build progress dots
  TOUR_STEPS.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "tour-dot";
    dot.addEventListener("click", () => goToStep(i));
    els.dots.appendChild(dot);
  });

  // Wire up buttons
  els.close.addEventListener("click", closeTour);
  els.prev.addEventListener("click", prevStep);
  els.nextLabel.addEventListener("click", nextStep);
  els.startBtn.addEventListener("click", onStartButtonClick);

  // Mobile swipe on tour box
  setupSwipe(els.box);

  // Always auto-show tour after intro animation
  setTimeout(() => {
    if (!_tourActive) startTour(0, true);
  }, 1000);
}

// ---- Public API ----

export function onObjectClick() {
  // Tour only closes via explicit user action (X button or Finish)
}

export function isTourActive() {
  return _tourActive;
}

export function updateStartButtonLabel() {
  if (_tourActive || !els.startLabel) return;

  const d = _getViewDomain ? _getViewDomain() : null;
  if (!d) {
    _contextualStepIndex = -1;
    els.startLabel.textContent = "Start the tour";
    return;
  }

  const cx = (d.x0 + d.x1) / 2;
  const cy = (d.y0 + d.y1) / 2;

  for (const region of TOUR_REGIONS) {
    if (cx >= region.x[0] && cx <= region.x[1] &&
        cy >= region.y[0] && cy <= region.y[1]) {
      _contextualStepIndex = region.stepIndex;
      els.startLabel.textContent = region.label;
      return;
    }
  }

  _contextualStepIndex = -1;
  els.startLabel.textContent = "Start the tour";
}

// ---- Internal ----

function startTour(stepIndex, skipNav) {
  _tourActive = true;
  _tourStep = stepIndex;

  els.box.classList.remove("tour-hidden");
  els.box.classList.add("tour-entering");
  els.startBtn.classList.add("tour-hidden");

  els.header.classList.remove("tour-hidden");
  els.header.classList.add("tour-entering");

  renderStep();
  if (!skipNav) navigateToStep(_tourStep);

  setTimeout(() => {
    els.box.classList.remove("tour-entering");
    els.header.classList.remove("tour-entering");
  }, 1200);
}

function closeTour() {
  _tourActive = false;
  els.box.classList.add("tour-hidden");
  els.header.classList.add("tour-hidden");
  els.box.classList.remove("tour-intro");
  localStorage.setItem("tri-tour-seen", "1");
  showStartButton();
}

function showStartButton() {
  els.startBtn.classList.remove("tour-hidden");
  updateStartButtonLabel();
}

function onStartButtonClick() {
  if (_contextualStepIndex >= 0) {
    startTour(_contextualStepIndex);
  } else if (_tourStep > 0) {
    startTour(_tourStep);
  } else {
    startTour(0);
  }
}

function nextStep() {
  if (_tourStep >= TOUR_STEPS.length - 1) {
    closeTour();
    return;
  }
  _tourStep++;
  renderStep();
  navigateToStep(_tourStep);
}

function prevStep() {
  if (_tourStep > 0) {
    _tourStep--;
    renderStep();
    navigateToStep(_tourStep);
  }
}

function goToStep(index) {
  if (index >= 0 && index < TOUR_STEPS.length) {
    _tourStep = index;
    renderStep();
    navigateToStep(_tourStep);
  }
}

let _firstRender = true;

function renderStep() {
  const step = TOUR_STEPS[_tourStep];

  function applyContent() {
    // Title — hide on intro step
    if (step.title) {
      els.title.textContent = step.title;
      els.title.style.display = "";
    } else {
      els.title.textContent = "";
      els.title.style.display = "none";
    }

    // Text — render markdown as HTML
    els.text.innerHTML = markdownToHtml(step.text);
    els.text.scrollTop = 0;

    // Intro step: taller box, hide prev + dots, CTA style
    if (step.isIntro) {
      els.box.classList.add("tour-intro");
      els.prev.style.display = "none";
      els.dots.style.display = "none";
      els.nextLabel.textContent = step.nextLabel || "Start Tour";
      els.nextLabel.classList.add("tour-cta");
    } else {
      els.box.classList.remove("tour-intro");
      els.prev.style.display = "";
      els.dots.style.display = "";
      els.nextLabel.classList.remove("tour-cta");

      // Prev button
      els.prev.disabled = _tourStep <= 1; // disable on first real step (after intro)

      // Next button label
      if (_tourStep >= TOUR_STEPS.length - 1) {
        els.nextLabel.textContent = "Finish";
      } else {
        const nextLabel = step.nextLabel || "Next";
        els.nextLabel.innerHTML = nextLabel + " &rarr;";
      }
    }

    // Sliding progress dots (Instagram-style)
    updateDots();

    // Header (title + subtitle) only visible on the opening step
    if (_tourStep === 0) {
      els.header.classList.remove("tour-hidden");
    } else {
      els.header.classList.add("tour-hidden");
    }
  }

  if (_firstRender) {
    _firstRender = false;
    applyContent();
    return;
  }

  // Animate: exit old content, then enter new
  els.content.classList.add("step-exit");
  setTimeout(() => {
    applyContent();
    els.content.classList.remove("step-exit");
    els.content.classList.add("step-enter");
    setTimeout(() => els.content.classList.remove("step-enter"), 400);
  }, 300);
}

// ---- Sliding dots (Instagram-style) ----

function updateDots() {
  const dots = els.dots.querySelectorAll(".tour-dot");
  const total = dots.length;

  if (total <= MAX_VISIBLE_DOTS) {
    // Few enough dots — show all normally
    dots.forEach((dot, i) => {
      dot.classList.remove("tour-dot-hidden", "tour-dot-small", "tour-dot-medium");
      dot.classList.toggle("active", i === _tourStep);
    });
    return;
  }

  // Calculate visible window centered on active step
  const center = Math.floor(MAX_VISIBLE_DOTS / 2);
  let windowStart = _tourStep - center;
  windowStart = Math.max(0, Math.min(windowStart, total - MAX_VISIBLE_DOTS));
  const windowEnd = windowStart + MAX_VISIBLE_DOTS;

  dots.forEach((dot, i) => {
    dot.classList.remove("active", "tour-dot-hidden", "tour-dot-small", "tour-dot-medium");

    if (i < windowStart || i >= windowEnd) {
      dot.classList.add("tour-dot-hidden");
    } else if (i === windowStart || i === windowEnd - 1) {
      dot.classList.add("tour-dot-small");
    } else if (i === windowStart + 1 || i === windowEnd - 2) {
      dot.classList.add("tour-dot-medium");
    }

    if (i === _tourStep) dot.classList.add("active");
  });
}

function navigateToStep(index) {
  const step = TOUR_STEPS[index];
  if (_zoomToRegion) _zoomToRegion(step.view);
}

// ---- Mobile swipe ----

function setupSwipe(el) {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  el.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    // Don't track swipe if starting inside scrollable text
    if (e.target.closest("#tour-text")) { tracking = false; return; }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  el.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) nextStep();
      else prevStep();
    }
  }, { passive: true });
}
