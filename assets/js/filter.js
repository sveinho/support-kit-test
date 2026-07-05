document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  const searchCounter = document.getElementById('searchCounter');
  const noResults = document.getElementById('noResults');
  
  let currentTag = 'beginner';
  let searchQuery = '';

  // Lagre original HTML for tittel og tekst så vi kan tilbakestille highlighting
  articles.forEach(article => {
    const titleEl = article.querySelector('h2');
    const contentEl = article.querySelector('p');
    if (titleEl) article.dataset.origTitle = titleEl.innerHTML;
    if (contentEl) article.dataset.origContent = contentEl.innerHTML;
  });

  const defaultButton = Array.from(tagButtons).find(btn => 
    btn.getAttribute('data-value')?.toLowerCase() === currentTag
  );
  if (defaultButton) {
    defaultButton.classList.add('active');
  }

  // Hjelpefunksjon for å utheve tekst trygt uten å ødelegge HTML-tagger
  function highlightText(element, words) {
    if (!element || !element.dataset.origTitle && !element.dataset.origContent) return;
    
    // Hent den rene, originale HTML-en vi lagret ved oppstart
    let html = element.tagName === 'H2' ? element.closest('.filterable').dataset.origTitle : element.closest('.filterable').dataset.origContent;
    
    if (words.length === 0) {
      element.innerHTML = html;
      return;
    }

    // Gå gjennom hvert søkeord og legg til <mark>-tagger rundt dem
    words.forEach(word => {
      // Regex som finner ordet uavhengig av store/små bokstaver, men hopper over ord inni HTML-tagger
      const regex = new RegExp(`(${word})(?![^<]*>|[^<>]*</)`, 'gi');
      html = html.replace(regex, '<mark>$1</mark>');
    });
    
    element.innerHTML = html;
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
      const contentText = contentEl?.textContent.toLowerCase() || '';
      const fullText = `${titleText} ${contentText}`; 
      
      // LOGIKK-ENDRING: Hvis brukeren søker, ignorerer vi tag-filteret helt (matchesTag blir true)
      const matchesTag = isSearching ? true : tags.includes(currentTag.toLowerCase());
      const matchesSearch = searchWords.every(word => fullText.includes(word));

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
        visibleCount++;
        
        // Siden artikkelen skal vises, legger vi på highlighting på tekstene
        if (titleEl) highlightText(titleEl, searchWords);
        if (contentEl) highlightText(contentEl, searchWords);
      } else {
        article.classList.add('hidden');
        
        // Nullstill tekst hvis den er skjult
        if (titleEl) titleEl.innerHTML = article.dataset.origTitle || '';
        if (contentEl) contentEl.innerHTML = article.dataset.origContent || '';
      }
    });

    updateSearchUI(visibleCount);
  }

  function updateSearchUI(count) {
    if (searchCounter) {
      if (searchQuery === '') {
        searchCounter.textContent = `Viser ${count} artikler i kategorien "${currentTag}"`;
      } else {
        searchCounter.textContent = `Fant ${count} treff i hele kunnskapsbasen`;
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

  // Kjør filteret ved oppstart
  filterArticles();

  // Søkefelt-event
  searchInput.addEventListener('input', function(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    
    if (searchQuery.length > 0) {
      resetBtn.classList.remove('invisible');
      // Deaktiver alle tag-knapper visuelt når man søker globalt
      tagButtons.forEach(btn => btn.classList.remove('active'));
    } else {
      resetBtn.classList.add('invisible');
      // Når søket tømmes, aktiverer vi knappen til den gjeldende taggen igjen
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
    
    // Sett visuell knapp tilbake til gjeldende tag
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
      // Hvis man trykker på en tag, tømmer vi søkefeltet samtidig for best UX
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
