(() => {
  const mast = document.querySelector('.mast-inner');
  const index = document.querySelector('#open-index');
  if (!mast || !index || index.hidden) return;
  const stops = [
    ['home', 'Home'], ['experience', 'Experience'], ['skills', 'Skills'],
    ['projects', 'Projects'], ['lab', 'Workbench'], ['about', 'Story'], ['contact', 'Contact']
  ].map(([id, label]) => ({id, label, section: document.getElementById(id)})).filter(stop => stop.section);
  const heights = [.57,.57,.35,.35,.66,.66,.45];
  const nav = document.createElement('nav');
  nav.className = 'coast-route';
  nav.setAttribute('aria-label','Coastal section map');
  const chart = document.createElement('div');
  chart.className='coast-route-chart';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden','true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const current = document.createElement('span');
  current.className = 'coast-route-location';
  current.setAttribute('aria-hidden','true');
  chart.append(canvas);
  const links = stops.map(({id,label}, i) => {
    const link = document.createElement('a');
    link.href = '#' + id;
    link.setAttribute('aria-label', label);
    link.title = label;
    link.style.setProperty('--pin-y', (100*heights[i])+'%');
    chart.append(link);
    return link;
  });
  nav.append(chart,current);
  mast.querySelector('.resume').before(nav);
  let active = -1;
  function highlight(){
    const boundary = innerHeight * .38;
    let next = 0;
    stops.forEach((stop,i) => {if (stop.section.getBoundingClientRect().top <= boundary) next = i});
    if (scrollY + innerHeight >= document.documentElement.scrollHeight-2) next = stops.length-1;
    if (next === active) return;
    links[active]?.removeAttribute('aria-current');
    active = next;
    links[next].setAttribute('aria-current','location');
    current.textContent=stops[next].label;
  }
  function draw(){
    const w=chart.clientWidth, h=chart.clientHeight;
    if (!w || !h) return;
    const ratio=Math.min(2,devicePixelRatio||1);
    canvas.width=Math.round(w*ratio);
    canvas.height=Math.round(h*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.strokeStyle='#53615f';
    ctx.lineWidth=.8;
    ctx.beginPath();
    for(let x=-h;x<w+h;x+=15){ctx.moveTo(x,0);ctx.lineTo(x+h*.64,h)}
    for(let y=-h;y<h*2;y+=11){ctx.moveTo(0,y);ctx.lineTo(w,y-w*.13)}
    ctx.stroke();
    ctx.lineJoin='round';
    ctx.beginPath();
    heights.slice(0,stops.length).forEach((point,i)=>{
      const x=(i+.5)*w/stops.length, y=h*point;
      if(i===0) ctx.moveTo(x,y);
      else {
        ctx.lineTo(x-w*.075,h*heights[i-1]);
        ctx.lineTo(x,y);
      }
    });
    ctx.strokeStyle='#263333';ctx.lineWidth=6;ctx.stroke();
    ctx.strokeStyle='#f1bc8b';ctx.lineWidth=2;ctx.stroke();
  }
  let frame = 0;
  addEventListener('scroll',()=>{if(!frame) frame=requestAnimationFrame(()=>{frame=0;highlight()})},{passive:true});
  new ResizeObserver(()=>{draw();highlight()}).observe(chart);
  highlight();
})();
