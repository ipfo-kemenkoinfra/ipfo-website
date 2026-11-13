/**
 * Common JavaScript Functions
 * Shared across all pages
 */

// ==========================================================================
// Smooth Scrolling
// ==========================================================================

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==========================================================================
// Utility: Debounce Function
// ==========================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================================================
// Navbar Scroll Effect
// ==========================================================================

function initNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = debounce(function () {
        if (window.scrollY > 100) {
            navbar.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(30, 64, 175, 0.95))';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'linear-gradient(135deg, var(--dark-blue), var(--primary-blue))';
            navbar.style.backdropFilter = 'none';
        }
    }, 10);

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// ==========================================================================
// Intersection Observer for Animations
// ==========================================================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections with .section-content class
    document.querySelectorAll('.section-content').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(section);
    });
}

// ==========================================================================
// Page Loading Animation
// ==========================================================================

function initPageLoadAnimation() {
    // Removed fade-in animation to prevent white flash
    // Page now loads instantly without animation
}

// ==========================================================================
// Active Navigation Link Highlighter
// ==========================================================================

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a, .mobile-nav-item');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// ==========================================================================
// Form Submission Handler (Generic)
// ==========================================================================
//
// Sends forms to the Google Apps Script endpoint set in js/config.js as a
// text/plain JSON POST (a CORS "simple request", which Apps Script supports).
//
// Usage:
//   IPFOCommon.handleFormSubmission('myForm', 'myStatus', 'Thanks!', {
//       transform: (payload, form) => payload,   // optional: adjust payload
//       onSuccess: (payload, form) => {}         // optional: after success
//   });
// The status element is optional: if it is missing, one is created after the form.

const FORM_TIMEOUT_MS = 20000;

function getSiteConfig() {
    return window.IPFO_CONFIG || {};
}

function getContactEmail() {
    return getSiteConfig().CONTACT_EMAIL || 'sekretariat@ipfo.kemenkoinfra.go.id';
}

function isFormEndpointConfigured() {
    const url = String(getSiteConfig().FORM_ENDPOINT || '');
    return /^https:\/\//.test(url) && !/REPLACE_WITH/i.test(url);
}

function ensureStatusElement(form, statusElementId) {
    let el = statusElementId ? document.getElementById(statusElementId) : null;
    if (!el) {
        el = document.createElement('p');
        if (statusElementId) el.id = statusElementId;
        el.className = 'form-status';
        form.insertAdjacentElement('afterend', el);
    }
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    return el;
}

function setFormStatus(el, type, message, allowHtml = false) {
    el.classList.add('form-status');
    el.classList.remove('success', 'error', 'pending');
    if (type) el.classList.add(type);
    if (allowHtml) {
        el.innerHTML = message;
    } else {
        el.textContent = message;
    }
}

function emailFallbackHtml(prefix, lead = 'Please email us at') {
    const email = getContactEmail();
    return `${prefix} ${lead} <a href="mailto:${email}">${email}</a>.`;
}

/** Turn a form into a plain object. Checkboxes become true/false. */
function collectFormPayload(form) {
    const payload = {};
    Array.from(form.elements).forEach(el => {
        if (!el.name || el.disabled || el.type === 'submit' || el.type === 'button') return;
        if (el.type === 'checkbox') {
            payload[el.name] = el.checked;
        } else if (el.type === 'radio') {
            if (el.checked) payload[el.name] = el.value;
        } else {
            payload[el.name] = el.value;
        }
    });

    // Cloudflare Turnstile injects its token as "cf-turnstile-response"
    if ('cf-turnstile-response' in payload) {
        payload.turnstileToken = payload['cf-turnstile-response'];
        delete payload['cf-turnstile-response'];
    }

    payload.pageUrl = window.location.href;
    return payload;
}

function handleFormSubmission(formId, statusElementId, successMessage = 'Thank you for your submission!', options = {}) {
    const form = document.getElementById(formId);
    if (!form) return;

    const statusElement = ensureStatusElement(form, statusElementId);
    const submitButton = form.querySelector('[type="submit"]');
    const turnstileSlot = form.querySelector('[data-turnstile]');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!isFormEndpointConfigured()) {
            setFormStatus(statusElement, 'error',
                emailFallbackHtml('Sorry, this form is not connected yet, so your message was not sent.'), true);
            return;
        }

        let payload = collectFormPayload(form);
        if (typeof options.transform === 'function') {
            payload = options.transform(payload, form) || payload;
        }

        if (turnstileSlot && !payload.turnstileToken) {
            setFormStatus(statusElement, 'error', turnstileSlot.dataset.turnstileFailed === 'true'
                ? 'The security check could not load. Please disable content blockers and reload the page, or email us.'
                : 'Please complete the security check above, then send again.');
            return;
        }

        const originalButtonHtml = submitButton ? submitButton.innerHTML : '';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending&hellip;';
        }
        setFormStatus(statusElement, 'pending', 'Sending…');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FORM_TIMEOUT_MS);

        try {
            const response = await fetch(getSiteConfig().FORM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
                redirect: 'follow',
                signal: controller.signal
            });

            let data = null;
            try {
                data = await response.json();
            } catch (parseError) {
                data = null;
            }

            if (response.ok && data && data.ok) {
                setFormStatus(statusElement, 'success', successMessage);
                form.reset();
                if (typeof options.onSuccess === 'function') options.onSuccess(payload, form);
            } else {
                let message = (data && data.message) || 'Sorry, there was a problem sending your message.';
                // Show the server's diagnostic code (e.g. Cloudflare error-codes) to make support easier
                if (data && (data.detail || data.error)) message += ` (code: ${data.detail || data.error})`;
                setFormStatus(statusElement, 'error',
                    emailFallbackHtml(escapeHtmlText(message), 'If this keeps happening, email us at'), true);
            }
        } catch (error) {
            const reason = error && error.name === 'AbortError'
                ? 'Sorry, the server took too long to respond.'
                : 'Sorry, we could not reach the server.';
            setFormStatus(statusElement, 'error', emailFallbackHtml(reason, 'Please try again, or email us at'), true);
        } finally {
            clearTimeout(timeout);
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHtml;
            }
            resetTurnstile(turnstileSlot);
        }
    });
}

function escapeHtmlText(value) {
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
}

// ==========================================================================
// Cloudflare Turnstile (spam protection)
// ==========================================================================
//
// Add <div data-turnstile></div> inside a form; the widget is rendered there
// with the site key from js/config.js. The token is sent as turnstileToken.

let turnstileScriptRequested = false;

function initTurnstile() {
    const slots = document.querySelectorAll('[data-turnstile]');
    if (!slots.length || turnstileScriptRequested) return;

    const siteKey = getSiteConfig().TURNSTILE_SITE_KEY;
    if (!siteKey) {
        console.warn('Turnstile site key missing in js/config.js');
        slots.forEach(slot => { slot.dataset.turnstileFailed = 'true'; });
        return;
    }

    turnstileScriptRequested = true;
    window.ipfoTurnstileLoaded = function () {
        slots.forEach(slot => {
            try {
                // The normal widget needs at least 300px; use the compact one on narrow phones
                slot.dataset.widgetId = window.turnstile.render(slot, {
                    sitekey: siteKey,
                    theme: 'light',
                    size: (slot.parentElement || slot).clientWidth < 300 ? 'compact' : 'flexible'
                });
            } catch (err) {
                console.error('Turnstile render failed:', err);
                slot.dataset.turnstileFailed = 'true';
            }
        });
    };

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=ipfoTurnstileLoaded';
    script.async = true;
    script.defer = true;
    script.onerror = function () {
        console.error('Turnstile script failed to load');
        slots.forEach(slot => { slot.dataset.turnstileFailed = 'true'; });
    };
    document.head.appendChild(script);
}

function resetTurnstile(slot) {
    if (slot && slot.dataset.widgetId && window.turnstile) {
        try {
            window.turnstile.reset(slot.dataset.widgetId);
        } catch (err) {
            // ignore
        }
    }
}

// ==========================================================================
// Date Formatting Helper
// ==========================================================================

function formatDate(dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// ==========================================================================
// Initialize All Common Functions
// ==========================================================================

function initCommonFunctions() {
    initSmoothScrolling();
    initNavbarScrollEffect();
    initScrollAnimations();
    initPageLoadAnimation();
    setActiveNavLink();
    initTurnstile();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonFunctions);
} else {
    initCommonFunctions();
}

// Export functions for use in other scripts
window.IPFOCommon = {
    initSmoothScrolling,
    initNavbarScrollEffect,
    initScrollAnimations,
    initPageLoadAnimation,
    setActiveNavLink,
    handleFormSubmission,
    isFormEndpointConfigured,
    initTurnstile,
    formatDate
};