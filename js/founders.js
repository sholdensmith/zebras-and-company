/* Ten founders, one question: step through the answers one at a time. */
(function () {
  'use strict';
  var root = document.querySelector('[data-founders]');
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll('.founders__card'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-dots] i'));
  var prev = root.querySelector('[data-prev]');
  var next = root.querySelector('[data-next]');
  var count = root.querySelector('[data-count]');
  var i = 0;

  function show(n) {
    i = (n + cards.length) % cards.length;
    cards.forEach(function (c, k) { c.classList.toggle('is-current', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('is-current', k === i); });
    if (count) count.textContent = (i + 1) + ' / ' + cards.length;
  }

  prev.addEventListener('click', function () { show(i - 1); });
  next.addEventListener('click', function () { show(i + 1); });

  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { show(i + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { show(i - 1); e.preventDefault(); }
  });

  /* Swipe */
  var x0 = null;
  root.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
    x0 = null;
  }, { passive: true });

  show(0);
})();
