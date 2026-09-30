/* Ten founders, one question. The visitor chooses whom to ask, in any order.
   When all ten have been asked, an eleventh slot opens for the visitor's own answer,
   kept in localStorage only. */
(function () {
  'use strict';
  var root = document.querySelector('[data-founders]');
  if (!root) return;

  var total = parseInt(root.getAttribute('data-total'), 10);
  var people = Array.prototype.slice.call(root.querySelectorAll('[data-ask]'));
  var cards = Array.prototype.slice.call(root.querySelectorAll('.founders__card'));
  var prompt = root.querySelector('[data-prompt]');
  var count = root.querySelector('[data-count]');
  var you = root.querySelector('[data-ask="you"]');
  var form = root.querySelector('[data-you-form]');
  var yours = root.querySelector('[data-you-answer]');
  var yoursText = root.querySelector('[data-you-text]');
  var reset = root.querySelector('[data-you-reset]');

  var KEY = 'zc-founders';
  var state = { asked: [], you: '' };
  try { state = Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var tpl = {
    some: (count && count.getAttribute('data-some')) || 'Asked {n} of {total}.',
    all: (count && count.getAttribute('data-all')) || 'You have asked all {total}. One more.'
  };

  function fill(s, n) { return s.replace('{n}', n).replace('{total}', total); }

  function render(current) {
    var n = state.asked.length;
    people.forEach(function (p) {
      var id = p.getAttribute('data-ask');
      var asked = id === 'you' ? !!state.you : state.asked.indexOf(id) > -1;
      p.classList.toggle('is-asked', asked);
      p.classList.toggle('is-current', id === current);
      p.setAttribute('aria-pressed', String(id === current));
    });
    cards.forEach(function (c) { c.classList.toggle('is-current', c.getAttribute('data-index') === current); });
    if (prompt) prompt.hidden = current !== null;
    if (count) count.textContent = n === 0 ? '' : n >= total ? fill(tpl.all, n) : fill(tpl.some, n);
    if (you) you.hidden = n < total;
    if (form && yours) {
      var has = !!state.you;
      form.hidden = has;
      yours.hidden = !has;
      if (has) yoursText.textContent = state.you;
    }
  }

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-ask]');
    if (!btn) return;
    var id = btn.getAttribute('data-ask');
    if (id !== 'you' && state.asked.indexOf(id) === -1) { state.asked.push(id); save(); }
    render(id);
    if (id === 'you' && form && !form.hidden) {
      var ta = form.querySelector('textarea');
      if (ta) ta.focus();
    }
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ta = form.querySelector('textarea');
      var v = (ta.value || '').trim();
      if (!v) return;
      state.you = v;
      save();
      render('you');
    });
  }
  if (reset) {
    reset.addEventListener('click', function () {
      state.you = '';
      save();
      var ta = form.querySelector('textarea');
      if (ta) ta.value = '';
      render('you');
      if (ta) ta.focus();
    });
  }

  /* Copy the count templates from data attributes if present; otherwise defaults above. */
  render(null);
})();
