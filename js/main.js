/* =================================================================
   MSI STUDIO — "The Drafting Table" interactions
   Vanilla DOM, IIFE, every lookup guarded.
   ================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---- Self-drawing SVG paths (the brand motif) ----
     Each svg.draw-svg holds path.draw strokes. We measure every path,
     hide it behind its own dash length, then release the offset when
     the svg enters the viewport (or shortly after load, for
     data-draw="load" svgs like the hero underline). Per-path pacing
     comes from data-dur / data-delay attributes. */
  var drawSvgs = document.querySelectorAll('svg.draw-svg');
  if (drawSvgs.length && !reduceMotion) {
    var prepPaths = function (svg) {
      svg.querySelectorAll('path.draw').forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len + ' ' + len;
        p.style.strokeDashoffset = len;
      });
    };
    var drawPaths = function (svg) {
      svg.querySelectorAll('path.draw').forEach(function (p) {
        var len = p.getTotalLength();
        var dur = parseFloat(p.getAttribute('data-dur')) ||
          Math.min(1.6, Math.max(0.5, len / 320));
        var delay = parseFloat(p.getAttribute('data-delay')) || 0;
        var ease = p.getAttribute('data-ease') || 'cubic-bezier(.4,0,.2,1)';
        p.style.transition = 'stroke-dashoffset ' + dur + 's ' + ease + ' ' + delay + 's';
        p.style.strokeDashoffset = '0';
      });
    };

    var loadSvgs = [];
    var scrollSvgs = [];
    drawSvgs.forEach(function (svg) {
      prepPaths(svg);
      (svg.getAttribute('data-draw') === 'load' ? loadSvgs : scrollSvgs).push(svg);
    });

    // Hero strokes draw once the type has risen into place
    window.setTimeout(function () { loadSvgs.forEach(drawPaths); }, 300);

    // Once the process connector finishes drawing, send a small ink dot
    // traveling along it (SMIL animations begin as "indefinite" so the
    // dot can't run on a not-yet-drawn stroke)
    var startProcessDot = function () {
      ['strokeDotMotion', 'strokeDotFade'].forEach(function (id) {
        var a = document.getElementById(id);
        if (a && a.beginElement) {
          try { a.beginElement(); } catch (e) { /* SMIL unsupported */ }
        }
      });
    };

    if ('IntersectionObserver' in window && scrollSvgs.length) {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            drawPaths(entry.target);
            if (entry.target.classList.contains('process-stroke')) {
              window.setTimeout(startProcessDot, 2700);
            }
            pio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });
      scrollSvgs.forEach(function (svg) { pio.observe(svg); });
    } else {
      scrollSvgs.forEach(drawPaths);
    }
  }

  /* ---- The unbroken thread: a page-long stroke scrubbed by scroll ----
     The path is built from real element positions (hero word, plate frames,
     process grid, services, signature, contact form) so it weaves through
     the page's margins at any layout width. The pen tip rides ~78% down
     the viewport, drawing just ahead of the reader. */
  var threadSvg = document.getElementById('threadSvg');
  var threadPath = document.getElementById('threadPath');
  var threadNib = document.getElementById('threadNib');
  var mainEl = document.querySelector('main');
  if (threadSvg && threadPath && threadNib && mainEl) {
    var threadLen = 0;
    var nibTimer = null;

    // Element box relative to <main>
    var rel = function (el) {
      var r = el.getBoundingClientRect();
      var m = mainEl.getBoundingClientRect();
      return {
        left: r.left - m.left, right: r.right - m.left,
        top: r.top - m.top, bottom: r.bottom - m.top,
        width: r.width, height: r.height,
        cx: r.left - m.left + r.width / 2,
        cy: r.top - m.top + r.height / 2
      };
    };

    var buildPoints = function () {
      var W = mainEl.clientWidth;
      var pts = [];
      var inkWord = document.querySelector('.ink-word');
      var spec = document.querySelector('.spec');
      var marquee = document.querySelector('.marquee');
      var workHead = document.querySelector('.work .section-head');
      var plates = document.querySelectorAll('.plate-frame');
      var processGrid = document.querySelector('.process-grid');
      var services = document.querySelectorAll('.service');
      var form = document.querySelector('.contact-form');

      // Begin exactly where the hero underline's stroke ends, so the
      // thread reads as the same pen leaving the word
      var underline = document.querySelector('.hero-title .underline-svg');
      if (underline) {
        var u = rel(underline);
        pts.push([u.left + (u.right - u.left) * .97, u.top + (u.bottom - u.top) * .4]);
        pts.push([W * .9, u.top - 30]); // arc over the hero copy
      } else if (inkWord) {
        var iw = rel(inkWord);
        pts.push([iw.right + 12, iw.bottom + 10]);
        pts.push([W * .9, iw.bottom - 24]);
      }
      if (spec) {
        var sp = rel(spec);
        pts.push([W * .94, sp.top - 50]);
        pts.push([W * .94, sp.cy]);
      }
      if (marquee) { var mq = rel(marquee); pts.push([W * .4, mq.cy]); }
      if (workHead) { var wh = rel(workHead); pts.push([W * .62, wh.bottom - 10]); }
      // Weave down the outer margin beside each plate, crossing between
      // them and skimming under each circled annotation on the way
      var prev = null;
      plates.forEach(function (pf, i) {
        var r = rel(pf);
        var side = (i % 2 === 0) ? W * .025 : W * .975;
        if (prev) { pts.push([W * .5, (prev.bottom + r.top) / 2]); }
        var anno = pf.querySelector('.plate-anno');
        if (anno) { var a = rel(anno); pts.push([a.cx, a.bottom + 6]); }
        pts.push([side, r.top + r.height * .3]);
        pts.push([side, r.bottom - r.height * .3]);
        prev = r;
      });
      // Glide down the left margin past the process section — its own
      // connector stroke owns that stage — then cross to services
      // through the empty band below the grid
      var processHead = document.querySelector('.process-head');
      if (processHead) { var ph = rel(processHead); pts.push([W * .04, ph.cy]); }
      if (processGrid) { var pg = rel(processGrid); pts.push([W * .04, pg.bottom + 40]); }
      if (services.length) {
        var s1 = rel(services[0]);
        var s2 = rel(services[services.length - 1]);
        pts.push([W * .96, s1.top - 10]);
        pts.push([W * .96, s2.bottom - 20]);
      }
      // Stay in the right margin beside the colophon — the signature
      // flourish draws itself; the thread must not cross it
      var about = document.querySelector('.about');
      if (about) { var ab = rel(about); pts.push([W * .96, ab.bottom - 30]); }
      // One deliberate gesture to finish: cross the section gap into the
      // column gutter, run down between intro and form, sweep under the
      // form, and lift off at its bottom-right crop mark
      if (form) {
        var f = rel(form);
        pts.push([f.left - 44, f.top - 44]);
        pts.push([f.left - 44, f.cy]);
        pts.push([f.cx, f.bottom + 26]);
        pts.push([f.right + 8, f.bottom + 8]);
      }
      return pts;
    };

    // Catmull-Rom through the anchors → smooth cubic béziers
    var toPathD = function (pts) {
      if (pts.length < 2) { return ''; }
      var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[i - 1] || pts[i];
        var p1 = pts[i];
        var p2 = pts[i + 1];
        var p3 = pts[i + 2] || p2;
        d += ' C ' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)
          + ', ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)
          + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d;
    };

    // The path is essentially monotonic in y, so binary-search the length
    // whose point sits at the viewport's "pen tip" line
    var lenAtY = function (targetY) {
      var lo = 0;
      var hi = threadLen;
      for (var i = 0; i < 18; i++) {
        var mid = (lo + hi) / 2;
        if (threadPath.getPointAtLength(mid).y < targetY) { lo = mid; } else { hi = mid; }
      }
      return (lo + hi) / 2;
    };

    var tipTarget = function () {
      var tipY = window.innerHeight * 0.78 - mainEl.getBoundingClientRect().top;
      if (tipY <= 0) { return 0; }
      if (tipY >= mainEl.offsetHeight) { return threadLen; }
      return lenAtY(tipY);
    };
    var setDrawn = function (drawn) {
      threadPath.style.strokeDashoffset = String(threadLen - drawn);
      var pt = threadPath.getPointAtLength(drawn);
      threadNib.setAttribute('cx', pt.x);
      threadNib.setAttribute('cy', pt.y);
    };

    // The thread stays invisible until the hero underline has finished
    // drawing (~2s), then flows out of it in one gesture down to the
    // reader's position. Only after that does scroll scrubbing take over.
    var introDone = reduceMotion;
    var runIntro = function () {
      if (introDone || !threadLen) { introDone = true; return; }
      threadNib.classList.add('scribing');
      // CSS transition does the drawing; the nib chases the drawn tip
      threadPath.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.3, 0, .2, 1)';
      threadPath.style.strokeDashoffset = String(threadLen - tipTarget());
      var nibFollow = function () {
        if (introDone) { return; }
        var off = parseFloat(window.getComputedStyle(threadPath).strokeDashoffset) || threadLen;
        var pt = threadPath.getPointAtLength(Math.max(0, threadLen - off));
        threadNib.setAttribute('cx', pt.x);
        threadNib.setAttribute('cy', pt.y);
        window.requestAnimationFrame(nibFollow);
      };
      window.requestAnimationFrame(nibFollow);
      window.setTimeout(function () {
        threadPath.style.transition = 'none';
        introDone = true;
        setDrawn(tipTarget());
        window.setTimeout(function () { threadNib.classList.remove('scribing'); }, 600);
      }, 1450);
    };

    var updateThread = function () {
      if (threadLen && introDone) { setDrawn(tipTarget()); }
    };

    var buildThread = function () {
      var d = toPathD(buildPoints());
      if (!d) { return; }
      threadSvg.setAttribute('viewBox', '0 0 ' + mainEl.clientWidth + ' ' + mainEl.offsetHeight);
      threadPath.setAttribute('d', d);
      threadLen = threadPath.getTotalLength();
      if (reduceMotion) {
        threadPath.style.strokeDasharray = 'none';
        threadNib.style.display = 'none';
      } else {
        threadPath.style.strokeDasharray = threadLen + ' ' + threadLen;
        if (introDone) { setDrawn(tipTarget()); }
        else { setDrawn(0); } // pen resting at the underline's end
      }
    };

    if (!reduceMotion) {
      var threadTicking = false;
      window.addEventListener('scroll', function () {
        if (!threadTicking) {
          threadTicking = true;
          window.requestAnimationFrame(function () {
            updateThread();
            threadTicking = false;
          });
        }
        threadNib.classList.add('scribing');
        if (nibTimer) { window.clearTimeout(nibTimer); }
        nibTimer = window.setTimeout(function () {
          threadNib.classList.remove('scribing');
        }, 700);
      }, { passive: true });
      // Hero underline finishes ~2.05s in (300ms kick-off + 1.75s draw)
      window.setTimeout(runIntro, 2150);
    }
    var rebuildTimer = null;
    window.addEventListener('resize', function () {
      if (rebuildTimer) { window.clearTimeout(rebuildTimer); }
      rebuildTimer = window.setTimeout(buildThread, 200);
    });
    // Rebuild once everything (images, fonts) has settled the layout
    window.addEventListener('load', buildThread);
    buildThread();
  }

  /* ---- Scroll-reveal via IntersectionObserver ---- */
  var revealTargets = document.querySelectorAll(
    '.section-head, .work-card, .step, .service, .about-text, .colophon, .contact-intro, .contact-form'
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

  /* ---- Scroll-spy: highlight the active section's nav link ---- */
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window && sections.length && navAnchors.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
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

  /* ---- Contact form — posts JSON to MSI Forms, shows result inline ---- */
  var contactForm = document.getElementById('contact-form');
  var formStatus = document.getElementById('form-status');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      formStatus.hidden = true;

      var data = {};
      new FormData(contactForm).forEach(function (value, key) { data[key] = value; });

      fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json().catch(function () { return {}; }); })
        .then(function (json) {
          if (json.ok) {
            contactForm.reset();
            formStatus.textContent = 'Sent. I’ll get back to you fast.';
            formStatus.classList.remove('is-error');
            if (btn) { btn.textContent = 'Sent'; }
          } else {
            throw new Error(json.error || 'failed');
          }
        })
        .catch(function () {
          formStatus.textContent = 'Something went wrong — email me instead.';
          formStatus.classList.add('is-error');
          if (btn) { btn.disabled = false; btn.textContent = 'Send it'; }
        })
        .finally(function () { formStatus.hidden = false; });
    });
  }

  /* ---- Footer year ---- */
  var year = document.getElementById('year');
  if (year) { year.textContent = new Date().getFullYear(); }
})();
