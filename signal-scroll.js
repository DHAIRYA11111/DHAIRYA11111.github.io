// Separate word spans preserve wrapping and the original text in the document.
(() => {
  const root = document.documentElement;
  const pause = document.getElementById('pause-scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const names = [...document.querySelectorAll('.fn-org,.fn-record h3')];
  for (const name of names) {
    const words = name.textContent.trim().split(/\s+/);
    const fragment = document.createDocumentFragment();
    words.forEach((word,index) => {
      if (index) fragment.append(' ');
      const span = document.createElement('span');
      span.className = 'letterpress-word';
      span.textContent = word;
      span.style.setProperty('--word-start', .6 * index / Math.max(1,words.length-1));
      fragment.append(span);
    });
    name.replaceChildren(fragment);
  }

  const elements = [...document.querySelectorAll(
    '.hero-line,.hello,.hero-intro,.hero-actions,.strip-inner>span,.fn-meter,.fn-jump,.fn-heading>div:first-child,.fn-period,.fn-record article>p:last-child,.fn-skills header,.fn-skills dl>div,' +
    '.proj-heading,.proj-tile,.lab-header,.lab-select button,.lab-card-content figure,.lab-caption,' +
    '.origin-text>*,.rail-ticket,.terminus h2,.terminus .section-kicker,.contact-actions>*,.endbar>div>*'
  )];
  for (const [index,el] of [...elements,...names].entries()) {
    if (index < elements.length) el.classList.add('press-entry');
    el.style.setProperty('--slide-side',index % 2 ? 1 : -1);
  }
  const projects = document.querySelector('#projects');
  const gallery = projects.querySelector('.proj-inner');
  const logos = [...gallery.querySelectorAll('.proj-tile')];
  function sizeGallery() {
    projects.classList.toggle('pin-gallery',gallery.offsetHeight + 155 < innerHeight);
    queue();
  }
  const bands = [...document.querySelectorAll('.signal-line')];
  const cloth = new Map(bands.map(band => [band,[...band.querySelectorAll('.signal-cloth')]]));
  const visible = new Set();
  let frame = 0;
  function paint() {
    frame = 0;
    if (!root.classList.contains('signal-motion')) return;
    const height = document.documentElement.clientHeight;
    const atEnd = scrollY + height >= document.documentElement.scrollHeight - 2;
    const positions = [...visible].map(el => [el,el.getBoundingClientRect().top]);
    const galleryPinned = projects.classList.contains('pin-gallery');
    const galleryTop = projects.getBoundingClientRect().top;
    for (const [el,top] of positions) {
      if (cloth.has(el)) {
        cloth.get(el).forEach((flag,i) => {
          const phase = top / 70 + i * .83;
          const wave = Math.sin(phase);
          flag.setAttribute('transform','skewX('+(wave*13).toFixed(2)+') scale(' +
            (.93+.07*Math.cos(phase)).toFixed(3)+' '+(.95+.05*wave).toFixed(3)+')');
        });
      } else {
        const logoIndex = logos.indexOf(el);
        const travel = galleryPinned && logoIndex >= 0
          ? (.60 - galleryTop / height - logoIndex * .21) / .38
          : (height * .98 - top) / (height * .31);
        const progress = atEnd ? 1 : Math.min(1,Math.max(0,travel));
        el.style.setProperty('--print-progress',progress.toFixed(4));
      }
    }
  }
  function queue() { if (!frame && root.classList.contains('signal-motion')) frame=requestAnimationFrame(paint); }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else {
        visible.delete(entry.target);
        entry.target.style.removeProperty('--print-progress');
      }
    }
    queue();
  },{rootMargin:'200px 65%'});
  [...names,...elements,...bands].forEach(el=>observer.observe(el));
  function sync() {
    const enabled = !reduced.matches && pause?.getAttribute('aria-pressed')!=='true';
    root.classList.toggle('signal-motion',enabled);
    if (enabled) queue();
    else for (const flags of cloth.values()) for (const flag of flags) flag.removeAttribute('transform');
  }
  reduced.addEventListener('change',sync);
  new MutationObserver(sync).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
  addEventListener('scroll',queue,{passive:true});
  new ResizeObserver(sizeGallery).observe(gallery);
  addEventListener('resize',sizeGallery,{passive:true});
  sizeGallery();
  sync();
})();
