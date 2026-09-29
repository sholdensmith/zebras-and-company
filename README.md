# Zebras and Company, Impact Journey site

Static site. HTML, CSS, vanilla JS. No framework, no dependencies.

## Run it

Open `index.html` in a browser. That is the whole site.

## Edit it

All copy lives in `content/en/*.json`, one file per stop plus `frame.json` (hero, nav, statement panel, closing, footer) and `glossary.json`. Edit the JSON, then rebuild:

    node build.js

`build.js` writes `index.html` from the JSON. It has no dependencies beyond Node itself. The shipped `index.html` is complete without JavaScript; the scripts add the nav state, the inline glossary, the founders sequence and the ecosystem diagram, and each of those degrades to plain content when JS is off.

Adding Japanese later means a `content/ja/` folder and `node build.js ja`.

## Rules the content follows

Nothing on the page comes from outside the Impact Journey Report 2021-2023 (English edition). Every block carries a `src` page reference, and `build.js` collects those into the sources strip at the foot of the page.

Prose that is not a direct quotation (connective paragraphs, ledes, the statement panel) is marked `"draft": true` in the JSON and shows a small red DRAFT tag on the page. Those are first passes written from the report's own language, for rewriting in place. Remove the `draft` flags before launch and the tags disappear.

Large numbers (`"type": "stats"`) are marked `"exception": true` because the design system says numbers stay in prose. Pending Z&C's agreement to allow them on this site.

## Files

    index.html            built output
    build.js              assembles index.html from content/
    css/tokens.css        design system custom properties, verbatim from the guide
    css/base.css          type, measure, rhythm, reveal
    css/components.css    nav card, pills, arrow, hero, veil, panel, stats, quotes, lists, founders, ecosystem, footer, sources
    css/stops.css         per-stop layout
    js/main.js            nav, scroll spy, reveal-on-entry
    js/gloss.js           inline glossary
    js/founders.js        ten founders sequence
    js/ecosystem.js       ecosystem diagram
    content/en/           the words
    assets/               the report PDF; photography, diagrams and fonts go here when they arrive

## Placeholders

Fonts: Oswald and Noto Serif JP from Google Fonts, standing in for the real display and Mincho faces per the design system's own caveat. Swap in the WOFF2 files and update `--font-display` / `--font-serif` in `tokens.css`.

Hero: a neutral gradient field with the CSS stripe veil at half strength. Replace `.hero__img` background with the photograph and restore the veil to the `--stripe-veil` token.

Logo: a tracked text wordmark until the SVG set arrives.

## Status

Pass one: frame, Stop 1, Stop 2, Stop 5. Stops 3, 4, 6 and 7 are stubbed with their ledes and a note on what they will hold.
