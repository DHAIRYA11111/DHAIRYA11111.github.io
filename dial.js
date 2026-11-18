// Keep native wheel, touch and keyboard scrolling. The index is mechanical
// feedback only, and the whole instrument is a standard section link.
(() => {
  const dial = document.querySelector('.station-dial');
  const hero = document.getElementById('home');
  const pause = document.getElementById('pause-scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let onscreen = true;
  let frame = 0;
  function refresh() {
    frame = 0;
    const stopped = !onscreen || document.hidden || reduced.matches || pause.getAttribute('aria-pressed') === 'true';
    dial.toggleAttribute('data-still', stopped);
    if (!stopped) dial.style.setProperty('--dial-angle', (scrollY * .76).toFixed(1) + 'deg');
  }
  function queue() {
    if (!frame) frame = requestAnimationFrame(refresh);
  }
  addEventListener('scroll', () => { if (onscreen) queue(); }, {passive:true});
  reduced.addEventListener('change',queue);
  document.addEventListener('visibilitychange',queue);
  new MutationObserver(queue).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
  new IntersectionObserver(([entry]) => { onscreen = entry.isIntersecting; queue(); }).observe(hero);
  refresh();
})();
