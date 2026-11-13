/**
 * IPFO website form backend (Google Apps Script web app)
 * ======================================================
 * Receives submissions from the static IPFO website and stores them in the
 * Google Sheet this script is bound to:
 *   - Contact enquiries   -> sheet "Enquiries"   (+ email notification)
 *   - Newsletter sign-ups -> sheet "Subscribers"
 *
 * This file is NOT served by the website. Paste it into the Apps Script editor
 * of the Google Sheet (Extensions > Apps Script). See apps-script/README.md.
 *
 * Script Properties (Project Settings > Script Properties):
 *   TURNSTILE_SECRET  (required)  Cloudflare Turnstile secret key
 *
 * Request format: the site POSTs a JSON string with Content-Type "text/plain".
 * That is a CORS "simple request" (no preflight), which Apps Script can serve.
 * Response: JSON { ok: true } or { ok: false, error: "<code>", message: "<text>" }.
 */

// =============================================================================
// Configuration
// =============================================================================

/** Who receives a notification email for every enquiry (comma-separate several). */
const NOTIFY_EMAIL = 'sekretariat@ipfo.kemenkoinfra.go.id';

const ENQUIRIES_SHEET = 'Enquiries';
const SUBSCRIBERS_SHEET = 'Subscribers';

/**
 * Name of the hidden honeypot field. Must match the forms on the site.
 * Deliberately meaningless: browsers autofill fields named e.g. "website",
 * which would make real visitors look like bots.
 */
const HONEYPOT_FIELD = 'ipfo_hp';

/**
 * Newsletter forms only use the honeypot (no Turnstile widget, to keep the
 * one-line sign-up bar unchanged). Set to true if you add Turnstile to them.
 */
const REQUIRE_TURNSTILE_FOR_NEWSLETTER = false;

const ENQUIRY_TYPES = {
  'interest': 'Express interest in a project',
  'facilitation': 'Request facilitation / one-on-one',
  'bottleneck': 'Report a bottleneck',
  'business-matching': 'IPFO Business Matching',
  'media': 'Media & press',
  'other': 'Other'
};

/** Max characters stored per field (protects the sheet from huge payloads). */
const MAX_LENGTH = {
  default: 200,
  message: 5000,
  pageUrl: 500
};

/** Simple per-email rate limit: max submissions per window. */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

const ENQUIRY_HEADERS = [
  'Timestamp', 'Enquiry type', 'Project ID', 'Project name', 'First name', 'Last name',
  'Email', 'Organization', 'Country', 'Message', 'Consent', 'Page URL',
  'Status', 'Assigned to'
];

const SUBSCRIBER_HEADERS = ['Timestamp', 'Email', 'Source', 'Page URL'];

// =============================================================================
// Entry points
// =============================================================================

function doPost(e) {
  try {
    const data = parseRequest_(e);

    // Honeypot: real people never see or fill this field.
    if (clean_(data[HONEYPOT_FIELD])) {
      return json_({ ok: false, error: 'rejected', message: 'Submission rejected.' });
    }

    const formType = clean_(data.form_type) === 'newsletter' ? 'newsletter' : 'enquiry';

    if (formType === 'newsletter') {
      return handleNewsletter_(data);
    }
    return handleEnquiry_(data);
  } catch (err) {
    console.error(err && err.stack || err);
    return json_({
      ok: false,
      error: 'server_error',
      message: 'Something went wrong on our side. Please try again later or email us directly.'
    });
  }
}

/** Lets you open the web app URL in a browser to check it is deployed. */
function doGet() {
  return json_({ ok: true, service: 'IPFO website forms', time: new Date().toISOString() });
}

// =============================================================================
// Handlers
// =============================================================================

function handleEnquiry_(data) {
  const v = {
    enquiryType: clean_(data.enquiryType),
    projectId: clean_(data.projectId),
    projectName: clean_(data.projectName),
    firstName: clean_(data.firstName),
    lastName: clean_(data.lastName),
    email: clean_(data.email).toLowerCase(),
    organization: clean_(data.organization),
    country: clean_(data.country),
    message: clean_(data.message, MAX_LENGTH.message),
    consent: isTrue_(data.consent),
    pageUrl: clean_(data.pageUrl, MAX_LENGTH.pageUrl)
  };

  const missing = [];
  if (!ENQUIRY_TYPES[v.enquiryType]) missing.push('enquiry type');
  if (!v.firstName) missing.push('first name');
  if (!v.lastName) missing.push('last name');
  if (!isEmail_(v.email)) missing.push('a valid email');
  if (!v.message) missing.push('message');
  if (!v.consent) missing.push('consent to the privacy notice');
  if (missing.length) {
    return json_({ ok: false, error: 'validation', message: 'Please provide ' + missing.join(', ') + '.' });
  }

  const captcha = verifyTurnstile_(data.turnstileToken);
  if (!captcha.ok) return json_(captcha);

  if (isRateLimited_(v.email)) {
    return json_({ ok: false, error: 'rate_limited', message: 'Too many submissions. Please try again later.' });
  }

  const sheet = getSheet_(ENQUIRIES_SHEET, ENQUIRY_HEADERS);
  withLock_(function () {
    sheet.appendRow([
      new Date(),
      v.enquiryType,
      v.projectId,
      v.projectName,
      v.firstName,
      v.lastName,
      v.email,
      v.organization,
      v.country,
      v.message,
      v.consent ? 'Yes' : 'No',
      v.pageUrl,
      '', // Status (internal triage)
      ''  // Assigned to (internal triage)
    ].map(sheetSafe_));
  });

  sendNotification_(v, sheet);

  return json_({ ok: true });
}

function handleNewsletter_(data) {
  const email = clean_(data.email).toLowerCase();
  const source = clean_(data.source) || 'newsletter';
  const pageUrl = clean_(data.pageUrl, MAX_LENGTH.pageUrl);

  if (!isEmail_(email)) {
    return json_({ ok: false, error: 'validation', message: 'Please enter a valid email address.' });
  }

  if (REQUIRE_TURNSTILE_FOR_NEWSLETTER) {
    const captcha = verifyTurnstile_(data.turnstileToken);
    if (!captcha.ok) return json_(captcha);
  }

  if (isRateLimited_(email)) {
    return json_({ ok: false, error: 'rate_limited', message: 'Too many submissions. Please try again later.' });
  }

  const sheet = getSheet_(SUBSCRIBERS_SHEET, SUBSCRIBER_HEADERS);
  withLock_(function () {
    // Skip duplicates silently: the person is already subscribed.
    const last = sheet.getLastRow();
    if (last > 1) {
      const existing = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (let i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).toLowerCase() === email) return;
      }
    }
    sheet.appendRow([new Date(), email, source, pageUrl].map(sheetSafe_));
  });

  return json_({ ok: true });
}

// =============================================================================
// Cloudflare Turnstile
// =============================================================================

function verifyTurnstile_(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) {
    console.error('TURNSTILE_SECRET script property is not set.');
    return { ok: false, error: 'server_config', message: 'The form is not fully configured yet. Please email us directly.' };
  }
  if (!clean_(token, 4096)) {
    return { ok: false, error: 'captcha', message: 'Please complete the security check and try again.' };
  }

  const response = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: secret, response: String(token) },
    muteHttpExceptions: true
  });

  let result = {};
  try {
    result = JSON.parse(response.getContentText());
  } catch (err) {
    console.error('Turnstile verify returned non-JSON:', response.getContentText());
  }

  if (result.success === true) return { ok: true };

  console.warn('Turnstile verification failed:', JSON.stringify(result));
  return { ok: false, error: 'captcha', message: 'The security check failed or expired. Please try again.' };
}

// =============================================================================
// Email notification
// =============================================================================

function sendNotification_(v, sheet) {
  if (!NOTIFY_EMAIL) return;

  const typeLabel = ENQUIRY_TYPES[v.enquiryType] || v.enquiryType;
  const subjectTarget = v.projectName || v.projectId || v.organization || (v.firstName + ' ' + v.lastName);
  const subject = '[IPFO enquiry] ' + typeLabel + ' - ' + subjectTarget;

  const lines = [
    'A new enquiry was submitted on the IPFO website.',
    '',
    'Type:          ' + typeLabel,
    'Project:       ' + (v.projectName ? v.projectName + ' (' + v.projectId + ')' : (v.projectId || '-')),
    'Name:          ' + v.firstName + ' ' + v.lastName,
    'Email:         ' + v.email,
    'Organization:  ' + (v.organization || '-'),
    'Country:       ' + (v.country || '-'),
    'Page:          ' + (v.pageUrl || '-'),
    '',
    'Message:',
    v.message,
    '',
    '---',
    'Triage sheet: ' + sheet.getParent().getUrl(),
    'Reply to this email to answer the sender directly.'
  ];

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject.substring(0, 250),
      body: lines.join('\n'),
      replyTo: v.email,
      name: 'IPFO Website'
    });
  } catch (err) {
    // The row is already saved; don't fail the submission because of email quota etc.
    console.error('Notification email failed:', err);
  }
}

// =============================================================================
// Helpers
// =============================================================================

function parseRequest_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      const parsed = JSON.parse(e.postData.contents);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (err) {
      // Not JSON: fall back to form-encoded parameters below.
    }
  }
  return (e && e.parameter) || {};
}

function clean_(value, maxLength) {
  if (value === undefined || value === null) return '';
  return String(value).trim().substring(0, maxLength || MAX_LENGTH.default);
}

function isTrue_(value) {
  return value === true || ['true', 'on', 'yes', '1'].indexOf(String(value).toLowerCase()) !== -1;
}

function isEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Prevent spreadsheet formula injection (values starting with = + - @). */
function sheetSafe_(value) {
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(value)) return "'" + value;
  return value;
}

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    fn();
  } finally {
    lock.releaseLock();
  }
}

function isRateLimited_(email) {
  const cache = CacheService.getScriptCache();
  const key = 'rl_' + Utilities.base64EncodeWebSafe(email).substring(0, 200);
  const count = Number(cache.get(key) || 0);
  if (count >= RATE_LIMIT_MAX) return true;
  cache.put(key, String(count + 1), RATE_LIMIT_WINDOW_SECONDS);
  return false;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =============================================================================
// Manual setup helper: run once from the editor to create both sheets.
// =============================================================================

function setup() {
  getSheet_(ENQUIRIES_SHEET, ENQUIRY_HEADERS);
  getSheet_(SUBSCRIBERS_SHEET, SUBSCRIBER_HEADERS);
  if (!PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET')) {
    console.warn('Remember to set the TURNSTILE_SECRET script property.');
  }
}
