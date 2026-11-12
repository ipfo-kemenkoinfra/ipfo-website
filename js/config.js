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
     * Script Properties, never here).
     * PLACEHOLDER: '1x00000000000000000000AA' is Cloudflare's official
     * "always passes" test key, so the widget works locally. Its tokens are
     * rejected by a real secret key, so it must be replaced before launch.
     */
    TURNSTILE_SITE_KEY: '1x00000000000000000000AA',

    /** Shown in fallback messages when the form cannot be used. */
    CONTACT_EMAIL: 'sekretariat@ipfo.kemenkoinfra.go.id'
};
