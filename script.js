/* ==========================================================
   i2P · Idea to Prototype · script.js
   Vanilla JS. No build step.
   ========================================================== */

/* ---------------------------------------------------------
   CONFIGURATION  ← edit these values
   --------------------------------------------------------- */
const CONFIG = {
  // Paste your deployed Google Apps Script Web App URL here (ends in /exec).
  // See README.md → "Waiting list setup". Leave empty until configured.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw-NOzQENYlXwpkBPUYbFr6-Uer6G8sB7e7FVGG2ZVoeTFVBvNVmx8MulFvgEkyjG_O0Q/exec",

  // Animations (typing, eased scrolling) always run. Set to true to switch them
  // off for visitors whose device has "reduce motion" enabled.
  RESPECT_REDUCED_MOTION: false,

  // Launch moment: 1 Jan 2027 00:00:00 in Africa/Harare (CAT = UTC+2, no DST).
  // The explicit offset makes it correct in every visitor's time zone.
  LAUNCH_ISO: "2027-01-01T00:00:00+02:00",
};

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };
const reducedMotion = CONFIG.RESPECT_REDUCED_MOTION && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------
   Eased scrolling (used by every in-page link and the back-to-top button)
   --------------------------------------------------------- */
const Scroll = (() => {
  let raf = null;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; };
  function to(y) {
    stop();
    const start = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const end = Math.max(0, Math.min(y, max));
    const dist = end - start;
    if (Math.abs(dist) < 2) return;
    if (reducedMotion) { window.scrollTo(0, end); return; }
    const dur = Math.min(1500, Math.max(700, Math.abs(dist) * 0.5));
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, start + dist * ease(p));
      raf = p < 1 ? requestAnimationFrame(step) : null;
    };
    raf = requestAnimationFrame(step);
  }
  // Let the visitor take over at any time
  ["wheel", "touchstart", "keydown", "mousedown"].forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
  // Any link that points at a section on this page
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-open-privacy") || e.defaultPrevented) return;
    const id = a.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    const headerH = (document.getElementById("header") || {}).offsetHeight || 84;
    to(id === "home" ? 0 : target.getBoundingClientRect().top + window.scrollY - headerH + 1);
    try { history.replaceState(null, "", "#" + id); } catch (err) {}
  });
  return { to, stop };
})();

/* ---------------------------------------------------------
   Theme: dark / light / system, persisted in localStorage
   --------------------------------------------------------- */
const Theme = (() => {
  const KEY = "i2p-theme";
  const order = ["system", "dark", "light"];
  const icons = { system: "monitor", dark: "moon", light: "sun" };
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  let pref = "system";
  try { pref = localStorage.getItem(KEY) || "system"; } catch (e) {}

  function apply() {
    const resolved = pref === "system" ? (mq.matches ? "dark" : "light") : pref;
    document.documentElement.setAttribute("data-theme", resolved);
    const btn = $("#themeBtn");
    btn.title = "Theme: " + pref + " (click to change)";
    btn.setAttribute("aria-label", "Theme: " + pref + ". Click to change.");
    btn.innerHTML = '<i data-lucide="' + icons[pref] + '"></i>';
    refreshIcons();
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = resolved === "dark" ? "#000000" : "#ffffff";
  }
  $("#themeBtn").addEventListener("click", () => {
    pref = order[(order.indexOf(pref) + 1) % order.length];
    try { localStorage.setItem(KEY, pref); } catch (e) {}
    apply();
  });
  if (mq.addEventListener) mq.addEventListener("change", () => { if (pref === "system") apply(); });
  return { apply };
})();

/* ---------------------------------------------------------
   Navigation: mobile menu, header border, active link
   --------------------------------------------------------- */
(() => {
  const header = $("#header"), menu = $("#navLinks"), btn = $("#menuBtn");
  const close = () => { menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => btn.setAttribute("aria-expanded", String(menu.classList.toggle("open"))));
  $$("a", menu).forEach((a) => a.addEventListener("click", close));
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 8), { passive: true });

  const links = $$('.nav-links a.link[href^="#"]');
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.remove("active"));
      const l = map.get(e.target.id);
      if (l) l.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

/* ---------------------------------------------------------
   Scroll reveal
   --------------------------------------------------------- */
(() => {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach((e) => io.observe(e));
})();

/* ---------------------------------------------------------
   Headline typing effect: types "Prototype." then erases and repeats.
   If the visitor's device asks for reduced motion, it types once and stays.
   --------------------------------------------------------- */
(() => {
  const wrap = $("#heroTyped");
  if (!wrap) return;
  const out = $(".tw-text", wrap);
  const word = wrap.dataset.text;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  wrap.classList.add("typing");
  out.textContent = "";
  (async function run() {
    do {
      await wait(500);
      for (let i = 1; i <= word.length; i++) { out.textContent = word.slice(0, i); await wait(105); }
      await wait(3200);
      for (let i = word.length - 1; i >= 0; i--) { out.textContent = word.slice(0, i); await wait(55); }
    } while (true);
  })();
})();

/* ---------------------------------------------------------
   Back to top button
   --------------------------------------------------------- */
(() => {
  const btn = $("#toTop");
  if (!btn) return;
  const toggle = () => btn.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
  btn.addEventListener("click", () => {
    Scroll.to(0);
    const logo = $(".brand");
    if (logo) logo.focus({ preventScroll: true });
  });
})();

/* ---------------------------------------------------------
   Mini countdown (calculated live from CONFIG.LAUNCH_ISO)
   --------------------------------------------------------- */
(() => {
  const target = new Date(CONFIG.LAUNCH_ISO).getTime();
  const box = $("#miniCd");
  const d = $("#cdDays"), h = $("#cdHours"), m = $("#cdMins"), s = $("#cdSecs");
  const pad = (n) => String(n).padStart(2, "0");
  let id;
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { box.classList.add("is-launched"); clearInterval(id); return; }
    const secs = Math.floor(diff / 1000);
    d.textContent = Math.floor(secs / 86400);
    h.textContent = pad(Math.floor((secs % 86400) / 3600));
    m.textContent = pad(Math.floor((secs % 3600) / 60));
    s.textContent = pad(secs % 60);
  }
  tick();
  id = setInterval(tick, 1000);
})();

/* ---------------------------------------------------------
   Hero visual: Idea, Concept, Prototype
   --------------------------------------------------------- */
(() => {
  const tabs = $$("#morph .morph-tabs button");
  const stages = $$("#morph .morph-stage");
  const caption = $("#morphCaption");
  const typedEl = $("#typed"), note = $("#typedNote");
  const captions = [
    "Say it the way you'd tell a friend.",
    "See it in the place it will live.",
    "The finished device.",
  ];
  const IDEA = "\u201cI want my bedroom light to turn on when I enter the room, and I also want to control it using my phone.\u201d";

  let typeTimer = null;

  function type() {
    clearInterval(typeTimer);
    note.classList.remove("show");
    if (reducedMotion) { typedEl.textContent = IDEA; note.classList.add("show"); return; }
    typedEl.textContent = "";
    let i = 0;
    typeTimer = setInterval(() => {
      typedEl.textContent = IDEA.slice(0, ++i);
      if (i >= IDEA.length) { clearInterval(typeTimer); note.classList.add("show"); }
    }, 32);
  }

  function show(n) {
    stages.forEach((s, i) => s.classList.toggle("on", i === n));
    tabs.forEach((t, i) => { t.classList.toggle("on", i === n); t.setAttribute("aria-selected", String(i === n)); });
    caption.textContent = captions[n];
    if (n === 0) type();
  }

  tabs.forEach((t, i) => t.addEventListener("click", () => show(i)));
  show(0);
})();

/* ---------------------------------------------------------
   How it works: five stages + sub-tabs
   --------------------------------------------------------- */
(() => {
  const btns = $$(".stage-btn");
  const visuals = $$(".stage-visual");

  function select(n) {
    btns.forEach((b, i) => b.setAttribute("aria-selected", String(i === n)));
    visuals.forEach((v, i) => v.classList.toggle("on", i === n));
  }
  btns.forEach((b, i) => {
    b.addEventListener("click", () => select(i));
    b.addEventListener("keydown", (e) => {
      const next = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : (e.key === "ArrowUp" || e.key === "ArrowLeft") ? -1 : 0;
      if (!next) return;
      e.preventDefault();
      const n = (i + next + btns.length) % btns.length;
      select(n); btns[n].focus();
    });
  });

  // Sub-tabs (Generation: components/circuit/code/app · Prototype: outside/inside)
  visuals.forEach((v) => {
    const subtabs = $$(".subtabs button", v);
    const imgs = $$(".sub", v);
    subtabs.forEach((t, i) => t.addEventListener("click", () => {
      subtabs.forEach((x, j) => { x.classList.toggle("on", j === i); x.setAttribute("aria-selected", String(j === i)); });
      imgs.forEach((img, j) => img.classList.toggle("on", j === i));
    }));
  });
})();

/* ---------------------------------------------------------
   Waiting list form
   --------------------------------------------------------- */
(() => {
  const form = $("#waitlistForm");
  const msg = $("#formMsg");
  const btn = $("#submitBtn");
  const label = $("#submitLabel");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const LS_KEY = "i2p-waitlist-submitted"; // client-side duplicate hint only; the server is the real check

  const showMsg = (type, text) => { msg.className = "form-msg show " + type; msg.textContent = text; };
  function setLoading(on) {
    btn.disabled = on;
    btn.classList.toggle("loading", on);
    label.textContent = on ? "Joining…" : "Join Waiting List";
  }
  const getSubmitted = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch (e) { return []; } };
  const remember = (email) => { try { localStorage.setItem(LS_KEY, JSON.stringify([...getSubmitted(), email])); } catch (e) {} };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.className = "form-msg";

    const name = $("#name").value.trim();
    const email = $("#email").value.trim().toLowerCase();
    const org = $("#org").value.trim();
    const interest = $("#interest").value;

    if ($("#website").value) { showMsg("success", "Thank you! You're on the list."); return; } // spam trap

    const nameOk = name.length >= 2;
    const emailOk = EMAIL_RE.test(email);
    $("#f-name").classList.toggle("invalid", !nameOk);
    $("#f-email").classList.toggle("invalid", !emailOk);
    if (!nameOk || !emailOk) {
      showMsg("error", !name && !email ? "Please fill in your name and email address." : "Please correct the highlighted fields.");
      return;
    }
    if (getSubmitted().includes(email)) { showMsg("error", "This email address is already on the waiting list."); return; }

    if (!CONFIG.APPS_SCRIPT_URL) {
      showMsg("setup", "Waiting-list storage isn't configured yet, so your registration was NOT saved. (Site owner: set APPS_SCRIPT_URL in script.js, see README.md.)");
      return;
    }

    setLoading(true);
    try {
      // text/plain avoids a CORS preflight, which Apps Script web apps do not answer.
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ name, email, organisation: org, interest, source: location.href }),
      });
      const data = await res.json();
      if (data && data.status === "success") {
        remember(email); form.reset();
        showMsg("success", data.message || "You're on the list! We'll be in touch at launch.");
      } else if (data && data.status === "duplicate") {
        remember(email);
        showMsg("error", data.message || "This email address is already on the waiting list.");
      } else {
        showMsg("error", (data && data.message) || "Something went wrong. Please try again.");
      }
    } catch (err) {
      showMsg("error", "We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  });

  ["#name", "#email"].forEach((s) => $(s).addEventListener("input", (ev) => ev.target.closest(".field").classList.remove("invalid")));
})();

/* ---------------------------------------------------------
   Drawing viewer: tap or click a drawing to enlarge it
   --------------------------------------------------------- */
(() => {
  const box = $("#lightbox"), img = $("#lbImg"), scroller = $("#lbScroll");
  const open = (src, alt) => {
    img.src = src; img.alt = alt || "";
    box.hidden = false; document.body.style.overflow = "hidden";
    scroller.scrollTo(0, 0); $("#lbClose").focus();
  };
  const close = () => { box.hidden = true; img.removeAttribute("src"); document.body.style.overflow = ""; };
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".stage-visual .screen img, .morph-stage img");
    if (t) open(t.currentSrc || t.src, t.alt);
  });
  $("#lbClose").addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box || e.target === scroller) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
})();

/* ---------------------------------------------------------
   Privacy modal, footer year, icons
   --------------------------------------------------------- */
(() => {
  const modal = $("#privacyModal");
  const open = (e) => { if (e) e.preventDefault(); modal.classList.add("open"); $("#privacyClose").focus(); };
  const close = () => modal.classList.remove("open");
  $$("[data-open-privacy]").forEach((a) => a.addEventListener("click", open));
  $("#privacyClose").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  $("#year").textContent = new Date().getFullYear();
})();

Theme.apply();
refreshIcons();
