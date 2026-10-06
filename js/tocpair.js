/* Two TOCs: side by side on wide screens; a pill pair switches between them on narrow ones. */
(function () {
  'use strict';
  var root = document.querySelector('[data-tocpair]');
  if (!root) return;
  var btns = root.querySelectorAll('[data-toc-show]');
  function show(key) {
    root.setAttribute('data-show', key);
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-toc-show') === key)); });
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-toc-show')); });
  });
  show('left');
})();
