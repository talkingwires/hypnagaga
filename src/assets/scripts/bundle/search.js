document.addEventListener("DOMContentLoaded", () => {
    let pagefind;
    let selectedFilters = {};

    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    const resultsContainer = document.getElementById("search-results");
    const summaryContainer = document.getElementById("search-summary");
    const countContainer = document.getElementById("result-count");
    const termContainer = document.getElementById("search-term");
    const filterContainer = document.getElementById("custom-search-filters");

    if (typeof PAGEFIND_URL === 'undefined') {
        console.error('PAGEFIND_URL is not defined. Please set it in your template.');
        return;
    }

    const initPagefind = async () => {
        if (pagefind) return;
        try {
            pagefind = await import(PAGEFIND_URL);
            pagefind.options({ "excerptLength": 30 });
            await displayFilters();
            
            const searchParams = new URLSearchParams(window.location.search);
            const searchTerm = searchParams.get("term");
            const tags = searchParams.get("tags");

            if (tags) {
                const tagArray = tags.split(',');
                selectedFilters.tag = tagArray;
                tagArray.forEach(tag => {
                    const checkbox = document.querySelector(`input[type="checkbox"][value="${tag}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            if (searchTerm) {
                searchInput.value = searchTerm;
                await performSearch(searchTerm, selectedFilters);
            } else if (tags) {
                await performSearch(null, selectedFilters);
            }

        } catch (e) {
            console.error("Pagefind failed to load or initialize:", e);
        }
    };

    const displayFilters = async () => {
        const availableFilters = await pagefind.filters();
        if (availableFilters.tag) {
            const tags = Object.keys(availableFilters.tag);
            const filterTitle = document.createElement('h3');
            filterTitle.textContent = 'Filter by Tag';
            filterContainer.appendChild(filterTitle);

            const tagGroup = document.createElement('div');
            tagGroup.className = 'filter-group';

            tags.forEach(tag => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = tag;
                checkbox.name = 'tag';
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${tag}`));
                tagGroup.appendChild(label);
            });
            filterContainer.appendChild(tagGroup);
        }
    };

    const getSelectedFilters = () => {
        const selected = {};
        const checkedBoxes = filterContainer.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length > 0) {
            selected.tag = Array.from(checkedBoxes).map(cb => cb.value);
        }
        return selected;
    };

    const performSearch = async (term, filters = {}) => {
        if (!pagefind) return;
        if (!term && Object.keys(filters).length === 0) {
            clearResults();
            return;
        };

        summaryContainer.style.display = 'block';
        termContainer.innerText = term || 'all posts';

        const searchResult = await pagefind.search(term, { filters });
        
        countContainer.innerText = searchResult.results.length;

        if (searchResult.results.length === 0) {
            resultsContainer.innerHTML = "<li>No results found.</li>";
            return;
        }

        const items = await Promise.all(searchResult.results.map(async (result) => {
            const data = await result.data();
            
            // Debug: log available data fields
            console.log('Pagefind data:', data);
            
            let tagsHTML = '';
            if (data.filters && data.filters.tag && data.filters.tag.length > 0) {
                tagsHTML = `
                    <div class="meta">
                        <ul class="cluster">
                            ${data.filters.tag.map(tag => `<li class="button" data-small-button>${tag}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            let imageHTML = '';
            if (data.meta.image) {
                // Try to get alt text from Pagefind metadata, fallback to title, then generic text
                const altText = data.meta['image[alt]'] || data.meta.title || 'Search result image';
                imageHTML = `<picture><img src="${data.meta.image}" alt="${altText}"></picture>`;
            }

            return `
                <li>
                    <custom-card clickable img-square>
                        ${imageHTML}
                        <h3><a href="${data.url}">${data.meta.title}</a></h3>
                        <p>${data.excerpt}</p>
                        ${tagsHTML}
                        <footer><a href="${data.url}">Read more</a></footer>
                    </custom-card>
                </li>
            `;
        }));

        resultsContainer.innerHTML = items.join("");
    };
    
    const clearResults = () => {
        resultsContainer.innerHTML = "";
        summaryContainer.style.display = 'none';
        countContainer.innerText = "0";
        termContainer.innerText = "";
    }

    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const handleSearch = async () => {
        const searchTerm = searchInput.value.trim();
        selectedFilters = getSelectedFilters();
        updateURL(searchTerm, selectedFilters);
        await performSearch(searchTerm, selectedFilters);
    };

    if (searchInput) {
        searchInput.addEventListener("input", debounce(handleSearch, 300));
    }

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleSearch();
        });
    }

    if (filterContainer) {
        filterContainer.addEventListener('change', handleSearch);
    }
    
    const updateURL = (term, filters) => {
        const url = new URL(window.location);
        if (term) {
            url.searchParams.set("term", term);
        } else {
            url.searchParams.delete("term");
        }

        if (filters.tag && filters.tag.length > 0) {
            url.searchParams.set("tags", filters.tag.join(','));
        } else {
            url.searchParams.delete("tags");
        }
        
        window.history.replaceState({}, "", url);
    }

    initPagefind(); 
});