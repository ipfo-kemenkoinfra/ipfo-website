/**
 * IPFO Analytics Module
 * ====================
 * Google Analytics 4 integration with custom event tracking.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID
 * 2. Get your Measurement ID from: Google Analytics > Admin > Data Streams > Web
 * 3. Include this script in all pages after the GA4 base script
 */

const IPFOAnalytics = (function () {

    // =========================================================================
    // CONFIGURATION - UPDATE THIS WITH YOUR GA4 MEASUREMENT ID
    // =========================================================================
    const GA_MEASUREMENT_ID = 'G-CQ66MFVL3M'; // <-- REPLACE WITH YOUR ID

    // =========================================================================
    // Initialize GA4
    // =========================================================================

    function init() {
        // Load GA4 script dynamically
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            'page_title': document.title,
            'page_location': window.location.href
        });

        // Setup automatic tracking
        setupDownloadTracking();
        setupOutboundLinkTracking();
        setupFormTracking();
        setupScrollTracking();

        console.log('IPFO Analytics initialized');
    }

    // =========================================================================
    // Download Tracking
    // =========================================================================

    function setupDownloadTracking() {
        // Track clicks on download links (PDFs, catalogues, etc.)
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href') || '';

            // Check if it's a download link
            const isDownload =
                href.includes('.pdf') ||
                href.includes('.xlsx') ||
                href.includes('.docx') ||
                href.includes('drive.google.com') ||
                href.includes('download') ||
                link.hasAttribute('download');

            if (isDownload) {
                trackDownload(href, link.textContent.trim());
            }
        });
    }

    function trackDownload(url, linkText) {
        // Determine file type
        let fileType = 'other';
        if (url.includes('.pdf')) fileType = 'pdf';
        else if (url.includes('.xlsx') || url.includes('.xls')) fileType = 'excel';
        else if (url.includes('.docx') || url.includes('.doc')) fileType = 'word';
        else if (url.includes('drive.google.com')) fileType = 'google_drive';

        // Determine document type based on context
        let documentType = 'unknown';
        if (url.toLowerCase().includes('catalogue') || linkText.toLowerCase().includes('catalogue')) {
            documentType = 'project_catalogue';
        } else if (url.toLowerCase().includes('report')) {
            documentType = 'report';
        } else if (url.toLowerCase().includes('guideline')) {
            documentType = 'guideline';
        }

        // Send event to GA4
        gtag('event', 'file_download', {
            'file_url': url,
            'file_type': fileType,
            'document_type': documentType,
            'link_text': linkText.substring(0, 100), // Truncate long text
            'page_location': window.location.pathname
        });

        console.log('Download tracked:', { url, fileType, documentType });
    }

    // =========================================================================
    // Outbound Link Tracking
    // =========================================================================

    function setupOutboundLinkTracking() {
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href') || '';

            // Check if external link
            if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                trackOutboundLink(href);
            }
        });
    }

    function trackOutboundLink(url) {
        // Parse the URL to get domain
        let domain = '';
        try {
            domain = new URL(url).hostname;
        } catch (e) {
            domain = url;
        }

        gtag('event', 'outbound_link', {
            'link_url': url,
            'link_domain': domain,
            'page_location': window.location.pathname
        });
    }

    // =========================================================================
    // Form Submission Tracking
    // =========================================================================

    function setupFormTracking() {
        document.addEventListener('submit', function (e) {
            const form = e.target;
            if (!form || form.tagName !== 'FORM') return;

            const formId = form.id || 'unknown_form';
            const formAction = form.action || '';

            // Determine form type
            let formType = 'unknown';
            if (formId.includes('contact') || formAction.includes('contact')) {
                formType = 'contact_inquiry';
            } else if (formId.includes('newsletter') || formAction.includes('newsletter')) {
                formType = 'newsletter_signup';
            } else if (formId.includes('interest') || formAction.includes('interest')) {
                formType = 'express_interest';
            }

            trackFormSubmission(formId, formType);
        });
    }

    function trackFormSubmission(formId, formType) {
        gtag('event', 'form_submission', {
            'form_id': formId,
            'form_type': formType,
            'page_location': window.location.pathname
        });

        // Also track as conversion for important forms
        if (formType === 'contact_inquiry' || formType === 'express_interest') {
            gtag('event', 'generate_lead', {
                'form_type': formType
            });
        }

        console.log('Form submission tracked:', { formId, formType });
    }

    // =========================================================================
    // Scroll Depth Tracking
    // =========================================================================

    function setupScrollTracking() {
        const thresholds = [25, 50, 75, 90];
        const tracked = new Set();

        window.addEventListener('scroll', throttle(function () {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );

            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !tracked.has(threshold)) {
                    tracked.add(threshold);
                    trackScrollDepth(threshold);
                }
            });
        }, 250));
    }

    function trackScrollDepth(percent) {
        gtag('event', 'scroll_depth', {
            'percent_scrolled': percent,
            'page_location': window.location.pathname
        });
    }

    // =========================================================================
    // Custom Event Tracking (Public API)
    // =========================================================================

    /**
     * Track a custom event
     * @param {string} eventName - Name of the event
     * @param {object} params - Event parameters
     */
    function trackEvent(eventName, params = {}) {
        gtag('event', eventName, {
            ...params,
            'page_location': window.location.pathname
        });
    }

    /**
     * Track project catalogue view
     * @param {string} catalogueName - Name/version of the catalogue
     */
    function trackCatalogueView(catalogueName) {
        trackEvent('catalogue_view', {
            'catalogue_name': catalogueName
        });
    }

    /**
     * Track project interest
     * @param {string} projectId - ID of the project
     * @param {string} projectName - Name of the project
     * @param {string} sector - Project sector
     */
    function trackProjectInterest(projectId, projectName, sector) {
        trackEvent('project_interest', {
            'project_id': projectId,
            'project_name': projectName,
            'project_sector': sector
        });
    }

    /**
     * Track blog article read
     * @param {string} articleId - Article ID
     * @param {string} articleTitle - Article title
     * @param {string} category - Article category
     */
    function trackArticleRead(articleId, articleTitle, category) {
        trackEvent('article_read', {
            'article_id': articleId,
            'article_title': articleTitle,
            'article_category': category
        });
    }

    /**
     * Track share action
     * @param {string} platform - Platform shared to (twitter, linkedin, etc.)
     * @param {string} contentType - Type of content shared
     * @param {string} contentId - ID of content shared
     */
    function trackShare(platform, contentType, contentId) {
        trackEvent('share', {
            'method': platform,
            'content_type': contentType,
            'content_id': contentId
        });
    }

    // =========================================================================
    // Utility Functions
    // =========================================================================

    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // =========================================================================
    // Public API
    // =========================================================================

    return {
        init,
        trackEvent,
        trackDownload,
        trackCatalogueView,
        trackProjectInterest,
        trackArticleRead,
        trackShare,
        trackFormSubmission
    };

})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', IPFOAnalytics.init);
} else {
    IPFOAnalytics.init();
}

// Export to global scope
window.IPFOAnalytics = IPFOAnalytics;
