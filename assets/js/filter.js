document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  const searchCounter = document.getElementById('searchCounter');
  const noResults = document.getElementById('noResults');
  
  let currentTag = 'beginner';
  let searchQuery = '';
  const MAX_SUMMARY_LENGTH = 100; // Antall tegn som vises i søkeresultatet

  // Lagre original HTML og ren tekst ved oppstart
  articles.forEach(article => {
    const titleEl = article.querySelector('h2');
    const contentEl = article.querySelector('p');
    
    if (titleEl) article.dataset.origTitle = titleEl.innerHTML;
    if (contentEl) {
      article.dataset.origContent = contentEl.innerHTML;
      // Lagrer ren tekst uten HTML-tagger for trygg tekstforkorting
      article.dataset.pureText = contentEl.textContent.trim();
    }

    // HÅNDTER KLIKK PÅ ARTIKKEL
    article.addEventListener('click', function() {
      const tagsData = this.getAttribute('data-tags') || '';
      const tags = tagsData.toLowerCase().split(' ').filter(Boolean);
      
      // Finn den første taggen som IKKE er 'beginner'
      const newTag = tags.find(tag => tag !== 'beginner');
      
      if (newTag) {
        currentTag = newTag;
        
        // Tøm søket og nullstill visuell tilstand
        searchInput.value = '';
        searchQuery = '';
        resetBtn.classList.add('invisible');
        
        tagButtons.forEach(btn => {
          if (btn.getAttribute('data-value')?.toLowerCase() === newTag) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        
        // Kjører filteret på nytt (dette vil nå vise denne artikkelen + andre i samme kategori i FULL lengde)
        filterArticles();
        
        // Valgfritt: Rull skjermen silkemykt opp til den valgte artikkelen
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Sett standardknapp ved oppstart
  const defaultButton = Array.from(tagButtons).find(btn => 
    btn.getAttribute('data-value')?.toLowerCase() === currentTag
  );
  if (defaultButton) defaultButton.classList.add('active');

  // Hjelpefunksjon for utheving (Highlighting)
  function getHighlightedHTML(originalHTML, words) {
    if (words.length === 0 || !originalHTML) return originalHTML;
    let html = originalHTML;
    words.forEach(word => {
      const regex = new RegExp(`(${word})(?![^<]*>|[^<>]*</)`, 'gi');
      html = html.replace(regex, '<mark>$1</mark>');
    });
    return html;
  }

  function filterArticles() {
    let visibleCount = 0;
    const searchWords = searchQuery.split(' ').filter(Boolean);
    const isSearching = searchWords.length > 0;

    articles.forEach(article => {
      const tagsData = article.getAttribute('data-tags') || '';
      const tags = tagsData.toLowerCase().split(' ').filter(Boolean);
      
      const titleEl = article.querySelector('h2');
      const contentEl = article.querySelector('p');
      
      const titleText = titleEl?.textContent.toLowerCase() || '';
      const contentText = article.dataset.pureText?.toLowerCase() || '';
      const fullText = `${titleText} ${contentText}`; 
      
      let matchesTag = false;
      let matchesSearch = false;

      if (isSearching) {
        // SØKEMODUS: Vis alt på tvers av de tre andre kategoriene (ekskluder ren beginner)
        const isOnlyBeginner = tags.length === 1 && tags.includes('beginner');
        matchesTag = !isOnlyBeginner; 
        matchesSearch = searchWords.every(word => fullText.includes(word));
      } else {
        // VANLIG MODUS: Filtrer kun på den valgte aktive taggen
        matchesTag = tags.includes(currentTag.toLowerCase());
        matchesSearch = true; 
      }

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
        visibleCount++;
        
        if (isSearching && contentEl && article.dataset.pureText) {
          // 1. Forkort teksten hvis vi søker
          let shortText = article.dataset.pureText;
          if (shortText.length > MAX_SUMMARY_LENGTH) {
            shortText = shortText.substring(0, MAX_SUMMARY_LENGTH) + '...';
          }
          // 2. Legg på highlighting på den forkortede teksten
          if (titleEl) titleEl.innerHTML = getHighlightedHTML(article.dataset.origTitle, searchWords);
          contentEl.innerHTML = getHighlightedHTML(shortText, searchWords);
        } else {
          // TILBAKESTILL TIL FULL LENGDE (Når vi ikke søker lenger)
          if (titleEl) titleEl.innerHTML = article.dataset.origTitle || '';
          if (contentEl) contentEl.innerHTML = article.dataset.origContent || '';
        }
      } else {
        article.classList.add('hidden');
        if (titleEl) titleEl.innerHTML = article.dataset.origTitle || '';
        if (contentEl) contentEl.innerHTML = article.dataset.origContent || '';
      }
    });

    updateSearchUI(visibleCount, isSearching);
  }

  function updateSearchUI(count, isSearching) {
    if (searchCounter) {
      if (isSearching) {
        searchCounter.textContent = `Fant ${count} treff i avanserte kategorier`;
      } else {
        const activeBtn = Array.from(tagButtons).find(btn => btn.classList.contains('active'));
        searchCounter.textContent = `Viser ${count} artikler i "${activeBtn ? activeBtn.textContent : currentTag}"`;
      }
    }

    if (noResults) {
      if (count === 0) {
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
      }
    }
  }

  // Kjør filter ved oppstart
  filterArticles();

  // Søkefelt-event
  searchInput.addEventListener('input', function(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    
    if (searchQuery.length > 0) {
      resetBtn.classList.remove('invisible');
      tagButtons.forEach(btn => btn.classList.remove('active'));
    } else {
      resetBtn.classList.add('invisible');
      const activeBtn = Array.from(tagButtons).find(btn => 
        btn.getAttribute('data-value')?.toLowerCase() === currentTag.toLowerCase()
      );
      if (activeBtn) activeBtn.classList.add('active');
    }
    filterArticles();
  });

  // Nullstill-knapp
  resetBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchQuery = '';
    resetBtn.classList.add('invisible');
    
    const activeBtn = Array.from(tagButtons).find(btn => 
      btn.getAttribute('data-value')?.toLowerCase() === currentTag.toLowerCase()
    );
    if (activeBtn) activeBtn.classList.add('active');
    
    searchInput.focus();
    filterArticles();
  });

  // Tag-knapper
  tagButtons.forEach(button => {
    button.addEventListener('click', function() {
      searchInput.value = '';
      searchQuery = '';
      resetBtn.classList.add('invisible');

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
