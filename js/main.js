/**
 * SoftBloom Server — Main JavaScript
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PARTICLE_COLORS = {
    light: ["#d4a0b8", "#b8a0d4", "#d4a0a8", "#c9a8b0"],
    dark: ["#e8b4d0", "#c8b0e8", "#e0a8b8", "#d4a0b0"],
  };

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyParticleColors() {
    const colors = PARTICLE_COLORS[getTheme()];
    document.querySelectorAll(".particle-field .particle").forEach((p, i) => {
      p.style.background = colors[i % colors.length];
    });
  }

  function initTheme() {
    const toggle = document.getElementById("themeToggle");
    const html = document.documentElement;

    const setTheme = (theme) => {
      html.setAttribute("data-theme", theme);
      localStorage.setItem("softbloom-theme", theme);
      if (toggle) {
        const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
        toggle.setAttribute("aria-label", label);
        toggle.setAttribute("title", label);
      }
      applyParticleColors();
    };

    toggle?.addEventListener("click", () => {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    });

    const stored = localStorage.getItem("softbloom-theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    } else {
      setTheme(getTheme());
    }
  }

  function initLoader() {
    const loader = document.getElementById("pageLoader");
    if (!loader) return;

    const hide = () => loader.classList.add("hidden");

    if (document.readyState === "complete") {
      setTimeout(hide, 400);
    } else {
      window.addEventListener("load", () => setTimeout(hide, 500));
    }
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;

    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      disable: prefersReducedMotion,
    });
  }

  function initNavbar() {
    const nav = document.getElementById("mainNav");
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    document.querySelectorAll(".nav-link[href^='#']").forEach((link) => {
      link.addEventListener("click", () => {
        const collapse = document.getElementById("navMenu");
        if (collapse?.classList.contains("show")) {
          const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapse);
          bsCollapse.hide();
        }
      });
    });
  }

  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;

    window.addEventListener(
      "scroll",
      () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        bar.style.width = `${progress}%`;
      },
      { passive: true }
    );
  }

  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        btn.classList.toggle("visible", window.scrollY > 500);
      },
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initCopyButtons() {
    const toastEl = document.getElementById("copyToast");
    const toast = toastEl ? bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2500 }) : null;

    document.querySelectorAll("[data-copy]").forEach((el) => {
      el.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const text = el.getAttribute("data-copy");
        if (!text) return;

        try {
          await navigator.clipboard.writeText(text);

          if (el.classList.contains("btn-copy") || el.classList.contains("btn-copy-address")) {
            el.classList.add("copied");
            const icon = el.querySelector("i");
            const label = el.querySelector("span:not(.visually-hidden)");
            const prevLabel = label?.textContent;
            if (icon) icon.className = "fa-solid fa-check";
            if (label && el.classList.contains("btn-copy-address") && !el.classList.contains("btn-copy-address-sm")) {
              label.textContent = "Copied!";
            }
            setTimeout(() => {
              el.classList.remove("copied");
              if (icon) icon.className = "fa-regular fa-copy";
              if (label && prevLabel) label.textContent = prevLabel;
            }, 2000);
          }

          if (toast) toast.show();
        } catch {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          if (toast) toast.show();
        }
      });
    });
  }

  function initParticles() {
    if (prefersReducedMotion) return;

    const particleField = document.querySelector(".particle-field");
    const petalLayer = document.querySelector(".petal-layer");

    if (particleField && !particleField.children.length) {
      const colors = PARTICLE_COLORS[getTheme()];
      for (let i = 0; i < 14; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        const size = 4 + Math.random() * 8;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = `${12 + Math.random() * 18}s`;
        p.style.animationDelay = `${Math.random() * 10}s`;
        particleField.appendChild(p);
      }
    }

    if (petalLayer && !petalLayer.children.length) {
      for (let i = 0; i < 6; i++) {
        const petal = document.createElement("div");
        petal.className = "petal";
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.animation = `float-particle ${14 + Math.random() * 12}s linear infinite`;
        petal.style.animationDelay = `${Math.random() * 8}s`;
        petal.style.transform = `rotate(${Math.random() * 360}deg)`;
        petalLayer.appendChild(petal);
      }
    }
  }

  function initParallax() {
    if (prefersReducedMotion) return;

    const blocks = document.querySelectorAll("[data-parallax]");
    if (!blocks.length) return;

    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;
        blocks.forEach((block) => {
          const speed = parseFloat(block.getAttribute("data-parallax")) || 0.15;
          block.style.transform = `translateY(${scrollY * speed * -0.5}px)`;
        });
      },
      { passive: true }
    );
  }

  function initActiveNav() {
    const sections = document.querySelectorAll("section[id], header[id]");
    const navLinks = document.querySelectorAll(".nav-link[href^='#']");

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              const href = link.getAttribute("href");
              link.classList.toggle("active", href === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function initTabs() {
    const tabEls = document.querySelectorAll('#serverTabs button[data-bs-toggle="pill"]');
    tabEls.forEach((tab) => {
      tab.addEventListener("shown.bs.tab", () => {
        if (typeof AOS !== "undefined") AOS.refresh();
      });
    });
  }

  function init() {
    initTheme();
    initLoader();
    initYear();
    initNavbar();
    initScrollProgress();
    initBackToTop();
    initCopyButtons();
    initParticles();
    initParallax();
    initActiveNav();
    initTabs();
    initAOS();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
