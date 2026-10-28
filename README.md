# Orc Siege website

Static homepage and blog placeholder for **www.orcsiege.com**. The playable game
is a separate Flask application at **classic.orcsiege.com**.

The design follows Classic's black background, orange links, ASCII graphics, and
simple bordered panels. There are no JavaScript dependencies, external fonts,
analytics, or build tools.

## Files

- `index.html`: homepage and link to the playable game.
- `blog/index.html`: blog placeholder.
- `styles.css`: shared responsive styling.
- `favicon.svg`: ASCII-inspired nexus icon.
- `.nojekyll`: publish the files unchanged on GitHub Pages.

## Preview locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ and http://127.0.0.1:8000/blog/.

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
4. Enable **Enforce HTTPS** once GitHub provisions the certificate.

Configure the apex (`orcsiege.com`) separately if it should redirect to `www`;
DNS records alone do not create HTTP redirects. Classic's DNS and hosting are
independent of this site. Its links intentionally point to the final game URL,
even while that deployment is being prepared.

Only this website repository needs to be public for GitHub Pages on GitHub Free.
The parent workspace and Classic repositories can remain private.
