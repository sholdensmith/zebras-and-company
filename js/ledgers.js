/* Two ledgers: one control switches which column is in focus; the other dims. */
(function () {
  'use strict';
  var root = document.querySelector('[data-ledgers]');
  if (!root) return;
  var btns = root.querySelectorAll('[data-ledger-focus]');
  function focus(key) {
    root.setAttribute('data-focus', key);
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ledger-focus') === key)); });
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () { focus(b.getAttribute('data-ledger-focus')); });
  });
  focus('left');
})();
