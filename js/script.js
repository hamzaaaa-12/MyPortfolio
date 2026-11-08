/* ==========================================================================
   Hamza Ibrahim, portfolio
   Plain JavaScript, no dependencies. Each feature is its own function and is
   wrapped in safe() so one failure never stops the rest of the page.

   1  Theme toggle           6  Project card spotlight
   2  Footer year            7  Copy email + toast
   3  Header + back to top   8  Hero neural network (canvas)
   4  Mobile navigation      9  In-page link focus handling
   5  Active nav + reveal
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Tells the stylesheet JavaScript is running, so reveal animations can apply.
  root.classList.add('js');

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
  function safe(fn) {
    try { fn(); } catch (error) { if (window.console) console.error('[portfolio]', error); }
  }

  var header = $('#site-header');
  var footer = $('#site-footer');

  /* 1. Theme toggle ------------------------------------------------------ */

  var THEME_KEY = 'portfolio-theme';
  var THEME_COLORS = { dark: '#070B16', light: '#F4F6FB' };
  var themeButton = $('#theme-toggle');

  function readStoredTheme() {
    try { return window.localStorage.getItem(THEME_KEY); } catch (error) { return null; }
  }

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);

    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);

    if (themeButton) {
      themeButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (persist) {
      try { window.localStorage.setItem(THEME_KEY, theme); } catch (error) { /* storage unavailable */ }
    }
    window.dispatchEvent(new Event('themechange'));
  }

  safe(function () {
    // Dark is the primary theme; a visitor's saved choice wins.
    applyTheme(readStoredTheme() === 'light' ? 'light' : 'dark', false);

    if (themeButton) {
      themeButton.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
      });
    }
  });

  /* 2. Footer year ------------------------------------------------------- */

  safe(function () {
    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  });

  /* 3. Sticky header state + back to top --------------------------------- */

  var toTop = $('#to-top');
  var footerInView = false;
  var scrollTicking = false;

  function setActiveLink(id) {
    $$('.nav__link').forEach(function (link) {
      if (link.getAttribute('href') === '#' + id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function onScroll() {
    scrollTicking = false;
    var y = window.pageYOffset || root.scrollTop;

    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 700 && !footerInView);

    // Near the bottom the last section may never cross the highlight band.
    var atBottom = window.innerHeight + y >= root.scrollHeight - 4;
    if (atBottom) setActiveLink('contact');
  }

  safe(function () {
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(onScroll);
      }
    }, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        var top = $('#top');
        if (top) { top.setAttribute('tabindex', '-1'); top.focus({ preventScroll: true }); }
      });
    }

    if (footer && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        footerInView = entries[0].isIntersecting;
        onScroll();
      }).observe(footer);
    }
  });

  /* 4. Mobile navigation ------------------------------------------------- */

  var nav = $('#primary-nav');
  var navButton = $('#nav-toggle');

  function setMenu(open) {
    if (!nav || !navButton) return;
    nav.classList.toggle('is-open', open);
    navButton.setAttribute('aria-expanded', String(open));
    navButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (header) header.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('is-locked', open);
  }

  function menuIsOpen() { return nav && nav.classList.contains('is-open'); }

  safe(function () {
    if (!nav || !navButton) return;

    navButton.addEventListener('click', function () { setMenu(!menuIsOpen()); });

    document.addEventListener('keydown', function (event) {
      if (!menuIsOpen()) return;

      if (event.key === 'Escape') {
        setMenu(false);
        navButton.focus();
        return;
      }

      // Keep keyboard focus inside the header while the full-screen menu is open.
      if (event.key === 'Tab' && header) {
        var items = $$('a[href], button', header).filter(function (el) { return el.offsetParent !== null; });
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    // Leaving the mobile breakpoint closes the menu.
    var desktop = window.matchMedia('(min-width: 1081px)');
    var onChange = function (event) { if (event.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  });

  /* 5. Active nav highlighting + scroll reveal --------------------------- */

  safe(function () {
    var revealItems = $$('[data-reveal]');
    var sections = $$('main section[id]');

    // Stagger children inside any [data-stagger] group.
    $$('[data-stagger]').forEach(function (group) {
      $$('[data-reveal]', group).forEach(function (item, index) {
        item.style.setProperty('--delay', (index * 0.07).toFixed(2) + 's');
      });
    });

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
      sections.forEach(function (section) { section.classList.add('is-visible'); });
      return;
    }

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealItems.forEach(function (item) { revealObserver.observe(item); });

    var sectionObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    sections.forEach(function (section) { sectionObserver.observe(section); });

    // A thin band across the middle of the viewport decides the current section.
    var activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target.id === 'top') {
          $$('.nav__link').forEach(function (link) { link.removeAttribute('aria-current'); });
        } else {
          setActiveLink(entry.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { activeObserver.observe(section); });
  });

  /* 6. Project card spotlight -------------------------------------------- */

  safe(function () {
    $$('[data-spotlight]').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
      }, { passive: true });
    });
  });

  /* 7. Copy email + toast ------------------------------------------------ */

  var toast = $('#toast');
  var toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 2400);
  }

  function copyWithFallback(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  safe(function () {
    var button = $('#copy-email');
    if (!button) return;

    button.addEventListener('click', function () {
      var email = button.getAttribute('data-email');
      var done = function () { showToast('Email address copied'); };
      var fail = function () { showToast('Copy failed. Select the address above and copy it manually.'); };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () {
          if (copyWithFallback(email)) done(); else fail();
        });
      } else if (copyWithFallback(email)) {
        done();
      } else {
        fail();
      }
    });
  });

  /* Contact form: opens the visitor's email app with the message filled in */

  safe(function () {
    var form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.reportValidity && !form.reportValidity()) return;

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.body.value.trim();
      var subject = 'Portfolio message from ' + name;
      var body = message + '\n\n' + name + '\n' + email;

      window.location.href = 'mailto:' + form.getAttribute('data-to') +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      showToast('Opening your email app');
    });
  });

  /* 8. Hero neural network ----------------------------------------------- */
  /* Signals travel through a small network. When one reaches the output
     layer, that output node lights up (lime = "current / live"). The pointer
     brightens nearby nodes. It pauses off-screen and under reduced motion. */

  safe(function () {
    var canvas = $('#network');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var LAYERS = [5, 8, 7, 15];     // input, two hidden layers, 15 output classes
    var width = 0;
    var height = 0;
    var layers = [];
    var nodes = [];
    var edges = [];
    var pulses = [];
    var colors = {};
    var pointer = { x: -1000, y: -1000 };
    var picked = null;
    var pickedEnergy = 0;
    var spawnTimer = 0;
    var running = false;
    var inView = true;
    var rafId = 0;
    var lastTime = 0;

    function readColors() {
      var style = window.getComputedStyle(root);
      var get = function (name) { return style.getPropertyValue(name).trim(); };
      colors = {
        edge: get('--net-edge'),
        node: get('--net-node'),
        accent: get('--accent'),
        violet: get('--violet'),
        lime: get('--lime')
      };
    }

    function build() {
      var padX = width * 0.11;
      var padY = height * 0.1;
      nodes = [];
      layers = [];
      edges = [];
      pulses = [];
      picked = null;
      pickedEnergy = 0;

      LAYERS.forEach(function (count, layerIndex) {
        var column = [];
        var x = padX + (width - 2 * padX) * (layerIndex / (LAYERS.length - 1));
        for (var i = 0; i < count; i++) {
          var y = padY + (height - 2 * padY) * ((i + 0.5) / count);
          var node = { x: x, y: y, energy: 0, radius: layerIndex === LAYERS.length - 1 ? 3.2 : 4.2 };
          column.push(node);
          nodes.push(node);
        }
        layers.push(column);
      });

      for (var l = 0; l < layers.length - 1; l++) {
        for (var a = 0; a < layers[l].length; a++) {
          for (var b = 0; b < layers[l + 1].length; b++) {
            edges.push([layers[l][a], layers[l + 1][b]]);
          }
        }
      }
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      build();
      if (reduceMotion.matches) setStaticState();
      draw();
    }

    // A fixed, readable frame for visitors who prefer reduced motion.
    function setStaticState() {
      var path = [layers[0][2], layers[1][4], layers[2][3], layers[3][7]];
      path.forEach(function (node) { node.energy = 0.9; });
      picked = path[path.length - 1];
      pickedEnergy = 1;
    }

    function spawnPulse() {
      var path = [];
      for (var i = 0; i < layers.length; i++) {
        path.push(layers[i][Math.floor(Math.random() * layers[i].length)]);
      }
      pulses.push({
        path: path,
        segment: 0,
        t: 0,
        speed: 0.9 + Math.random() * 0.4,
        color: Math.random() < 0.7 ? colors.accent : colors.violet
      });
      path[0].energy = 1;
    }

    function update(dt) {
      var i;
      for (i = 0; i < nodes.length; i++) {
        nodes[i].energy = Math.max(0, nodes[i].energy - dt * 1.8);
      }
      pickedEnergy = Math.max(0, pickedEnergy - dt * 0.35);

      spawnTimer -= dt;
      if (spawnTimer <= 0 && pulses.length < 3) {
        spawnPulse();
        spawnTimer = 1.1 + Math.random() * 0.8;
      }

      for (i = pulses.length - 1; i >= 0; i--) {
        var pulse = pulses[i];
        pulse.t += dt * pulse.speed;
        if (pulse.t >= 1) {
          pulse.segment += 1;
          pulse.t = 0;
          var reached = pulse.path[pulse.segment];
          reached.energy = 1;
          if (pulse.segment >= pulse.path.length - 1) {
            picked = reached;
            pickedEnergy = 1;
            pulses.splice(i, 1);
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Connections
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.edge;
      ctx.beginPath();
      for (var e = 0; e < edges.length; e++) {
        ctx.moveTo(edges[e][0].x, edges[e][0].y);
        ctx.lineTo(edges[e][1].x, edges[e][1].y);
      }
      ctx.stroke();

      // Signals in transit
      for (var p = 0; p < pulses.length; p++) {
        var pulse = pulses[p];
        var from = pulse.path[pulse.segment];
        var to = pulse.path[pulse.segment + 1];
        var hx = from.x + (to.x - from.x) * pulse.t;
        var hy = from.y + (to.y - from.y) * pulse.t;
        var tail = Math.max(0, pulse.t - 0.28);
        var tx = from.x + (to.x - from.x) * tail;
        var ty = from.y + (to.y - from.y) * tail;

        ctx.strokeStyle = pulse.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.fillStyle = pulse.color;
        ctx.beginPath();
        ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Nodes
      for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        var dx = node.x - pointer.x;
        var dy = node.y - pointer.y;
        var near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 110) * 0.65;
        var glow = Math.max(node.energy, near);

        ctx.fillStyle = colors.node;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        if (glow > 0.02) {
          ctx.globalAlpha = glow;
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + glow * 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // The output node the "model" picked
      if (picked && pickedEnergy > 0.02) {
        ctx.globalAlpha = pickedEnergy;
        ctx.fillStyle = colors.lime;
        ctx.beginPath();
        ctx.arc(picked.x, picked.y, picked.radius + 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = pickedEnergy * 0.7;
        ctx.strokeStyle = colors.lime;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(picked.x, picked.y, picked.radius + 7 + (1 - pickedEnergy) * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function frame(time) {
      if (!running) return;
      var dt = Math.min((time - lastTime) / 1000 || 0.016, 0.05);
      lastTime = time;
      update(dt);
      draw();
      rafId = window.requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion.matches || !inView || document.hidden) return;
      running = true;
      lastTime = window.performance.now();
      rafId = window.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(rafId);
    }

    readColors();
    resize();
    start();

    // Keep the canvas sharp when the layout changes.
    if ('ResizeObserver' in window) {
      var resizeFrame = 0;
      new ResizeObserver(function () {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(resize);
      }).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }).observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    window.addEventListener('themechange', function () {
      readColors();
      if (!running) draw();
    });

    var onMotionChange = function () {
      if (reduceMotion.matches) {
        stop();
        build();
        setStaticState();
        draw();
      } else {
        build();
        start();
      }
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);
    else if (reduceMotion.addListener) reduceMotion.addListener(onMotionChange);

    var panel = canvas.parentElement;
    panel.addEventListener('pointermove', function (event) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    }, { passive: true });
    panel.addEventListener('pointerleave', function () {
      pointer.x = -1000;
      pointer.y = -1000;
    });
  });

  /* 10. Portrait fallback ------------------------------------------------ */
  /* If assets/images/hamza.jpg is missing, show the logo placeholder instead
     of a broken-image icon. */

  safe(function () {
    $$('.portrait__img').forEach(function (img) {
      var useFallback = function () {
        img.onerror = null;
        img.src = 'assets/icons/favicon.svg';
        img.classList.add('is-placeholder');
      };
      img.addEventListener('error', useFallback);
      if (img.complete && img.naturalWidth === 0) useFallback();
    });
  });

  /* 11. Certificate image fallback --------------------------------------- */

  safe(function () {
    $$('.cert__img').forEach(function (img) {
      var media = img.parentElement;
      var markMissing = function () { media.classList.add('is-missing'); };
      var markLoaded = function () { media.classList.remove('is-missing'); };
      // Only react to real load / error events. Lazy images that have not
      // started loading can look "complete but empty", so do not trust that state.
      img.addEventListener('error', markMissing);
      img.addEventListener('load', markLoaded);
      if (img.getAttribute('loading') !== 'lazy' && img.complete && img.naturalWidth === 0) markMissing();
    });
  });

  /* 9. In-page links: move focus to the target section ------------------- */
  /* Scrolling itself is native (CSS scroll-behavior), this only fixes focus
     for keyboard and screen reader users and closes the mobile menu. */

  safe(function () {
    document.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;

      var id = link.getAttribute('href').slice(1);
      var target = id ? document.getElementById(id) : null;
      if (!target) return;

      setMenu(false);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

})();