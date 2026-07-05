document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  // 1. Sett 'getting-started' som standardverdi ved oppstart
  let currentTag = 'getting-started';
  let searchQuery = '';

  // Sørg for at den riktige knappen har 'active'-klassen i HTML ved oppstart
  const defaultButton = document.querySelector('.tag-btn[data-value="getting-started"]');
  if (defaultButton) {
    defaultButton.classList.add('active');
  }

  function filterArticles() {
    articles.forEach(article => {
      const tagsData = article.getAttribute('data-tags') || '';
      const tags = tagsData.split(' ').filter(Boolean);
      
      const title = article.querySelector('h2')?.textContent.toLowerCase() || '';
      const content = article.querySelector('p')?.textContent.toLowerCase() || '';
      
      // Siden currentTag aldri blir helt tom nå, sjekker vi alltid om taggen finnes
      const matchesTag = tags.includes(currentTag);
      const matchesSearch = (title.includes(searchQuery) || content.includes(searchQuery));

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
      } else {
        article.classList.add('hidden');
      }
    });
  }

  // Kjør filteret én gang ved oppstart for å skjule alt som ikke er 'getting-started'
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
      
      // 2. Hvis man klikker av en aktiv knapp, faller vi tilbake til 'getting-started'
      if (currentTag === clickedTag) {
        this.classList.remove('active');
        currentTag = 'getting-started';
        
        // Aktiver 'getting-started'-knappen igjen visuelt
        const startBtn = document.querySelector('.tag-btn[data-value="getting-started"]');
        if (startBtn) startBtn.classList.add('active');
      } else {
        tagButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentTag = clickedTag;
      }
      
      filterArticles();
    });
  });
});
