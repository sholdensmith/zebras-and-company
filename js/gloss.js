/* Inline glossary: a term opens its definition below the line; a second tap closes it. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.term');
    if (!btn) return;
    var def = document.getElementById(btn.getAttribute('aria-controls'));
    if (!def) return;
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    def.hidden = open;
  });
})();
