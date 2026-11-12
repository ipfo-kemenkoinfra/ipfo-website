/**
 * IPFO Project Catalogue Module
 * =============================
 * Renders project-catalogue.html from assets/project-catalogue/editions.json.
 *
 * - The edition marked "current": true is shown in the hero.
 * - All other editions are listed under "Previous editions", newest first.
 * - Every edition has a permanent anchor: project-catalogue.html#<edition id>
 *   which scrolls to and highlights that edition.
 *
 * Publishing a new edition only requires editing editions.json and adding
 * files (see README.md, "Publishing a new catalogue edition").
 */

const IPFOCatalogue = (function () {

    const EDITIONS_URL = 'assets/project-catalogue/editions.json';
    const PLACEHOLDER_COVER = 'assets/project-catalogue/cover-missing.svg';
    const SUPERSEDED_NOTICE = 'Superseded by the current edition. Project status may have changed.';

    let editions = [];
    let currentEdition = null;

    // =========================================================================
    // Helpers
    // =========================================================================

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /** Only allow http(s) URLs and relative paths (no javascript: etc.) */
    function safeUrl(value) {
        const url = String(value || '').trim();
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '';
        return url;
    }

    /** Accepts "YYYY-MM-DD" or "YYYY-MM"; returns e.g. "12 December 2025" / "December 2025" */
    function formatReleaseDate(value) {
        if (!value) return '';
        const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(value).trim());
        if (!match) return String(value);
        const [, year, month, day] = match;
        const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day || 1)));
        const options = { year: 'numeric', month: 'long', timeZone: 'UTC' };
        if (day) options.day = 'numeric';
        return date.toLocaleDateString('en-GB', options);
    }

    /** Sort key: releaseDate if present, otherwise the id (e.g. "2025-q4") */
    function sortKey(edition) {
        return String(edition.releaseDate || edition.id || '');
    }

    function isExternal(url) {
        return /^https?:\/\//i.test(url) && !url.includes(window.location.hostname);
    }

    function linkAttrs(url) {
        // Open documents in a new tab; local PDFs too, so the page stays open.
        return `href="${escapeHtml(url)}" target="_blank" rel="noopener${isExternal(url) ? ' noreferrer' : ''}"`;
    }

    function coverImg(edition, className, loading) {
        const src = safeUrl(edition.cover) || PLACEHOLDER_COVER;
        return `<img src="${escapeHtml(src)}" alt="Cover of the IPFO ${escapeHtml(edition.label)} Project Catalogue"
                    class="${className}" loading="${loading}" width="1600" height="900"
                    onerror="this.onerror=null;this.src='${PLACEHOLDER_COVER}';">`;
    }

    function catalogueTitle(edition) {
        return `IPFO ${edition.label} Project Catalogue`;
    }

    // =========================================================================
    // Rendering
    // =========================================================================

    function renderActions(edition, isCurrent) {
        const pdf = safeUrl(edition.pdf);
        const kepmenko = safeUrl(edition.kepmenko);
        const buttonClass = isCurrent ? 'cta-button' : 'edition-link';
        let html = '';

        if (pdf) {
            html += `<a ${linkAttrs(pdf)} class="${buttonClass}" data-edition="${escapeHtml(edition.id)}"
                        data-doc="catalogue">View catalogue <i class="fas fa-arrow-right" aria-hidden="true"></i></a>`;
        } else {
            html += `<span class="${buttonClass} is-disabled" aria-disabled="true">
                        Catalogue file coming soon</span>`;
        }

        if (kepmenko) {
            html += `<a ${linkAttrs(kepmenko)} class="edition-legal-link" data-edition="${escapeHtml(edition.id)}"
                        data-doc="kepmenko"><i class="fas fa-scale-balanced" aria-hidden="true"></i>
                        Legal basis (Kepmenko)</a>`;
        }

        return html;
    }

    function renderCurrent(edition) {
        const date = formatReleaseDate(edition.releaseDate);
        return `
            <article class="current-edition edition-anchor" id="${escapeHtml(edition.id)}" data-edition="${escapeHtml(edition.id)}">
                <div class="current-edition-cover">
                    ${coverImg(edition, 'catalogue-image', 'eager')}
                </div>
                <div class="current-edition-body">
                    <span class="edition-badge"><i class="fas fa-star" aria-hidden="true"></i> Current edition</span>
                    <h2 class="current-edition-title">${escapeHtml(catalogueTitle(edition))}</h2>
                    <p class="edition-date">
                        <i class="far fa-calendar" aria-hidden="true"></i>
                        ${date ? `Released ${escapeHtml(date)}` : 'Release date to be announced'}
                    </p>
                    ${edition.note ? `<p class="edition-note">${escapeHtml(edition.note)}</p>` : ''}
                    <div class="edition-actions">
                        ${renderActions(edition, true)}
                    </div>
                </div>
            </article>
        `;
    }

    function renderPrevious(edition) {
        const date = formatReleaseDate(edition.releaseDate);
        return `
            <article class="edition-card edition-anchor" id="${escapeHtml(edition.id)}" data-edition="${escapeHtml(edition.id)}">
                <div class="edition-card-cover">
                    ${coverImg(edition, 'edition-card-image', 'lazy')}
                </div>
                <div class="edition-card-body">
                    <h3>${escapeHtml(edition.label)}</h3>
                    ${date ? `<p class="edition-date"><i class="far fa-calendar" aria-hidden="true"></i> ${escapeHtml(date)}</p>` : ''}
                    ${edition.note ? `<p class="edition-note">${escapeHtml(edition.note)}</p>` : ''}
                    <p class="edition-superseded">
                        <i class="fas fa-circle-info" aria-hidden="true"></i>
                        ${SUPERSEDED_NOTICE}
                    </p>
                    <div class="edition-actions">
                        ${renderActions(edition, false)}
                        <a href="#${escapeHtml(edition.id)}" class="edition-permalink" data-permalink="${escapeHtml(edition.id)}"
                            title="Permanent link to this edition"><i class="fas fa-link" aria-hidden="true"></i> Link</a>
                    </div>
                </div>
            </article>
        `;
    }

    function renderError() {
        const slot = document.getElementById('currentEditionSlot');
        if (!slot) return;
        slot.innerHTML = `
            <div class="catalogue-error" role="alert">
                <p><i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
                    The catalogue list could not be loaded right now. Please refresh the page, or email
                    <a href="mailto:sekretariat@ipfo.kemenkoinfra.go.id">sekretariat@ipfo.kemenkoinfra.go.id</a>
                    to request the catalogue.</p>
            </div>
        `;
    }

    function render() {
        const slot = document.getElementById('currentEditionSlot');
        const previousSection = document.getElementById('previous-editions');
        const grid = document.getElementById('editionsGrid');
        if (!slot) return;

        slot.innerHTML = currentEdition ? renderCurrent(currentEdition) : '';

        const previous = editions
            .filter(e => e !== currentEdition)
            .sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

        if (grid && previousSection) {
            grid.innerHTML = previous.map(renderPrevious).join('');
            previousSection.hidden = previous.length === 0;
        }
    }

    // =========================================================================
    // Anchors (#2025-q4) and highlighting
    // =========================================================================

    function editionFromHash() {
        const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        if (!id) return null;
        return editions.find(e => e.id === id) || null;
    }

    function highlight(edition, scroll) {
        document.querySelectorAll('.edition-anchor.is-highlighted')
            .forEach(el => el.classList.remove('is-highlighted'));

        const el = document.getElementById(edition.id);
        if (!el) return;

        // Restart the animation even if the same edition is targeted twice
        void el.offsetWidth;
        el.classList.add('is-highlighted');

        if (scroll) {
            const reduceMotion = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
    }

    function handleHash(via) {
        const edition = editionFromHash();
        if (edition) {
            highlight(edition, true);
            trackView(edition, 'anchor');
        } else if (via === 'load' && currentEdition) {
            trackView(currentEdition, 'default');
        }
    }

    // =========================================================================
    // Analytics
    // =========================================================================

    function trackView(edition, via) {
        if (!window.IPFOAnalytics || !IPFOAnalytics.trackCatalogueView) return;
        IPFOAnalytics.trackCatalogueView(edition.id, {
            label: edition.label,
            isCurrent: edition === currentEdition,
            via: via
        });
    }

    function setupClickTracking() {
        // Clicking the permalink of the edition already in the URL fires no
        // hashchange, so re-highlight it manually.
        document.addEventListener('click', function (e) {
            const permalink = e.target.closest('a[data-permalink]');
            if (!permalink) return;
            const id = permalink.getAttribute('data-permalink');
            if (decodeURIComponent(window.location.hash.slice(1)) === id) {
                e.preventDefault();
                const edition = editions.find(ed => ed.id === id);
                if (edition) highlight(edition, true);
            }
        });

        document.addEventListener('click', function (e) {
            const link = e.target.closest('a[data-edition][data-doc]');
            if (!link || !window.IPFOAnalytics || !IPFOAnalytics.trackCatalogueOpen) return;
            const id = link.getAttribute('data-edition');
            IPFOAnalytics.trackCatalogueOpen(
                id,
                link.getAttribute('data-doc'),
                link.getAttribute('href'),
                !!currentEdition && currentEdition.id === id
            );
        });
    }

    // =========================================================================
    // Init
    // =========================================================================

    function normalize(data) {
        const list = Array.isArray(data) ? data : (data && data.editions) || [];
        return list.filter(e => e && e.id && e.label);
    }

    async function init() {
        try {
            const response = await fetch(EDITIONS_URL, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            editions = normalize(await response.json());
        } catch (err) {
            console.error('Could not load catalogue editions:', err);
            renderError();
            return;
        }

        if (!editions.length) {
            renderError();
            return;
        }

        // Current edition = the one flagged "current"; fall back to the newest.
        currentEdition = editions.find(e => e.current === true) ||
            editions.slice().sort((a, b) => sortKey(b).localeCompare(sortKey(a)))[0];

        render();
        setupClickTracking();

        // Wait for layout (header/nav are injected, images reserve space via width/height)
        requestAnimationFrame(() => handleHash('load'));
        window.addEventListener('hashchange', () => handleHash('hashchange'));
    }

    return {
        init,
        // Exposed for testing / debugging
        formatReleaseDate,
        getEditions: () => editions.slice(),
        getCurrentEdition: () => currentEdition
    };

})();

window.IPFOCatalogue = IPFOCatalogue;
