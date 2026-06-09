/* =================================================================
   MSI STUDIO — interactions
   Vanilla DOM, IIFE, every lookup guarded.
   ================================================================= */
(function () {
  'use strict';

  /* ---- Sticky nav: toggle .scrolled past a threshold ---- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile hamburger ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    var closeMenu = function () {
      toggle.classList.remove('open');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('open');
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close after tapping a link
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---- Scroll-reveal via IntersectionObserver ---- */
  var revealTargets = document.querySelectorAll(
    '.section-head, .work-card, .step, .service, .about-text, .about-cred, .contact-intro, .contact-form, .hero-stats'
  );
  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el) { el.classList.add('fade-in'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---- Present the Process section full screen ---- */
  var presentBtn = document.getElementById('presentBtn');
  var processSection = document.getElementById('process');
  if (presentBtn && processSection && processSection.requestFullscreen) {
    presentBtn.addEventListener('click', function () {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) { document.exitFullscreen(); }
      } else {
        processSection.requestFullscreen().catch(function () {});
      }
    });
    document.addEventListener('fullscreenchange', function () {
      var on = document.fullscreenElement === processSection;
      presentBtn.innerHTML = '<span class="present-ico" aria-hidden="true">⛶</span> '
        + (on ? 'Exit full screen' : 'Present full screen');
    });
  } else if (presentBtn) {
    // No Fullscreen API support — hide the affordance rather than show a dead button
    presentBtn.style.display = 'none';
  }

  /* ---- Footer year ---- */
  var year = document.getElementById('year');
  if (year) { year.textContent = new Date().getFullYear(); }
})();
