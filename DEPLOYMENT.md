# Deployment Guide

## 📦 Files to Deploy

Make sure you have ALL these files and folders before deploying:

```
refactored-site/
├── css/
│   ├── common.css
│   ├── homepage.css
│   ├── contact.css
│   ├── blog.css
│   ├── blog-article.css
│   └── project-catalogue.css
├── js/
│   ├── common.js
│   ├── components.js
│   └── blog.js
├── homepage.html
├── contact-us.html
├── project-catalogue.html
├── blog.html
├── blog-article.html
├── README.md
└── DEPLOYMENT.md (this file)
```

## 🚀 Quick Deployment Steps

### Option 1: GitHub Pages (Recommended for Beginners)

1. **Create a GitHub account** at https://github.com if you don't have one

2. **Create a new repository**:
   - Click the "+" icon in the top right
   - Select "New repository"
   - Name it: `ipfo-website` (or any name you like)
   - Make it Public
   - Click "Create repository"

3. **Upload your files**:
   - Click "uploading an existing file"
   - Drag and drop ALL folders and files
   - Scroll down and click "Commit changes"

4. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Under "Source", select "main" branch
   - Click "Save"
   - Wait 2-3 minutes

5. **Your site is live!**
   - URL will be: `https://yourusername.github.io/ipfo-website/homepage.html`
   - Share this link with others

### Option 2: Traditional Web Hosting (cPanel, FTP)

1. **Get hosting credentials**:
   - Login URL
   - Username
   - Password

2. **Using FileZilla (Free FTP Client)**:
   - Download FileZilla from https://filezilla-project.org/
   - Install and open it
   - Enter your hosting details:
     - Host: your-domain.com or ftp.your-domain.com
     - Username: (from your host)
     - Password: (from your host)
     - Port: 21
   - Click "Quickconnect"

3. **Upload files**:
   - On the left (local): Navigate to your `refactored-site` folder
   - On the right (remote): Navigate to `public_html` or `www` folder
   - Select ALL files and folders from left side
   - Right-click → Upload
   - Wait for upload to complete

4. **Set homepage**:
   - Rename `homepage.html` to `index.html` (if required by your host)
   - OR configure your hosting to use `homepage.html` as default

5. **Your site is live!**
   - Visit: `https://your-domain.com`

### Option 3: Netlify (Drag & Drop Deployment)

1. **Create account** at https://netlify.com

2. **Deploy**:
   - Click "Add new site" → "Deploy manually"
   - Drag your entire `refactored-site` folder into the box
   - Wait 30 seconds

3. **Your site is live!**
   - Netlify gives you a URL like: `random-name-123.netlify.app`
   - You can customize this name in settings

## ✅ Post-Deployment Checklist

After deploying, check these items:

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Images display properly
- [ ] Contact form submits successfully
- [ ] Blog page loads articles
- [ ] Mobile navigation works on phone
- [ ] Footer appears on all pages

## 🔧 Troubleshooting

### Problem: Pages show "404 Not Found"
**Solution**: Check that file names match exactly (case-sensitive):
- `homepage.html` (not `Homepage.html`)
- `css/common.css` (not `CSS/Common.css`)

### Problem: Styles not loading
**Solution**: 
1. Check file paths in HTML are correct
2. Clear browser cache (Ctrl+Shift+R)
3. Ensure `css` folder is uploaded

### Problem: JavaScript not working
**Solution**:
1. Check browser console for errors (F12)
2. Ensure `js` folder is uploaded
3. Check script loading order in HTML

### Problem: Images not showing
**Solution**:
1. Check image URLs in code
2. Ensure external images are accessible
3. Test image URLs in browser

## 📱 Testing Your Site

### Before Going Live:
1. **Test on multiple browsers**:
   - Chrome
   - Firefox
   - Safari
   - Edge

2. **Test on mobile**:
   - Use browser's mobile view (F12 → Toggle device toolbar)
   - Test on actual mobile device
   - Check mobile navigation

3. **Test all forms**:
   - Submit contact form
   - Subscribe to newsletter
   - Check you receive emails

4. **Test all links**:
   - Click every navigation link
   - Click footer links
   - Check external links open in new tab

## 🔐 Security Checklist

- [ ] Remove any test data or credentials
- [ ] Verify the Apps Script URL and Turnstile site key in `js/config.js` (Turnstile secret only in Script Properties)
- [ ] Check Google Sheets URL is correct
- [ ] Don't commit sensitive data to GitHub

## 🎯 Performance Tips

1. **Optimize images**:
   - Compress images before uploading
   - Use tools like TinyPNG.com
   - Keep images under 200KB when possible

2. **Enable caching** (if using traditional hosting):
   - Add `.htaccess` file with caching rules
   - Consult your hosting documentation

3. **Use a CDN**:
   - External libraries (Font Awesome, PapaParse) already use CDN
   - Consider Cloudflare for additional performance

## 📊 Analytics Setup (Optional)

### Google Analytics:
1. Create account at analytics.google.com
2. Get tracking ID
3. Add to each HTML page before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🆘 Getting Help

If you're stuck:
1. Check the README.md file
2. Look at browser console (F12) for errors
3. Google the specific error message
4. Check Stack Overflow
5. Ask in web development forums

## 🎉 Congratulations!

Your IPFO website is now live! Remember to:
- Update content regularly
- Keep backups of your files
- Monitor form submissions
- Check site performance monthly

---

**Pro Tip**: Keep a local copy of all files on your computer as backup!
