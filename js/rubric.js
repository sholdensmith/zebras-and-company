/* Due diligence rubric: collapsed by default. */
(function () {
  'use strict';
  var btn = document.querySelector('[data-rubric-toggle]');
  if (!btn) return;
  var body = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    if (body) body.hidden = open;
    btn.firstChild.textContent = open ? btn.getAttribute('data-open') : btn.getAttribute('data-close');
  });
})();
