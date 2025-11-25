/**
 * Simplified Blog Module
 * Core functionality: Search, Filters, View Toggle, Pagination, Caching
 */

const BlogModule = (function () {
    // Configuration
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjaqBX7gq1Mg0lxaLyw5rO2Bo1jbaxMveEopOadoSUxHFIlJii__6pMTaWTnDkUDeLoTivvmP_dE31/pub?gid=0&single=true&output=csv';
    const CACHE_KEY = 'ipfo_blog_posts';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const POSTS_PER_PAGE = 9;

    let allPosts = [];
    let displayedPosts = [];
    let currentFilter = 'all';
    let currentPage = 1;
    let searchQuery = '';

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

        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        return posts;
    }

    // ==========================================================================
    // Blog Loading Functions
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
            initializeBlog();
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

            initializeBlog();
        } catch (error) {
            console.error('Error loading posts:', error);
            if (loadingState) loadingState.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }
    }

    function initializeBlog() {
        const loadingState = document.getElementById('loadingState');
        const blogGrid = document.getElementById('blogGrid');

        if (allPosts.length === 0) {
            if (loadingState) loadingState.style.display = 'none';
            if (document.getElementById('emptyState')) {
                document.getElementById('emptyState').style.display = 'block';
            }
            return;
        }

        // Update filter counts
        updateFilterCounts();

        // Display initial posts
        applyFilters();

        // Initialize interactive features
        initSearch();
        initFilters();
        initViewToggle();
        initLoadMore();

        // Hide loading, show content
        if (loadingState) loadingState.style.display = 'none';
        if (blogGrid) blogGrid.style.display = 'grid';
    }

    // ==========================================================================
    // Post Display Functions
    // ==========================================================================

    function displayPosts(posts, append = false) {
        const grid = document.getElementById('blogGrid');
        const emptyState = document.getElementById('emptyState');
        const loadMoreContainer = document.getElementById('loadMoreContainer');

        if (!grid) return;

        if (!append) {
            grid.innerHTML = '';
            currentPage = 1;
        }

        // Calculate which posts to show
        const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
        const endIndex = startIndex + POSTS_PER_PAGE;
        const postsToShow = posts.slice(startIndex, endIndex);

        if (posts.length === 0 && !append) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        postsToShow.forEach(post => {
            const card = createBlogCard(post);
            grid.appendChild(card);
        });

        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        // Show/hide load more button
        if (loadMoreContainer) {
            if (endIndex >= posts.length) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
                updateShowingCount(endIndex, posts.length);
            }
        }

        displayedPosts = posts;
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
                <a href="${post.link}" class="read-more" onclick="event.stopPropagation()">
                    Read More <i class="fas fa-arrow-right"></i>
                </a>
                <div class="blog-author">
                    <i class="fas fa-user"></i> ${post.author}
                </div>
            </div>
        `;

        return card;
    }

    // ==========================================================================
    // Filter & Search Functions
    // ==========================================================================

    function applyFilters() {
        let filtered = allPosts;

        // Apply category filter
        if (currentFilter !== 'all') {
            filtered = filtered.filter(post => post.category === currentFilter);
        }

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchQuery) ||
                post.excerpt.toLowerCase().includes(searchQuery) ||
                post.category.toLowerCase().includes(searchQuery) ||
                post.author.toLowerCase().includes(searchQuery)
            );
        }

        displayPosts(filtered, false);
    }

    function initFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update filter
                currentFilter = btn.dataset.category;
                applyFilters();
            });
        });
    }

    function updateFilterCounts() {
        const categories = ['all', 'Infrastructure', 'Investment', 'Policy', 'News'];

        categories.forEach(cat => {
            const count = cat === 'all'
                ? allPosts.length
                : allPosts.filter(p => p.category === cat).length;

            const btn = document.querySelector(`[data-category="${cat}"]`);
            if (btn) {
                const countSpan = btn.querySelector('.count');
                if (countSpan) countSpan.textContent = count;
            }
        });
    }

    // ==========================================================================
    // Search Functionality
    // ==========================================================================

    function initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', debounce(function (e) {
            searchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        }, 300));
    }

    // ==========================================================================
    // View Toggle (Grid/List)
    // ==========================================================================

    function initViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const blogGrid = document.getElementById('blogGrid');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const view = btn.dataset.view;
                if (blogGrid) {
                    blogGrid.className = view === 'list' ? 'blog-list' : 'blog-grid';
                }
            });
        });
    }

    // ==========================================================================
    // Load More Functionality
    // ==========================================================================

    function initLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        loadMoreBtn.addEventListener('click', () => {
            currentPage++; // Increment page first

            const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
            const endIndex = startIndex + POSTS_PER_PAGE;
            const morePosts = displayedPosts.slice(startIndex, endIndex);

            // Append new posts to grid
            const grid = document.getElementById('blogGrid');
            morePosts.forEach(post => {
                const card = createBlogCard(post);
                grid.appendChild(card);
            });

            // Update count and hide button if no more posts
            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (endIndex >= displayedPosts.length) {
                if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            } else {
                updateShowingCount(endIndex, displayedPosts.length);
            }
        });
    }

    function updateShowingCount(shown, total) {
        const countElement = document.getElementById('showingCount');
        if (countElement) {
            countElement.textContent = `Showing ${shown} of ${total} articles`;
        }
    }

    // ==========================================================================
    // Article Display Functions (for blog-article.html)
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
        if (elements.date) {
            const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            elements.date.textContent = formattedDate;
        }
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

    function formatDate(dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
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

    // ==========================================================================
    // Utility Functions
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
        initializeFilters: initFilters
    };
})();

// Export to global scope
window.BlogModule = BlogModule;