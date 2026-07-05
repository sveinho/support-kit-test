document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  // Setter standardverdi (alltid små bokstaver internt)
  let currentTag = 'beginner';
  let searchQuery = '';

  // Finn knappen uavhengig av om det står "Beginner" eller "beginner" i HTML
  const defaultButton = Array.from(tagButtons).find(btn => 
    btn.getAttribute('data-value')?.toLowerCase() === currentTag
  );
  if (defaultButton) {
    defaultButton.classList.add('active');
  }

  function filterArticles() {
    articles.forEach(article => {
      const tagsData = article.getAttribute('data-tags') || '';
      // Gjør om alle tagger fra HTML til små bokstaver for trygg sammenligning
      const tags = tagsData.toLowerCase().split(' ').filter(Boolean);
      
      const title = article.querySelector('h2')?.textContent.toLowerCase() || '';
      const content = article.querySelector('p')?.textContent.toLowerCase() || '';
      
      // Sammenligner i små bokstaver
      const matchesTag = tags.includes(currentTag.toLowerCase());
      const matchesSearch = (title.includes(searchQuery) || content.includes(searchQuery));

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
      } else {
        article.classList.add('hidden');
      }
    });
  }

  // Kjør filteret ved oppstart
  filterArticles();

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
      
      if (currentTag.toLowerCase() === clickedTag?.toLowerCase()) {
        this.classList.remove('active');
        currentTag = 'beginner';
        if (defaultButton) defaultButton.classList.add('active');
      } else {
        tagButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentTag = clickedTag;
      }
      
      filterArticles();
    });
  });
});
