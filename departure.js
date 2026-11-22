(() => {
  const home = document.querySelector('#home');
  const runway = home.parentElement;
  const mast = document.querySelector('.mast');
  const copy = home.querySelector('.hero-copy');
  const clamp = n => Math.min(1, Math.max(0, n));
  let frame = 0, inset = 0;
  function paint() {
    frame = 0;
    const distance = runway.offsetHeight - home.offsetHeight;
    const scrolled = inset - runway.getBoundingClientRect().top;
    const compact = distance <= 1;
    const range = compact ? Math.min(home.offsetHeight, innerHeight) * .72 : distance;
    const progress = document.documentElement.classList.contains('signal-motion')
      ? clamp(scrolled / Math.max(1, range)) : 0;
    const reveal = clamp((progress - .30) / .48);
    home.style.setProperty('--travel', progress.toFixed(4));
    home.style.setProperty('--letter-exit', clamp(progress / .47).toFixed(4));
    home.style.setProperty('--chapter', reveal.toFixed(4));
    copy.inert = !compact && progress > .55 && !copy.contains(document.activeElement);
    home.dispatchEvent(new CustomEvent('departureprogress', {detail: progress}));
  }
  function queue() {if (!frame) frame = requestAnimationFrame(paint)}
  function size() {
    inset = getComputedStyle(mast).position === 'sticky' ? mast.offsetHeight : 0;
    runway.style.setProperty('--mast-height', inset + 'px');
    runway.classList.toggle('can-hold', home.offsetHeight <= innerHeight - inset + 2);
    queue();
  }
  new ResizeObserver(size).observe(home);
  new ResizeObserver(size).observe(mast);
  new MutationObserver(queue).observe(document.documentElement, {attributes:true,attributeFilter:['class']});
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',size);
  size();
})();
