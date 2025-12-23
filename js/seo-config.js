/**
 * IPFO SEO Configuration
 * =====================
 * Single source of truth for all SEO-related data.
 * Update URLs and metadata here - changes apply site-wide.
 */

const SEOConfig = {
    // Base site information
    site: {
        name: 'Infrastructure Project Facilitation Office',
        shortName: 'IPFO',
        url: 'https://ipfo.kemenkoinfra.go.id',
        defaultImage: 'https://ipfo.kemenkoinfra.go.id/assets/images/og-image.png',
        language: 'en',
        locale: 'en_US'
    },

    // Organization structured data
    organization: {
        name: 'Infrastructure Project Facilitation Office (IPFO)',
        description: 'Facilitating Indonesia infrastructure project investment to support sustainable and equitable growth.',
        url: 'https://ipfo.kemenkoinfra.go.id',
        logo: 'https://ipfo.kemenkoinfra.go.id/assets/images/ipfo-logo.png',
        email: 'sekretariat@ipfo.kemenkoinfra.go.id',
        phone: '+6285123332509',
        address: {
            streetAddress: 'Jl. M.H. Thamrin No.8, 2nd Floor',
            addressLocality: 'Jakarta Pusat',
            addressRegion: 'DKI Jakarta',
            postalCode: '10340',
            addressCountry: 'ID'
        },
        parentOrganization: 'Kementerian Koordinator Bidang Infrastruktur dan Pembangunan Kewilayahan'
    },

    // Page-specific SEO data
    pages: {
        'index.html': {
            title: 'IPFO - Infrastructure Project Facilitation Office Indonesia',
            description: 'Facilitating Indonesia infrastructure project investment to support sustainable and equitable growth. Access infrastructure projects and investment opportunities through IPFO.',
            keywords: 'Indonesia infrastructure, IPFO, infrastructure investment, PPP projects, infrastructure facilitation, government investment, project catalogue',
            canonical: '/'
        },
        'project-catalogue.html': {
            title: 'Project Catalogue - IPFO Indonesia',
            description: 'Browse Indonesia\'s infrastructure project catalogue featuring projects in transportation, energy, water, and waste management sectors available for private investment.',
            keywords: 'Indonesia infrastructure projects, project catalogue, PPP projects Indonesia, infrastructure investment opportunities, strategic projects',
            canonical: '/project-catalogue.html'
        },
        'contact-us.html': {
            title: 'Contact Us - IPFO Indonesia',
            description: 'Get in touch with the Infrastructure Project Facilitation Office (IPFO) for inquiries about infrastructure investment opportunities in Indonesia.',
            keywords: 'contact IPFO, infrastructure investment inquiry, Indonesia investment contact, IPFO office',
            canonical: '/contact-us.html'
        },
        'blog.html': {
            title: 'Blog & Insights - IPFO Indonesia',
            description: 'Latest news, insights, and updates on Indonesia infrastructure development, investment opportunities, and policy developments from IPFO.',
            keywords: 'Indonesia infrastructure news, infrastructure insights, IPFO blog, infrastructure policy, investment news',
            canonical: '/blog.html'
        },
        'blog-article.html': {
            title: 'Article - IPFO Indonesia',
            description: 'Read the latest insights on Indonesia infrastructure development from IPFO.',
            keywords: 'Indonesia infrastructure, IPFO article, infrastructure insights',
            canonical: '/blog-article.html'
        }
    },

    // Social media profiles (add when available)
    social: {
        twitter: '',
        linkedin: '',
        facebook: '',
        instagram: ''
    }
};

/**
 * Get SEO data for a specific page
 */
function getPageSEO(pageName) {
    return SEOConfig.pages[pageName] || SEOConfig.pages['index.html'];
}

/**
 * Generate full canonical URL
 */
function getCanonicalURL(pageName) {
    const pageSEO = getPageSEO(pageName);
    return SEOConfig.site.url + pageSEO.canonical;
}

/**
 * Generate Organization JSON-LD structured data
 */
function getOrganizationSchema() {
    const org = SEOConfig.organization;
    return {
        "@context": "https://schema.org",
        "@type": "GovernmentOrganization",
        "name": org.name,
        "description": org.description,
        "url": org.url,
        "logo": org.logo,
        "email": org.email,
        "telephone": org.phone,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": org.address.streetAddress,
            "addressLocality": org.address.addressLocality,
            "addressRegion": org.address.addressRegion,
            "postalCode": org.address.postalCode,
            "addressCountry": org.address.addressCountry
        },
        "parentOrganization": {
            "@type": "GovernmentOrganization",
            "name": org.parentOrganization
        }
    };
}

/**
 * Generate WebSite JSON-LD structured data
 */
function getWebsiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SEOConfig.site.name,
        "url": SEOConfig.site.url,
        "description": SEOConfig.organization.description,
        "publisher": {
            "@type": "GovernmentOrganization",
            "name": SEOConfig.organization.name
        }
    };
}

/**
 * Inject structured data into page
 */
function injectStructuredData() {
    // Organization schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify(getOrganizationSchema());
    document.head.appendChild(orgScript);

    // Website schema
    const siteScript = document.createElement('script');
    siteScript.type = 'application/ld+json';
    siteScript.textContent = JSON.stringify(getWebsiteSchema());
    document.head.appendChild(siteScript);
}

/**
 * Update page meta tags dynamically (for SPA-like behavior)
 */
function updatePageMeta(pageName) {
    const seo = getPageSEO(pageName);

    // Update title
    document.title = seo.title;

    // Update meta tags
    updateMetaTag('description', seo.description);
    updateMetaTag('keywords', seo.keywords);

    // Update Open Graph
    updateMetaTag('og:title', seo.title, 'property');
    updateMetaTag('og:description', seo.description, 'property');
    updateMetaTag('og:url', getCanonicalURL(pageName), 'property');

    // Update Twitter
    updateMetaTag('twitter:title', seo.title);
    updateMetaTag('twitter:description', seo.description);

    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.href = getCanonicalURL(pageName);
    }
}

function updateMetaTag(name, content, attribute = 'name') {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (meta) {
        meta.content = content;
    }
}

// Export for use in other scripts
window.SEOConfig = SEOConfig;
window.IPFOSeo = {
    getPageSEO,
    getCanonicalURL,
    getOrganizationSchema,
    getWebsiteSchema,
    injectStructuredData,
    updatePageMeta
};
