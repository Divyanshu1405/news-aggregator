// Wait for the page to fully load before running our code
document.addEventListener("DOMContentLoaded", () => {
  // Get all the important elements from our HTML page
  const newsContainer = document.getElementById("newsContainer");
  const searchInput = document.getElementById("searchInput");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const themeToggle = document.getElementById("themeToggle");
  const savedArticlesBtn = document.getElementById("savedArticlesBtn");
  const savedCountBadge = document.getElementById("savedCountBadge");

  // Keep track of what we're currently viewing
  let currentCategory = '';
  let currentQuery = '';

  // Store saved articles in browser storage.
  let savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];

  // Update the little badge that shows how many articles we've saved
  function updateSavedCount() {
    if (savedArticles.length > 0) {
      savedCountBadge.textContent = savedArticles.length;
      savedCountBadge.classList.remove('hidden');
    } else {
      savedCountBadge.classList.add('hidden');
    }
  }

  // Set up the dark theme when the page loads
  function setupInitialTheme() {
    document.documentElement.classList.add('dark');
    updateAllThemeElements();
    updateBackgroundImages();
  }

  // Update background images when theme changes
  function updateBackgroundImages() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const body = document.body;

    // Force the browser to refresh the background
    body.style.backgroundImage = 'none';
    body.offsetWidth; // This tricks the browser into refreshing
    body.style.backgroundImage = '';

    console.log(`Theme switched to: ${isDarkMode ? 'dark' : 'light'} mode`);
  }

  // Update all elements to match the current theme
  function updateAllThemeElements() {
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Update main body styling
    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark:bg-gray-900', 'dark:text-white');
      body.classList.remove('bg-white', 'text-gray-900');
    } else {
      body.classList.add('bg-white', 'text-gray-900');
      body.classList.remove('dark:bg-gray-900', 'dark:text-white');
    }

    // Update header, navigation, search input, and footer
    updateElementTheme('header', isDarkMode, 'dark:bg-gray-800', 'bg-white');
    updateElementTheme('nav', isDarkMode, 'dark:bg-gray-700', 'bg-gray-100');
    updateElementTheme('footer', isDarkMode, 'dark:bg-gray-800 dark:text-gray-400', 'bg-white text-gray-500');

    // Update search input with more specific styling
    if (searchInput) {
      if (isDarkMode) {
        searchInput.classList.add('dark:bg-gray-800', 'dark:border-gray-600', 'dark:text-white');
        searchInput.classList.remove('bg-white', 'border-gray-300', 'text-gray-900');
      } else {
        searchInput.classList.add('bg-white', 'border-gray-300', 'text-gray-900');
        searchInput.classList.remove('dark:bg-gray-800', 'dark:border-gray-600', 'dark:text-white');
      }
    }

    // Update existing news cards to match theme
    document.querySelectorAll('.news-card').forEach(card => {
      if (isDarkMode) {
        card.classList.add('dark:bg-gray-800');
        card.classList.remove('bg-white');
      } else {
        card.classList.add('bg-white');
        card.classList.remove('dark:bg-gray-800');
      }
    });
  }

  // Helper function to update individual element themes
  function updateElementTheme(selector, isDarkMode, darkClasses, lightClasses) {
    const element = document.querySelector(selector);
    if (element) {
      if (isDarkMode) {
        element.className = element.className.replace(lightClasses, '') + ' ' + darkClasses;
      } else {
        element.className = element.className.replace(darkClasses, '') + ' ' + lightClasses;
      }
    }
  }

  // Switch between light and dark themes with a smooth animation
  function switchTheme() {
    const htmlElement = document.documentElement;
    const isDarkMode = htmlElement.classList.contains('dark');

    // Add smooth transition effect
    document.body.style.transition = 'all 0.3s ease';

    // Toggle the theme
    if (isDarkMode) {
      htmlElement.classList.remove('dark');
    } else {
      htmlElement.classList.add('dark');
    }

    // Update all elements and backgrounds
    updateAllThemeElements();
    updateBackgroundImages();

    // Add a subtle zoom effect during transition
    document.body.style.transform = 'scale(0.98)';
    setTimeout(() => {
      document.body.style.transform = 'scale(1)';
      document.body.style.transition = '';
    }, 300);
  }

  // Save or unsave an article
  function toggleSaveArticle(article) {
    if (!article) {
      console.error('No article provided to save');
      return;
    }

    // Check if this article is already saved
    const alreadySaved = savedArticles.some(saved => saved.url === article.url);

    if (alreadySaved) {
      // Remove from saved articles
      savedArticles = savedArticles.filter(saved => saved.url !== article.url);
      showMessage('Article removed from saved articles', 'info');
    } else {
      // Add to saved articles with timestamp
      const articleToSave = {
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        source: article.source,
        publishedAt: article.publishedAt,
        savedAt: new Date().toISOString()
      };
      savedArticles.push(articleToSave);
      showMessage('Article saved successfully!', 'success');
    }

    //Save to local storage.
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));

    // Update UI to reflect changes
    updateSaveButtonAppearance();
    updateSavedCount();
  }

  // Update all save buttons to show correct state (saved or not saved)
  function updateSaveButtonAppearance() {
    document.querySelectorAll('.save-article-btn').forEach(btn => {
      const card = btn.closest('.news-card');
      const titleElement = card.querySelector('.article-title');
      const articleTitle = titleElement.textContent;

      // Check if this article is saved
      const isSaved = savedArticles.some(saved => saved.title === articleTitle);

      // Update button appearance based on saved state
      if (isSaved) {
        btn.classList.add('text-blue-600', 'bg-blue-100', 'dark:bg-blue-900');
        btn.title = 'Remove from saved articles';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>`;
      } else {
        btn.classList.remove('text-blue-600', 'bg-blue-100', 'dark:bg-blue-900');
        btn.title = 'Save article';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>`;
      }
    });
  }

  // Show notification messages to the user
  function showMessage(message, type = 'info') {
    // Remove any existing notification first
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create new notification element
    const notification = document.createElement('div');
    notification.className = 'notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full';

    // Set color based on message type
    const colorClass = {
      'success': 'bg-green-500',
      'error': 'bg-red-500',
      'info': 'bg-blue-500'
    }[type] || 'bg-blue-500';

    notification.classList.add(colorClass, 'text-white');
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${message}</span>
        <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in from the right
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }

  // Display all saved articles
  function showSavedArticles() {
    if (savedArticles.length === 0) {
      // Show empty state when no articles are saved
      newsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-6xl mb-4">🔖</div>
          <p class="text-gray-500 dark:text-gray-400 text-xl mb-4">No saved articles yet</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm">Save articles by clicking the bookmark icon on any article</p>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Browse News
          </button>
        </div>
      `;
      return;
    }

    // Update current view state
    currentCategory = 'saved';
    currentQuery = '';
    searchInput.value = '';

    // Clear navigation active states
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

    // Create header for saved articles section
    newsContainer.innerHTML = `
      <div class="col-span-full mb-6">
        <div class="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h2 class="text-xl font-bold text-blue-600 dark:text-blue-400">Saved Articles</h2>
            <span class="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">${savedArticles.length}</span>
          </div>
          <div class="flex space-x-2">
            <button onclick="clearAllSavedArticles()" class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
              Clear All
            </button>
            <button onclick="location.reload()" class="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
              Back to News
            </button>
          </div>
        </div>
      </div>
    `;

    // Display saved articles with delete buttons
    displaySavedArticles(savedArticles);
  }

  // Render saved articles with special delete functionality
  function displaySavedArticles(articles) {
    articles.forEach((article, index) => {
      if (!article) return;

      const card = createArticleCard(article, index, true);
      newsContainer.appendChild(card);
    });
  }

  // Remove a specific saved article
  function removeSavedArticle(articleUrl) {
    savedArticles = savedArticles.filter(article => article.url !== articleUrl);

    //Save to local storage

    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    showMessage('Article removed from saved articles', 'info');
    updateSavedCount();
    showSavedArticles(); // Refresh the view
  }

  // Remove all saved articles
  function clearAllSavedArticles() {
    if (confirm('Are you sure you want to remove all saved articles? This action cannot be undone.')) {
      savedArticles = [];

      //Clear from local storage
      localStorage.removeItem('savedArticles')
      showMessage('All saved articles cleared', 'info');
      updateSavedCount();
      showSavedArticles();
    }
  }

  // Show/hide loading spinner
  function showLoadingSpinner() {
    loadingSpinner.classList.remove("hidden");
    newsContainer.classList.add("opacity-50");
  }

  function hideLoadingSpinner() {
    loadingSpinner.classList.add("hidden");
    newsContainer.classList.remove("opacity-50");
  }

  // Display error messages
  function showErrorMessage(message) {
    console.error("Error:", message);
    newsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">📰</div>
        <p class="text-red-500 text-lg font-semibold">${message}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Try Again
        </button>
      </div>
    `;
  }

  // Fetch news from the API
  async function getNewsArticles(category = '', query = '') {
    showLoadingSpinner();

    try {
      // Build the API URL with parameters
      let apiUrl = '/api/news';
      const urlParams = new URLSearchParams();

      if (category) urlParams.append('category', category);
      if (query) urlParams.append('q', query);

      if (urlParams.toString()) {
        apiUrl += `?${urlParams.toString()}`;
      }

      console.log('Fetching news from:', apiUrl);

      // Make the API request
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log('API Response:', data);

      // Check for errors in the response
      if (data.error) {
        throw new Error(data.error);
      }
      if (!data.articles) {
        throw new Error('No articles found in response');
      }

      // Display the articles
      displayNewsArticles(data.articles);

    } catch (error) {
      console.error('Error fetching news:', error);
      showErrorMessage(`Failed to fetch news: ${error.message}`);
    } finally {
      hideLoadingSpinner();
    }
  }

  // Create a single article card element
  function createArticleCard(article, index, isSavedView = false) {
    const card = document.createElement('div');
    card.className = 'news-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in hover-lift';
    card.style.animationDelay = `${index * 0.1}s`;

    // Handle missing images
    const imageUrl = article.urlToImage && article.urlToImage !== 'null'
      ? article.urlToImage
      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM3NDE1MSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgZmlsbD0iIzYwYTVmYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZldGNoUHJlc3MgTmV3czwvdGV4dD4KICA8L3N2Zz4K';
    // Extract article information safely
    const title = article.title || 'No title available';
    const description = article.description || 'No description available';
    const source = article.source?.name || 'Unknown source';
    const publishedAt = article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
      : 'Unknown date';

    const hasValidUrl = article.url && article.url.startsWith('http');
    const isSaved = savedArticles.some(saved => saved.url === article.url);

    // Build the card HTML
    if (isSavedView) {
      const savedAt = article.savedAt
        ? new Date(article.savedAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        })
        : '';

      card.innerHTML = createSavedArticleHTML(imageUrl, title, source, savedAt, description, publishedAt, hasValidUrl, article.url);

      // Add delete button functionality
      const deleteBtn = card.querySelector('.delete-article-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeSavedArticle(article.url);
        });
      }
    } else {
      card.innerHTML = createRegularArticleHTML(imageUrl, title, source, isSaved, description, publishedAt, hasValidUrl, article.url);

      // Add save button functionality
      const saveBtn = card.querySelector('.save-article-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSaveArticle(article);
        });
      }
    }

    // Add click-to-open functionality to titles
    const titleElement = card.querySelector('.article-title');
    if (hasValidUrl && titleElement) {
      titleElement.addEventListener('click', () => {
        window.open(article.url, '_blank', 'noopener,noreferrer');
      });
    }

    return card;
  }

  // HTML template for regular articles
  function createRegularArticleHTML(imageUrl, title, source, isSaved, description, publishedAt, hasValidUrl, url) {
    return `
      <div class="relative overflow-hidden">
        <img src="${imageUrl}" alt="${title}" class="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM3NDE1MSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgZmlsbD0iIzYwYTVmYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZldGNoUHJlc3MgTmV3czwvdGV4dD4KICA8L3N2Zz4K'"
        <div class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
          ${source}
        </div>
        <button class="absolute top-2 left-2 p-2 ${isSaved ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'} rounded-full transition-colors save-article-btn" 
                title="${isSaved ? 'Remove from saved articles' : 'Save article'}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" ${isSaved ? 'fill="currentColor"' : 'fill="none" stroke="currentColor"'} viewBox="0 0 24 24">
            <path ${isSaved ? '' : 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2"'} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-16"></div>
      </div>
      <div class="p-4">
        <h2 class="article-title text-lg font-bold mb-2 line-clamp-2 text-shadow hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">${title}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">${description}</p>
        <div class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${publishedAt}</span>
          ${hasValidUrl
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer"
                class="read-more-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105">
                Read More →
             </a>`
        : `<span class="text-gray-400 text-sm">Link unavailable</span>`
      }
        </div>
      </div>
    `;
  }

  // HTML template for saved articles
  function createSavedArticleHTML(imageUrl, title, source, savedAt, description, publishedAt, hasValidUrl, url) {
    return `
      <div class="relative overflow-hidden">
        <img src="${imageUrl}" alt="${title}" class="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" 
             onerror="this.src='https://via.placeholder.com/400x200/1e293b/60a5fa?text=FetchPress+News'" />
        <div class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
          ${source}
        </div>
        <div class="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
          Saved ${savedAt}
        </div>
        <button class="absolute top-12 left-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors delete-article-btn" 
                title="Remove from saved articles">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0016.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-16"></div>
      </div>
      <div class="p-4">
        <h2 class="article-title text-lg font-bold mb-2 line-clamp-2 text-shadow hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">${title}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">${description}</p>
        <div class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${publishedAt}</span>
          ${hasValidUrl
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer"
                class="read-more-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105">
                Read More →
             </a>`
        : `<span class="text-gray-400 text-sm">Link unavailable</span>`
      }
        </div>
      </div>
    `;
  }

  // Display news articles in the container
  function displayNewsArticles(articles) {
    newsContainer.innerHTML = '';

    if (!articles || articles.length === 0) {
      newsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-6xl mb-4">📰</div>
          <p class="text-gray-500 dark:text-gray-400 text-xl mb-4">No news articles found</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm">Try searching for something else or check a different category</p>
        </div>
      `;
      return;
    }

    articles.forEach((article, index) => {
      if (!article) return;
      const card = createArticleCard(article, index, false);
      newsContainer.appendChild(card);
    });

    // Update save button states after rendering
    updateSaveButtonAppearance();
  }

  // Set up event listeners for navigation buttons
  function setupNavigationButtons() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = btn.dataset.category;

        // Update active button state
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Clear search and update state
        searchInput.value = '';
        currentQuery = '';
        currentCategory = category;

        // Fetch news for selected category
        getNewsArticles(category);
      });
    });
  }

  // Set up search functionality
  function setupSearchInput() {
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            currentQuery = query;
            currentCategory = '';

            // Clear navigation active states
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

            // Search for articles
            getNewsArticles('', query);
          }
        }
      });
    }
  }

  // Set up theme toggle functionality
  function setupThemeToggle() {
    if (themeToggle) {
      themeToggle.addEventListener('click', switchTheme);
      themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchTheme();
        }
      });
    }
  }

  // Set up saved articles button
  function setupSavedArticlesButton() {
    if (savedArticlesBtn) {
      savedArticlesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Viewing saved articles');
        showSavedArticles();
      });
    }
  }

  // Initialize the application
  function initializeApp() {
    setupInitialTheme();
    updateSavedCount();
    setupNavigationButtons();
    setupSearchInput();
    setupThemeToggle();
    setupSavedArticlesButton();

    // Load initial news
    getNewsArticles();
  }

  // Make functions available globally for HTML onclick handlers
  window.clearAllSavedArticles = clearAllSavedArticles;
  window.removeSavedArticle = removeSavedArticle;
  window.showSavedArticles = showSavedArticles;
  window.getNewsArticles = getNewsArticles;

  // Start the application
  initializeApp();
});