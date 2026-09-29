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
    return `<div class="block reveal">
      <h3>${esc(b.heading)}</h3>
      <p class="founders__q">${esc(b.question)}</p>
      ${b.intro ? `<p class="measure${draftCls(b.intro_draft)}">${text(b.intro)}</p>` : ''}
      <div class="founders" data-founders>
        <div class="founders__stage" aria-live="polite">
          ${b.items
            .map(
              (f, i) => `<article class="founders__card${i === 0 ? ' is-current' : ''}" data-index="${i}">
              <p>${text(f.text)}</p>
              <div class="founders__who"><strong>${esc(f.name)}</strong><span>${esc(f.org)}</span></div>
            </article>`
            )
            .join('')}
        </div>
        <div class="founders__controls">
          <button class="arrow-btn arrow-btn--prev" type="button" data-prev aria-label="Previous answer"><span class="arrow"></span></button>
          <button class="arrow-btn" type="button" data-next aria-label="Next answer"><span class="arrow"></span></button>
          <span class="founders__count" data-count>1 / ${b.items.length}</span>
          <div class="founders__dots" data-dots>${b.items.map((_, i) => `<i${i === 0 ? ' class="is-current"' : ''}></i>`).join('')}</div>
        </div>
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
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log(`Built index.html (${lang}): ${stops.length} stops, ${sources.length} source lines, ${termSeq} glossary terms.`);
