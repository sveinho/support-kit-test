document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetSearchBtn');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const articles = document.querySelectorAll('.filterable');
  
  const searchCounter = document.getElementById('searchCounter');
  const noResults = document.getElementById('noResults');
  
  let currentTag = 'beginner';
  let searchQuery = '';
  const MAX_SUMMARY_LENGTH = 100;

  // 1. FORBEDRING: Lagre 100 % ren tekst fri for HTML-tagger og skjulte tegn
  articles.forEach(article => {
    const titleEl = article.querySelector('h2');
    const contentEl = article.querySelector('p');
    
    if (titleEl) {
      article.dataset.origTitle = titleEl.innerHTML;
      // .textContent fjerner alle <strong>, <a> osv, og gir ren tekst
      article.dataset.pureTitle = titleEl.textContent.trim().toLowerCase();
    }
    if (contentEl) {
      article.dataset.origContent = contentEl.innerHTML;
      // Renser bort HTML-tagger og erstatter usynlige orddelingstegn (&shy;)
      article.dataset.pureText = contentEl.textContent.replace(/\u00AD/g, '').trim().toLowerCase();
    }

    // Klikk på artikkel
    article.addEventListener('click', function() {
      const tagsData = this.getAttribute('data-tags') || '';
      const tags = tagsData.toLowerCase().split(' ').filter(Boolean);
      const newTag = tags.find(tag => tag !== 'beginner');
      
      if (newTag) {
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
      }
    });
  });

  const defaultButton = Array.from(tagButtons).find(btn => 
    btn.getAttribute('data-value')?.toLowerCase() === currentTag
  );
  if (defaultButton) defaultButton.classList.add('active');

  // 2. FORBEDRING: Gjør søkeordene trygge for RegEx (escaper ?, +, ., etc.)
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function getHighlightedHTML(originalHTML, words) {
    if (words.length === 0 || !originalHTML) return originalHTML;
    let html = originalHTML;
    words.forEach(word => {
      const safeWord = escapeRegExp(word);
      // Finner ordet uten å ødelegge eksisterende HTML-tagger
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
      
      // 3. FORBEDRING: Søk KUN i de ferdigvaskede tekstindeksene (ingen HTML-støy)
      const titleText = article.dataset.pureTitle || '';
      const contentText = article.dataset.pureText || '';
      const fullText = `${titleText} ${contentText}`; 
      
      let matchesTag = false;
      let matchesSearch = false;

      if (isSearching) {
        const isOnlyBeginner = tags.length === 1 && tags.includes('beginner');
        matchesTag = !isOnlyBeginner; 
        matchesSearch = searchWords.every(word => fullText.includes(word));
      } else {
        matchesTag = tags.includes(currentTag.toLowerCase());
        matchesSearch = true; 
      }

      if (matchesTag && matchesSearch) {
        article.classList.remove('hidden');
        visibleCount++;
        
        if (isSearching && contentEl && article.dataset.pureText) {
          // Finn opprinnelig ren tekst for forkorting
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

  filterArticles();

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
