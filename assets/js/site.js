/* Rupnar IPTV — web oficial: menú móvil, visor de capturas e idioma. */
(function () {
  'use strict';

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  // Recordar el idioma que elige el visitante con el selector ES | EN
  document.querySelectorAll('[data-setlang]').forEach(function (a) {
    a.addEventListener('click', function () { store('rupnar_lang', a.getAttribute('data-setlang')); });
  });

  // Menú en móvil
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a[href^="#"]')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Versión y tamaño del último instalador publicado (si GitHub no responde, queda el texto fijo)
  var rel = document.getElementById('release-info');
  if (rel && window.fetch) {
    fetch('https://api.github.com/repos/rupnardev/rupnariptv-releases/releases/latest')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.tag_name) return;
        var parts = [rel.getAttribute('data-label') + ' ' + String(d.tag_name).replace(/^v/, '')];
        (d.assets || []).forEach(function (a) {
          if (a.name === 'RupnarIPTV-Setup.exe' && a.size) parts.push(Math.round(a.size / 1048576) + ' MB');
        });
        rel.textContent = parts.join(' · ') + ' · ' + rel.textContent;
      })
      .catch(function () {});
  }

  // Visor de capturas a pantalla completa
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-full]'));
  var box = document.getElementById('lightbox');
  if (!items.length || !box) return;
  var img = box.querySelector('img');
  var cap = box.querySelector('p');
  var current = 0;
  var lastFocus = null;
  // Solo las de la galería forman la secuencia (las del recorrido abren su propia imagen)
  var seq = items.filter(function (el) { return el.closest('.gallery'); });

  function show(el) {
    img.src = el.getAttribute('data-full');
    img.alt = el.querySelector('img').alt;
    cap.textContent = el.getAttribute('data-caption') || img.alt;
    var i = seq.indexOf(el);
    if (i >= 0) current = i;
    box.classList.toggle('single', i < 0);
    box.querySelector('.lb-prev').hidden = i < 0;
    box.querySelector('.lb-next').hidden = i < 0;
  }
  function open(el) {
    lastFocus = el;
    show(el);
    box.classList.add('open');
    document.body.classList.add('no-scroll');
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('open');
    document.body.classList.remove('no-scroll');
    img.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }
  function step(d) {
    if (box.classList.contains('single')) return;
    current = (current + d + seq.length) % seq.length;
    show(seq[current]);
  }

  items.forEach(function (el) { el.addEventListener('click', function () { open(el); }); });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
  box.querySelector('.lb-next').addEventListener('click', function () { step(1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  // Deslizar con el dedo en móvil
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    x0 = null;
  });
})();
