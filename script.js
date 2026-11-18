(() => {
  const clock = document.querySelector('#jaipur-time');
  const timeFormat = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', hour12:false});
  function tick() {
    const now = new Date();
    clock.textContent = timeFormat.format(now);
    clock.dateTime = now.toISOString();
  }
  tick();
  setInterval(tick, 30000);

  const button = document.querySelector('#pause-scene');
  if (window.portfolioScene) {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = false;
    function updateScene() {
      window.portfolioScene.setPaused(paused || preference.matches);
      button.hidden = preference.matches;
      button.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
      button.setAttribute('aria-label', paused ? 'Play city animation' : 'Pause city animation');
      button.setAttribute('aria-pressed', String(paused));
    }
    button.addEventListener('click', () => { paused = !paused; updateScene(); });
    preference.addEventListener('change', updateScene);
    updateScene();
  }

  const copy = document.querySelector('#copy-email');
  const status = document.querySelector('#copy-status');
  if (navigator.clipboard?.writeText) {
    copy.hidden = false;
    let timer;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('sansidhairya11@gmail.com');
        copy.textContent = 'Copied ✓';
        status.textContent = 'Email address copied.';
        clearTimeout(timer);
        timer = setTimeout(() => { copy.textContent = 'Copy email'; status.textContent = ''; }, 2400);
      } catch { status.textContent = 'Select the displayed email address to copy it.'; }
    });
  }
  const links = [...document.querySelectorAll('.main-nav a')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current','location');
          else link.removeAttribute('aria-current');
        });
      }
    }, {rootMargin:'-10% 0px -65% 0px'});
    sections.forEach(section => observer.observe(section));
  }
})();
