/**
 * Movie Cards Application
 * Fetches movie data from JSON file with perfect alignment
 */

// Application state
let allMovies = [];
let filteredMovies = [];
let currentSearchTerm = '';
let currentSortBy = 'name';

// DOM elements
const elements = {
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    moviesGrid: document.getElementById('moviesGrid'),
    noResults: document.getElementById('noResults'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    retryBtn: document.getElementById('retryBtn')
};

/**
 * Fetch movies from JSON file
 * @returns {Promise<Array>} Array of movie objects
 */
async function fetchMoviesFromJSON() {
    try {
        console.log('Fetching movies from movies.json...');
        
        const response = await fetch('movies.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.movies || !Array.isArray(data.movies)) {
            throw new Error('Invalid JSON structure: missing movies array');
        }
        
        return data.movies;
        
    } catch (error) {
        console.error('Error fetching movies from JSON:', error);
        throw error;
    }
}

/**
 * Create HTML for a single movie card
 * @param {Object} movie - Movie object from JSON
 * @returns {string} HTML string for movie card
 */
function createMovieCard(movie) {
    const { name, rating, director, year, image, boxOffice, runtime, genre } = movie;
    
    // Fallback image if image fails to load
    const fallbackImage = `https://via.placeholder.com/300x450/f3f4f6/9ca3af?text=${encodeURIComponent(name)}`;
    
    return `
        <div class="movie-card" 
             data-name="${name.toLowerCase()}" 
             data-year="${year}" 
             data-rating="${rating}"
             data-director="${director.toLowerCase()}"
             data-genre="${genre.toLowerCase()}">
            <img 
                src="${image}" 
                alt="${name} Poster" 
                class="movie-image"
                loading="lazy"
                onerror="this.src='${fallbackImage}'"
            >
            <div class="movie-content">
                <h3 class="movie-title">${name}</h3>
                
                <div class="movie-meta">
                    <span class="movie-year">${year}</span>
                    <span class="movie-director">${director}</span>
                </div>
                
                <div class="movie-ratings">
                    <div class="rating-item rating-imdb">
                        <span>⭐</span>
                        <span class="rating-value">${rating}</span>
                    </div>
                    <div class="rating-item rating-box-office">
                        <span>💰</span>
                        <span class="rating-value">${boxOffice}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display movies in the grid
 * @param {Array} movies - Array of movie objects
 */
function displayMovies(movies) {
    elements.moviesGrid.innerHTML = '';
    
    if (movies.length === 0) {
        elements.noResults.classList.remove('hidden');
        return;
    }
    
    elements.noResults.classList.add('hidden');
    
    movies.forEach(movie => {
        const movieCardHTML = createMovieCard(movie);
        elements.moviesGrid.innerHTML += movieCardHTML;
    });
    
    console.log(`Displayed ${movies.length} movies`);
}

/**
 * Filter movies based on search term
 * @param {string} searchTerm - Search term to filter by
 */
function filterMovies(searchTerm) {
    currentSearchTerm = searchTerm.toLowerCase().trim();
    
    if (currentSearchTerm === '') {
        filteredMovies = [...allMovies];
    } else {
        filteredMovies = allMovies.filter(movie => {
            const name = (movie.name || '').toLowerCase();
            const genre = (movie.genre || '').toLowerCase();
            const director = (movie.director || '').toLowerCase();
            const year = (movie.year || '').toString();
            
            return name.includes(currentSearchTerm) ||
                   genre.includes(currentSearchTerm) ||
                   director.includes(currentSearchTerm) ||
                   year.includes(currentSearchTerm);
        });
    }
    
    sortMovies(currentSortBy);
    displayMovies(filteredMovies);
}

/**
 * Sort movies by specified criteria
 * @param {string} sortBy - Sort criteria ('name', 'year', 'rating')
 */
function sortMovies(sortBy) {
    currentSortBy = sortBy;
    
    filteredMovies.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'year':
                return parseInt(b.year || 0) - parseInt(a.year || 0);
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });
}

/**
 * Show loading state
 */
function showLoadingState() {
    elements.loadingState.classList.remove('hidden');
    elements.errorState.classList.add('hidden');
    elements.moviesGrid.innerHTML = '';
    elements.noResults.classList.add('hidden');
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    elements.loadingState.classList.add('hidden');
}

/**
 * Show error state
 */
function showErrorState() {
    elements.loadingState.classList.add('hidden');
    elements.errorState.classList.remove('hidden');
    elements.moviesGrid.innerHTML = '';
    elements.noResults.classList.add('hidden');
}

/**
 * Load movies from JSON file
 */
async function loadMovies() {
    try {
        showLoadingState();
        
        allMovies = await fetchMoviesFromJSON();
        filteredMovies = [...allMovies];
        
        hideLoadingState();
        sortMovies(currentSortBy);
        displayMovies(filteredMovies);
        
        console.log(`Successfully loaded ${allMovies.length} movies from JSON`);
        
    } catch (error) {
        console.error('Error loading movies:', error);
        showErrorState();
    }
}

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('Initializing Movie Cards Application...');
    console.log('Fetching data from movies.json...');
    
    // Set up event listeners
    elements.searchInput.addEventListener('input', (e) => {
        filterMovies(e.target.value);
    });
    
    elements.sortSelect.addEventListener('change', (e) => {
        sortMovies(e.target.value);
        displayMovies(filteredMovies);
    });
    
    elements.retryBtn.addEventListener('click', loadMovies);
    
    // Load movie data
    await loadMovies();
}

// Start the application after intro video ends
const introVideo = document.getElementById('introVideo');
introVideo.addEventListener('ended', () => {
    introVideo.style.display = 'none';
    document.querySelector('.container').classList.remove('hidden');
    initializeApp();
});

// Export for debugging (optional)
if (typeof window !== 'undefined') {
    window.movieApp = {
        allMovies: () => allMovies,
        filteredMovies: () => filteredMovies,
        loadMovies,
        filterMovies,
        sortMovies
    };
}
