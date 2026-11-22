// Title staging, section arrivals and a short pointer afterimage for Night Line.
(() => {
  const hero = document.querySelector('#home');
  const title = document.querySelector('#hero-title');
  if (!hero || !title || title.dataset.choreographed) return;
  title.dataset.choreographed = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const pauseButton = document.querySelector('#pause-scene');
  const words = Array.from(title.children);
  const isEnabled = () => !reduced.matches && pauseButton?.getAttribute('aria-pressed') !== 'true';
  const listen = (query, handler) => query.addEventListener ? query.addEventListener('change', handler) : query.addListener(handler);
  let glyphIndex = 0;
  title.setAttribute('aria-label', title.getAttribute('aria-label') || title.textContent.trim());

  for (const word of words) {
    word.classList.add('motion-word');
    word.setAttribute('aria-hidden','true');
    const walker = document.createTreeWalker(word, NodeFilter.SHOW_TEXT);
    const leaves = [];
    while (walker.nextNode()) leaves.push(walker.currentNode);
    for (const text of leaves) {
      const content = document.createDocumentFragment();
      for (const char of text.textContent) {
        const glyph = document.createElement('i');
        glyph.className = 'motion-char';
        glyph.textContent = char;
        glyph.style.setProperty('--glyph-index', glyphIndex++);
        content.append(glyph);
      }
      text.replaceWith(content);
    }
    if (isEnabled()) word.classList.add('motion-name-enter');
  }
  function finishIntro() {
    words.forEach(word => word.classList.remove('motion-name-enter'));
  }
  setTimeout(finishIntro, 760 + glyphIndex * 25);

  let heroOnscreen = true;
  let scrollFrame = 0;
  function positionWords() {
    scrollFrame = 0;
    if (!isEnabled()) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
    hero.style.setProperty('--view-offset', Math.round(progress * 22) + 'px');
    const travel = Math.min(52, hero.clientWidth * .04) * progress;
    words.forEach((word, i) => {
      word.style.setProperty('--word-x', (travel * (i % 2 ? 1 : -.65)).toFixed(2) + 'px');
      word.style.setProperty('--word-y', (-travel * .20).toFixed(2) + 'px');
    });
  }
  function scheduleWords() {
    if (!scrollFrame && heroOnscreen && isEnabled()) scrollFrame = requestAnimationFrame(positionWords);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroOnscreen = entry.isIntersecting;
      if (heroOnscreen) scheduleWords();
    }).observe(hero);

  }
  addEventListener('scroll', scheduleWords, {passive:true});
  addEventListener('resize', scheduleWords, {passive:true});

  // The native cursor remains visible and retains the actual click target.
  // A second, short stroke follows fast movement, then settles into two corners on links.
  let tracker, tail, pointerFrame = 0, x = 0, y = 0, px = 0, py = 0, painting = false;
  let anchor = null, bounds = null;
  function createTracker() {
    const ns = 'http://www.w3.org/2000/svg';
    tracker = document.createElementNS(ns, 'svg');
    tracker.setAttribute('class','ds-pointer-track');
    tracker.setAttribute('viewBox','-14 -14 28 28');
    tracker.setAttribute('aria-hidden','true');
    tracker.setAttribute('focusable','false');
    tail = document.createElementNS(ns,'path');
    tail.setAttribute('class','ds-tail');
    const corners = document.createElementNS(ns,'path');
    corners.setAttribute('class','ds-reticle');
    corners.setAttribute('d','M-8 -4v-4h4 M8 4v4H4');
    tracker.append(tail,corners);
    document.body.append(tracker);
  }
  function clearPointer() {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    painting = false;
    anchor = bounds = null;
    tracker?.removeAttribute('data-visible');
    tracker?.removeAttribute('data-link');
  }
  function paintPointer() {
    pointerFrame = 0;
    if (!painting) return;
    let tx = x, ty = y;
    if (anchor && bounds) {
      // Move a few pixels toward the anchor centre, leaving the native hitbox untouched.
      tx += Math.max(-4, Math.min(4, (bounds.left + bounds.width/2 - x)*.10));
      ty += Math.max(-4, Math.min(4, (bounds.top + bounds.height/2 - y)*.12));
    }
    px += (tx - px)*.34;
    py += (ty - py)*.34;
    const dx = Math.max(-16, Math.min(16, x - px));
    const dy = Math.max(-16, Math.min(16, y - py));
    const moving = Math.hypot(tx - px, ty - py) > .35;
    tail.setAttribute('d', moving ? 'M0 0l'+dx.toFixed(1)+' '+dy.toFixed(1) : '');
    tracker.style.transform = 'translate3d('+(px-14).toFixed(1)+'px,'+(py-14).toFixed(1)+'px,0)';
    tracker.toggleAttribute('data-visible', moving || !!anchor);
    if (moving) pointerFrame = requestAnimationFrame(paintPointer);
  }
  function movePointer(event) {
    if (!isEnabled() || !fine.matches || event.pointerType !== 'mouse' || document.hidden) return;
    if (!tracker) createTracker();
    x = event.clientX;
    y = event.clientY;
    if (!painting) {px = x; py = y; painting = true;}
    const next = event.target.closest?.('a[href],button:not([disabled]),summary') || null;
    if (next !== anchor) {
      anchor = next;
      bounds = anchor ? anchor.getBoundingClientRect() : null;
      tracker.toggleAttribute('data-link',!!anchor);
    }
    if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
  }
  addEventListener('pointermove', movePointer, {passive:true});
  document.documentElement.addEventListener('pointerleave', clearPointer);
  addEventListener('pointercancel', clearPointer, {passive:true});
  addEventListener('blur', clearPointer);
  addEventListener('scroll', clearPointer, {passive:true});
  document.addEventListener('keydown', clearPointer);
  document.addEventListener('visibilitychange', clearPointer);

  function syncMotion() {
    if (!fine.matches || !isEnabled()) clearPointer();
    if (isEnabled()) return scheduleWords();
    finishIntro();
    hero.style.removeProperty('--view-offset');
    words.forEach(word => {word.style.removeProperty('--word-x'); word.style.removeProperty('--word-y');});
  }
  if (pauseButton) new MutationObserver(syncMotion).observe(pauseButton,{attributes:true,attributeFilter:['aria-pressed']});
  listen(reduced,syncMotion);
  listen(fine,syncMotion);
  syncMotion();
})();

// Let the role crossing the reading line drive both the records and their route map.
(() => {
  const section = document.getElementById('experience');
  const timeline = section?.querySelector('.fn-timeline');
  const track = section?.querySelector('.fn-meter-track');
  const counter = section?.querySelector('.fn-meter-number');
  const records = [...(timeline?.querySelectorAll('.fn-record') || [])];
  if (!track || !counter || !records.length) return;

  const period = document.createElement('span');
  period.className = 'fn-current-period';
  track.after(period);
  const stops = records.map(() => {
    const stop = document.createElement('span');
    stop.className = 'fn-route-stop';
    track.append(stop);
    return stop;
  });
  const periods = records.map(record => record.querySelector('.fn-period').textContent.trim());
  const total = String(records.length).padStart(2, '0');
  let active = -1;
  let visible = true;
  let frame = 0;

  function paint() {
    frame = 0;
    const readingLine = Math.max(80, document.documentElement.clientHeight * .42);
    const tops = records.map(record => record.getBoundingClientRect().top);
    let index = 0;
    while (index + 1 < tops.length && tops[index + 1] <= readingLine) index++;
    const nextTop = tops[index + 1];
    const fraction = nextTop === undefined ? 0 :
      Math.min(1, Math.max(0, (readingLine - tops[index]) / Math.max(1, nextTop - tops[index])));
    const progress = (index + fraction) / Math.max(1, records.length - 1);
    section.style.setProperty('--field-progress', progress.toFixed(4));
    if (active === index) return;
    active = index;
    records.forEach((record, i) => {
      record.toggleAttribute('data-passing', i === index);
      stops[i].toggleAttribute('data-reached', i <= index);
      stops[i].toggleAttribute('data-current', i === index);
    });
    period.textContent = periods[index];
    counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + total;
  }
  function queue() {
    if (visible && !frame) frame = requestAnimationFrame(paint);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      queue();
    }, {rootMargin: '100px'}).observe(timeline);
  }
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', queue, {passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(queue).observe(timeline);
  paint();
})();
