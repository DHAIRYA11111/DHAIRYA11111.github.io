(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!Element.prototype.animate) return;
  const layer = document.createElement('div');
  layer.className = 'coast-cut';
  layer.setAttribute('aria-hidden','true');
  const panels = [document.createElement('i'), document.createElement('i')];
  layer.append(...panels);
  document.body.append(layer);
  let sequence = 0;
  let animations = [];
  function clear() {
    sequence++;
    layer.style.visibility = 'hidden';
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target || reduced.matches || !document.documentElement.classList.contains('signal-motion')) return;
    const distance = target.getBoundingClientRect().top;
    if (Math.abs(distance) < innerHeight * .6) return;
    clear();
    const run = sequence;
    layer.style.visibility = 'visible';
    animations = panels.map((panel,index) => {
      const sign = index ? 1 : -1;
      return panel.animate([
        {transform:'translateX('+sign*100+'%)',opacity:.72},
        {transform:'translateX('+sign*21+'%)',opacity:.84,offset:.33},
        {transform:'translate('+sign*110+'%,'+(-Math.sign(distance)*8)+'%)',opacity:.35}
      ], {duration:420,easing:'cubic-bezier(.28,.6,.34,1)'});
    });
    Promise.allSettled(animations.map(animation=>animation.finished)).then(()=>{
      if(run===sequence) clear();
    });
  });
  reduced.addEventListener('change',clear);
  document.getElementById('pause-scene')?.addEventListener('click',clear);
})();
