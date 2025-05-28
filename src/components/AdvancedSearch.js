/**
 * AG&P Attendance System - Advanced Search & Filtering Component
 * Provides comprehensive search and filtering capabilities
 */

class AdvancedSearch {
    constructor() {
        this.searchCriteria = {
            query: '',
            department: '',
            role: '',
            status: '',
            dateFrom: '',
            dateTo: '',
            tags: [],
            sortBy: 'name',
            sortOrder: 'asc'
        };
        
        this.activeFilters = [];
        this.searchHistory = [];
        this.savedSearches = [];
        this.isAdvancedMode = false;
        
        this.loadSavedSearches();
    }

    /**
     * Initialize advanced search component
     */
    init() {
        this.setupEventListeners();
        this.loadSearchHistory();
    }

    /**
     * Render search interface
     */
    renderSearchInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="advanced-search-container">
                <div class="search-header">
                    <h3 class="search-title">
                        <i class="fas fa-search"></i>
                        Search & Filter
                    </h3>
                    <button class="search-toggle" onclick="advancedSearch.toggleAdvancedMode()">
                        ${this.isAdvancedMode ? 'Simple' : 'Advanced'}
                    </button>
                </div>

                <!-- Quick Search -->
                <div class="quick-search">
                    <div class="search-input-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               id="quick-search-input"
                               placeholder="Search users, departments, activities..."
                               value="${this.searchCriteria.query}">
                        <button class="search-clear" id="clear-search" style="display: ${this.searchCriteria.query ? 'block' : 'none'}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Advanced Search Fields -->
                <div class="advanced-search-fields" style="display: ${this.isAdvancedMode ? 'block' : 'none'}">
                    <div class="search-grid">
                        <div class="search-field">
                            <label for="search-department">Department</label>
                            <select class="search-select" id="search-department">
                                <option value="">All Departments</option>
                                ${this.renderDepartmentOptions()}
                            </select>
                        </div>
                        
                        <div class="search-field">
                            <label for="search-role">Role</label>
                            <select class="search-select" id="search-role">
                                <option value="">All Roles</option>
                                <option value="user">User/Intern</option>
                                <option value="admin">Administrator</option>
                                <option value="developer">Developer</option>
                            </select>
                        </div>
                        
                        <div class="search-field">
                            <label for="search-status">Status</label>
                            <select class="search-select" id="search-status">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        
                        <div class="search-field">
                            <label for="search-date-from">Date From</label>
                            <input type="date" class="search-input" id="search-date-from" value="${this.searchCriteria.dateFrom}">
                        </div>
                        
                        <div class="search-field">
                            <label for="search-date-to">Date To</label>
                            <input type="date" class="search-input" id="search-date-to" value="${this.searchCriteria.dateTo}">
                        </div>
                        
                        <div class="search-field">
                            <label for="search-sort">Sort By</label>
                            <select class="search-select" id="search-sort">
                                <option value="name">Name</option>
                                <option value="department">Department</option>
                                <option value="role">Role</option>
                                <option value="created">Date Created</option>
                                <option value="lastLogin">Last Login</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="search-actions">
                        <button class="action-btn secondary" onclick="advancedSearch.clearSearch()">
                            <i class="fas fa-eraser"></i>
                            Clear
                        </button>
                        <button class="action-btn secondary" onclick="advancedSearch.saveSearch()">
                            <i class="fas fa-bookmark"></i>
                            Save Search
                        </button>
                        <button class="action-btn primary" onclick="advancedSearch.executeSearch()">
                            <i class="fas fa-search"></i>
                            Search
                        </button>
                    </div>
                </div>

                <!-- Active Filters -->
                <div class="active-filters" id="active-filters" style="display: ${this.activeFilters.length > 0 ? 'flex' : 'none'}">
                    ${this.renderActiveFilters()}
                </div>

                <!-- Saved Searches -->
                ${this.savedSearches.length > 0 ? `
                    <div class="saved-searches">
                        <h4>Saved Searches</h4>
                        <div class="saved-searches-list">
                            ${this.renderSavedSearches()}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Search Results Header -->
            <div class="search-results-header" id="search-results-header" style="display: none">
                <div class="search-results-count" id="search-results-count">
                    0 results found
                </div>
                <div class="search-sort">
                    <label for="results-sort">Sort:</label>
                    <select class="sort-select" id="results-sort">
                        <option value="relevance">Relevance</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                    </select>
                </div>
            </div>
        `;

        this.setupSearchEventListeners();
    }

    /**
     * Setup event listeners for search functionality
     */
    setupSearchEventListeners() {
        // Quick search input
        const quickSearchInput = document.getElementById('quick-search-input');
        if (quickSearchInput) {
            quickSearchInput.addEventListener('input', (e) => {
                this.searchCriteria.query = e.target.value;
                this.updateClearButton();
                this.debounceSearch();
            });
        }

        // Clear search button
        const clearSearchBtn = document.getElementById('clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearQuickSearch();
            });
        }

        // Advanced search fields
        const searchFields = ['search-department', 'search-role', 'search-status', 'search-date-from', 'search-date-to', 'search-sort'];
        searchFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', (e) => {
                    const key = fieldId.replace('search-', '').replace('-', '');
                    this.searchCriteria[key] = e.target.value;
                    this.executeSearch();
                });
            }
        });

        // Results sort
        const resultsSort = document.getElementById('results-sort');
        if (resultsSort) {
            resultsSort.addEventListener('change', (e) => {
                this.sortResults(e.target.value);
            });
        }
    }

    /**
     * Toggle between simple and advanced search modes
     */
    toggleAdvancedMode() {
        this.isAdvancedMode = !this.isAdvancedMode;
        const advancedFields = document.querySelector('.advanced-search-fields');
        const toggleBtn = document.querySelector('.search-toggle');
        
        if (advancedFields) {
            advancedFields.style.display = this.isAdvancedMode ? 'block' : 'none';
        }
        
        if (toggleBtn) {
            toggleBtn.textContent = this.isAdvancedMode ? 'Simple' : 'Advanced';
        }
    }

    /**
     * Execute search with current criteria
     */
    executeSearch() {
        const results = this.performSearch();
        this.displayResults(results);
        this.updateActiveFilters();
        this.saveToHistory();
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('searchExecuted', {
            detail: { criteria: this.searchCriteria, results }
        }));
    }

    /**
     * Perform the actual search
     */
    performSearch() {
        let results = [];
        
        // Get data sources
        const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
        const departments = window.userDatabase ? window.userDatabase.getAllDepartments() : [];
        const activities = JSON.parse(localStorage.getItem('agp_attendance_activitiesData') || '[]');
        
        // Search users
        if (this.shouldSearchUsers()) {
            results = results.concat(this.searchUsers(users));
        }
        
        // Search departments
        if (this.shouldSearchDepartments()) {
            results = results.concat(this.searchDepartments(departments));
        }
        
        // Search activities
        if (this.shouldSearchActivities()) {
            results = results.concat(this.searchActivities(activities));
        }
        
        // Apply filters
        results = this.applyFilters(results);
        
        // Sort results
        results = this.sortResults(results);
        
        return results;
    }

    /**
     * Search users based on criteria
     */
    searchUsers(users) {
        return users.filter(user => {
            // Text search
            if (this.searchCriteria.query) {
                const query = this.searchCriteria.query.toLowerCase();
                const searchableText = `${user.name} ${user.email} ${user.position}`.toLowerCase();
                if (!searchableText.includes(query)) return false;
            }
            
            // Department filter
            if (this.searchCriteria.department && user.department !== this.searchCriteria.department) {
                return false;
            }
            
            // Role filter
            if (this.searchCriteria.role && user.role !== this.searchCriteria.role) {
                return false;
            }
            
            // Status filter
            if (this.searchCriteria.status) {
                const isActive = user.isActive || user.status === 'active';
                if (this.searchCriteria.status === 'active' && !isActive) return false;
                if (this.searchCriteria.status === 'inactive' && isActive) return false;
            }
            
            return true;
        }).map(user => ({
            type: 'user',
            id: user.id,
            title: user.name,
            subtitle: `${user.position} - ${user.email}`,
            department: user.department,
            role: user.role,
            status: user.isActive ? 'active' : 'inactive',
            data: user
        }));
    }

    /**
     * Search departments based on criteria
     */
    searchDepartments(departments) {
        return departments.filter(dept => {
            if (this.searchCriteria.query) {
                const query = this.searchCriteria.query.toLowerCase();
                const searchableText = `${dept.name} ${dept.description}`.toLowerCase();
                if (!searchableText.includes(query)) return false;
            }
            return true;
        }).map(dept => ({
            type: 'department',
            id: dept.id,
            title: dept.name,
            subtitle: dept.description,
            status: dept.isActive ? 'active' : 'inactive',
            data: dept
        }));
    }

    /**
     * Search activities based on criteria
     */
    searchActivities(activities) {
        return activities.filter(activity => {
            if (this.searchCriteria.query) {
                const query = this.searchCriteria.query.toLowerCase();
                const searchableText = `${activity.title} ${activity.description}`.toLowerCase();
                if (!searchableText.includes(query)) return false;
            }
            
            // Date range filter
            if (this.searchCriteria.dateFrom || this.searchCriteria.dateTo) {
                const activityDate = new Date(activity.date || activity.timestamp);
                if (this.searchCriteria.dateFrom && activityDate < new Date(this.searchCriteria.dateFrom)) return false;
                if (this.searchCriteria.dateTo && activityDate > new Date(this.searchCriteria.dateTo)) return false;
            }
            
            return true;
        }).map(activity => ({
            type: 'activity',
            id: activity.id,
            title: activity.title,
            subtitle: activity.description,
            date: activity.date || activity.timestamp,
            status: activity.status,
            data: activity
        }));
    }

    /**
     * Apply additional filters to results
     */
    applyFilters(results) {
        // Apply any additional custom filters here
        return results;
    }

    /**
     * Sort search results
     */
    sortResults(results, sortBy = null) {
        const sortCriteria = sortBy || this.searchCriteria.sortBy || 'name';
        
        return results.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortCriteria) {
                case 'name':
                case 'name-asc':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    return aValue.localeCompare(bValue);
                    
                case 'name-desc':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    return bValue.localeCompare(aValue);
                    
                case 'date-desc':
                    aValue = new Date(a.date || a.data.createdAt || 0);
                    bValue = new Date(b.date || b.data.createdAt || 0);
                    return bValue - aValue;
                    
                case 'date-asc':
                    aValue = new Date(a.date || a.data.createdAt || 0);
                    bValue = new Date(b.date || b.data.createdAt || 0);
                    return aValue - bValue;
                    
                case 'relevance':
                default:
                    // Simple relevance based on query match position
                    if (this.searchCriteria.query) {
                        const query = this.searchCriteria.query.toLowerCase();
                        const aIndex = a.title.toLowerCase().indexOf(query);
                        const bIndex = b.title.toLowerCase().indexOf(query);
                        if (aIndex !== bIndex) return aIndex - bIndex;
                    }
                    return a.title.localeCompare(b.title);
            }
        });
    }

    /**
     * Display search results
     */
    displayResults(results) {
        const resultsHeader = document.getElementById('search-results-header');
        const resultsCount = document.getElementById('search-results-count');
        
        if (resultsHeader) {
            resultsHeader.style.display = results.length > 0 ? 'flex' : 'none';
        }
        
        if (resultsCount) {
            resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;
        }
        
        // Trigger event for other components to handle result display
        window.dispatchEvent(new CustomEvent('searchResultsUpdated', {
            detail: { results, count: results.length }
        }));
    }

    /**
     * Helper methods
     */
    shouldSearchUsers() {
        return !this.searchCriteria.query || 
               this.searchCriteria.query.length === 0 || 
               this.searchCriteria.department || 
               this.searchCriteria.role || 
               this.searchCriteria.status ||
               ['user', 'admin', 'person', 'intern'].some(term => 
                   this.searchCriteria.query.toLowerCase().includes(term));
    }

    shouldSearchDepartments() {
        return !this.searchCriteria.query || 
               this.searchCriteria.query.length === 0 ||
               ['department', 'dept', 'team', 'division'].some(term => 
                   this.searchCriteria.query.toLowerCase().includes(term));
    }

    shouldSearchActivities() {
        return !this.searchCriteria.query || 
               this.searchCriteria.query.length === 0 ||
               this.searchCriteria.dateFrom ||
               this.searchCriteria.dateTo ||
               ['activity', 'task', 'work', 'project'].some(term => 
                   this.searchCriteria.query.toLowerCase().includes(term));
    }

    renderDepartmentOptions() {
        if (!window.userDatabase) return '';
        
        const departments = window.userDatabase.getAllDepartments();
        return departments.map(dept => 
            `<option value="${dept.id}" ${this.searchCriteria.department === dept.id ? 'selected' : ''}>${dept.name}</option>`
        ).join('');
    }

    renderActiveFilters() {
        return this.activeFilters.map(filter => `
            <div class="filter-chip">
                <span>${filter.label}</span>
                <button class="filter-chip-remove" onclick="advancedSearch.removeFilter('${filter.key}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    renderSavedSearches() {
        return this.savedSearches.map(search => `
            <button class="saved-search-item" onclick="advancedSearch.loadSavedSearch('${search.id}')">
                <i class="fas fa-bookmark"></i>
                <span>${search.name}</span>
            </button>
        `).join('');
    }

    updateActiveFilters() {
        this.activeFilters = [];
        
        if (this.searchCriteria.department) {
            const dept = window.userDatabase?.getDepartmentById(this.searchCriteria.department);
            this.activeFilters.push({
                key: 'department',
                label: `Department: ${dept?.name || this.searchCriteria.department}`
            });
        }
        
        if (this.searchCriteria.role) {
            this.activeFilters.push({
                key: 'role',
                label: `Role: ${this.searchCriteria.role}`
            });
        }
        
        if (this.searchCriteria.status) {
            this.activeFilters.push({
                key: 'status',
                label: `Status: ${this.searchCriteria.status}`
            });
        }
        
        if (this.searchCriteria.dateFrom) {
            this.activeFilters.push({
                key: 'dateFrom',
                label: `From: ${this.searchCriteria.dateFrom}`
            });
        }
        
        if (this.searchCriteria.dateTo) {
            this.activeFilters.push({
                key: 'dateTo',
                label: `To: ${this.searchCriteria.dateTo}`
            });
        }
        
        const activeFiltersContainer = document.getElementById('active-filters');
        if (activeFiltersContainer) {
            activeFiltersContainer.style.display = this.activeFilters.length > 0 ? 'flex' : 'none';
            activeFiltersContainer.innerHTML = this.renderActiveFilters();
        }
    }

    removeFilter(key) {
        this.searchCriteria[key] = '';
        this.executeSearch();
        
        // Update the corresponding form field
        const field = document.getElementById(`search-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
        if (field) {
            field.value = '';
        }
    }

    clearSearch() {
        this.searchCriteria = {
            query: '',
            department: '',
            role: '',
            status: '',
            dateFrom: '',
            dateTo: '',
            tags: [],
            sortBy: 'name',
            sortOrder: 'asc'
        };
        
        // Clear all form fields
        const fields = ['quick-search-input', 'search-department', 'search-role', 'search-status', 'search-date-from', 'search-date-to', 'search-sort'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        this.executeSearch();
    }

    clearQuickSearch() {
        this.searchCriteria.query = '';
        const quickSearchInput = document.getElementById('quick-search-input');
        if (quickSearchInput) {
            quickSearchInput.value = '';
        }
        this.updateClearButton();
        this.executeSearch();
    }

    updateClearButton() {
        const clearBtn = document.getElementById('clear-search');
        if (clearBtn) {
            clearBtn.style.display = this.searchCriteria.query ? 'block' : 'none';
        }
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.executeSearch();
        }, 300);
    }

    saveSearch() {
        const name = prompt('Enter a name for this search:');
        if (name) {
            const search = {
                id: Date.now().toString(),
                name,
                criteria: { ...this.searchCriteria },
                createdAt: new Date().toISOString()
            };
            
            this.savedSearches.push(search);
            this.saveSavedSearches();
            
            // Re-render to show new saved search
            this.renderSearchInterface('search-container');
        }
    }

    loadSavedSearch(searchId) {
        const search = this.savedSearches.find(s => s.id === searchId);
        if (search) {
            this.searchCriteria = { ...search.criteria };
            this.renderSearchInterface('search-container');
            this.executeSearch();
        }
    }

    saveToHistory() {
        if (this.searchCriteria.query || Object.values(this.searchCriteria).some(v => v && v !== 'name' && v !== 'asc')) {
            const historyItem = {
                criteria: { ...this.searchCriteria },
                timestamp: new Date().toISOString()
            };
            
            this.searchHistory.unshift(historyItem);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep last 10 searches
            
            localStorage.setItem('agp_search_history', JSON.stringify(this.searchHistory));
        }
    }

    loadSearchHistory() {
        this.searchHistory = JSON.parse(localStorage.getItem('agp_search_history') || '[]');
    }

    loadSavedSearches() {
        this.savedSearches = JSON.parse(localStorage.getItem('agp_saved_searches') || '[]');
    }

    saveSavedSearches() {
        localStorage.setItem('agp_saved_searches', JSON.stringify(this.savedSearches));
    }

    setupEventListeners() {
        // Global search shortcut (Ctrl+K or Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('quick-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    }
}

// Create global instance
window.advancedSearch = new AdvancedSearch();
