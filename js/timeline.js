/* Two-lane timeline: tap a point, one sentence appears below. Arrow keys move along the track. */
(function () {
  'use strict';
  var root = document.querySelector('[data-timeline]');
  if (!root) return;
  var btns = Array.prototype.slice.call(root.querySelectorAll('[data-tl]'));
  var detail = root.querySelector('[data-tl-detail]');

  function select(n, focusBtn) {
    btns.forEach(function (b, i) {
      var on = i === n;
      b.setAttribute('aria-expanded', String(on));
      b.parentNode.classList.toggle('is-current', on);
      if (on) {
        var body = document.getElementById(b.getAttribute('aria-controls'));
        if (detail && body) detail.innerHTML = body.innerHTML;
        if (focusBtn) b.focus();
      }
    });
  }

  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { select(i, false); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(Math.min(i + 1, btns.length - 1), true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(Math.max(i - 1, 0), true); }
    });
  });
  select(0, false);
})();
