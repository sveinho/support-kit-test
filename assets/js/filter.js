document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  let currentTag = 'gettingstarted';
  let searchQuery = '';

  function filterArticles() {
    articles.forEach(article => {
      const tags = article.getAttribute('data-tags').split(' ');
      const title = article.querySelector('h2').textContent.toLowerCase();
      const content = article.querySelector('p').textContent.toLowerCase();
      
      const matchesTag = (currentTag === 'all' || tags.includes(currentTag));
      const matchesSearch = (title.includes(searchQuery) || content.includes(searchQuery));

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
      } else {
        article.classList.add('hidden');
      }
    });
  }

  // Søkefelt-event
  searchInput.addEventListener('input', function(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    if (searchQuery.length > 0) {
      resetBtn.classList.remove('invisible');
    } else {
      resetBtn.classList.add('invisible');
    }
    filterArticles();
  });

  // Nullstill-knapp
  resetBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchQuery = '';
    resetBtn.classList.add('invisible');
    filterArticles();
  });

  // Tag-knapper
  tagButtons.forEach(button => {
    button.addEventListener('click', function() {
      tagButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentTag = this.getAttribute('data-value');
      filterArticles();
    });
  });
});
