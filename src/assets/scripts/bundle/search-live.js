const RESULTS_PER_PAGE = 10;

const SEARCH_TERM_SELECTOR = "#search-term";
const RESULT_COUNT_SELECTOR = "#result-count";
const SEARCH_RESULTS_SELECTOR = "#search-results";
const SEARCH_FILTER_TAGS_SELECTOR = "#search-filter-tags";

class PageFinder {
    constructor(pagefind) {
        this.pagefind = pagefind;
        this.resultCounter = document.querySelector(RESULT_COUNT_SELECTOR);
        this.searchResultList = document.querySelector(SEARCH_RESULTS_SELECTOR);
        this.filterTagsEl = document.querySelector(SEARCH_FILTER_TAGS_SELECTOR);
        this.searchResults = [];
        this.start = 0;
    }

    async getSearchResults(searchTerm, hashFilters = {}) {
        try {
            const search = await this.pagefind.search(searchTerm, {
                filters: hashFilters,
            });
            this.searchResults = search.results;
            this.resultCounter.innerText = search.results.length;
            const filters = this.getFiltersFromResults(await Promise.all(this.searchResults.map((r) => r.data())));
            this.start = 0;
            await this.goToPage(0);
            return {
                results: search.results,
                filters,
            };
        } catch (error) {
            console.error("Error during Pagefind search:", error);
            return { results: [], filters: {} };
        }
    }

    async goToPage(pageIndex) {
        this.start = pageIndex * RESULTS_PER_PAGE;
        const paginatedResults = await Promise.all(this.searchResults.slice(this.start, this.start + RESULTS_PER_PAGE).map((r) => r.data()));
        await this.populateSearchResults(paginatedResults, true);
        const totalPages = Math.ceil(this.searchResults.length / RESULTS_PER_PAGE);
        this.renderPagination(pageIndex, totalPages);
        requestAnimationFrame(() => {
            document.documentElement.scrollIntoView({ behavior: "smooth" });
        });
    }

    async populateSearchResults(paginatedResults, clear = false) {
        if (clear) {
            this.searchResultList.innerHTML = "";
        }
        paginatedResults.forEach((result) => {
            const card = document.createElement("div");
            card.innerHTML = this._getCardHtml(result.meta.title, result.excerpt, result.url, Object.values(result.filters).flat());
            this.searchResultList.appendChild(card);
        });
    }

    populateFilters(filters, initHashFilters) {
        this.filterTagsEl.innerHTML = "";
        this.filterTagsEl.className = "fr-mb-5v";
        const specialGuideTags = ["Utilisateur", "Développeur", "Producteur"];
        Object.entries(filters).forEach(([filterType, subFilter]) => {
            const tagEntries = Object.entries(subFilter);
            const specialTags = tagEntries.filter(([tag]) => specialGuideTags.includes(tag));
            const otherTags = tagEntries.filter(([tag]) => !specialGuideTags.includes(tag));
            const sortTags = (a, b) => {
                const countDiff = b[1] - a[1];
                if (countDiff !== 0) return countDiff;
                return a[0].localeCompare(b[0], "fr", { sensitivity: "base" });
            };
            if (specialTags.length > 0) {
                specialTags.sort(sortTags);
                this.renderFilterBlock(filterType, specialTags, initHashFilters, "Guides :");
            }
            if (otherTags.length > 0) {
                otherTags.sort(sortTags);
                const title = `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} :`;
                this.renderFilterBlock(filterType, otherTags, initHashFilters, title);
            }
        });
    }

    renderFilterBlock(filterType, tagEntries, initHashFilters, title) {
        const div = document.createElement("div");
        div.className = "fr-grid-row fr-grid-row--middle fr-mb-2v";
        const divTitle = document.createElement("div");
        divTitle.className = "fr-col-12 fr-mb-2v";
        divTitle.textContent = title;
        const divTags = document.createElement("div");
        divTags.className = "fr-col-12 fr-col-lg-8";
        const ulTags = document.createElement("ul");
        ulTags.className = "fr-tags-group";
        divTags.appendChild(ulTags);
        tagEntries.forEach(([filterKeyword, count]) => {
            const button = document.createElement("button");
            button.className = "fr-tag fr-tag--sm";
            button.ariaPressed = initHashFilters[filterType]?.includes(filterKeyword) ? "true" : "false";
            button.textContent = `${filterKeyword} (${count})`;
            button.addEventListener("click", (e) => {
                e.preventDefault();
                const button = e.currentTarget;
                const hashFilters = this.getFiltersFromHash();
                if (button.ariaPressed === "true") {
                    hashFilters[filterType] = hashFilters[filterType]?.filter((f) => f !== filterKeyword);
                    if (!hashFilters[filterType]?.length) {
                        delete hashFilters[filterType];
                    }
                } else {
                    hashFilters[filterType] = Array.from(new Set([...(hashFilters[filterType] ?? []), filterKeyword]));
                }
                window.location.hash = Object.keys(hashFilters).length === 0 ? "" : encodeURIComponent(JSON.stringify(hashFilters));
            });
            ulTags.appendChild(button);
        });
        div.appendChild(divTitle);
        div.appendChild(divTags);
        this.filterTagsEl.appendChild(div);
    }

    getFiltersFromHash() {
        let hashFilters;
        try {
            const hash = window.location.hash.substring(1);
            hashFilters = hash === "" ? {} : JSON.parse(decodeURIComponent(hash));
        } catch (error) {
            hashFilters = {};
        }
        return hashFilters;
    }

    getFiltersFromResults(results) {
        const getFilterKeys = (results) => {
            const filters = results.map((r) => {
                return r.filters ?? {};
            });
            const filterKeys = filters.map((f) => Object.keys(f) ?? []).flat();
            return Array.from(new Set(filterKeys)).sort();
        };
        const countOccurrences = (array) => {
            return array.reduce((acc, curr) => {
                acc[curr] ??= 0;
                acc[curr]++;
                return acc;
            }, {});
        };
        const filterKeys = getFilterKeys(results);
        const filters = {};
        filterKeys.forEach((filterKey) => {
            filters[filterKey] = results.map((r) => r.filters[filterKey] ?? []).flat();
            filters[filterKey] = countOccurrences(filters[filterKey]);
        });
        return filters;
    }

    formatExcerpt(excerpt) {
        if (!excerpt || excerpt.trim() === "") return "";
        const plainText = excerpt.replace(/<[^>]+>/g, "").trim();
        const startsWithUpper = /^[A-ZÀ-ÖÙ-Ü]/.test(plainText);
        const endsWithDot = /[.!?…]$/.test(plainText);
        const prefix = startsWithUpper ? "" : "... ";
        const suffix = endsWithDot ? "" : " ...";
        return `${prefix}${excerpt.trim()}${suffix}`;
    }

    renderPagination(currentPage, totalPages) {
        if (this.searchResults.length <= RESULTS_PER_PAGE) {
            document.querySelector("#pagination-container").innerHTML = "";
            return;
        }
        const container = document.querySelector("#pagination-container");
        container.innerHTML = "";
        const ul = document.createElement("ul");
        ul.className = "fr-pagination__list";
        const createPageLink = (page, label, isDisabled = false, isCurrent = false) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.className = "fr-pagination__link";
            if (label === "Page précédente") a.classList.add("fr-pagination__link--prev", "fr-pagination__link--lg-label");
            if (label === "Page suivante") a.classList.add("fr-pagination__link--next", "fr-pagination__link--lg-label");
            a.setAttribute("role", "link");
            if (isDisabled) a.setAttribute("aria-disabled", "true");
            else {
                a.href = "#";
                a.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.goToPage(page);
                });
            }
            if (isCurrent) {
                a.setAttribute("aria-current", "page");
            }
            a.textContent = label || page;
            li.appendChild(a);
            return li;
        };
        ul.appendChild(createPageLink(currentPage - 1, "Page précédente", currentPage === 0));
        for (let i = 0; i < totalPages; i++) {
            if (Math.abs(i - currentPage) <= 2 || i === 0 || i === totalPages - 1) {
                ul.appendChild(createPageLink(i, String(i + 1), false, i === currentPage));
            } else if ((i === currentPage - 3 && currentPage > 3) || (i === currentPage + 3 && currentPage < totalPages - 4)) {
                const li = document.createElement("li");
                li.innerHTML = `<span class="fr-pagination__link">…</span>`;
                ul.appendChild(li);
            }
        }
        ul.appendChild(createPageLink(currentPage + 1, "Page suivante", currentPage >= totalPages - 1));
        container.appendChild(ul);
    }

    _getCardHtml(title, excerpt, url, filters = []) {
        return `
<div class="search-result-card">
    <div class="search-result-card__body">
        <div class="search-result-card__content">
            <h3 class="search-result-card__title">
                <a href="${url}">${title}</a>
            </h3>
            <p class="search-result-card__desc">${this.formatExcerpt(excerpt)}</p>
            <div class="search-result-card__tags">
                <ul class="tags-group">
                    ${filters
                        ?.map(
                            (filter) => `
                        <li class="tag">${filter}</li>
                    `
                        )
                        .join("")}
                </ul>
            </div>
        </div>
    </div>
</div>`;
    }

    _bottomIsReached() {
        return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight;
    }
}

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

document.addEventListener('DOMContentLoaded', () => {
    (async () => {
        try {
            const pagefind = await import(PAGEFIND_URL);
            const pageFinder = new PageFinder(pagefind);

            const searchInput = document.querySelector("#search-input");
            const searchForm = document.querySelector("#search-form");

            const debouncedSearch = debounce(async (searchTerm) => {
                const hashFilters = pageFinder.getFiltersFromHash();
                const { filters } = await pageFinder.getSearchResults(searchTerm, hashFilters);
                pageFinder.populateFilters(filters, hashFilters);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });

            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                debouncedSearch(searchInput.value);
            });

            // Initial search if query param exists
            const queryParams = new URLSearchParams(window.location.search);
            const initialSearchTerm = queryParams.get("term");
            if (initialSearchTerm) {
                searchInput.value = initialSearchTerm;
                debouncedSearch(initialSearchTerm);
            }

        } catch (error) {
            console.error("Error initializing search:", error);
        }
    })();
});