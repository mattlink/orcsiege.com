# Orc Siege website

Static homepage and About page for **www.orcsiege.com**. The standalone game
and archived leaderboard are hosted separately at **classic.orcsiege.com**.

The homepage tries **08 · Center stack** in **05 · Rust on charcoal**: a 52px
Jacquard 12 title with the two links 18px below, centered as one group. The
previous **10 · Low left** setup remains in the design study. Move toward the
links from above to wake the weighted title letters; the links work whether or not
the animation runs. The wordmark and links are plain HTML before JavaScript
loads. Motion respects reduced-motion settings. There are no JavaScript
dependencies, remote font requests, analytics, or build tools.

## Files

- `index.html`: animated homepage, with Classic and About links.
- `about/index.html`: a short introduction styled to match the homepage.
- `assets/`: local fonts and their OFL licenses, homepage styles, and shared title motion.
- `design-study/`: playable design archive, including the twelve layouts, palette and spacing controls, color study, and original framed concepts. The homepage doesn't load the archive.
- `blog/index.html` and `styles.css`: existing blog placeholder and its styling, not linked from the homepage.
- `favicon.svg`: OS favicon drawn from the Jacquard 12 title outlines; the standalone Classic site uses the same mark.
- `.nojekyll`: publish the files unchanged on GitHub Pages.

## Preview locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ for the homepage,
http://127.0.0.1:8000/about/ for About, or
http://127.0.0.1:8000/design-study/ for the design study.

The older untracked `preview/` workbench (22 homepage variations) was saved
in the local Git stash named `Archive legacy local Orc Siege preview`.
It is not intended for publication. `design-study/` supersedes it.

## GitHub Pages

Publish the `main` branch, repository root (`/`), using **Settings → Pages →
Deploy from a branch**. No build step is required. Relative asset and navigation
URLs also work at the temporary project URL:
https://mattlink.github.io/orcsiege.com/.

The intended custom domain is `www.orcsiege.com`; registration and DNS remain at
Namecheap. Leave the Pages custom domain unset until ready to switch DNS, so the
temporary project URL remains usable. At cutover:

1. Verify domain ownership in GitHub's account Pages settings using its generated
   TXT record. Keep that verification record after launch.
2. Configure `www.orcsiege.com` as this site's Pages custom domain (including the
   corresponding `CNAME` file).
3. Set Namecheap's `www` CNAME to `mattlink.github.io` (no repository path),
   replacing only conflicting records for `www` and preserving unrelated records.
4. Set Namecheap's `@` ALIAS to `mattlink.github.io`, replacing the old apex
   A and AAAA records. With both names pointed at Pages, GitHub redirects
   `orcsiege.com` to `www.orcsiege.com`. Leave the mail records alone.
5. Enable **Enforce HTTPS** once GitHub provisions the certificate, then test
   both names over HTTPS.

Classic's DNS and hosting are independent of the website.

Only this website repository needs to be public for GitHub Pages on GitHub Free.
The parent workspace and Classic repositories can remain private.
