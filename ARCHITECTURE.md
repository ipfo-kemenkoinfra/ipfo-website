# IPFO Website Architecture

## 📊 Visual Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       USER'S BROWSER                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                   HTML Pages                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ homepage.html│  │ blog.html    │  │ etc...   │ │    │
│  │  │              │  │              │  │          │ │    │
│  │  │ Placeholders:│  │ Placeholders:│  │          │ │    │
│  │  │ • header-top │  │ • header-top │  │          │ │    │
│  │  │ • navigation │  │ • navigation │  │          │ │    │
│  │  │ • footer     │  │ • footer     │  │          │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │            JavaScript Modules                      │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ components  │  │  common.js   │  │ blog.js  │ │    │
│  │  │   .js       │  │              │  │          │ │    │
│  │  │ Creates:    │  │ Functions:   │  │ Handles: │ │    │
│  │  │ • Header    │  │ • Animations │  │ • Posts  │ │    │
│  │  │ • Nav       │  │ • Scrolling  │  │ • CSV    │ │    │
│  │  │ • Footer    │  │ • Forms      │  │ • Filter │ │    │
│  │  └─────────────┘  └──────────────┘  └──────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │                 CSS Styles                         │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ common   │  │ homepage.css │  │   blog.css  │ │    │
│  │  │  .css    │  │              │  │             │ │    │
│  │  │ Styles:  │  │ Styles:      │  │ Styles:     │ │    │
│  │  │ • Colors │  │ • Hero       │  │ • Cards     │ │    │
│  │  │ • Layout │  │ • Sections   │  │ • Filters   │ │    │
│  │  │ • Buttons│  │              │  │             │ │    │
│  │  └──────────┘  └──────────────┘  └─────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Component Flow

### How a Page Loads:

```
1. Browser requests homepage.html
         │
         ▼
2. HTML loads with placeholders
   <div id="header-top-placeholder"></div>
   <div id="navigation-placeholder"></div>
   <div id="footer-placeholder"></div>
         │
         ▼
3. Browser loads JavaScript files
   • components.js  ← Loads first
   • common.js      ← Loads second
         │
         ▼
4. JavaScript runs:
   IPFOComponents.insertComponents('homepage.html')
         │
         ▼
5. Components replace placeholders:
   • Header top bar inserted
   • Navigation menu inserted
   • Footer inserted
   • Active link highlighted
         │
         ▼
6. Common functions initialize:
   • Smooth scrolling enabled
   • Scroll animations set up
   • Navbar effects enabled
         │
         ▼
7. Page-specific code runs:
   (e.g., blog loads posts, forms handle submissions)
         │
         ▼
8. ✨ FULLY RENDERED PAGE ✨
```

## 🎯 Data Flow for Blog

```
┌─────────────────────────────────────────────────────┐
│                  Google Sheets                       │
│         (Blog posts stored as CSV)                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ HTTPS Request
                  ▼
┌─────────────────────────────────────────────────────┐
│              blog.js Module                          │
│                                                      │
│  1. Fetch CSV data                                  │
│  2. Parse with PapaParse                            │
│  3. Create post objects                             │
│  4. Filter by category                              │
│  5. Generate HTML cards                             │
│  6. Insert into page                                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                blog.html / blog-article.html         │
│              (Displayed to user)                     │
└─────────────────────────────────────────────────────┘
```

## 🏗️ File Dependencies

### Every Page Needs:

```
HTML Page
├── Font Awesome (CDN)
├── css/common.css       ← ALWAYS REQUIRED
├── css/page-name.css    ← Page-specific styles
├── js/components.js     ← ALWAYS REQUIRED (load first)
└── js/common.js         ← ALWAYS REQUIRED (load second)
```

### Blog Pages Also Need:

```
Blog Pages (blog.html, blog-article.html)
└── Additional:
    ├── PapaParse library (CDN)
    └── js/blog.js
```

## 🔌 Component System

### Before (Old Way):
```
homepage.html      (1000 lines including header/footer)
contact.html       (1000 lines including header/footer)
blog.html          (1000 lines including header/footer)
project-catalogue  (1000 lines including header/footer)
                   ─────────────────────────────────────
                   4000 lines TOTAL
                   Header/Footer repeated 4 times
                   Maintenance nightmare
```

### After (New Way):
```
homepage.html      (100 lines - just content)
contact.html       (100 lines - just content)
blog.html          (100 lines - just content)
project-catalogue  (100 lines - just content)
js/components.js   (200 lines - ONE definition)
                   ─────────────────────────────────────
                   600 lines TOTAL
                   Header/Footer in ONE place
                   Easy maintenance
```

**Result**: 85% less code, infinitely easier to maintain!

## 🎨 CSS Organization

```
CSS Architecture
├── common.css (Base Layer)
│   ├── CSS Variables (colors, sizes)
│   ├── Reset styles
│   ├── Layout (container, grid)
│   ├── Navigation
│   ├── Footer
│   ├── Buttons
│   ├── Forms
│   ├── Utility classes
│   └── Responsive breakpoints
│
└── Page-specific CSS (Enhancement Layer)
    ├── homepage.css (hero, sections)
    ├── contact.css (form styles)
    ├── blog.css (cards, filters)
    ├── blog-article.css (article layout)
    └── project-catalogue.css (catalogue styles)
```

## 📱 Responsive Behavior

```
Desktop (> 768px)
├── Full navigation menu
├── Two-column layouts
├── Large hero sections
└── Desktop footer

         │
         ▼ Screen width decreases
         │

Tablet (481px - 768px)
├── Full navigation (slightly smaller)
├── Adaptive layouts
├── Medium hero sections
└── Adapted footer

         │
         ▼ Screen width decreases
         │

Mobile (≤ 480px)
├── Mobile navigation (bottom bar)
├── Single-column layouts
├── Compact hero sections
└── Mobile footer
```

## ⚙️ JavaScript Module System

```
Window Object (Global Scope)
├── IPFOCommon (from common.js)
│   ├── initSmoothScrolling()
│   ├── initNavbarScrollEffect()
│   ├── initScrollAnimations()
│   ├── handleFormSubmission()
│   └── formatDate()
│
├── IPFOComponents (from components.js)
│   ├── createHeaderTop()
│   ├── createNavigation()
│   ├── createFooter()
│   └── insertComponents()
│
└── BlogModule (from blog.js)
    ├── loadBlogPosts()
    ├── loadArticle()
    └── initializeFilters()
```

## 🚀 Performance Strategy

```
Browser Cache Strategy
├── HTML files (no cache - always fresh)
├── CSS files (cached - version in filename)
├── JS files (cached - version in filename)
└── External libraries (CDN cached globally)

Loading Strategy
├── Critical CSS inline (future enhancement)
├── Non-critical CSS deferred (future enhancement)
├── JavaScript at bottom (implemented)
└── Images lazy-loaded (future enhancement)

Optimization
├── Minified CSS (production ready)
├── Minified JS (production ready)
├── Compressed images (user responsibility)
└── CDN for libraries (implemented)
```

## 🔒 Security Layers

```
Security Measures
├── Form Validation
│   ├── Client-side (HTML5 + JS)
│   └── Server-side (Google Apps Script + Turnstile, see apps-script/)
│
├── XSS Protection
│   ├── No eval() usage
│   ├── Safe HTML insertion
│   └── Input sanitization
│
└── Best Practices
    ├── HTTPS only
    ├── No sensitive data in code
    └── Secure external dependencies
```

## 📊 State Management

```
Application State
├── No page state (static pages)
├── Blog posts (loaded from CSV)
│   └── Stored in memory during session
├── Form state (managed by browser)
└── UI state (CSS classes)

Session Storage
└── None (intentional - privacy)

Local Storage
└── None (intentional - privacy)
```

## 🎯 Event Flow

```
User Action → JavaScript Handler → DOM Update → Visual Change

Example: Clicking Navigation Link
1. User clicks "Blog" link
2. Browser navigates to blog.html
3. Page loads (see "How a Page Loads")
4. "Blog" link gets "active" class
5. Link highlighted in yellow

Example: Filtering Blog Posts
1. User clicks "Investment" filter button
2. JavaScript captures click event
3. BlogModule filters posts array
4. DOM updated with filtered posts
5. Only Investment posts visible
```

---

## 💡 Key Takeaways

1. **Modularity**: Each file has ONE job
2. **Reusability**: Components used everywhere
3. **Maintainability**: Update once, change everywhere
4. **Performance**: Efficient code, minimal redundancy
5. **Scalability**: Easy to add new features

This architecture follows industry best practices and is used by professional development teams worldwide!
