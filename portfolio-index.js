// The original inline navigation remains available without dialog support.
(() => {
  const menu = document.getElementById('portfolio-index');
  const trigger = document.getElementById('open-index');
  const navigation = document.querySelector('.main-nav');
  if (!menu?.showModal || !trigger || !navigation) return;

  const list = menu.querySelector('nav');
  const preview = menu.querySelector('.index-picture');
  const images = {
    '#experience': ['assets/skills/pi-4-board.svg', 'hardware'],
    '#projects': ['assets/work/pixel-play-mark.svg', 'arcade'],
    '#lab': ['assets/skills/uno-r3-board.svg', 'hardware'],
    '#about': ['assets/city/city-night-mobile.webp', 'city'],
    '#contact': ['assets/mark.svg', 'mark']
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function showPreview(link) {
    if (menu.dataset.section === link.hash) return;
    menu.dataset.section = link.hash;
    const [src, kind] = images[link.hash] || images['#about'];
    preview.dataset.kind = kind;
    preview.src = src;
    if (!reduced.matches && !document.querySelector('#pause-scene[aria-pressed="true"]')) {
      preview.getAnimations?.().forEach(animation => animation.cancel());
      preview.animate?.([{opacity:.55, translate:'0 6px'}, {opacity:1, translate:'0 0'}],
        {duration:230, easing:'ease-out'});
    }
  }
  let destination = null;
  for (const original of navigation.querySelectorAll('a')) {
    const link = original.cloneNode(true);
    link.removeAttribute('aria-current');
    list.append(link);
    link.addEventListener('pointerenter', () => showPreview(link));
    link.addEventListener('focus', () => showPreview(link));
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      destination = document.getElementById(link.hash.slice(1));
      menu.close();
    });
  }
  trigger.addEventListener('click', () => {
    const current = navigation.querySelector('[aria-current]')?.hash;
    for (const link of list.querySelectorAll('a')) {
      if (link.hash === current) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
    destination = null;
    menu.showModal();
    document.documentElement.classList.add('index-open');
    trigger.setAttribute('aria-expanded','true');
    showPreview(list.querySelector('[aria-current]') || list.firstElementChild);
  });
  menu.querySelector('button').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded','false');
    document.documentElement.classList.remove('index-open');
    if (destination) {
      if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
      destination.focus({preventScroll:true});
      destination = null;
    }
  });
  trigger.hidden = false;
  navigation.hidden = true;
})();
