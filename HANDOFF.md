# Handoff: facilitation channel + catalogue redo (Nov 2026)

Status as of 2026-11-12. Work is on branch `dev`; nothing merged to `main`.
Delete this file once every open item below is closed.

## What was done (commits on `dev`)

| Commit | Summary |
|---|---|
| Fix og:image/twitter:image extension and standardize IPFO name | `og-image.png` everywhere; "Infrastructure Project Facilitation Office" |
| Render project catalogue from editions.json | `js/catalogue.js` + `assets/project-catalogue/editions.json`; per-edition folders; anchors `#<id>`; GA4 `catalogue_view` / `catalogue_open` |
| Add Google Apps Script form backend | `apps-script/Code.gs` + `apps-script/README.md` (deploy steps) |
| Add draft privacy notice page | `privacy.html` (noindex, draft banner), footer link |
| Move contact form to Apps Script | `js/config.js`, `js/contact.js`, rewritten `handleFormSubmission` in `js/common.js`, `assets/data/projects.json` |
| Point newsletter forms at Apps Script | blog + article sidebar; Formspree fully removed |
| Update sitemap lastmod | 2026-11-12 |

## How things fit together

- **Catalogue:** `project-catalogue.html` is rendered from `assets/project-catalogue/editions.json`.
  The entry with `"current": true` is the hero; the rest go in "Previous editions". To publish a
  new edition, see README.md, "Publishing a new catalogue edition".
- **Forms:** every form posts a `text/plain` JSON body to `FORM_ENDPOINT` in `js/config.js`
  (Google Apps Script web app). Enquiries go to the "Enquiries" sheet plus an email to the
  secretariat; newsletter sign-ups go to the "Subscribers" sheet. While the endpoint is a
  placeholder, forms show a "not connected yet, please email us" message.
- **Spam:** hidden honeypot field `website` on all forms; Cloudflare Turnstile on the contact form
  (secret only in Apps Script Script Properties).

## Open questions (need an answer)

- [ ] **Q2 2025 PDF link:** unknown. The card shows "Catalogue file coming soon".
- [ ] **Release dates:** Q4 2025 = `2025-12` and Q2 2025 = `2025-06` are guesses (cover commit date / ICI 2025). Confirm.
- [ ] **Noscript link:** the `<noscript>` block in `project-catalogue.html` hard-codes
      `assets/project-catalogue/2026-q4/catalogue.pdf`. It's the one HTML touch per new edition, unless a
      stable path convention is adopted.
- [ ] **Privacy retention:** the "2 years" for enquiries in `privacy.html` is a proposal; legal to confirm.

## Still to supply (and where)

| Item | Where |
|---|---|
| Q4 2026 cover | `assets/project-catalogue/2026-q4/cover.png`; set `"cover"` in `editions.json`; delete `cover-placeholder.svg` |
| Q4 2026 PDF | `assets/project-catalogue/2026-q4/catalogue.pdf`; set `"pdf"` in `editions.json` |
| Q4 2026 release date, Kepmenko | `"releaseDate"`, `"kepmenko"` in `editions.json` |
| Q2 2025 PDF | `"pdf"` of `2025-q2` in `editions.json` |
| Project list | `assets/data/projects.json` (replace the 3 `PLACEHOLDER-*` entries from the catalogue Excel) |
| Apps Script URL | `FORM_ENDPOINT` in `js/config.js` (follow `apps-script/README.md`) |
| Turnstile site key | `TURNSTILE_SITE_KEY` in `js/config.js` (currently Cloudflare's always-pass test key) |
| Turnstile secret | Apps Script → Project Settings → Script Properties → `TURNSTILE_SECRET` |
| Legal sign-off | `privacy.html`: remove the draft banner, set robots to `index, follow`, add the page to `sitemap.xml` |

## Testing notes

- Local: run `python3 -m http.server 8080` in the repo root, then open http://127.0.0.1:8080/
- Verified with headless Chromium: catalogue default/anchor/no-JS views; placeholder, success and error
  form paths (mocked endpoint); 375px with no horizontal scroll; no JS errors.
- Apps Script logic was tested in Node with mocked Google services, not yet in real Apps Script.
- Blog post images (imgur) return 403 on localhost. That's not from these changes.
- After deploying Apps Script: send one real enquiry and one newsletter sign-up from the GitHub Pages
  preview, then check the sheet rows and the notification email.
