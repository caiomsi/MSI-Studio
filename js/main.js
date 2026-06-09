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

  /* ---- Scroll-driven sparkles ---- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var descend = document.querySelector('.star-descend');
  var heroStar = document.querySelector('.star-hero');
  if (!reduceMotion && (descend || heroStar)) {
    var clamp = function (n) { return n < 0 ? 0 : n > 1 ? 1 : n; };
    var ticking = false;
    var updateStars = function () {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      var vh = window.innerHeight || 1;
      var max = (document.documentElement.scrollHeight - vh) || 1;
      var pageP = clamp(y / max);
      var heroP = clamp(y / vh);

      if (descend) {
        // start ~12vh, glide to ~86vh down the viewport; drift + rotate as it falls
        descend.style.setProperty('--ty', (12 + pageP * 74).toFixed(2));
        descend.style.setProperty('--tx', (Math.sin(pageP * Math.PI * 2) * 42).toFixed(2));
        descend.style.setProperty('--rot', (pageP * 540).toFixed(1));
      }
      if (heroStar) {
        // drift across the hero and brighten its halo as scrolling begins
        heroStar.style.setProperty('--tx', (heroP * -90).toFixed(2));
        heroStar.style.setProperty('--ty', (heroP * 70).toFixed(2));
        heroStar.style.setProperty('--rot', (heroP * 220).toFixed(1));
        heroStar.style.setProperty('--lit', heroP.toFixed(3));
      }
    };
    var requestStars = function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateStars); }
    };
    window.addEventListener('scroll', requestStars, { passive: true });
    window.addEventListener('resize', requestStars, { passive: true });
    updateStars();
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
