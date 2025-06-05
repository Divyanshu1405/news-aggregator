document.addEventListener("DOMContentLoaded", () => {
  const newsContainer = document.getElementById("newsContainer");

  async function fetchNews(category = '') {
    const res = await fetch(`/news?category=${category}`);
    const data = await res.json();
    renderNews(data.articles);
  }

  function renderNews(articles) {
    newsContainer.innerHTML = '';
    articles.forEach(article => {
      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-gray-800 rounded shadow p-4';
      card.innerHTML = `
        <img src="${article.urlToImage || ''}" alt="" class="w-full h-40 object-cover rounded" />
        <h2 class="text-lg font-bold mt-2">${article.title}</h2>
        <p class="text-sm mt-1">${article.description || ''}</p>
        <a href="${article.url}" target="_blank" class="text-blue-500 mt-2 inline-block">Read more →</a>
      `;
      newsContainer.appendChild(card);
    });
  }

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      fetchNews(cat);
    });
  });

  fetchNews(); // Load default news on page load
});
