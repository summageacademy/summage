// Icon fallback
    document.querySelectorAll('.nav-btn img').forEach(img => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const fb = document.createElement('span');
        fb.textContent = '•';
        fb.style.fontSize = '20px';
        img.parentNode.appendChild(fb);
      });
    });

    // Loader
    document.addEventListener('DOMContentLoaded', () => {
      const loader = document.getElementById('loader');
      const VISIBLE_MS = 600, REMOVE_AFTER_FADE_MS = 220;
      if (!loader) {
        document.body.classList.remove('no-scroll');
        return;
      }
      setTimeout(() => {
        loader.classList.add('loaded');
        setTimeout(() => {
          if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
          document.body.classList.remove('no-scroll');
        }, REMOVE_AFTER_FADE_MS);
      }, VISIBLE_MS);
    });

    const blogsBtn = document.getElementById('blogs');
    if (blogsBtn) {
      blogsBtn.addEventListener('click', () => {
        window.location.href = 'blogs.html';
      });
    }

// Mobile sidebar logic
    (function () {
      const hamburger = document.getElementById('hamburgerBtn');
      const overlay = document.getElementById('sidebarOverlay');
      const sidebar = document.getElementById('sidebar');
      const closeBtn = document.getElementById('sidebarCloseBtn');

      const openSidebar = () => {
        if (!overlay || !sidebar || !hamburger) return;
        overlay.classList.add('open');
        sidebar.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
      };

      const closeSidebar = () => {
        if (!overlay || !sidebar || !hamburger) return;
        overlay.classList.remove('open');
        sidebar.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
      };

      if (hamburger) {
        hamburger.addEventListener('click', e => {
          e.stopPropagation();
          if (window.innerWidth >= 768) return;
          openSidebar();
        });
      }
      if (overlay) overlay.addEventListener('click', closeSidebar);
      if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeSidebar();
      });

      let lastFocus = null;
      const trapFocusOnOpen = () => {
        lastFocus = document.activeElement;
        const focusable = sidebar.querySelectorAll('button,a,[tabindex]:not([tabindex="-1"])');
        if (focusable && focusable.length) focusable[0].focus();
      };
      const restoreFocusOnClose = () => {
        if (lastFocus) lastFocus.focus();
        lastFocus = null;
      };

      if (hamburger) hamburger.addEventListener('click', trapFocusOnOpen);
      if (closeBtn) closeBtn.addEventListener('click', restoreFocusOnClose);
      if (overlay) overlay.addEventListener('click', restoreFocusOnClose);

      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeSidebar();
      });
    })();

    // === RANDOM QUOTE FOR PC SIDEBAR ===
(function () {
  const quotes = [
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" }
  ];

  const quoteEl = document.querySelector('#pcQuote .quote-text');
  const authorEl = document.querySelector('#pcQuote .quote-author');

  function showRandomQuote() {
    if (!quoteEl || !authorEl) return;
    const { text, author } = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.textContent = `“${text}”`;
    authorEl.textContent = `— ${author}`;
  }

  // Run on load
  if (window.innerWidth >= 1024) {
    showRandomQuote();
  }

  // Re-run if user resizes into desktop view
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && quoteEl && quoteEl.textContent === '') {
      showRandomQuote();
    }
  });
})();
