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
    const progress = distance > 1 ? clamp((inset - runway.getBoundingClientRect().top) / distance) : 0;
    const reveal = clamp((progress - .30) / .48);
    home.style.setProperty('--travel', progress.toFixed(4));
    home.style.setProperty('--letter-exit', clamp(progress / .47).toFixed(4));
    home.style.setProperty('--chapter', reveal.toFixed(4));
    copy.inert = progress > .55 && !copy.contains(document.activeElement);
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
