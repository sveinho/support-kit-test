document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  // Nye HTML-elementer for søkevisning
  const searchCounter = document.getElementById('searchCounter');
  const noResults = document.getElementById('noResults');
  
  let currentTag = 'beginner';
  let searchQuery = '';

  const defaultButton = Array.from(tagButtons).find(btn => 
    btn.getAttribute('data-value')?.toLowerCase() === currentTag
  );
  if (defaultButton) {
    defaultButton.classList.add('active');
  }

  function filterArticles() {
    let visibleCount = 0; // Holder styr på hvor mange artikler som vises

    // Del opp søket i enkeltord og fjern tomme mellomrom
    const searchWords = searchQuery.split(' ').filter(Boolean);

    articles.forEach(article => {
      const tagsData = article.getAttribute('data-tags') || '';
      const tags = tagsData.toLowerCase().split(' ').filter(Boolean);
      
      const title = article.querySelector('h2')?.textContent.toLowerCase() || '';
      const content = article.querySelector('p')?.textContent.toLowerCase() || '';
      // Slår sammen tittel og tekst for å søke i alt samtidig
      const fullText = `${title} ${content}`; 
      
      // Sjekk tag
      const matchesTag = tags.includes(currentTag.toLowerCase());
      
      // Sjekk søk: Hvert enkelt ord brukeren skrev må finnes i teksten
      const matchesSearch = searchWords.every(word => fullText.includes(word));

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
        visibleCount++; // Øk telleren for hvert treff
      } else {
        article.classList.add('hidden');
      }
    });

    // Håndter visning av resultater til brukeren
    updateSearchUI(visibleCount);
  }

  // Funksjon som styrer hva brukeren ser av meldinger og tellere
  function updateSearchUI(count) {
    // 1. Oppdater telleren
    if (searchCounter) {
      if (searchQuery === '') {
        searchCounter.textContent = `Viser ${count} artikler i denne kategorien`;
      } else {
        searchCounter.textContent = `Fant ${count} ${count === 1 ? 'treff' : 'treff'}`;
      }
    }

    // 2. Vis/skjul "Ingen treff"-meldingen
    if (noResults) {
      if (count === 0) {
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
      }
    }
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
