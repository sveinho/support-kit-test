document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  const searchCounter = document.getElementById('searchCounter');
  const noResults = document.getElementById('noResults');
  
  // 1. ENDRING: Sett 'all' som standardverdi ved oppstart
  let currentTag = 'all';
  let searchQuery = '';
  const MAX_SUMMARY_LENGTH = 100;

  // Lagre original HTML og ren tekst ved oppstart
  articles.forEach(article => {
    const titleEl = article.querySelector('h2');
    const contentEl = article.querySelector('p');
    
    if (titleEl) {
      article.dataset.origTitle = titleEl.innerHTML;
      article.dataset.pureTitle = titleEl.textContent.trim().toLowerCase();
    }
    if (contentEl) {
      article.dataset.origContent = contentEl.innerHTML;
      article.dataset.pureText = contentEl.textContent.replace(/\u00AD/g, '').trim().toLowerCase();
    }

    // Klikk på artikkel (nullstiller søk og hopper inn i artikkelens spesifikke tag)
    article.addEventListener('click', function() {
      const tagsData = this.getAttribute('data-tags') || '';
      const tags = tagsData.toLowerCase().split(' ').filter(Boolean);
      
      // Finn en tag som IKKE er 'all'. Hvis den kun har 'all', blir den i 'all'.
      const newTag = tags.find(tag => tag !== 'all') || 'all';
      
      currentTag = newTag;
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
      
      filterArticles();
      this.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Sett 'all'-knappen som aktiv i grensesnittet ved oppstart
  const defaultButton = Array.from(tagButtons).find(btn => 
    btn.getAttribute('data-value')?.toLowerCase() === currentTag
  );
  if (defaultButton) defaultButton.classList.add('active');

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function getHighlightedHTML(originalHTML, words) {
    if (words.length === 0 || !originalHTML) return originalHTML;
    let html = originalHTML;
    words.forEach(word => {
      const safeWord = escapeRegExp(word);
      const regex = new RegExp(`(${safeWord})(?![^<]*>|[^<>]*</)`, 'gi');
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
      
      const titleText = article.dataset.pureTitle || '';
      const contentText = article.dataset.pureText || '';
      const fullText = `${titleText} ${contentText}`; 
      
      // 2. ENDRING: SØKELOGIKK. Hvis currentTag er 'all', matcher alle artikler tag-sjekken.
      // Hvis ikke, må artikkelen ha den spesifikke taggen.
      const matchesTag = (currentTag.toLowerCase() === 'all' || tags.includes(currentTag.toLowerCase()));
      const matchesSearch = searchWords.every(word => fullText.includes(word));

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
        visibleCount++;
        
        if (isSearching && contentEl && article.dataset.pureText) {
          let shortText = article.querySelector('p').textContent; 
          if (shortText.length > MAX_SUMMARY_LENGTH) {
            shortText = shortText.substring(0, MAX_SUMMARY_LENGTH) + '...';
          }
          if (titleEl) titleEl.innerHTML = getHighlightedHTML(article.dataset.origTitle, searchWords);
          contentEl.innerHTML = getHighlightedHTML(shortText, searchWords);
        } else {
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
      const activeBtn = Array.from(tagButtons).find(btn => btn.classList.contains('active'));
      const tagNameVisible = activeBtn ? activeBtn.textContent : currentTag;

      if (isSearching) {
        searchCounter.textContent = `Fant ${count} treff i "${tagNameVisible}"`;
      } else {
        searchCounter.textContent = `Viser ${count} artikler i "${tagNameVisible}"`;
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

  filterArticles();

  // Søkefelt-event (Beholder nå den aktive taggen uansett om det er 'all' eller en spesifikk kategori)
  searchInput.addEventListener('input', function(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    if (searchQuery.length > 0) {
      resetBtn.classList.remove('invisible');
    } else {
      resetBtn.classList.add('invisible');
    }
    filterArticles();
  });

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
      // Tømmer søket når man manuelt trykker på en ny kategori for renere UX
      searchInput.value = '';
      searchQuery = '';
      resetBtn.classList.add('invisible');

      const clickedTag = this.getAttribute('data-value');
      
      // Hvis man klikker av en aktiv tag, faller vi tilbake til 'all'
      if (currentTag.toLowerCase() === clickedTag?.toLowerCase()) {
        this.classList.remove('active');
        currentTag = 'all';
        const allBtn = Array.from(tagButtons).find(btn => btn.getAttribute('data-value')?.toLowerCase() === 'all');
        if (allBtn) allBtn.classList.add('active');
      } else {
        tagButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentTag = clickedTag;
      }
      filterArticles();
    });
  });
});
