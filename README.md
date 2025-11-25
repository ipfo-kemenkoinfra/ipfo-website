# IPFO Website - Refactored Codebase

## 📁 Project Structure

```
refactored-site/
├── css/
│   ├── common.css          # Shared styles across all pages
│   ├── homepage.css        # Homepage-specific styles
│   ├── contact.css         # Contact page-specific styles
│   ├── blog.css            # Blog listing page styles
│   ├── blog-article.css    # Individual article page styles
│   └── project-catalogue.css    # Individual article page styles
├── js/
│   ├── common.js           # Shared JavaScript functions
│   ├── components.js       # Reusable HTML components
│   └── blog.js             # Blog functionality module
├── homepage.html           # Main landing page
├── contact-us.html         # Contact form page
├── project-catalogue.html  # Project catalogue page
├── blog.html               # Blog listing page
├── blog-article.html       # Individual blog article page
└── README.md               # This file
```

## 🎯 Key Improvements

### 1. **Separation of Concerns**
- **CSS**: Styles are separated into modular files
  - `common.css`: Shared styles (navigation, footer, utilities)
  - Page-specific CSS files for unique page styles
  
- **JavaScript**: Logic is organized into modules
  - `common.js`: Shared functions (scroll effects, animations)
  - `components.js`: Reusable HTML components
  - `blog.js`: Blog-specific functionality

### 2. **Reusable Components**
The `components.js` file provides functions to generate:
- Header top bar
- Navigation menu (desktop & mobile)
- Footer
- These components are inserted dynamically into placeholder elements

### 3. **DRY (Don't Repeat Yourself) Principle**
- Common functionality is centralized
- HTML components are defined once and reused
- CSS variables for consistent theming

### 4. **Better Code Organization**
- Clear file structure
- Modular JavaScript with IIFE pattern
- Comments and documentation throughout

### 5. **Easier Maintenance**
- Update header/footer in one place
- Modify styles without searching through large files
- Add new pages easily by following the template

## 🚀 Quick Start Guide

### For Beginners

#### 1. **File Structure Setup**
Create the folder structure as shown above. Place all files in their respective directories.

#### 2. **Understanding the HTML Pages**

Each HTML page follows this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    
    <!-- External Libraries -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- Your Styles -->
    <link rel="stylesheet" href="css/common.css">      <!-- Always include -->
    <link rel="stylesheet" href="css/page-specific.css"> <!-- Page-specific -->
</head>
<body>
    <!-- Components (automatically populated) -->
    <div id="header-top-placeholder"></div>
    <div id="navigation-placeholder"></div>
    
    <!-- Your Page Content Here -->
    <section class="your-content">
        <!-- ... -->
    </section>
    
    <!-- Components (automatically populated) -->
    <div id="footer-placeholder"></div>
    <div id="mobile-nav-placeholder"></div>
    
    <!-- Scripts -->
    <script src="js/components.js"></script>
    <script src="js/common.js"></script>
    <script>
        // Initialize components with current page
        IPFOComponents.insertComponents('your-page.html');
    </script>
</body>
</html>
```

#### 3. **How Components Work**

The placeholder `<div>` elements are replaced with actual HTML by JavaScript:

```javascript
// In your page's script section
IPFOComponents.insertComponents('homepage.html');
```

This automatically:
- Adds the header top bar
- Adds navigation (with active link highlighting)
- Adds footer
- Adds mobile navigation

#### 4. **Adding a New Page**

**Step 1**: Create HTML file
```html
<!-- new-page.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Page - IPFO</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/common.css">
    <link rel="stylesheet" href="css/new-page.css">
</head>
<body>
    <div id="header-top-placeholder"></div>
    <div id="navigation-placeholder"></div>
    
    <section class="page-header">
        <div class="container">
            <h1>My New Page</h1>
        </div>
    </section>
    
    <section class="content-section">
        <div class="container">
            <p>Your content here...</p>
        </div>
    </section>
    
    <div id="footer-placeholder"></div>
    <div id="mobile-nav-placeholder"></div>
    
    <script src="js/components.js"></script>
    <script src="js/common.js"></script>
    <script>
        IPFOComponents.insertComponents('new-page.html');
    </script>
</body>
</html>
```

**Step 2**: Create CSS file (optional)
```css
/* css/new-page.css */
.content-section {
    padding: 80px 0;
}

.content-section p {
    font-size: 1.1rem;
    line-height: 1.8;
}
```

**Step 3**: Add to navigation (in `js/components.js`)
```javascript
const menuItems = [
    { href: 'homepage.html', label: 'Home', icon: 'home' },
    { href: 'new-page.html', label: 'New Page', icon: 'star' }, // Add this
    // ... other items
];
```

## 📝 Common Tasks

### Task 1: Change Website Colors

Edit `css/common.css`:
```css
:root {
    --primary-blue: #1e40af;    /* Change this */
    --dark-blue: #1e3a8a;       /* And this */
    --yellow-accent: #fbbf24;   /* And this */
}
```

### Task 2: Update Contact Information

Edit `js/components.js`, find the `createHeaderTop()` and `createFooter()` functions:
```javascript
// Header email
<a href="mailto:newemail@example.com">newemail@example.com</a>

// Footer phone
<a href="tel:+6281234567890">+6281234567890</a>
```

### Task 3: Add Social Media Links

Edit `js/components.js` in the `createFooter()` function:
```javascript
<div class="social-links">
    <a href="https://facebook.com/yourpage" target="_blank">
        <i class="fab fa-facebook"></i> Facebook
    </a>
    <a href="https://twitter.com/yourhandle" target="_blank">
        <i class="fab fa-twitter"></i> Twitter
    </a>
</div>
```

### Task 4: Modify Form Submission

The form handling is already set up in `common.js`. To use it:

```html
<form id="myForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
    <!-- form fields -->
    <button type="submit">Submit</button>
</form>
<p id="formStatus"></p>

<script>
    IPFOCommon.handleFormSubmission('myForm', 'formStatus');
</script>
```

## 🎨 CSS Architecture

### Variables (Customization)
All colors and common values are defined as CSS variables in `common.css`:
```css
:root {
    --primary-blue: #1e40af;
    --dark-blue: #1e3a8a;
    --light-blue: #3b82f6;
    --yellow-accent: #fbbf24;
    --white: #ffffff;
    --gray-light: #f5f5f5;
    --gray-medium: #6b7280;
    --text-dark: #1f2937;
}
```

### Utility Classes
Common utility classes available:
- `.text-center` - Center text
- `.text-primary` - Primary blue color
- `.text-accent` - Yellow accent color
- `.mt-2`, `.mb-2` - Margins
- `.container` - Max-width container with padding

## 📱 Responsive Design

The site is mobile-responsive with breakpoints:
- **Desktop**: > 768px (full navigation)
- **Tablet**: 481px - 768px (adapted layouts)
- **Mobile**: ≤ 480px (mobile navigation, stacked layouts)

Mobile navigation automatically appears on small screens.

## 🔧 JavaScript API

### Common Functions (`IPFOCommon`)
```javascript
// Smooth scrolling
IPFOCommon.initSmoothScrolling();

// Navbar scroll effect
IPFOCommon.initNavbarScrollEffect();

// Scroll animations
IPFOCommon.initScrollAnimations();

// Form submission
IPFOCommon.handleFormSubmission(formId, statusElementId, successMessage);

// Date formatting
IPFOCommon.formatDate(dateString, options);
```

### Component Functions (`IPFOComponents`)
```javascript
// Insert all components
IPFOComponents.insertComponents('current-page.html');

// Get individual components
const header = IPFOComponents.createHeaderTop();
const nav = IPFOComponents.createNavigation('active-page.html');
const footer = IPFOComponents.createFooter();
```

### Blog Functions (`BlogModule`)
```javascript
// Load blog posts (for blog.html)
BlogModule.loadBlogPosts();
BlogModule.initializeFilters();

// Load article (for blog-article.html)
BlogModule.loadArticle();
```

## 🐛 Debugging Tips

### Problem: Components not showing
**Solution**: Check if placeholder divs have correct IDs:
- `header-top-placeholder`
- `navigation-placeholder`
- `footer-placeholder`
- `mobile-nav-placeholder`

### Problem: Styles not applying
**Solution**: Check:
1. CSS file paths are correct
2. `common.css` is loaded before page-specific CSS
3. Browser cache (hard refresh: Ctrl+Shift+R)

### Problem: JavaScript errors
**Solution**: Check:
1. Scripts are loaded in correct order (components.js first, then common.js)
2. Check browser console (F12) for error messages
3. Ensure all referenced element IDs exist in HTML

## 📦 Dependencies

### External Libraries
- **Font Awesome 6.0.0**: Icons
- **PapaParse 5.4.1**: CSV parsing for blog (only on blog pages)

Both are loaded from CDN, no installation needed.

## 🚢 Deployment

### For GitHub Pages:
1. Upload all files maintaining the folder structure
2. Set the repository to serve from main branch
3. Your site will be at `https://username.github.io/repository-name/`

### For Traditional Web Hosting:
1. Upload all files via FTP maintaining the folder structure
2. Ensure the homepage is named `index.html` or `homepage.html`
3. Configure your server to serve static files

## 📞 Support

For questions or issues:
- Check this README first
- Look at code comments in the files
- Console.log() is your friend for debugging!

## 🎓 Learning Resources

- **HTML/CSS**: [MDN Web Docs](https://developer.mozilla.org/)
- **JavaScript**: [JavaScript.info](https://javascript.info/)
- **CSS Grid**: [CSS Tricks Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**Happy Coding! 🚀**
