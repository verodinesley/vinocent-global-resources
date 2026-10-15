// Vinocent - Recommendation & Search Script (client-side, lightweight)
// Replaces previous recommendation engine with a DOM-driven product fetcher, search, filters, and pagination

let VINOCENT_PRODUCTS = [];
let currentPage = 1;
const itemsPerPage = 12;
let activeCategory = 'all';
let currentProductsList = [];
let searchQuery = '';

// Fetch products from Blogger Posts Feed on Page Load
document.addEventListener('DOMContentLoaded', () => {
    fetchBloggerProducts();

    // Hook up search input if present (debounced)
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchQuery = (e.target.value || '').trim().toLowerCase();
            currentPage = 1;
            applyFilters();
        }, 250));
    }

    // Keyboard support for left/right page navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToPage(Math.max(1, currentPage - 1));
        if (e.key === 'ArrowRight') goToPage(currentPage + 1);
    });
});

function fetchBloggerProducts() {
    const blogUrl = window.location.protocol + '//' + window.location.hostname + '/feeds/posts/default?alt=json&max-results=500';

    fetch(blogUrl)
        .then(response => response.json())
        .then(data => {
            const entries = data.feed.entry || [];
            
            VINOCENT_PRODUCTS = entries.map((entry, index) => {
                const categories = entry.category ? entry.category.map(cat => (cat.term || '').toLowerCase().trim()) : ['uncategorized'];
                
                const title = (entry.title && entry.title.$t) ? entry.title.$t : `Product ${index + 1}`;
                const contentHtml = entry.content ? entry.content.$t : '';

                // Simple parser from post body content
                const priceMatch = contentHtml.match(/Price:\s*([0-9,]+)/i);
                const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 10000;

                const iconMatch = contentHtml.match(/Icon:\s*([a-zA-Z0-9-]+)/i);
                const icon = iconMatch ? iconMatch[1] : 'fa-seedling';

                // Strip HTML tags for clean description
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = contentHtml;
                let description = tempDiv.textContent || tempDiv.innerText || '';
                description = description.replace(/Price:.*?(\r?\n|$)/i, '').replace(/Icon:.*?(\r?\n|$)/i, '').trim();

                // Precompute searchable tokens for efficiency
                const normalizedName = (title || '').toLowerCase();
                const normalizedDesc = (description || '').toLowerCase();
                const tokens = tokenize(`${normalizedName} ${normalizedDesc}`);

                return {
                    id: `blog-prod-${index}`,
                    name: title,
                    categories: categories.length ? categories : ['uncategorized'],
                    price: price,
                    icon: icon,
                    description: description || 'High-quality agro-chemical input from Vinocent.',
                    _name: normalizedName,
                    _desc: normalizedDesc,
                    _tokens: tokens
                };
            });

            // initialize current list and UI
            currentProductsList = [...VINOCENT_PRODUCTS];
            generateCategoryFilters();
            renderCatalogue();
        })
        .catch(error => {
            console.error('Error fetching Blogger feed:', error);
            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">Unable to load products from Blogger feed. Please check your connection.</div>';
            }
        });
}

// Tokenize helper (basic word split)
function tokenize(text) {
    if (!text) return new Set();
    return new Set(
        text
            .toLowerCase()
            .split(/[\W_]+/)
            .filter(Boolean)
    );
}

// Build dynamic category buttons (assumes an element with id 'categoryFilters' exists)
function generateCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    const allCats = new Set();
    VINOCENT_PRODUCTS.forEach(p => {
        (p.categories || []).forEach(c => {
            if (c) allCats.add(c);
        });
    });

    const cats = ['all', ...Array.from(allCats).sort()];
    container.innerHTML = cats.map(cat => {
        const activeClass = (cat === activeCategory) ? 'agro-gradient-bg text-navy-950' : 'bg-navy-900 text-slate-300 border border-slate-800 hover:border-emerald-500';
        return `<button onclick="filterByCategory('${cat}')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all ${activeClass}">${cat.toUpperCase()}</button>`;
    }).join(' ');
}

// Apply category + search filtering
function applyFilters() {
    const cat = activeCategory;
    const query = searchQuery;

    // Start from all products
    let filtered = [...VINOCENT_PRODUCTS];

    if (cat && cat !== 'all') {
        filtered = filtered.filter(p => (p.categories || []).includes(cat));
    }

    if (query) {
        filtered = filtered.filter(p => {
            // match name or description tokens or simple substring in precomputed strings
            if ((p._name && p._name.includes(query)) || (p._desc && p._desc.includes(query))) return true;
            // token intersection (fuzzy)
            const qtokens = Array.from(tokenize(query));
            for (const t of qtokens) {
                if (p._tokens.has(t)) return true;
            }
            return false;
        });
    }

    currentProductsList = filtered;
    currentPage = 1;
    renderCatalogue();
}

// Render Catalogue with Pagination
function renderCatalogue() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = currentProductsList.slice(startIndex, startIndex + itemsPerPage);

    if (paginatedItems.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">No agro-chemical products found in this category.</div>';
        renderPaginationControls(0);
        return;
    }

    paginatedItems.forEach(product => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-5 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/50 transition-all';
        card.innerHTML = `
            <div>
                <div class='h-40 rounded-lg bg-navy-950/80 mb-4 flex items-center justify-center text-emerald-400 text-4xl border border-slate-800'>
                    <i class='fa-solid ${product.icon}'></i>
                </div>
                <div class='flex flex-wrap gap-1 mb-2'>
                    ${product.categories.map(cat => `<span class='text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded'>${cat}</span>`).join('')}
                </div>
                <h4 class='text-lg font-bold text-white mt-1 cursor-pointer hover:text-emerald-400 transition-colors' onclick='sortRecommendations("${product.id}")' tabindex="0">${product.name}</h4>
                <p class='text-xs text-slate-400 mt-1 line-clamp-2'>${product.description}</p>
            </div>
            <div class='mt-6 pt-4 border-t border-slate-800 flex items-center justify-between'>
                <span class='text-emerald-400 font-extrabold text-base'>₦${product.price.toLocaleString()}</span>
                <div class="flex items-center gap-2">
                    <button onclick='initiatePayment("${escapeQuotesForTemplate(product.name)}", ${product.price})' class='agro-gradient-bg text-navy-950 font-bold px-3 py-1.5 rounded text-xs hover:brightness-110'>
                        Buy Now
                    </button>
                    <button onclick='sortRecommendations("${product.id}")' class='text-xs px-2 py-1 rounded border border-slate-800 hover:border-emerald-500'>Recommend</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    renderPaginationControls(Math.ceil(currentProductsList.length / itemsPerPage));
}

// Cross-Category Filter Handler
function filterByCategory(category) {
    activeCategory = category;
    currentPage = 1;
    applyFilters();
}

// Improved Recommendation Engine: category overlap + token overlap (deterministic)
function sortRecommendations(clickedId) {
    const clicked = VINOCENT_PRODUCTS.find(p => p.id === clickedId);
    if (!clicked) return;

    // Precompute clicked tokens & category set
    const clickedCatSet = new Set(clicked.categories || []);
    const clickedTokens = clicked._tokens || new Set();

    // Score each product once
    const scored = currentProductsList.map(p => {
        if (p.id === clickedId) {
            return { p, score: -Infinity }; // ensure clicked item ranks out or stays top depending on intent
        }
        // Category overlap count
        const categoryOverlap = (p.categories || []).reduce((acc, c) => acc + (clickedCatSet.has(c) ? 1 : 0), 0);

        // Token overlap
        let tokenOverlap = 0;
        for (const t of clickedTokens) {
            if (p._tokens && p._tokens.has(t)) tokenOverlap++;
        }

        // Weighted score (tweak weights if you want)
        const score = (categoryOverlap * 100) + (tokenOverlap * 10);

        return { p, score };
    });

    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // deterministic tiebreaker: product name
        return String(a.p.name).localeCompare(String(b.p.name));
    });

    // Rebuild currentProductsList while preserving any active search/category filter
    currentProductsList = scored.map(s => s.p).filter(Boolean);

    currentPage = 1;
    renderCatalogue();

    const catalogueRoot = document.getElementById('catalogue');
    if (catalogueRoot) catalogueRoot.scrollIntoView({ behavior: 'smooth' });
}

// Pagination Controls Renderer
function renderPaginationControls(totalPages) {
    let paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationContainer';
        paginationContainer.className = 'flex justify-center items-center gap-2 mt-10';
        const catSection = document.getElementById('catalogue');
        if (catSection) {
            const inner = catSection.querySelector('.max-w-7xl') || catSection;
            inner.appendChild(paginationContainer);
        }
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all ${currentPage === i ? 'agro-gradient-bg text-navy-950' : 'bg-navy-900 text-slate-300 border border-slate-800 hover:border-emerald-500'}">${i}</button>`;
    }
    paginationContainer.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderCatalogue();
    const catalogueRoot = document.getElementById('catalogue');
    if (catalogueRoot) catalogueRoot.scrollIntoView({ behavior: 'smooth' });
}

// Simple payment / contact fallback for static sites
function initiatePayment(productName, price) {
    // Try integrating your real payment flow here. For static fallback, open email prefilled.
    const subject = encodeURIComponent(`Order: ${productName}`);
    const body = encodeURIComponent(`I would like to order "${productName}" priced at ₦${price.toLocaleString()}.\n\nPlease tell me how to proceed with payment and delivery.\n\nThanks.`);
    // Replace sales@example.com with your actual contact address
    window.location.href = `mailto:sales@example.com?subject=${subject}&body=${body}`;
}

// Utility: debounce
function debounce(fn, wait = 200) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

// Utility: escape quotes for inline onclick usage (safe for templates)
function escapeQuotesForTemplate(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
