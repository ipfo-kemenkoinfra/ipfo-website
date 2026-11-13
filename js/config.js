/**
 * IPFO Site Configuration
 * =======================
 * The only place to paste deployment-specific values for the forms.
 * See apps-script/README.md for how to obtain them.
 */
window.IPFO_CONFIG = {
    /**
     * Google Apps Script web app URL (ends in /exec).
     * PLACEHOLDER: until this is replaced, forms show a friendly
     * "not connected yet, please email us" message and send nothing.
     */
    FORM_ENDPOINT: 'REPLACE_WITH_APPS_SCRIPT_WEB_APP_URL',

    /**
     * Cloudflare Turnstile SITE key (public; the secret goes in Apps Script
     * Script Properties, never here). Widget "IPFO website", allowed hostnames:
     * ipfo.kemenkoinfra.go.id and ipfo-kemenkoinfra.github.io.
     *
     * On localhost the real key is not allowed, so Cloudflare's official
     * "always passes" test key is used instead. Its tokens are rejected by
     * the real secret, so local tests can't reach the real Sheet.
     */
    TURNSTILE_SITE_KEY: /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)
        ? '1x00000000000000000000AA'    // local testing only
        : '0x4AAAAAAF_FVNsHqLYa-HNz',  // production + dev GitHub Pages

    /** Shown in fallback messages when the form cannot be used. */
    CONTACT_EMAIL: 'sekretariat@ipfo.kemenkoinfra.go.id'
};
