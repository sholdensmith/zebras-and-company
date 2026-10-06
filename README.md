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
    js/ledgers.js         two ledgers (Stop 4)
    js/timeline.js        two-lane timeline (Stop 6)
    js/tocpair.js         the two TOCs, switchable on narrow screens (Stop 3)
    js/rubric.js          due diligence rubric, collapsed by default (Stop 3)
    js/yourmap.js         draw-your-own map, localStorage, print and copy (Stop 7)
    content/en/           the words
    assets/               the report PDF; photography, diagrams and fonts go here when they arrive

## Placeholders

Fonts: Oswald and Noto Serif JP from Google Fonts, standing in for the real display and Mincho faces per the design system's own caveat. Swap in the WOFF2 files and update `--font-display` / `--font-serif` in `tokens.css`.

Case photography: each case in Stop 4 has a grey field where the photograph goes. Set `.case__photo` to the image when it arrives.

The two TOCs: the English edition carries both diagrams as artwork (the PDF still shows the designer's placeholder notes), so Stop 3 shows each map as its title, its center and the report's own description. Replace the `tocpair` block's text with the diagrams once Z&C sends editable English versions.

Hero: a neutral gradient field with the CSS stripe veil at half strength. Replace `.hero__img` background with the photograph and restore the veil to the `--stripe-veil` token.

Logo: a tracked text wordmark until the SVG set arrives.

## Status

Pass two: all seven stops built. Pending from Z&C and marked in the content or this file: English TOC diagrams, hero and case photography, founder portraits, brand files, the Linklusion raise figure, and sign-off on the large-number exception.

Figures held back on purpose: the Finance for Purpose round for Linklusion (p.50 says around 100 million yen, p.78 says approximately 150 million) is not on the page; Stop 4 uses the unambiguous figure, approximately 220 million yen across two rounds (p.77). Hitobito's 154% and 131% are labeled with the report's own words, "growth rate," which read either as growth to or growth by; confirm before launch.
