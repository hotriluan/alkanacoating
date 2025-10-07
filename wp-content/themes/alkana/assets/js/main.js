// Minimal JS for Alkana theme
(function(){
  // Example: add a class when JS is enabled
  document.documentElement.classList.add('js');

  // Mobile menu toggle (if a button with data-toggle="primary-menu" exists)
  const toggle = document.querySelector('[data-toggle="primary-menu"]');
  const menu = document.querySelector('.site-nav');
  if (toggle && menu) {
    toggle.addEventListener('click', function(){
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open');
    });
  }
})();
