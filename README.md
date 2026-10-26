# Zebras and Company, Impact Journey site

Static site. HTML, CSS, vanilla JS. No framework, no dependencies, nothing loaded from a third party.

## Run it

Open `index.html` in a browser. That is the whole site.

## Edit it

All copy lives in `content/en/*.json`, one file per stop plus `frame.json` (hero, nav, statement, closing, footer) and `glossary.json`. Edit the JSON, then rebuild:

    node build.js

`build.js` writes `index.html` from the JSON. It has no dependencies beyond Node itself. The shipped `index.html` is complete without JavaScript; the scripts add the nav state, the inline glossary, the founders sequence, the ecosystem rows, the ledgers, the TOC pair, the rubric and the your-map tool, and each of those degrades to plain content when JS is off.

Adding Japanese later means a `content/ja/` folder and `node build.js ja`.

## Design, round 2 (October 2026)

Built to the designers' frames: style guide, header, footer, section head, co-founder cards, stat tiles, table, timeline, and the round accordion control.

- Type: Libre Caslon Condensed (H1 regular, H2 and H4 bold, big numbers, quote attributions) and Figtree (H3, eyebrows, body). Both self-hosted from `assets/fonts/` under the SIL Open Font License; nothing is fetched from Google Fonts.
- Colour: green, pink and dark brown as primaries; blue, light blue, pale green, light grey and beige as secondaries. Values are in `css/tokens.css`, verbatim from the style guide.
- Frame: a fixed sidebar on the left (logo, title, pink rule, the seven stops with their glosses, the download). Below 1100px it becomes a bar across the top with a Menu control.
- Hero: the dark field with the green bar and the two zebra-patterned blocks. Each stop opens with the light-blue zebra band; Stop 1 carries the zebra illustration beside its head.
- Figures: the brown, green and light-blue tiles for set-piece numbers; the hairline row for the numbers inside the three cases.
- Cards (co-founders, typology, LIFE type1, TOC pair, ledgers, your map): the pale green card. The designers also drew an outlined white version (Frame 22); switch `--surface-card` in `tokens.css` to white and add a 1px `--zc-rule` border on `.card`-style blocks if Z&C prefers it. The same goes for the tiles: Frame 29 also shows pale green and beige as the third tile colour, and an outlined set.
- Quotes: the pink bar, Figtree text, Caslon attribution. Stop 5 keeps its dark field.
- Timeline: vertical, every point open, as the designers drew it (Frame 45). It replaces the earlier horizontal two-lane track; the lanes survive as the open or filled square and a tag on the year.
- Controls: pills in green (outline on light fields, pink on dark); the round disc for accordions, light blue when closed, green when open.
- The zebra stripe is a CSS mask (`--zebra-mask` in `tokens.css`, inlined from `assets/brand/zebra-pattern.png`) so it tints to whatever sits beneath it and works when the file is opened from disk.

## Rules the content follows

Nothing on the page comes from outside the Impact Journey Report 2021-2023 (English edition). Every block carries a `src` page reference, and `build.js` collects those into the sources strip at the foot of the page.

Prose that is not a direct quotation (connective paragraphs, ledes, the statement) is marked `"draft": true` in the JSON. The DRAFT tags are hidden by default so the page can be shown to the client; add `?drafts` to the URL to see them. Remove the `draft` flags before launch.

Large numbers (`"type": "stats"`) are marked `"exception": true` because the client's earlier design system said numbers stay in prose. The new designs include stat tiles, so this is likely settled; confirm with Z&C.

## Files

    index.html            built output
    build.js              assembles index.html from content/
    css/tokens.css        colour, type, space; the @font-face rules; the stripe mask
    css/base.css          type scale, page frame (sidebar + column), rhythm, reveal
    css/components.css    pills, disc, sidebar, hero, band, tiles, quotes, cards, table, timeline, your map, footer, sources
    css/stops.css         per-stop layout, the dark Stop 5
    js/main.js            sidebar, scroll spy, reveal-on-entry, the ?drafts flag
    js/gloss.js           inline glossary
    js/founders.js        ten founders sequence
    js/ecosystem.js       ecosystem rows
    js/ledgers.js         two ledgers (Stop 4)
    js/tocpair.js         the two TOCs, switchable on narrow screens (Stop 3)
    js/rubric.js          due diligence rubric, collapsed by default (Stop 3)
    js/yourmap.js         draw-your-own map, localStorage, print and copy (Stop 7)
    content/en/           the words
    assets/brand/         logo (white and dark), zebra illustration, stripe pattern, all from the designers' files
    assets/fonts/         Libre Caslon Condensed and Figtree, WOFF2, with licenses
    assets/               the report PDF

## Placeholders

Logo and illustration: rasters lifted from the designers' PDFs. Swap in the SVGs when the brand files arrive.

Case photography: each case in Stop 4 has a grey field where the photograph goes. Set `.case__photo` to the image when it arrives.

The two TOCs: the English edition carries both diagrams as artwork (the PDF still shows the designer's placeholder notes), so Stop 3 shows each map as its title, its center and the report's own description. Replace the `tocpair` block's text with the diagrams once Z&C sends editable English versions.

## Status

Design round 2 applied to all seven stops; copy unchanged from pass two except the one-line timeline intro, which no longer tells the reader to tap. Pending from Z&C and marked in the content or this file: English TOC diagrams, case photography, founder portraits, brand SVGs, the Linklusion raise figure, and updated content.

Figures held back on purpose: the Finance for Purpose round for Linklusion (p.50 says around 100 million yen, p.78 says approximately 150 million) is not on the page; Stop 4 uses the unambiguous figure, approximately 220 million yen across two rounds (p.77). Hitobito's 154% and 131% are labeled with the report's own words, "growth rate," which read either as growth to or growth by; confirm before launch.
# zebras-and=company
