document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  let currentTag = '';
  let searchQuery = '';

  function filterArticles() {
    articles.forEach(article => {
      // .filter(Boolean) fjerner tomme strenger fra arrayet hvis det er doble mellomrom
      const tagsData = article.getAttribute('data-tags') || '';
      const tags = tagsData.split(' ').filter(Boolean);
      
      // Valgfri kjeding (?.) hindrer krasj hvis h2 eller p mangler
      const title = article.querySelector('h2')?.textContent.toLowerCase() || '';
      const content = article.querySelector('p')?.textContent.toLowerCase() || '';
      
      const matchesTag = (currentTag === '' || tags.includes(currentTag));
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
    searchInput.focus();
    filterArticles();
  });

  // Tag-knapper
  tagButtons.forEach(button => {
    button.addEventListener('click', function() {
      const clickedTag = this.getAttribute('data-value');
      
      // Hvis man klikker på en allerede aktiv tag, deaktiveres den
      if (currentTag === clickedTag) {
        this.classList.remove('active');
        currentTag = '';
      } else {
        tagButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentTag = clickedTag;
      }
      
      filterArticles();
    });
  });
});
