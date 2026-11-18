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
    const sections = document.querySelectorAll('main > section:not(#home)');
    const arrivals = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        arrivals.unobserve(entry.target);
        if (!isEnabled()) continue;
        // Choose up to three editorial beats from this section. Large project cards
        // retain their own layout and interaction, even during their arrival.
        const candidates = [
          entry.target.querySelector('.section-kicker, .proj-kicker, .lab-rule'),
          entry.target.querySelector('h2'),
          entry.target.querySelector('.lab-select, .rail-ticket, .contact-actions, .proj-tile'),
        ].filter(Boolean);
        candidates.forEach((node, i) => {
          const className = node.classList.contains('lab-rule') ? 'ds-arrival-rule' : 'ds-scroll-beat';
          node.style.setProperty('--beat-delay', (i * 65) + 'ms');
          node.classList.add(className);
          setTimeout(() => {node.classList.remove(className); node.style.removeProperty('--beat-delay');}, 950);
        });
      }
    }, {rootMargin:'0px 0px -5% 0px',threshold:0});
    sections.forEach(section => arrivals.observe(section));
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
    words.forEach(word => {word.style.removeProperty('--word-x'); word.style.removeProperty('--word-y');});
    document.querySelectorAll('.ds-scroll-beat,.ds-arrival-rule').forEach(node=>node.classList.remove('ds-scroll-beat','ds-arrival-rule'));
  }
  if (pauseButton) new MutationObserver(syncMotion).observe(pauseButton,{attributes:true,attributeFilter:['aria-pressed']});
  listen(reduced,syncMotion);
  listen(fine,syncMotion);
  syncMotion();
})();

// Each experience is a stop on the same line. Track the stop crossing the
// reading band independently of the entrance animation on its text.
(() => {
  const panel = document.querySelector('.field-notes');
  if (!panel || !('IntersectionObserver' in window)) return;
  const records = [...panel.querySelectorAll('.fn-record')];
  const indicator = panel.querySelector('.fn-meter-number');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = document.querySelector('#pause-scene');
  const passing = new IntersectionObserver(entries => {
    const hit = entries.filter(entry=>entry.isIntersecting).at(-1);
    if (!hit) return;
    const index = records.indexOf(hit.target);
    records.forEach(record=>record.toggleAttribute('data-passing',record===hit.target));
    panel.style.setProperty('--field-progress',String((index+1)/records.length));
    if (indicator) indicator.textContent = String(index+1).padStart(2,'0')+' / '+String(records.length).padStart(2,'0');
  },{rootMargin:'-24% 0px -50% 0px'});
  records.forEach(record=>passing.observe(record));

  const subjects = document.querySelectorAll('.fn-record article,.fn-skills dl>div,.proj-grid>a,.proj-link,.origin-text>p:not(.section-kicker),.lab-caption');
  const entrance = new IntersectionObserver(entries => {
    const visible = entries.filter(entry=>entry.isIntersecting);
    visible.forEach(({target},index) => {
      entrance.unobserve(target);
      if (reduced.matches || pause?.getAttribute('aria-pressed')==='true' || !target.animate) return;
      target.animate([{opacity:.25,transform:'translateY(28px) scale(.985)'},{opacity:1,transform:'none'}],
        {duration:620,delay:index*45,easing:'cubic-bezier(.16,1,.3,1)'});
    });
  },{threshold:.07});
  subjects.forEach(el=>entrance.observe(el));
})();
