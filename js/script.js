const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
}

// Close navbar when link is clicked
const navLink = document.querySelectorAll(".nav-link");

navLink.forEach((n) => n.addEventListener("click", closeMenu));

function closeMenu() {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
}

// Embedded project cards
const projectFrames = document.querySelectorAll(".project-frame");

// ===================== Theme (light / dark) =====================
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);

function activeTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

// Push the current theme into every embedded card (same-origin iframes)
function applyThemeToFrames(theme) {
  projectFrames.forEach((frame) => {
    try {
      const doc = frame.contentDocument || frame.contentWindow.document;
      doc.documentElement.setAttribute("data-theme", theme);
    } catch (e) {
      /* frame not ready yet — its load handler will apply the theme */
    }
  });
}

// Push the current language into every embedded card
function applyLangToFrames(lang) {
  projectFrames.forEach((frame) => {
    try {
      const doc = frame.contentDocument || frame.contentWindow.document;
      doc.documentElement.setAttribute("lang", lang);
    } catch (e) {
      /* frame not ready yet — its load handler will apply the language */
    }
  });
}

function activeLang() {
  return document.documentElement.getAttribute("lang") === "fa" ? "fa" : "en";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (toggleSwitch) toggleSwitch.checked = theme === "dark";
  applyThemeToFrames(theme);
}

toggleSwitch.addEventListener("change", (e) => {
  setTheme(e.target.checked ? "dark" : "light");
});

// Restore saved preference on load
setTheme(localStorage.getItem("theme") || "light");

// ===================== Language (EN / FA) =====================
const langToggle = document.querySelector("#lang-toggle");

function applyLanguage(lang) {
  const isFa = lang === "fa";
  document.documentElement.setAttribute("lang", isFa ? "fa" : "en");
  document.documentElement.setAttribute("dir", isFa ? "rtl" : "ltr");
  document.body.classList.toggle("lang-fa", isFa);

  document.querySelectorAll("[data-en]").forEach((el) => {
    const text = isFa ? el.getAttribute("data-fa") : el.getAttribute("data-en");
    if (text !== null) el.textContent = text;
  });

  if (langToggle) langToggle.textContent = isFa ? "EN" : "FA";
  applyLangToFrames(lang);
  localStorage.setItem("lang", lang);
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    applyLanguage(
      document.documentElement.getAttribute("lang") === "fa" ? "en" : "fa"
    );
  });
}

applyLanguage(localStorage.getItem("lang") || "en");

// ===================== Adding date =====================
const myDate = document.querySelector("#datee");
myDate.innerHTML = new Date().getFullYear();

// ===================== Size the project cards equally =====================
// Measure every card, then give all frames the same height (the tallest one)
// so the grid reads as a set of matching windows with no inner scrollbars.
function resizeFrames() {
  let max = 0;

  projectFrames.forEach((frame) => {
    try {
      const doc = frame.contentDocument || frame.contentWindow.document;
      const card = doc.querySelector(".project-card") || doc.body;
      if (card && card.offsetHeight > max) max = card.offsetHeight;
    } catch (e) {
      /* not ready — skip for now */
    }
  });

  if (max > 0) {
    // cards are top-aligned inside their frame with 28px padding top & bottom,
    // so the frame needs the tallest card plus that padding
    const h = max + 56 + "px";
    projectFrames.forEach((frame) => {
      frame.style.height = h;
    });
  }
}

projectFrames.forEach((frame) => {
  frame.addEventListener("load", () => {
    applyThemeToFrames(activeTheme());
    applyLangToFrames(activeLang());
    resizeFrames();
  });
});

// Recompute once everything (including fonts) has settled
window.addEventListener("load", () => {
  applyThemeToFrames(activeTheme());
  applyLangToFrames(activeLang());
  resizeFrames();
});

// Re-measure on resize since card height changes with width
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeFrames, 150);
});
