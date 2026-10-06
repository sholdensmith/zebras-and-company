#!/usr/bin/env node
/* Assembles index.html from content/<lang>/*.json.
   Usage: node build.js [lang]   (default: en)
   No dependencies. The shipped index.html is complete without JavaScript. */

const fs = require('fs');
const path = require('path');

const lang = process.argv[2] || 'en';
const dir = path.join(__dirname, 'content', lang);
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

const frame = read('frame.json');
const glossary = read('glossary.json');
const stops = frame.stops.map((s) => read(`${s.id}.json`));

const sources = []; // { stop, label, src }
let termSeq = 0;

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Inline glossary: {{term:key}} becomes a button plus a hidden definition. */
function text(s = '') {
  return esc(s).replace(/\{\{term:([a-z0-9-]+)\}\}/g, (_, key) => {
    const t = glossary.terms[key];
    if (!t) return key;
    const id = `term-${key}-${++termSeq}`;
    return (
      `<button class="term" type="button" aria-expanded="false" aria-controls="${id}">${esc(t.label)}</button>` +
      `<span class="term-def" id="${id}" hidden><strong>${esc(t.label)}</strong>${esc(t.def)} <span class="muted">(Glossary, ${esc(t.src || glossary.src)})</span></span>`
    );
  });
}

const draftCls = (d) => (d ? ' draft' : '');
const note = (stop, label, src) => src && sources.push({ stop, label, src });

/* ---------- block renderers ---------- */
const R = {
  prose(b, stop) {
    note(stop, b.heading || 'Prose', b.src);
    return `<div class="block reveal${draftCls(b.draft)}">
      ${b.heading ? `<h3>${esc(b.heading)}</h3>` : ''}
      <div class="measure">${b.paragraphs.map((p) => `<p>${text(p)}</p>`).join('')}</div>
    </div>`;
  },

  stats(b, stop) {
    note(stop, 'Figures', b.src);
    return `<div class="block reveal" data-exception="${b.exception ? 'stat-block' : ''}">
      <div class="stats">${b.items
        .map(
          (i) => `<div class="stat">
            <div class="stat__num${String(i.num).length > 6 ? ' stat__num--long' : ''}">${esc(i.num)}${i.unit ? `<small>${esc(i.unit)}</small>` : ''}</div>
            <div class="stat__gloss">${text(i.gloss)}</div>
          </div>`
        )
        .join('')}</div>
    </div>`;
  },

  quote(b, stop) {
    note(stop, b.who || 'Quotation', b.src);
    const cls = ['quote', b.large ? 'quote--large' : '', b.bare ? 'quote--bare' : ''].filter(Boolean).join(' ');
    return `<div class="block reveal"><blockquote class="${cls}">
      <p>${text(b.text)}</p>
      ${b.who ? `<footer><b>${esc(b.who)}</b>${b.role ? `, ${esc(b.role)}` : ''}</footer>` : ''}
    </blockquote></div>`;
  },

  twin(b, stop) {
    note(stop, `${b.left.title} / ${b.right.title}`, b.src);
    const col = (c) => `<div>
      <h3>${esc(c.title)}</h3>
      ${c.sub ? `<span class="gloss">${esc(c.sub)}</span>` : ''}
      <ol>${c.items
        .map((i) => `<li><div>${i.strong ? `<strong>${esc(i.strong)}</strong>` : ''}${text(i.text)}</div></li>`)
        .join('')}</ol>
    </div>`;
    return `<div class="block reveal"><div class="twin">${col(b.left)}${col(b.right)}</div></div>`;
  },

  typology(b, stop) {
    note(stop, b.heading, b.src);
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <div class="typology">${b.items
        .map(
          (i) => `<div><h3>${esc(i.title)}</h3><p>${text(i.text)}</p>${
            i.examples ? `<p class="examples">${esc(i.examples)}</p>` : ''
          }</div>`
        )
        .join('')}</div>
    </div>`;
  },

  founders(b, stop) {
    note(stop, b.heading, b.src);
    const u = b.ui;
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      <p class="founders__q">${esc(b.question)}</p>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <div class="founders" data-founders data-total="${b.items.length}">
        <div class="founders__people" role="group" aria-label="Who to ask">
          ${b.items
            .map(
              (f, i) => `<button class="founders__person" type="button" data-ask="${i}" aria-pressed="false">
                <span class="founders__name">${esc(f.name)}</span>
                <span class="founders__org">${esc(f.org)}</span>
              </button>`
            )
            .join('')}
          <button class="founders__person founders__person--you" type="button" data-ask="you" aria-pressed="false" hidden>
            <span class="founders__name">${esc(u.you_name)}</span>
            <span class="founders__org">${esc(u.you_org)}</span>
          </button>
        </div>
        <div class="founders__stage">
          <p class="founders__prompt${draftCls(b.ui_draft)}" data-prompt>${esc(u.prompt)}</p>
          <div class="founders__cards" aria-live="polite">
          ${b.items
            .map(
              (f, i) => `<article class="founders__card" data-index="${i}">
              <p>${text(f.text)}</p>
              <div class="founders__who"><strong>${esc(f.name)}</strong><span>${esc(f.org)}</span></div>
            </article>`
            )
            .join('')}
          <article class="founders__card founders__card--you" data-index="you">
            <form class="founders__form" data-you-form>
              <label class="founders__label${draftCls(b.ui_draft)}" for="founders-you">${esc(u.you_prompt)}</label>
              <textarea id="founders-you" rows="4" required placeholder="${esc(u.you_placeholder)}"></textarea>
              <div class="founders__formrow">
                <button class="pill pill--sm" type="submit">${esc(u.you_submit)}<span class="arrow"></span></button>
                <span class="founders__fine">${esc(u.you_fine)}</span>
              </div>
            </form>
            <div class="founders__yours" data-you-answer hidden>
              <p data-you-text></p>
              <div class="founders__who"><strong>${esc(u.you_name)}</strong><span>${esc(u.you_org)}</span></div>
              <button class="founders__reset" type="button" data-you-reset>${esc(u.you_reset)}</button>
            </div>
          </article>
          </div>
        </div>
        <p class="founders__count" data-count data-some="${esc(u.count_some)}" data-all="${esc(u.count_all)}" aria-live="polite"></p>
      </div>
    </div>`;
  },

  eco(b, stop) {
    note(stop, b.heading, b.src);
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <div class="eco" data-eco>
        <div class="eco__center">${esc(b.center)}</div>
        ${b.rings
          .map(
            (r, i) => `<div class="eco__ring">
            <button type="button" aria-expanded="false" aria-controls="eco-${i}"><h3>${esc(r.title)}</h3><span class="arrow"></span></button>
            <div class="eco__body" id="eco-${i}" hidden>
              <ul>${r.actors.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
              <p class="eco__flow">${esc(r.flow)}</p>
            </div>
          </div>`
          )
          .join('')}
      </div>
      ${b.footnote ? `<p class="muted" style="font-size:13px">${esc(b.footnote)}</p>` : ''}
    </div>`;
  },

  /* ---------- pass two ---------- */

  /* Two-column contrast table (Stop 3: fund vs. Z&C) */
  compare(b, stop) {
    note(stop, b.heading, b.src);
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <table class="compare">
        <thead><tr><th scope="col"><span class="visually-hidden">Dimension</span></th><th scope="col">${esc(b.left_title)}</th><th scope="col">${esc(b.right_title)}</th></tr></thead>
        <tbody>${b.rows
          .map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.left)}</td><td>${esc(r.right)}</td></tr>`)
          .join('')}</tbody>
      </table>
      ${b.after ? `<div class="measure${draftCls(b.after_draft)}">${b.after.map((p) => `<p>${text(p)}</p>`).join('')}</div>` : ''}
    </div>`;
  },

  /* LIFE type1 (Stop 3) */
  life(b, stop) {
    note(stop, b.heading, b.src);
    return `<div class="block reveal">
      <h3>${esc(b.heading)}<span class="gloss">${esc(b.sub)}</span></h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <ol class="life">${b.how
        .map((h) => `<li><h4>${esc(h.title)}</h4><p>${text(h.text)}</p></li>`)
        .join('')}</ol>
      <div class="life__terms">
        <p class="eyebrow">${esc(b.conditions_heading)}</p>
        <ul>${b.conditions.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        <p class="muted life__note${draftCls(b.conditions_note_draft)}">${esc(b.conditions_note)}</p>
      </div>
      <p class="measure life__closing">${text(b.closing)}</p>
      <p class="life__links">${b.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join(' &nbsp;·&nbsp; ')}</p>
    </div>`;
  },

  /* The two TOCs, as text until the English diagrams arrive (Stop 3) */
  tocpair(b, stop) {
    note(stop, b.heading, b.src);
    const side = (s, key) => `<article class="tocpair__map" data-toc="${key}">
      <p class="eyebrow">${esc(s.label)}</p>
      <h4>${esc(s.title)}</h4>
      <div class="tocpair__center"><span>${esc(s.center)}</span><small>at the center</small></div>
      <p>${text(s.text)}</p>
      <p class="muted tocpair__src">${esc(s.src)}</p>
    </article>`;
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <div class="tocpair" data-tocpair>
        <div class="tocpair__controls" role="group" aria-label="Which map">
          <button class="pill pill--sm pill--outline" type="button" data-toc-show="left" aria-pressed="true">${esc(b.ui.left)}</button>
          <button class="pill pill--sm pill--outline" type="button" data-toc-show="right" aria-pressed="false">${esc(b.ui.right)}</button>
        </div>
        <div class="tocpair__maps">${side(b.left, 'left')}${side(b.right, 'right')}</div>
      </div>
      ${b.placeholder_note ? `<p class="muted tocpair__note${draftCls(b.placeholder_note_draft)}">${esc(b.placeholder_note)}</p>` : ''}
    </div>`;
  },

  /* Due diligence rubric, collapsed by default (Stop 3) */
  rubric(b, stop) {
    note(stop, b.heading, b.src);
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <button class="rubric__toggle" type="button" aria-expanded="false" aria-controls="rubric-body" data-rubric-toggle data-open="${esc(b.toggle_open)}" data-close="${esc(b.toggle_close)}">${esc(b.toggle_open)}<span class="arrow"></span></button>
      <div class="rubric" id="rubric-body" hidden>
        ${b.groups
          .map(
            (g) => `<section class="rubric__group">
            <h4>${esc(g.title)}</h4>
            <dl>${g.items.map((i) => `<div><dt>${esc(i.sub)}</dt><dd>${esc(i.q)}</dd></div>`).join('')}</dl>
          </section>`
          )
          .join('')}
      </div>
    </div>`;
  },

  /* Contextual download */
  cta(b, stop) {
    note(stop, 'Download pointer', b.src);
    return `<div class="block reveal cta">
      <p class="measure${draftCls(b.text_draft)}">${esc(b.text)}</p>
      <a class="pill pill--outline" href="${esc(frame.report_pdf)}" download>${esc(b.label)}<span class="arrow"></span></a>
    </div>`;
  },

  /* A case (Stop 4) */
  case(b, stop) {
    const label = `${stop} · ${b.name}`;
    note(label, 'Account', b.src);
    note(label, 'Figures', b.stats_src);
    if (b.after_src) note(label, 'Collaboration and coverage', b.after_src);
    if (b.steps_src) note(label, 'Scheme', b.steps_src);
    return `<article class="block reveal case">
      <header class="case__head">
        <p class="eyebrow">${esc(b.number)}</p>
        <h3>${esc(b.name)}<span class="gloss">${esc(b.place)} · ${esc(b.person)}</span></h3>
        <p class="case__kind">${esc(b.kind)}</p>
      </header>
      <div class="case__photo" role="img" aria-label="${esc(b.photo_alt)}"><span>${esc(b.photo_alt)}</span></div>
      <div class="measure${draftCls(b.paragraphs_draft)}">${b.paragraphs.map((p) => `<p>${text(p)}</p>`).join('')}</div>
      ${
        b.stats
          ? `<div data-exception="stat-block">
          <p class="eyebrow">${esc(b.stats_heading)}</p>
          <div class="stats stats--case">${b.stats
            .map(
              (i) => `<div class="stat">
              <div class="stat__num${String(i.num).length > 6 ? ' stat__num--long' : ''}">${esc(i.num)}${i.unit ? `<small>${esc(i.unit)}</small>` : ''}</div>
              <div class="stat__gloss">${text(i.gloss)}</div>
            </div>`
            )
            .join('')}</div>
        </div>`
          : ''
      }
      ${
        b.steps
          ? `<div class="steps"><p class="eyebrow">${esc(b.steps_heading)}</p><ol>${b.steps
              .map((s) => `<li>${esc(s)}</li>`)
              .join('')}</ol></div>`
          : ''
      }
      ${b.after ? `<div class="measure${draftCls(b.after_draft)}">${b.after.map((p) => `<p>${text(p)}</p>`).join('')}</div>` : ''}
      ${
        b.quote
          ? `<blockquote class="quote"><p>${text(b.quote.text)}</p><footer><b>${esc(b.quote.who)}</b>${
              b.quote.role ? `, ${esc(b.quote.role)}` : ''
            }</footer></blockquote>`
          : ''
      }
    </article>`;
  },

  /* Two ledgers (Stop 4) */
  ledgers(b, stop) {
    note(stop, b.heading, b.src);
    const col = (c, key) => `<div class="ledger" data-ledger="${key}">
      <h4>${esc(c.title)}</h4>
      <ul>${c.items.map((i) => `<li><span>${text(i.text)}</span><small>${esc(i.src)}</small></li>`).join('')}</ul>
    </div>`;
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <div class="ledgers" data-ledgers>
        <div class="ledgers__controls" role="group" aria-label="Which ledger is in focus">
          <button class="pill pill--sm pill--outline" type="button" data-ledger-focus="left" aria-pressed="true">${esc(b.ui.left)}</button>
          <button class="pill pill--sm pill--outline" type="button" data-ledger-focus="right" aria-pressed="false">${esc(b.ui.right)}</button>
        </div>
        <div class="ledgers__cols">${col(b.left, 'left')}${col(b.right, 'right')}</div>
      </div>
    </div>`;
  },

  /* Credit strip (Stop 4) */
  credits(b, stop) {
    note(stop, b.heading, b.src);
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <ul class="credits">${b.items
        .map((i) => `<li><strong>${esc(i.name)}</strong><span>${text(i.text)}</span><small>${esc(i.src)}</small></li>`)
        .join('')}</ul>
    </div>`;
  },

  /* Two-lane timeline (Stop 6) */
  timeline(b, stop) {
    note(stop, b.heading, b.src);
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <div class="timeline" data-timeline>
        <div class="timeline__lanes" aria-hidden="true">${b.lanes.map((l) => `<span>${esc(l)}</span>`).join('')}</div>
        <ol class="timeline__track">${b.items
          .map(
            (i, n) => `<li class="timeline__point timeline__point--lane${i.lane}">
            <button type="button" data-tl="${n}" aria-expanded="false" aria-controls="tl-${n}">
              <span class="timeline__year">${esc(i.year)}</span>
              <span class="timeline__dot"></span>
              <span class="timeline__title">${esc(i.title)}</span>
            </button>
            <div class="timeline__body" id="tl-${n}" hidden><p>${text(i.text)}</p><small>${esc(i.src)}</small></div>
          </li>`
          )
          .join('')}</ol>
        <div class="timeline__detail" data-tl-detail aria-live="polite"></div>
        <p class="timeline__legend">${b.lanes
          .map((l, i) => `<span><span class="timeline__dot timeline__dot--legend${i ? ' timeline__dot--filled' : ''}" aria-hidden="true"></span>${esc(l)}</span>`)
          .join('')}</p>
      </div>
    </div>`;
  },

  /* Draw your own map (Stop 7) */
  yourmap(b, stop) {
    note(stop, b.heading, b.src);
    note(stop, 'Logic model stages', b.stages_src);
    const u = b.ui;
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <div class="yourmap" data-yourmap data-total="${b.questions.length}" data-stages='${esc(JSON.stringify(b.stages_order))}'>
        <form class="yourmap__form" data-ym-form>
          <p class="yourmap__progress${draftCls(b.ui_draft)}" data-ym-progress data-tpl="${esc(u.progress)}"></p>
          ${b.questions
            .map(
              (q, i) => `<fieldset class="yourmap__q" data-ym-q="${i}">
              <legend><span class="eyebrow">${esc(q.stage)} · ${esc(q.sub)}</span><span class="yourmap__question">${esc(q.q)}</span><small class="muted">${esc(q.src)}</small></legend>
              <textarea id="ym-${i}" name="ym-${i}" rows="5" data-stage="${esc(q.stage)}" data-sub="${esc(q.sub)}" data-q="${esc(q.q)}" placeholder="${esc(u.placeholder)}" aria-label="${esc(q.q)}"></textarea>
            </fieldset>`
            )
            .join('')}
          <div class="yourmap__nav">
            <button class="arrow-btn arrow-btn--prev" type="button" data-ym-back aria-label="${esc(u.back)}"><span class="arrow"></span></button>
            <button class="pill" type="button" data-ym-next>${esc(u.next)}<span class="arrow"></span></button>
            <button class="pill" type="submit" data-ym-finish hidden>${esc(u.finish)}<span class="arrow"></span></button>
          </div>
          <p class="yourmap__fine muted${draftCls(b.ui_draft)}">${esc(u.fine)}</p>
        </form>
        <section class="yourmap__map" data-ym-map hidden aria-label="${esc(u.map_title)}">
          <h4 class="display">${esc(u.map_title)}</h4>
          <ol class="yourmap__stages" data-ym-stages></ol>
          <p class="yourmap__caption">${esc(u.map_caption)} <small class="muted">(${esc(u.map_caption_src)})</small></p>
          <div class="yourmap__actions">
            <button class="pill pill--outline" type="button" data-ym-edit>${esc(u.edit)}<span class="arrow"></span></button>
            <button class="pill" type="button" data-ym-print>${esc(u.print)}<span class="arrow"></span></button>
            <button class="pill pill--outline" type="button" data-ym-copy data-copied="${esc(u.copied)}">${esc(u.copy)}<span class="arrow"></span></button>
            <button class="yourmap__reset" type="button" data-ym-reset>${esc(u.reset)}</button>
          </div>
        </section>
        <template data-ym-empty>${esc(u.empty)}</template>
      </div>
    </div>`;
  },

  stub(b) {
    return `<div class="block stub"><p class="eyebrow">Not built yet</p><p class="measure">${esc(b.text)}</p></div>`;
  },
};

/* ---------- page pieces ---------- */
function navCard() {
  return `<nav class="nav-card" aria-label="The argument" data-nav>
    <div class="nav-card__head">
      <span class="nav-card__title">${esc(frame.nav_title)}</span>
      <span class="nav-card__current" data-current data-default="${esc(frame.nav_title)}">${esc(frame.nav_title)}</span>
      <button class="nav-card__toggle" type="button" aria-expanded="false" data-nav-toggle>Menu</button>
    </div>
    <ol class="nav-card__list">
      ${frame.stops
        .map(
          (s) => `<li><a href="#${s.id}" data-nav-link="${s.id}"><span><span class="nav-card__word">${esc(s.word)}</span><span class="nav-card__gloss">${esc(
            s.gloss
          )}</span></span></a></li>`
        )
        .join('')}
    </ol>
    <a class="pill pill--sm" href="${esc(frame.report_pdf)}" download>${esc(frame.download_label)}<span class="arrow"></span></a>
  </nav>`;
}

function hero() {
  const h = frame.hero;
  return `<header class="hero">
    <div class="hero__img" role="img" aria-label="Photograph placeholder"></div>
    <div class="veil" aria-hidden="true"></div>
    <div class="logo"><a href="${esc(frame.logo.href)}">${esc(frame.logo.text)}</a></div>
    <div class="container hero__inner">
      <p class="eyebrow" style="color:rgba(255,255,255,.8)">${esc(h.eyebrow)}</p>
      <h1>${esc(h.title)}</h1>
      <p class="hero__sub${draftCls(h.sub_draft)}">${esc(h.sub)}</p>
      <div class="hero__actions">
        <a class="pill pill--white" href="${esc(h.primary.href)}">${esc(h.primary.label)}<span class="arrow"></span></a>
        <a class="pill pill--outline" href="${esc(h.secondary.href)}" download>${esc(h.secondary.label)}<span class="arrow"></span></a>
      </div>
    </div>
  </header>`;
}

function statement() {
  const s = frame.statement;
  note('Frame', 'Statement panel', s.src);
  return `<div class="container"><section class="panel${draftCls(s.draft)}" aria-label="About this page">
    ${s.paragraphs.map((p) => `<p>${text(p)}</p>`).join('')}
  </section></div>`;
}

function stop(s) {
  const label = `${s.number}. ${s.word}`;
  const theme = s.theme ? ` stop--${s.theme}` : '';
  return `<section class="stop${theme}${s.stub ? ' stop--stub' : ''}" id="${s.id}" aria-labelledby="${s.id}-title">
    <div class="container stop__grid">
      <div class="stop__head">
        <span class="stop__num">Stop ${esc(s.number)}</span>
        <h2 id="${s.id}-title">${esc(s.word)}<span class="gloss">${esc(s.gloss)}</span></h2>
        <p class="stop__lede${draftCls(s.lede_draft)}">${text(s.lede)}</p>
      </div>
      <div class="stop__body">
        ${s.blocks.map((b) => (R[b.type] ? R[b.type](b, label) : `<!-- unknown block ${b.type} -->`)).join('\n')}
      </div>
    </div>
  </section>`;
}

function closing() {
  const c = frame.closing;
  note('Closing', 'Closing line', c.body_src);
  return `<footer class="brandfield">
    <div class="container">
      <h2 class="${c.title_draft ? 'draft' : ''}">${esc(c.title)}</h2>
      <p class="measure-narrow" style="margin-top:var(--space-6);font-size:18px">${esc(c.body)}</p>
      <div class="hero__actions">
        <a class="pill pill--white" href="${esc(c.primary.href)}" download>${esc(c.primary.label)}<span class="arrow"></span></a>
      </div>
      <p style="margin-top:var(--space-6);font-size:14px">${c.links
        .map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`)
        .join(' &nbsp;·&nbsp; ')}</p>
      <div class="footer-grid">
        ${frame.footer.columns
          .map(
            (col) => `<div><p class="eyebrow">${esc(col.title)}</p><ul>${col.items
              .map((i) => `<li>${i.href ? `<a href="${esc(i.href)}">${esc(i.label)}</a>` : esc(i.label)}</li>`)
              .join('')}</ul></div>`
          )
          .join('')}
      </div>
      <p style="margin-top:var(--space-7);font-size:12px;opacity:.8">${esc(frame.footer.fine_print)}</p>
    </div>
  </footer>`;
}

function sourcesStrip() {
  return `<section class="sources" aria-label="Sources">
    <div class="container">
      <p class="eyebrow">Sources in the report</p>
      <ul>${sources.map((s) => `<li><b>${esc(s.stop)}</b> · ${esc(s.label)} · ${esc(s.src)}</li>`).join('')}</ul>
    </div>
  </section>`;
}

/* ---------- assemble ---------- */
const body = [
  navCard(),
  hero(),
  statement(),
  `<main id="main">${stops.map(stop).join('\n')}</main>`,
  closing(),
];
body.push(sourcesStrip()); // after stops so the list is complete

const html = `<!doctype html>
<html lang="${lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(frame.title)} · Zebras and Company</title>
<meta name="description" content="${esc(frame.meta_description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Oswald:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/stops.css">
<script>document.documentElement.classList.remove('no-js');</script>
</head>
<body>
<a class="visually-hidden" href="#main">Skip to content</a>
${body.join('\n')}
<script src="js/main.js" defer></script>
<script src="js/gloss.js" defer></script>
<script src="js/founders.js" defer></script>
<script src="js/ecosystem.js" defer></script>
<script src="js/ledgers.js" defer></script>
<script src="js/timeline.js" defer></script>
<script src="js/tocpair.js" defer></script>
<script src="js/rubric.js" defer></script>
<script src="js/yourmap.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log(`Built index.html (${lang}): ${stops.length} stops, ${sources.length} source lines, ${termSeq} glossary terms.`);
