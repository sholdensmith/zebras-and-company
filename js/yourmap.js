/* Draw your own map: six questions, one screen each, laid out on the logic model's stages.
   Drafts persist in localStorage. Nothing leaves the browser. */
(function () {
  'use strict';
  var root = document.querySelector('[data-yourmap]');
  if (!root) return;

  var KEY = 'zc-yourmap-v1';
  var total = parseInt(root.getAttribute('data-total'), 10);
  var stages = JSON.parse(root.getAttribute('data-stages'));
  var form = root.querySelector('[data-ym-form]');
  var qs = Array.prototype.slice.call(root.querySelectorAll('[data-ym-q]'));
  var fields = qs.map(function (q) { return q.querySelector('textarea'); });
  var progress = root.querySelector('[data-ym-progress]');
  var back = root.querySelector('[data-ym-back]');
  var next = root.querySelector('[data-ym-next]');
  var finish = root.querySelector('[data-ym-finish]');
  var map = root.querySelector('[data-ym-map]');
  var stagesEl = root.querySelector('[data-ym-stages]');
  var emptyText = root.querySelector('[data-ym-empty]').innerHTML;
  var step = 0;

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved) return;
      fields.forEach(function (f, i) { if (saved.answers && saved.answers[i]) f.value = saved.answers[i]; });
      if (saved.done) { render(); show(map); hide(form); }
      else if (typeof saved.step === 'number') step = Math.min(saved.step, total - 1);
    } catch (e) { /* storage unavailable: the tool still works for this visit */ }
  }
  function save(done) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ answers: fields.map(function (f) { return f.value; }), step: step, done: !!done }));
    } catch (e) { /* ignore */ }
  }
  function show(el) { el.hidden = false; }
  function hide(el) { el.hidden = true; }

  function go(n, focus) {
    step = Math.max(0, Math.min(n, total - 1));
    qs.forEach(function (q, i) { q.hidden = i !== step; });
    back.disabled = step === 0;
    next.hidden = step === total - 1;
    finish.hidden = step !== total - 1;
    if (progress) progress.textContent = progress.getAttribute('data-tpl').replace('{n}', step + 1).replace('{total}', total);
    if (focus) fields[step].focus();
    save(false);
  }

  function render() {
    var byStage = {};
    fields.forEach(function (f) {
      byStage[f.getAttribute('data-stage')] = { q: f.getAttribute('data-q'), sub: f.getAttribute('data-sub'), a: f.value.trim() };
    });
    stagesEl.innerHTML = stages.map(function (s) {
      var e = byStage[s] || {};
      var answer = e.a ? '<p class="yourmap__answer">' + escapeHtml(e.a).replace(/\n/g, '<br>') + '</p>' : '<p class="yourmap__answer yourmap__answer--empty">' + emptyText + '</p>';
      return '<li><div class="yourmap__stage"><span class="eyebrow">' + escapeHtml(s) + '</span>' +
        (e.q ? '<p class="yourmap__stageq">' + escapeHtml(e.q) + '</p>' : '') + '</div>' + answer + '</li>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function asText() {
    var lines = [root.querySelector('[data-ym-map] h4').textContent, ''];
    fields.slice().reverse().forEach(function (f) {
      lines.push(f.getAttribute('data-stage').toUpperCase() + ' (' + f.getAttribute('data-sub') + ')');
      lines.push(f.getAttribute('data-q'));
      lines.push(f.value.trim() || '[ ' + root.querySelector('[data-ym-empty]').textContent + ' ]');
      lines.push('');
    });
    lines.push(root.querySelector('.yourmap__caption').textContent.trim());
    return lines.join('\n');
  }

  back.addEventListener('click', function () { go(step - 1, true); });
  next.addEventListener('click', function () { go(step + 1, true); });
  fields.forEach(function (f) {
    f.addEventListener('input', function () { save(false); });
    f.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); step === total - 1 ? form.requestSubmit() : go(step + 1, true); }
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    render();
    save(true);
    hide(form); show(map);
    map.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  root.querySelector('[data-ym-edit]').addEventListener('click', function () {
    hide(map); show(form); go(0, true); save(false);
  });
  root.querySelector('[data-ym-print]').addEventListener('click', function () {
    document.body.classList.add('print-map');
    window.print();
    setTimeout(function () { document.body.classList.remove('print-map'); }, 500);
  });
  var copyBtn = root.querySelector('[data-ym-copy]');
  copyBtn.addEventListener('click', function () {
    var label = copyBtn.firstChild.textContent;
    var done = function () { copyBtn.firstChild.textContent = copyBtn.getAttribute('data-copied'); setTimeout(function () { copyBtn.firstChild.textContent = label; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(asText()).then(done);
    else { var ta = document.createElement('textarea'); ta.value = asText(); document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done(); }
  });
  root.querySelector('[data-ym-reset]').addEventListener('click', function () {
    fields.forEach(function (f) { f.value = ''; });
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    hide(map); show(form); go(0, true);
  });

  load();
  if (!form.hidden) go(step, false);
})();
