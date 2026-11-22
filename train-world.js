// Night Line: a separate foreground rail follows native scroll in either direction.
(() => {
  const hero = document.getElementById('home');
  if (!hero || hero.querySelector('.ds-train-world')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = document.getElementById('pause-scene');
  const ns = 'http://www.w3.org/2000/svg';
  const layer = document.createElement('div');
  layer.className = 'ds-train-world';
  layer.setAttribute('aria-hidden','true');
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('preserveAspectRatio','none');
  svg.setAttribute('focusable','false');

  const carLength = 117;
  const carCount = 5;
  const windows = (count,start,seed) => Array.from({length:count}, (_,i) => {
    const x=start+i*12;
    const light=['#ffd5a1','#e7aa71','#ffe5ba','#bd8b68'][(i*3+seed)%4];
    return '<rect x="'+x+'" y="36" width="9" height="8" rx="1" fill="'+light+'"/>'+
      '<path d="M'+(x+4.6)+' 36v8" stroke="#433d39" stroke-width=".7"/>';
  }).join('');
  function carriage(i) {
    const front = i===carCount-1;
    const body = front
      ? 'M2 32q0-6 9-6h54q19 0 28 8l21 18q5 5 0 10l-8 3H3Z'
      : i===0
        ? 'M2 50l10-15q7-9 19-9h77q6 0 6 6v33H3Z'
        : 'M2 32q0-6 8-6h96q8 0 8 6v33H2Z';
    const carriageWindows= windows(front?5:7,i===0?23:8,i);
    const cab=front?'<path d="M72 31q11 1 18 7l14 12-19-4Z" fill="#7b99aa"/><path d="m80 34 6 10" stroke="#1c2c34" stroke-width="2"/><path d="m106 53 10 4-1 2-9-2Z" fill="#fff0c5"/><path d="M113 56l41 7-38-1Z" fill="url(#ds-head-beam)"/>':'';
    const roof = i%2===0?'<path d="M28 26v-3h26v3m10 0v-4h13v4" fill="#243143" stroke="#4d5558" stroke-width=".75"/>':'<path d="m46 26 12-9 10 7m-20-2 13-7m-8 0h14" stroke="#92908a" stroke-width="1" fill="none"/>';
    const door=front?'<path d="M64 35v23h9V36" fill="none" stroke="#62656a" stroke-width=".8"/>':'<path d="M92 35v23h13V35Zm6.5 0v23" fill="none" stroke="#7a7a78" stroke-width=".8"/><path d="M94 37h2v7h-2zm6 0h3v7h-3Z" fill="#cfaa82"/>';
    return '<g transform="translate('+(i*carLength)+' 0)">'+roof+
      '<g fill="#10161e" stroke="#2e343c" stroke-width="1"><path d="M12 61h81v7H11Z"/><circle cx="20" cy="66" r="5"/><circle cx="32" cy="66" r="5"/><circle cx="86" cy="66" r="5"/><circle cx="97" cy="66" r="5"/></g>'+
      '<path d="'+body+'" fill="url(#ds-car-skin)" stroke="#10151e" stroke-width="1.4"/><path d="M9 31h'+(front?'58':'95')+'" stroke="#938d7f" opacity=".72"/>'+
      carriageWindows+door+cab+'<path d="M5 51h'+(front?'85':'107')+'" stroke="#dc6551" stroke-width="2.2"/><path d="M5 54h'+(front?'91':'107')+'" stroke="#6c372e" stroke-width="1"/>'+
      '<path d="M12 61h'+(front?'86':'88')+'" stroke="#59606b" stroke-width=".75"/>'+
      (front?'':'<path d="M114 33h5v28h-5z" fill="#080d15"/><path d="M115 38v19" stroke="#5b626e" stroke-width=".85"/>')+'</g>';
  }

  svg.innerHTML='<defs>'+
    '<linearGradient id="ds-car-skin" x2=".1" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#414750"/><stop offset=".27" stop-color="#202931"/><stop offset=".62" stop-color="#141c26"/><stop offset="1" stop-color="#0b111b"/></linearGradient>'+
    '<linearGradient id="ds-head-beam"><stop stop-color="#ffedbc" stop-opacity=".55"/><stop offset="1" stop-color="#ffdab7" stop-opacity="0"/></linearGradient>'+
    '<pattern id="ds-back-girder" width="162" height="100" patternUnits="userSpaceOnUse"><path d="M0 62h162v3H0ZM18 65h6v35h-6Z" fill="#293140"/><path d="m19 94 31-30m103 30-32-30" fill="none" stroke="#2a3443" stroke-width="2"/></pattern>'+
    '<pattern id="ds-front-girder" width="94" height="100" patternUnits="userSpaceOnUse"><path d="M0 74h94v24H0Z" fill="#0e151e"/><path d="M0 77h94M0 94h94" stroke="#54535a" stroke-width="1.4"/><path d="m0 93 23-15 23 15 24-15 24 15" fill="none" stroke="#39414a" stroke-width="2"/><path d="M8 77h6" stroke="#e4ad82" stroke-width="1.5"/><path d="M27 98h7v5h-7Z" fill="#0c1119"/></pattern></defs>'+
    '<g data-ds-far><rect x="-200" width="9000" height="100" fill="url(#ds-back-girder)"/></g>'+
    '<g data-ds-train>'+Array.from({length:carCount},(_,i)=>carriage(i)).join('')+'</g>'+
    '<g data-ds-track><path d="M-200 72h9000v3H-200Z" fill="#786961"/><path d="M-200 71h9000" stroke="#c8a487" opacity=".68"/><rect x="-200" width="9000" height="100" fill="url(#ds-front-girder)"/></g>';

  layer.append(svg);
  hero.insertBefore(layer,hero.querySelector('.hero-frame') || hero.firstChild);
  hero.classList.add('ds-has-train');
  const train=svg.querySelector('[data-ds-train]');
  const behind=svg.querySelector('[data-ds-far]');
  const track=svg.querySelector('[data-ds-track]');
  let width=1100, intro=0, last=0, frame=0, onscreen=true, progress=0;
  const paused=()=>pause?.getAttribute('aria-pressed')==='true';

  function resize() {
    const rect=layer.getBoundingClientRect();
    if (!rect.height) return;
    width = rect.width * 100 / rect.height;
    svg.setAttribute('viewBox','0 0 '+width.toFixed(1)+' 100');
    paint();
    queue();
  }
  function paint() {
    const ease=1-(1-intro)**3;
    const start=width*.64-carLength*carCount;
    const offset=reduced.matches?0:(ease-1)*Math.min(width*.14,165)+progress*(width*.89);
    train.setAttribute('transform','translate('+(start+offset).toFixed(2)+' 0)');
    behind.setAttribute('transform','translate('+(-progress*12).toFixed(2)+' 0)');
    track.setAttribute('transform','translate('+(-progress*43).toFixed(2)+' 0)');
  }
  let departure = 0;
  hero.addEventListener('departureprogress', event => {departure = event.detail; queue();});
  function tick(now) {
    frame=0;
    if (document.hidden || !onscreen || paused() || reduced.matches) {last=0;return;}
    if (last) intro=Math.min(1,intro+Math.min(50,now-last)/1900);
    last=now;
    const rect=hero.getBoundingClientRect();
    progress=Math.max(departure, Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height))));
    paint();
    if (intro<1) queue();
  }
  function queue() {
    if (!frame && !document.hidden && onscreen && !paused() && !reduced.matches) frame=requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    last=frame=0;
    if (reduced.matches) {intro=1;progress=0;paint();}
    else queue();
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry])=>{onscreen=entry.isIntersecting;sync();}).observe(hero);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(layer);
  else addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',queue,{passive:true});
  document.addEventListener('visibilitychange',sync);
  if (reduced.addEventListener) reduced.addEventListener('change',sync);
  else reduced.addListener(sync);
  if (pause) new MutationObserver(sync).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
  resize();
  sync();
})();
