/* Local zebra ecosystem diagram: each ring expands below. */
(function () {
  'use strict';
  var root = document.querySelector('[data-eco]');
  if (!root) return;
  root.addEventListener('click', function (e) {
    var btn = e.target.closest('.eco__ring > button');
    if (!btn) return;
    var body = document.getElementById(btn.getAttribute('aria-controls'));
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    if (body) body.hidden = open;
  });
})();
