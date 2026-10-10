/* Mi botiquín — web: visor de capturas a pantalla completa. */
(function () {
  'use strict';
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-full]'));
  var box = document.getElementById('lightbox');
  if (!items.length || !box) return;
  var img = box.querySelector('img');
  var cap = box.querySelector('p');
  var current = 0;
  var lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    var el = items[current];
    img.src = el.getAttribute('data-full');
    img.alt = el.querySelector('img').alt;
    cap.textContent = el.getAttribute('data-caption') || img.alt;
  }
  function open(i) {
    lastFocus = items[i];
    show(i);
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

  items.forEach(function (el, i) { el.addEventListener('click', function () { open(i); }); });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
