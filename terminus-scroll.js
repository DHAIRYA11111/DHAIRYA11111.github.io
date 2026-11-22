(() => {
  const root = document.documentElement;
  const contact = document.querySelector('#contact');
  const ticket = document.querySelector('#about .rail-ticket');
  if (!contact || !ticket || !('IntersectionObserver' in window)) return;

  const clamp = number => Math.max(0, Math.min(1, number));
  let frame = 0;
  let nearby = false;
  let lastProgress = -1;

  function draw() {
    frame = 0;
    if (!root.classList.contains('signal-motion')) return;
    const height = root.clientHeight;
    const y = window.scrollY;
    const top = contact.getBoundingClientRect().top + y;
    const start = Math.max(0, top - height * 1.06);
    // On a tall display the footer may arrive before Contact reaches mid-screen.
    const end = Math.min(root.scrollHeight - height, top - height * .12);
    const progress = end > start ? clamp((y - start) / (end - start)) : 1;
    if (progress === lastProgress) return;
    lastProgress = progress;

    // The ink advances at different rates on each edge, then settles flush.
    const left = clamp(progress / .82);
    const right = clamp((progress - .12) / .88);
    contact.style.setProperty('--ink-left', (100 * (1 - left)).toFixed(2) + '%');
    contact.style.setProperty('--ink-right', (100 * (1 - right)).toFixed(2) + '%');
    contact.style.setProperty('--tear-height', (1 - progress).toFixed(3));
    ticket.style.setProperty('--ticket-turn', (3 * progress).toFixed(2) + 'deg');
  }

  function queue() {
    if (!frame && nearby && root.classList.contains('signal-motion')) {
      frame = requestAnimationFrame(draw);
    }
  }

  contact.classList.add('ticket-arrival');
  ticket.classList.add('ticket-issued');
  const proximity = new IntersectionObserver(([entry]) => {
    nearby = entry.isIntersecting;
    if (nearby) queue();
  }, {rootMargin: '100% 0px'});
  proximity.observe(contact);
  new MutationObserver(queue).observe(root, {attributes: true, attributeFilter: ['class']});
  window.addEventListener('scroll', queue, {passive: true});
  window.addEventListener('resize', queue, {passive: true});
  window.addEventListener('pageshow', queue);
  if ('ResizeObserver' in window) new ResizeObserver(queue).observe(document.body);
  draw();
})();
