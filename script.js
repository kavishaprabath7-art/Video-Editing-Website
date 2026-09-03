/**
 * KAWEESHA CHAMARA — Portfolio  |  script.js  v2
 * Fully audited, bug-fixed, optimised
 *
 * Modules:
 *  1. Helpers
 *  2. Nav — scroll dim + mobile drawer
 *  3. Scroll reveal — IntersectionObserver
 *  4. Work grid — filter tabs + lightbox
 *  5. Vimeo — pause hero/fiverr on scroll-out
 *  6. Sidebar — open/close + touch-swipe
 *  7. Contact form — Google Sheets (no-cors)
 *  8. Magnetic buttons — CSS-var approach (no transform conflict)
 *  9. Smooth scroll CTA
 */

'use strict';

// ─────────────────────────────────────────────────────────────
// 1. HELPERS
// ─────────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ─────────────────────────────────────────────────────────────
// 2. NAV
// ─────────────────────────────────────────────────────────────
(function initNav() {
  const nav    = $('#nav');
  const burger = $('#navBurger');
  const drawer = $('#navLinks');
  if (!nav || !burger || !drawer) return;

  // Scroll → frosted nav
  let ticking = false;
  function handleScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(handleScroll);
    ticking = true;
  }, { passive: true });
  // Check initial state
  handleScroll();

  // Burger toggle
  function openDrawer() {
    drawer.classList.add('active');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('active');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () =>
    drawer.classList.contains('active') ? closeDrawer() : openDrawer()
  );

  // Close on nav link or CTA click
  $$('a, button', drawer).forEach(el =>
    el.addEventListener('click', closeDrawer)
  );

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) closeDrawer();
  });

  // FIX: "Let's Talk" button in nav also opens sidebar
  const navContactBtn = $('#navContactBtn');
  if (navContactBtn) navContactBtn.addEventListener('click', () => { closeDrawer(); openSidebar(); });
})();

// ─────────────────────────────────────────────────────────────
// 3. SCROLL REVEAL
// ─────────────────────────────────────────────────────────────
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, {
    rootMargin: '0px 0px -32px 0px',
    threshold: 0.04
  });

  els.forEach(el => io.observe(el));
})();

// ─────────────────────────────────────────────────────────────
// 4. WORK GRID — filter tabs + lightbox
// ─────────────────────────────────────────────────────────────
(function initWorkGrid() {
  const workCards  = $$('.work-card');
  const allCards   = $$('.js-lightbox'); // Include recreations and showreels for lightbox nav
  const filterBtns = $$('.filter-btn');
  if (!allCards.length) return;

  // ── Filter tabs ──────────────────────────────────────────
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const filter = btn.dataset.filter;
      workCards.forEach(card => {
        const hide = filter !== 'all' && card.dataset.category !== filter;
        card.classList.toggle('hidden', hide);
      });
    });
  });

  // ── Lightbox elements ─────────────────────────────────────
  const lb        = $('#lightbox');
  const lbOverlay = $('#lightboxOverlay');
  const lbClose   = $('#lightboxClose');
  const lbFrame   = $('#lightboxFrame');
  const lbTag     = $('#lbTag');
  const lbTitle   = $('#lbTitle');
  const lbClient  = $('#lbClient');
  const lbRole    = $('#lbRole');
  const lbTools   = $('#lbTools');
  const lbYear    = $('#lbYear');
  if (!lb) return;

  let currentCard = null;
  let closeTimeout = null;

  function openLightbox(card) {
    if (closeTimeout) clearTimeout(closeTimeout);
    currentCard = card;
    const id = card.dataset.videoId;

    // Apply dynamic aspect ratio (default to 9/16 if not specified)
    lbFrame.style.aspectRatio = card.dataset.aspect || '9/16';

    // Populate meta
    lbTag.textContent    = card.dataset.category ? card.dataset.category.charAt(0).toUpperCase() + card.dataset.category.slice(1) : '';
    lbTitle.textContent  = card.dataset.title || '';
    lbClient.textContent = card.dataset.client || '';
    lbRole.textContent   = card.dataset.role || '';
    lbTools.textContent  = card.dataset.tools || '';
    lbYear.textContent   = card.dataset.year || '';

    // Inject full interactive Vimeo player
    lbFrame.innerHTML = '';
    lbFrame.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&muted=1&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

    // Show lightbox
    lb.hidden = false;
    requestAnimationFrame(() => {
      lb.classList.add('active');
      lbOverlay.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
    lbClose.focus();

    // FIX: trap focus inside lightbox
    lb.addEventListener('keydown', trapFocus);
  }

  function closeLightbox() {
    lb.classList.remove('active');
    lbOverlay.classList.remove('active');
    lb.removeEventListener('keydown', trapFocus);

    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      lb.hidden = true;
      lbFrame.innerHTML = ''; // stops video playback/network requests
      document.body.style.overflow = '';
      if (currentCard) { currentCard.focus(); currentCard = null; }
    }, 460);
  }

  // Basic focus trap inside lightbox
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusable = $$('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])', lb);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Bind click events to open lightbox
  document.querySelectorAll('.js-lightbox').forEach(card => {
    card.addEventListener('click', () => openLightbox(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(card); }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbOverlay.addEventListener('click', closeLightbox);

  // Keyboard: Escape close, ArrowLeft/Right browse
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

    const visible = allCards.filter(c => !c.classList.contains('hidden'));
    if (visible.length < 2) return;
    const idx = visible.indexOf(currentCard);
    const next = e.key === 'ArrowRight'
      ? visible[(idx + 1) % visible.length]
      : visible[(idx - 1 + visible.length) % visible.length];

    // Transition smoothly
    lb.classList.remove('active');
    lbOverlay.classList.remove('active');
    if (closeTimeout) clearTimeout(closeTimeout);
    setTimeout(() => openLightbox(next), 470);
  });

  // "Hire Me" button inside lightbox opens sidebar
  const lbHireBtn = $('#lbHireBtn');
  if (lbHireBtn) lbHireBtn.addEventListener('click', () => { closeLightbox(); setTimeout(openSidebar, 470); });
})();

// ─────────────────────────────────────────────────────────────
// (Vimeo SDK integration removed - unused in current architecture)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 6. SIDEBAR — open / close / swipe
// ─────────────────────────────────────────────────────────────
// Defined as plain function (not IIFE) so other modules can call openSidebar()
function openSidebar() {
  const sidebar = $('#contactSidebar');
  const overlay = $('#sidebarOverlay');
  if (!sidebar) return;
  sidebar.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Focus first field
  const firstField = $('input, select, textarea', sidebar);
  setTimeout(() => firstField?.focus(), 50);
}

function closeSidebar() {
  const sidebar = $('#contactSidebar');
  const overlay = $('#sidebarOverlay');
  if (!sidebar) return;
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

(function initSidebar() {
  const sidebar  = $('#contactSidebar');
  const overlay  = $('#sidebarOverlay');
  const closeBtn = $('#closeSidebarBtn');
  if (!sidebar) return;

  // Build a deduped set of trigger elements.
  // navContactBtn is already handled in initNav — exclude it here to prevent double-fire.
  const triggers = new Set($$('.open-sidebar-btn'));
  triggers.delete($('#navContactBtn'));           // handled in initNav
  triggers.delete($('#lbHireBtn'));               // handled in initWorkGrid
  // heroContactBtn has no open-sidebar-btn class — add it explicitly
  const heroContactBtn = $('#heroContactBtn');
  if (heroContactBtn) triggers.add(heroContactBtn);

  triggers.forEach(btn => btn.addEventListener('click', openSidebar));

  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay)  overlay.addEventListener('click', closeSidebar);

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) closeSidebar();
  });

  // Swipe right to close on mobile
  let swipeStartX = 0;
  sidebar.addEventListener('touchstart', e => { swipeStartX = e.changedTouches[0].screenX; }, { passive: true });
  sidebar.addEventListener('touchend',   e => {
    if (e.changedTouches[0].screenX > swipeStartX + 70) closeSidebar();
  }, { passive: true });
})();

// ─────────────────────────────────────────────────────────────
// 7. CONTACT FORM — Google Apps Script → Google Sheets
// ─────────────────────────────────────────────────────────────
(function initForm() {
  const form = $('#contactForm');
  if (!form) return;

  // Simple required-field check before submitting
  function isValid() {
    let ok = true;
    $$('[required]', form).forEach(el => {
      const invalid = !el.value.trim();
      el.style.borderColor = invalid ? '#ff4d4f' : '';
      if (invalid) ok = false;
    });
    return ok;
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!isValid()) return;

    const btn = this.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = new URLSearchParams();
    data.append('name',         (this.name?.value         || '').trim());
    data.append('email',        (this.email?.value        || '').trim());
    data.append('project_type', (this.project_type?.value || '').trim());
    data.append('service',      (this.service?.value      || '').trim());
    data.append('budget',       (this.budget?.value       || '').trim());
    data.append('message',      (this.message?.value      || '').trim());

    fetch('https://script.google.com/macros/s/AKfycby_THfWs8LRvciU1aiEAmymi6dUiM4-bAi24Dn7GrOQASjhdr0nunCOLOHgDX-iwbtzSw/exec', {
      method: 'POST',
      body: data,
      mode: 'no-cors',
    })
      .then(() => {
        this.reset();
        $$('[required]', form).forEach(el => (el.style.borderColor = ''));
        // Replace button with a success message briefly
        btn.textContent = '✓ Message sent!';
        btn.style.background = '#2a5c00';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.disabled = false;
          closeSidebar();
        }, 2600);
      })
      .catch(() => {
        alert('Something went wrong. Please try emailing directly: kaweeshawarnakula@gmail.com');
        btn.textContent = orig;
        btn.disabled = false;
      });
  });

  // Reset red border on input/change
  $$('[required]', form).forEach(el => {
    el.addEventListener('input', () => (el.style.borderColor = ''));
    if (el.tagName === 'SELECT') {
      el.addEventListener('change', () => (el.style.borderColor = ''));
    }
  });
})();

// ─────────────────────────────────────────────────────────────
// 8. MAGNETIC BUTTONS — CSS custom-property approach
//    FIX: sets --tx / --ty so the CSS transform: translate(var(--tx),var(--ty))
//    works independently of any :hover translateY — no conflict
// ─────────────────────────────────────────────────────────────
(function initMagnetic() {
  // Skip on touch devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  $$('.btn-magnetic').forEach(btn => {
    let r, cx, cy;
    btn.addEventListener('mouseenter', () => {
      r = btn.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    });
    btn.addEventListener('mousemove', e => {
      if (!r) return;
      btn.style.setProperty('--tx', `${(e.clientX - cx) * 0.18}px`);
      btn.style.setProperty('--ty', `${(e.clientY - cy) * 0.18}px`);
    });
    btn.addEventListener('mouseleave', () => {
      r = null;
      btn.style.setProperty('--tx', '0px');
      btn.style.setProperty('--ty', '0px');
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// 9. SMOOTH SCROLL — "Watch the Reel" CTA
// ─────────────────────────────────────────────────────────────
(function initSmoothScroll() {
  const watchBtn = $('#heroWatchBtn');
  if (!watchBtn) return;
  watchBtn.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById('work');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
