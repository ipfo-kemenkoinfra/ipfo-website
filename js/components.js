/**
 * HTML Components Generator
 * Creates reusable header and footer components
 */

// ==========================================================================
// Header Top Component
// ==========================================================================

function createHeaderTop() {
    return `
        <div class="header-top">
            <div class="container">
                <div class="contact-info">
                    <i class="fas fa-envelope"></i>
                    <a href="mailto:sekretariat@ipfo.kemenkoinfra.go.id">sekretariat@ipfo.kemenkoinfra.go.id</a>
                </div>
            </div>
        </div>
    `;
}

// ==========================================================================
// Navigation Component
// ==========================================================================

function createNavigation(activePage = '') {
    const menuItems = [
        { href: 'index.html', label: 'Home', icon: 'home' },
        { href: 'project-catalogue.html', label: 'Project Catalogue', icon: 'folder-open' },
        { href: 'contact-us.html', label: 'Contact Us', icon: 'envelope' },
        { href: 'blog.html', label: 'Blog', icon: 'newspaper' }
    ];

    const desktopMenu = menuItems.map(item => `
        <li>
            <a href="${item.href}" ${activePage === item.href ? 'class="active"' : ''}>
                ${item.label}
            </a>
        </li>
    `).join('');

    const mobileMenu = menuItems.map(item => `
        <a href="${item.href}" class="mobile-nav-item ${activePage === item.href ? 'active' : ''}">
            <i class="fas fa-${item.icon}"></i>
            ${item.label === 'Project Catalogue' ? 'Projects' : item.label}
        </a>
    `).join('');

    return {
        desktop: `
            <nav class="navbar">
                <div class="container">
                    <div class="nav-container">
                        <div class="logo">
                            <img src="assets/images/ipfo-logo.png" alt="IPFO Logo">
                        </div>
                        <ul class="nav-menu">
                            ${desktopMenu}
                        </ul>
                    </div>
                </div>
            </nav>
        `,
        mobile: `
            <div class="mobile-nav">
                <div class="mobile-nav-items">
                    ${mobileMenu}
                </div>
            </div>
        `
    };
}

// ==========================================================================
// Footer Component
// ==========================================================================

function createFooter() {
    return `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Our Office</h3>
                        <div class="footer-links">
                            <a href="https://maps.app.goo.gl/d1MnPAUq1zS32bpJA" target="_blank">
                                <i class="fas fa-map-marker-alt"></i>
                                <p>
                                    2nd floor, Kementerian Koordinator Bidang Infrastruktur & Pembangunan Kewilayahan<br>
                                    Jl. M.H. Thamrin No.8, RT.10/RW.10, Kb. Sirih, Kec. Menteng, Jakarta Pusat<br>
                                    Daerah Khusus Ibukota Jakarta 10340
                                </p>
                            </a>
                        </div>
                    </div>

                    <div class="footer-section">
                        <h3>Contact Us</h3>
                        <div class="footer-links">
                            <a href="mailto:sekretariat@ipfo.kemenkoinfra.go.id">
                                <i class="fas fa-envelope"></i>
                                sekretariat@ipfo.kemenkoinfra.go.id
                            </a>
                            <a href="tel:+6285123332509">
                                <i class="fas fa-phone"></i>
                                +6285123332509
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

// ==========================================================================
// Insert Components into Page
// ==========================================================================

function insertComponents(activePage = '') {
    // Insert header top
    const headerTopPlaceholder = document.getElementById('header-top-placeholder');
    if (headerTopPlaceholder) {
        headerTopPlaceholder.outerHTML = createHeaderTop();
    }

    // Insert navigation
    const navPlaceholder = document.getElementById('navigation-placeholder');
    if (navPlaceholder) {
        const nav = createNavigation(activePage);
        navPlaceholder.outerHTML = nav.desktop;
    }

    // Insert footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = createFooter();
    }

    // Insert mobile navigation
    const mobileNavPlaceholder = document.getElementById('mobile-nav-placeholder');
    if (mobileNavPlaceholder) {
        const nav = createNavigation(activePage);
        mobileNavPlaceholder.outerHTML = nav.mobile;
    }
}

// Export for use in pages
window.IPFOComponents = {
    createHeaderTop,
    createNavigation,
    createFooter,
    insertComponents
};
