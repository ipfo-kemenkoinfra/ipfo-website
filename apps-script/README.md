# IPFO website forms: Google Apps Script backend

The contact form (`contact-us.html`) and the newsletter forms (`blog.html`,
`blog-article.html`) post to a Google Apps Script web app. The script saves each
submission into a Google Sheet and emails the secretariat about new enquiries.

`Code.gs` in this folder is the source. The website does **not** run it: you paste it
into Apps Script yourself. GitHub Pages publishes this folder too, which is fine
because it contains no secrets. The Turnstile secret lives in Script Properties.

```
Browser ──(POST, text/plain JSON)──► Apps Script web app ──► Google Sheet
                                         │                     ├─ Enquiries
                                         │                     └─ Subscribers
                                         ├─► Cloudflare Turnstile (token check)
                                         └─► Email to sekretariat@ipfo.kemenkoinfra.go.id
```

## 1. Create the Cloudflare Turnstile widget

1. Go to the Cloudflare dashboard, open **Turnstile** and click **Add widget**.
2. Name it "IPFO website" and add these hostnames:
   - `ipfo.kemenkoinfra.go.id`
   - your GitHub Pages host for `dev` (e.g. `<user>.github.io`)
   - `localhost` and `127.0.0.1` (optional, for local testing)
3. Widget mode: **Managed**.
4. Copy the **Site key** (public) and the **Secret key** (private).

## 2. Create the Google Sheet

1. Use the IPFO Google account that should own the data. Create a new Google Sheet,
   e.g. "IPFO Website Enquiries".
2. Leave it empty. The script creates the **Enquiries** and **Subscribers** tabs with headers.
3. Share the sheet only with the people who triage enquiries.

## 3. Add the script to the Sheet

1. In the Sheet: **Extensions → Apps Script**.
2. Delete the sample code in `Code.gs` and paste the full contents of `apps-script/Code.gs`.
3. Check the constants at the top. `NOTIFY_EMAIL` defaults to `sekretariat@ipfo.kemenkoinfra.go.id`.
4. Click **Save**.

## 4. Set Script Properties (the secret)

1. In the Apps Script editor: **Project Settings** (gear icon) → **Script Properties** → **Add script property**.
2. Property `TURNSTILE_SECRET`, value: the Turnstile **Secret key** from step 1.
3. Save. Never put the secret in `Code.gs` or in the website code.

## 5. Run setup once (authorize)

1. In the editor, select the function `setup` in the toolbar and click **Run**.
2. Google asks for permissions (Sheets, sending email, external requests). Review them and allow.
   On "Google hasn't verified this app", click **Advanced → Go to (project) (unsafe)**.
   This is expected for your own script.
3. Check that the two tabs now exist in the Sheet.

## 6. Deploy as a web app

1. **Deploy → New deployment**, then click the gear and pick **Web app**.
2. Description: `IPFO website forms v1`.
3. **Execute as: Me** (the account that owns the Sheet).
4. **Who has access: Anyone**. This is required so the public website can post to it.
   Visitors don't need a Google account.
5. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. Open the URL in a browser. You should see `{"ok":true,"service":"IPFO website forms",...}`.

## 7. Connect the website

Edit **`js/config.js`** in the website repo:

```js
window.IPFO_CONFIG = {
    FORM_ENDPOINT: 'https://script.google.com/macros/s/XXXXXXXX/exec',  // from step 6
    TURNSTILE_SITE_KEY: '0x4AAAAAAA...'                                  // from step 1 (site key, not secret)
};
```

Commit to `dev`, open the GitHub Pages preview, and send a test enquiry and a test
newsletter sign-up. Check the rows in the Sheet and the notification email.

## Updating the script later

After editing the code: **Deploy → Manage deployments**, select the existing deployment,
click the pencil icon, set **Version: New version**, then **Deploy**. This keeps the same URL.
Creating a *new* deployment gives a new URL, which you would then have to update in `js/config.js`.

## Sheet columns

**Enquiries:** Timestamp, Enquiry type, Project ID, Project name, First name, Last name, Email,
Organization, Country, Message, Consent, Page URL, **Status**, **Assigned to**.
The script leaves the last two blank for internal triage. Data validation (e.g. a dropdown
`New / In progress / Closed`) can be added on the Status column.

**Subscribers:** Timestamp, Email, Source (`newsletter` / `newsletter_sidebar`), Page URL.
Duplicate emails are not added twice.

## Notes and limits

- **Spam protection:** hidden honeypot field `ipfo_hp` (rejected if filled; never name it something browsers autofill, like `website`) and Turnstile on the
  contact form. Newsletter forms use the honeypot only. Set `REQUIRE_TURNSTILE_FOR_NEWSLETTER = true`
  if you add a widget there. There is also a small per-email rate limit (5 per 10 minutes).
- **Email quota:** Apps Script `MailApp` can send about 100 emails/day on a consumer Google account
  and about 1,500/day on Google Workspace. If the quota runs out, the row is still saved.
- **CORS:** the site sends `Content-Type: text/plain` with a JSON body, so the browser makes no
  preflight request (Apps Script can't answer one). Apps Script responses allow any origin, so the
  site can read the JSON result.
- **Retention:** the privacy notice (`privacy.html`) states how long data is kept. Delete old rows
  to match it.
