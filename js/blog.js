/**
 * Blog Module
 * Handles blog listing and article display functionality
 */

const BlogModule = (function () {
    // Configuration
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjaqBX7gq1Mg0lxaLyw5rO2Bo1jbaxMveEopOadoSUxHFIlJii__6pMTaWTnDkUDeLoTivvmP_dE31/pub?gid=0&single=true&output=csv';
    const CACHE_KEY = 'ipfo_blog_posts';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    let allPosts = [];
    let currentFilter = 'all';

    // ==========================================================================
    // Caching Functions
    // ==========================================================================

    function getCachedData() {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const isExpired = Date.now() - timestamp > CACHE_DURATION;

            return isExpired ? null : data;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }

    function setCacheData(data) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }

    // ==========================================================================
    // CSV Parsing
    // ==========================================================================

    function parseCSV(csv) {
        const parsed = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            trimHeaders: true,
            dynamicTyping: false
        });

        if (parsed.errors.length > 0) {
            console.error('CSV parsing errors:', parsed.errors);
        }

        const posts = parsed.data.map(row => ({
            id: row.ID?.trim() || '',
            title: row.Title?.trim() || '',
            excerpt: row.Excerpt?.trim() || '',
            content: row.Content?.trim() || '',
            category: row.Category?.trim() || 'General',
            author: row.Author?.trim() || 'IPFO Team',
            date: row.Date?.trim() || new Date().toISOString().split('T')[0],
            image: row.Image?.trim() || 'https://placehold.co/400x250/1e40af/ffffff?text=IPFO',
            link: `blog-article.html?id=${row.ID?.trim()}`
        })).filter(post => post.id);

        return posts;
    }

    // ==========================================================================
    // Blog Listing Functions
    // ==========================================================================

    async function loadBlogPosts() {
        const loadingState = document.getElementById('loadingState');
        const blogGrid = document.getElementById('blogGrid');
        const emptyState = document.getElementById('emptyState');

        // Try to load from cache first
        const cached = getCachedData();
        if (cached) {
            console.log('Loading blog posts from cache');
            allPosts = cached;
            displayPosts(allPosts);

            if (loadingState) loadingState.style.display = 'none';
            if (blogGrid) blogGrid.style.display = 'grid';
            return;
        }

        // Fetch from API if no cache
        try {
            console.log('Fetching blog posts from API');
            const response = await fetch(SHEET_URL);
            const csvText = await response.text();
            allPosts = parseCSV(csvText);

            // Cache the data
            setCacheData(allPosts);

            displayPosts(allPosts);

            if (loadingState) loadingState.style.display = 'none';
            if (blogGrid) blogGrid.style.display = 'grid';
        } catch (error) {
            console.error('Error loading posts:', error);
            if (loadingState) loadingState.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }
    }

    function displayPosts(posts) {
        const grid = document.getElementById('blogGrid');
        const emptyState = document.getElementById('emptyState');

        if (!grid) return;

        grid.innerHTML = '';

        if (posts.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        posts.forEach(post => {
            const card = createBlogCard(post);
            grid.appendChild(card);
        });

        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
    }

    function createBlogCard(post) {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.onclick = () => window.location.href = post.link;

        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        card.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="blog-image" 
                 onerror="this.src='https://placehold.co/400x250/1e40af/ffffff?text=IPFO'">
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-date">
                        <i class="far fa-calendar"></i> ${formattedDate}
                    </span>
                    <span class="blog-category">${post.category}</span>
                </div>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <a href="${post.link}" class="read-more">
                    Read More <i class="fas fa-arrow-right"></i>
                </a>
                <div class="blog-author">
                    <i class="fas fa-user"></i> ${post.author}
                </div>
            </div>
        `;

        return card;
    }

    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter posts
                const category = btn.dataset.category;
                currentFilter = category;

                const filtered = category === 'all'
                    ? allPosts
                    : allPosts.filter(post => post.category === category);

                displayPosts(filtered);
            });
        });
    }

    // ==========================================================================
    // Article Display Functions
    // ==========================================================================

    async function loadArticle() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        if (!articleId) {
            showError();
            return;
        }

        const loadingState = document.getElementById('loadingState');
        const articleContainer = document.getElementById('articleContainer');
        const errorState = document.getElementById('errorState');

        try {
            const response = await fetch(SHEET_URL);
            const csvText = await response.text();
            allPosts = parseCSV(csvText);

            const article = allPosts.find(a => a.id === articleId);

            if (!article) {
                console.error('Article not found with ID:', articleId);
                showError();
                return;
            }

            displayArticle(article);
            loadRelatedPosts(article.category, article.id);

            if (loadingState) loadingState.style.display = 'none';
            if (articleContainer) articleContainer.style.display = 'block';
        } catch (error) {
            console.error('Error loading article:', error);
            showError();
        }
    }

    function displayArticle(article) {
        document.title = `${article.title} - IPFO`;

        const elements = {
            category: document.getElementById('articleCategory'),
            title: document.getElementById('articleTitle'),
            date: document.getElementById('articleDate'),
            author: document.getElementById('articleAuthor'),
            image: document.getElementById('articleImage'),
            content: document.getElementById('articleContent'),
            readTime: document.getElementById('readTime')
        };

        if (elements.category) elements.category.textContent = article.category;
        if (elements.title) elements.title.textContent = article.title;
        if (elements.date) elements.date.textContent = formatDate(article.date);
        if (elements.author) elements.author.textContent = article.author;

        if (elements.image) {
            elements.image.src = article.image;
            elements.image.alt = article.title;
        }

        if (elements.content) elements.content.innerHTML = article.content;

        // Calculate read time
        if (elements.readTime) {
            const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
            const readTime = Math.ceil(wordCount / 200);
            elements.readTime.textContent = `${readTime} min read`;
        }

        setupShareButtons(article.title);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function setupShareButtons(title) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(title);

        const buttons = {
            twitter: document.getElementById('shareTwitter'),
            linkedin: document.getElementById('shareLinkedIn'),
            facebook: document.getElementById('shareFacebook'),
            email: document.getElementById('shareEmail')
        };

        if (buttons.twitter) {
            buttons.twitter.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        }
        if (buttons.linkedin) {
            buttons.linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        }
        if (buttons.facebook) {
            buttons.facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        }
        if (buttons.email) {
            buttons.email.href = `mailto:?subject=${text}&body=Check out this article: ${url}`;
        }
    }

    function loadRelatedPosts(category, currentId) {
        const related = allPosts
            .filter(a => a.id !== currentId && a.category === category)
            .slice(0, 3);

        const grid = document.getElementById('relatedPosts');
        if (!grid) return;

        grid.innerHTML = '';

        related.forEach(post => {
            const card = document.createElement('div');
            card.className = 'related-card';
            card.onclick = () => window.location.href = `blog-article.html?id=${post.id}`;

            card.innerHTML = `
                <img src="${post.image}" alt="${post.title}" 
                     onerror="this.src='https://placehold.co/400x250/1e40af/ffffff?text=IPFO'">
                <div class="related-card-content">
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    function showError() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');

        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'flex';
    }

    // ==========================================================================
    // Public API
    // ==========================================================================

    return {
        loadBlogPosts,
        loadArticle,
        initializeFilters
    };
})();

// Export to global scope
window.BlogModule = BlogModule;