document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  const searchCounter = document.getElementById('searchCounter');
  const noResults = document.getElementById('noResults');
  
  let currentTag = 'beginner';
  let searchQuery = '';

  // Lagre original HTML for utheving (highlighting)
  articles.forEach(article => {
    const titleEl = article.querySelector('h2');
    const contentEl = article.querySelector('p');
    if (titleEl) article.dataset.origTitle = titleEl.innerHTML;
    if (contentEl) article.dataset.origContent = contentEl.innerHTML;

    // Gjør artikkelen visuelt klikkbar via JavaScript (eller legg til cursor: pointer i CSS)
    article.style.cursor = 'pointer';
    
    // HÅNDTER KLIKK PÅ ARTIKKEL
    article.addEventListener('click', function() {
      const tagsData = this.getAttribute('data-tags') || '';
      const tags = tagsData.toLowerCase().split(' ').filter(Boolean);
      
      // Finn den første taggen som IKKE er 'beginner'
      const newTag = tags.find(tag => tag !== 'beginner');
      
      if (newTag) {
        // 1. Oppdater den aktive variabelen
        currentTag = newTag;
        
        // 2. Tøm søket siden brukeren nå har valgt en spesifikk artikkel/kategori
        searchInput.value = '';
        searchQuery = '';
        resetBtn.classList.add('invisible');
        
        // 3. Oppdater tag-knappene visuelt
        tagButtons.forEach(btn => {
          if (btn.getAttribute('data-value')?.toLowerCase() === newTag) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        
        // 4. Kjør filteret på nytt (dette vil nå vise alle artikler i den nye kategorien)
        filterArticles();
        
        // Valgfritt: Her kan du legge til kode for å åpne en modal, 
        // gå til en ny lenke, eller rulle til toppen.
        console.log(`Åpnet artikkel: ${titleEl?.textContent}. Kategori satt til: ${newTag}`);
      }
    });
  });

  // Sett standardknapp ved oppstart
  const defaultButton = Array.from(tagButtons).find(btn => 
    btn.getAttribute('data-value')?.toLowerCase() === currentTag
  );
  if (defaultButton) defaultButton.classList.add('active');

  // Hjelpefunksjon for utheving
  function highlightText(element, words) {
    if (!element) return;
    let html = element.tagName === 'H2' 
      ? element.closest('.filterable').dataset.origTitle 
      : element.closest('.filterable').dataset.origContent;
    
    if (words.length === 0 || !html) {
      element.innerHTML = html || '';
      return;
    }
    words.forEach(word => {
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
      
      let matchesTag = false;
      let matchesSearch = false;

      if (isSearching) {
        // SØKEMODUS: Søk i alt innhold, MINUS artikler som BARE har 'beginner'
        const isOnlyBeginner = tags.length === 1 && tags.includes('beginner');
        
        matchesTag = !isOnlyBeginner; 
        matchesSearch = searchWords.every(word => fullText.includes(word));
      } else {
        // VANLIG MODUS: Filtrer kun på den valgte aktive taggen
        matchesTag = tags.includes(currentTag.toLowerCase());
        matchesSearch = true; // Ingen søkeord betyr at alt i kategorien matcher
      }

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
        visibleCount++;
        
        if (titleEl) highlightText(titleEl, searchWords);
        if (contentEl) highlightText(contentEl, searchWords);
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
        searchCounter.textContent = `Fant ${count} relevante treff utenfor nybegynner-kategorien`;
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
      // Slå av tag-knappene visuelt mens vi søker i "alt"
      tagButtons.forEach(btn => btn.classList.remove('active'));
    } else {
      resetBtn.classList.add('invisible');
      // Sett tilbake den visuelle knappen når søket tømmes
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
      // Hvis man trykker på en tag manuelt, nullstiller vi søket
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
