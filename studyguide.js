document.addEventListener('DOMContentLoaded', () => {
  const pcSidebar = document.getElementById('pcSidebar');
  if (!pcSidebar) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'pcSidebarOverlay';
  document.body.appendChild(overlay);

  // Create toggle button
  const toggle = document.createElement('button');
  toggle.id = 'pcSidebarToggle';
  toggle.setAttribute('aria-label', 'Toggle menu');
  toggle.innerHTML = `<span class="hamburger-icon" aria-hidden="true"></span>`;
  document.body.appendChild(toggle);

  // Toggle function
  const open = () => {
    pcSidebar.classList.add('open');
    overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    pcSidebar.classList.remove('open');
    overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => pcSidebar.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);

  // Random quote
  const quotes = [
    {text:"The best way to predict the future is to invent it.",author:"Alan Kay"},
    {text:"Success is not final, failure is not fatal.",author:"Winston Churchill"},
    {text:"Don’t watch the clock; do what it does.",author:"Sam Levenson"}
  ];
  const {text, author} = quotes[Math.floor(Math.random() * quotes.length)];
  document.querySelector('#pcQuote .quote-text').textContent = `"${text}"`;
  document.querySelector('#pcQuote .quote-author').textContent = `— ${author}`;
});