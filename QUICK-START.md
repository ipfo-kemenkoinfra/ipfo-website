# 🚀 Quick Start Guide - IPFO Website

## ⚡ 5-Minute Quick Start

### Step 1: Open Your Files (30 seconds)
```
📁 Open the refactored-site folder
   Look at the clean structure - beautiful, right?
```

### Step 2: View in Browser (1 minute)
```
🌐 Double-click homepage.html
   → Opens in your default browser
   → Everything should work perfectly!
```

### Step 3: Make Your First Change (3 minutes)
```
✏️ Open css/common.css in any text editor
   Find line 5: --primary-blue: #1e40af;
   Change to: --primary-blue: #ff0000;
   Save and refresh browser
   🎉 Website is now red!
```

---

## 📝 Common Tasks Cheat Sheet

### Task: Change Website Colors
```css
📄 File: css/common.css
📍 Lines: 5-12 (CSS variables)

--primary-blue: #1e40af;    ← Main color
--yellow-accent: #fbbf24;   ← Accent color
```

### Task: Update Contact Email
```javascript
📄 File: js/components.js
📍 Function: createHeaderTop() and createFooter()

Change: sekretariat@ipfo.kemenkoinfra.go.id
To: your-email@example.com
```

### Task: Add Navigation Link
```javascript
📄 File: js/components.js
📍 Line: ~45 (menuItems array)

Add:
{ href: 'new-page.html', label: 'New Page', icon: 'star' }
```

### Task: Modify Footer
```javascript
📄 File: js/components.js
📍 Function: createFooter()

Edit the HTML inside the return statement
```

### Task: Create New Page
```html
📄 Create: new-page.html

Copy homepage.html
Change content between <section> tags
Update: IPFOComponents.insertComponents('new-page.html')
```

---

## 🎨 File Quick Reference

### 🎯 Need to Change...

| What | File | Location |
|------|------|----------|
| Colors | `css/common.css` | Lines 5-12 |
| Header/Footer | `js/components.js` | Functions at top |
| Navigation Menu | `js/components.js` | menuItems array |
| Contact Email | `js/components.js` | Multiple places |
| Homepage Hero | `homepage.html` | Line ~30 |
| Homepage Styles | `css/homepage.css` | Anywhere |
| Contact Form | `contact-us.html` | Line ~50 |
| Blog Settings | `js/blog.js` | Line 10 (SHEET_URL) |

---

## 🔧 Troubleshooting Quick Fixes

### Problem: Nothing shows up
```
✅ Check: Are placeholder divs in HTML?
   <div id="header-top-placeholder"></div>
   <div id="navigation-placeholder"></div>
   <div id="footer-placeholder"></div>

✅ Check: Are scripts loaded?
   <script src="js/components.js"></script>
   <script src="js/common.js"></script>

✅ Check: Is insertComponents() called?
   IPFOComponents.insertComponents('page.html')
```

### Problem: Styles look wrong
```
✅ Check: Is common.css loaded FIRST?
   <link rel="stylesheet" href="css/common.css">

✅ Clear browser cache
   Press: Ctrl + Shift + R (or Cmd + Shift + R on Mac)
```

### Problem: JavaScript not working
```
✅ Open browser console
   Press F12 → Console tab
   Look for red error messages

✅ Check script order
   components.js MUST load before common.js
```

---

## 📚 Learning Path (30 Days)

### Week 1: Exploration
- [ ] Open every HTML file
- [ ] Read the code comments
- [ ] Change one color
- [ ] Update some text

### Week 2: Customization
- [ ] Change all colors
- [ ] Update contact info
- [ ] Modify footer content
- [ ] Add social media links

### Week 3: Creation
- [ ] Create a new page
- [ ] Add it to navigation
- [ ] Style your new page
- [ ] Test on mobile

### Week 4: Advanced
- [ ] Modify JavaScript
- [ ] Create custom component
- [ ] Add new feature
- [ ] Deploy your site!

---

## 💻 Essential Commands

### Open Files
```bash
# Windows
start homepage.html

# Mac
open homepage.html

# Linux
xdg-open homepage.html
```

### Edit Files
```
Any text editor works:
• Notepad (Windows)
• TextEdit (Mac)
• VS Code (recommended!)
• Sublime Text
• Atom
```

### Test Changes
```
1. Save file
2. Go to browser
3. Press Ctrl+Shift+R (hard refresh)
4. See your changes!
```

---

## 🎯 Key Files Explained

```
📁 refactored-site/
├── 📄 homepage.html          ← START HERE (main page)
├── 📄 README.md              ← READ THIS (full documentation)
├── 📄 DEPLOYMENT.md          ← HOW TO DEPLOY online
│
├── 📁 css/
│   ├── 📄 common.css         ← CHANGE COLORS HERE
│   └── 📄 homepage.css       ← Homepage-specific styles
│
└── 📁 js/
    ├── 📄 components.js      ← EDIT HEADER/FOOTER HERE
    ├── 📄 common.js          ← Shared functions (usually don't touch)
    └── 📄 blog.js            ← Blog functions (usually don't touch)
```

---

## 🎨 CSS Variables Reference

```css
/* In css/common.css */

:root {
  --primary-blue: #1e40af;     /* Buttons, links, highlights */
  --dark-blue: #1e3a8a;        /* Navbar, headers */
  --light-blue: #3b82f6;       /* Hover states */
  --yellow-accent: #fbbf24;    /* Active links, CTAs */
  --white: #ffffff;            /* Backgrounds */
  --gray-light: #f5f5f5;       /* Alternate backgrounds */
  --gray-medium: #6b7280;      /* Secondary text */
  --text-dark: #1f2937;        /* Main text */
}
```

---

## 🌐 Before Going Live

### Pre-Launch Checklist
- [ ] Update all contact information
- [ ] Test every page in browser
- [ ] Test on mobile (browser dev tools)
- [ ] Check all links work
- [ ] Submit contact form (test it!)
- [ ] Replace placeholder images (if any)
- [ ] Update Google Sheets URL for blog
- [ ] Set the Apps Script URL and Turnstile site key in `js/config.js` (see `apps-script/README.md`)

---

## 📞 Getting Help

### In Order of Speed:
1. **Browser Console** (F12) - See errors instantly
2. **README.md** - Complete documentation
3. **Google** - Copy error message, search it
4. **Stack Overflow** - Ask the community
5. **Web Dev Discord** - Real-time help

### Useful Search Terms:
- "HTML [your issue]"
- "CSS [your issue]"
- "JavaScript [your issue]"
- "How to [what you want to do]"

---

## 🎉 You're Ready!

### Remember:
✅ Start small - one change at a time
✅ Test after each change
✅ Save frequently
✅ Keep backups
✅ Have fun! 🚀

### Your First Goal:
Change one color and see it work. That's it!
Once you do that, everything else becomes easier.

---

## 💡 Pro Tips

1. **Use VS Code** - Free, powerful, easy to learn
2. **Learn by doing** - Make changes and see what happens
3. **Break things** - That's how you learn (just keep backups!)
4. **Use browser DevTools** - F12 is your best friend
5. **Comment your changes** - Future you will thank you

---

**Happy coding! You've got this! 💪**
