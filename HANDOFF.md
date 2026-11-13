# Handoff: facilitation channel + catalogue redo (Nov 2026)

Status as of 2026-11-13. Work is on branch `dev`; nothing merged to `main`.
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
| Make edition permalink a 'Copy link' button | copies `#<id>` link with "Copied!" feedback |
| Set real Cloudflare Turnstile site key | real key on the live sites, test key on localhost |
| Form endpoint set to the Apps Script web app | `FORM_ENDPOINT` in `js/config.js` |

## Live services (set up 2026-11-13). All forms are working end to end.

- **Google Sheet:** "IPFO Website Enquiries" (tabs: Enquiries, Subscribers), owned by the IPFO Google
  account. The Apps Script is bound to it. Viewer access is shared with kreitonstrs@gmail.com.
- **Apps Script web app:** deployed (Execute as: Me, Access: Anyone). To change the code, use Manage
  deployments → edit → **New version**, which keeps the same URL.
- **Cloudflare Turnstile:** widget "IPFO website". Hostnames: `ipfo.kemenkoinfra.go.id`,
  `ipfo-kemenkoinfra.github.io`. Mode: Managed.
- **Verified on the dev site:** real enquiries land in the Sheet with the project id and name; the
  notification email reaches sekretariat@; the newsletter writes to Subscribers; honeypot, validation
  and fake Turnstile tokens are rejected. The test rows have been deleted.
- **Gotcha:** opening Apps Script fails with "Sorry, unable to open the file" when the browser is signed
  in to several Google accounts. Use a private window or a browser profile with only the IPFO account.

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

- [ ] **Release dates:** Q4 2025 = `2025-12` and Q2 2025 = `2025-06` are guesses (cover commit date / ICI 2025). Confirm.
- [ ] **Kepmenko document:** Decree No. 102/S of 2026 is cited in the Q4 2026 note. Add the PDF or link as
      `"kepmenko"` in `editions.json` to show the "Legal basis (Kepmenko)" link.
- [ ] **Project count:** the Excel's Catalogue tab lists 76 projects, but the "by Status" summary adds up to 72.
      `projects.json` uses all 76. Check which is right.
- [ ] **Noscript link:** the `<noscript>` block in `project-catalogue.html` hard-codes
      `assets/project-catalogue/2026-q4/catalogue.pdf`. It's the one HTML touch per new edition, unless a
      stable path convention is adopted.
- [ ] **Rotate the Turnstile secret** (it was shown in a chat screenshot): Cloudflare → widget → Settings →
      Rotate secret key, then update `TURNSTILE_SECRET` in Script Properties. Afterwards, re-test one enquiry.
- [ ] **Privacy retention:** the "2 years" for enquiries in `privacy.html` is a proposal; legal to confirm.

## Remaining before going live (in order)

1. ~~Catalogue files and project list~~ (done 2026-11-13); still open: the Kepmenko document and the two old release dates.
2. Legal sign-off on `privacy.html`.
3. Rotate the Turnstile secret.
4. Final check on the dev site, delete this file, then merge `dev` into `main` (done by the owner, not Claude).

## Still to supply (and where)

| Item | Where |
|---|---|
| ~~Q4 2026 cover, PDF, release date~~ | Done (2026-11-13) |
| ~~Q2 2025 PDF~~ | Done (hosted at `2025-q2/catalogue.pdf`) |
| ~~Project list~~ | Done: 76 projects from `Project_Catalogue_Q4_2026_extract_v04.xlsx`. For the next edition, regenerate from the new Excel and keep existing ids. |
| Kepmenko 102/S/2026 | PDF or link → `"kepmenko"` of `2026-q4` in `editions.json` |
| ~~Apps Script URL~~ | Done (2026-11-13) |
| ~~Turnstile site key / secret~~ | Done (2026-11-13). Secret rotation still open, see above |
| Legal sign-off | `privacy.html`: remove the draft banner, set robots to `index, follow`, add the page to `sitemap.xml` |

## Testing notes

- Local: run `python3 -m http.server 8080` in the repo root, then open http://127.0.0.1:8080/
- Verified with headless Chromium: catalogue default/anchor/no-JS views; placeholder, success and error
  form paths (mocked endpoint); 375px with no horizontal scroll; no JS errors.
- Apps Script: tested in Node with mocks, then end to end on the dev site (2026-11-13).
- Blog post images (imgur) return 403 on localhost. That's not from these changes.
- Locally, forms use the Turnstile test key, so the real Apps Script rejects them (captcha). Test real
  submissions on the dev GitHub Pages site.
