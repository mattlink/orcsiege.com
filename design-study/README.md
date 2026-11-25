# Orc Siege homepage design study

This is the interactive design artifact from the mattl.ink workbench, ported into the website repository. Serve the website root with the static server in the [website README](../README.md), then open `/design-study/`.

- **03 / Title & links** (`./`): 12 layouts, eight palettes, wide/mobile preview, and live title-size, inset, and gap controls. Full screen preserves the selected settings in its URL.
- **02 / Orange on black** (`./colors/`): the flat palette comparison, including the optional Jacquard-to-Bastarda texture.
- **01 / Framed** (`./framed/`): the eight original wood-frame experiments.

The website homepage tries layout **08 · Center stack**, palette **05 · Rust on charcoal** (`#bc5429` on `#242424`), **52px** title size, and an **18px** gap. The title and links are centered as one group. The previous **10 · Low left** setup still has its **160px** desktop inset. Narrow screens scale those dimensions as needed. The layout study points at the real Classic destination and the matching About page instead of the original placeholder routes. The responsive title-motion code and local font assets are shared with the homepage; the homepage does not load the study or its controls.
