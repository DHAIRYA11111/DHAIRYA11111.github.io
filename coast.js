// Original coastal illustration. The horizon, waterfront and flyover move at
// different speeds as the existing departure timeline advances.
(() => {
  const hero = document.getElementById('home');
  const canvas = hero.querySelector('.coast-panorama');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const art = canvas.parentElement;
  let travel = 0, width = 0, height = 0, frame = 0;
  let seed = 7021;
  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function shape(color, points) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath(); ctx.fill();
  }
  function line(color, weight, points) {
    ctx.strokeStyle = color; ctx.lineWidth = weight; ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.stroke();
  }
  function palm(x,y,h,lean) {
    ctx.save(); ctx.translate(x,y); ctx.scale(h/200,h/200);
    const ink = '#17172a';
    shape(ink,[[-7,5],[lean-3,-117],[lean*.8-2,-191],[lean*.8+3,-191],[lean+3,-112],[6,5]]);
    ctx.translate(lean*.8,-190);
    for (let j=0;j<12;j++) {
      const dir = j%2 ? 1 : -1, reach = 24+(j%6)*10, arch = 13+(j%4)*9;
      const fall = (j%5)*11-9;
      const pts=[];
      for(let i=0;i<=16;i++) {
        const t=i/16, x=dir*reach*t, y=-Math.sin(t*Math.PI)*arch+fall*t;
        pts.push([x,y]);
        if(i>0) shape(ink,[[x,y-1],[x+dir*8,y+4+Math.sin(t*Math.PI)*15],[x+dir*3,y+1]]);
      }
      line(ink,2,pts);
    }
    ctx.restore();
  }
  function paint() {
    frame = 0;
    if (!width || !height) return;
    seed = 7021;
    const h=720, w=width/height*h, focus=w*.73;
    ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
    const sky=ctx.createLinearGradient(0,0,0,560);
    for(const [t,c] of [[0,'#292944'],[.26,'#705777'],[.55,'#d48282'],[.83,'#ffc18a'],[1,'#f7cf99']]) sky.addColorStop(t,c);
    ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
    const sun=focus-w*.055*travel;
    const glow=ctx.createRadialGradient(sun,276,14,sun,276,182);
    glow.addColorStop(0,'#ffe1aa99');glow.addColorStop(1,'#ffbc8100');
    ctx.fillStyle=glow;ctx.fillRect(sun-183,93,366,366);
    ctx.fillStyle='#ffdb9b';ctx.beginPath();ctx.arc(sun,276,54,0,Math.PI*2);ctx.fill();
    for(let k=0;k<32;k++){
      const x=random()*w,y=100+random()*216;
      line('#ffdbc332',.8+random()*2,[[x,y],[x+12+random()*80,y-1]]);
    }
    for(let k=0;k<3;k++){
      const pts=[[-4,520]];
      for(let x=-4;x<w+14;x+=12){
        const a=x+travel*(9+k*7);
        pts.push([x,340+k*25+Math.sin(a*.011+k)*19+Math.sin(a*.028+k*2)*7+Math.sin(a*.005)*31]);
      }
      pts.push([w+14,520]);shape(['#ac7c88','#88677d','#675b72'][k],pts);
    }
    const water=ctx.createLinearGradient(0,414,0,600);
    water.addColorStop(0,'#d69a91');water.addColorStop(.55,'#797788');water.addColorStop(1,'#495267');
    ctx.fillStyle=water;ctx.fillRect(0,414,w,306);
    for(let i=0;i<210;i++){
      const x=random()*w,y=416+random()*130;
      line(Math.abs(x-sun)<80?'#ffe4ae91':'#f8cdb747',1,[[x,y],[x+2+random()*21,y]]);
    }
    ctx.save();ctx.translate(-50*travel,0);
    for(let x=w*.40;x<w+150;){
      const bw=7+random()*24,bh=10+random()*80+Math.max(0,1-Math.abs(x/w-.82)*9)*64;
      const y=430-bh;
      ctx.fillStyle='#493c51';ctx.fillRect(x,y,bw,bh);ctx.fillRect(x+bw*.24,y-4,bw*.5,4);
      if (bh>90) line('#503f53',1,[[x+bw*.58,y],[x+bw*.58,y-9]]);
      ctx.fillStyle='#eebb8b';
      for(let yy=y+5;yy<429;yy+=7)for(let xx=x+3;xx<x+bw-1;xx+=5)if(random()>.74)ctx.fillRect(xx,yy,2,2);
      x+=bw+random()*6;
    }
    ctx.restore();
    shape('#302e40',[[-2,476],[w*.23,465],[w*.68,437],[w+2,433],[w+2,448],[w*.67,454],[-2,502]]);
    for(let i=0;i<8;i++){const x=w*i/7;ctx.fillStyle='#393747';ctx.fillRect(x,484-46*i/7,4,24);}
    shape('#292637',[[0,643],[w*.36,539],[w*.76,492],[w,475],[w,720],[0,720]]);
    shape('#3c3642',[[0,672],[w*.40,555],[w*.78,504],[w,483],[w,490],[w*.78,515],[w*.40,571],[0,716]]);
    for(let i=0;i<20;i++){
      const t=(i/20+travel*.05)%1,x=w*(1-t),y=488+194*t*t;
      line('#eab98a',1+t*1.8,[[x,y],[x-w*(.013+t*.014),y+1+8*t]]);
    }
    palm(w*.91-travel*62,521,216,-13);
    palm(w*.98-travel*69,517,155,11);
    palm(w*.36-travel*128,651,306,13);
    palm(w*.10-travel*165,733,401,-23);
  }
  function queue(){if(!frame)frame=requestAnimationFrame(paint)}
  new ResizeObserver(() => {
    width=art.clientWidth;height=art.clientHeight;
    const ratio=Math.min(1.5,devicePixelRatio||1);
    canvas.width=Math.max(1,Math.round(width*ratio));
    canvas.height=Math.max(1,Math.round(height*ratio));
    queue();
  }).observe(art);
  hero.addEventListener('departureprogress',e=>{
    if(Math.abs(travel-e.detail)<.002 && e.detail!==0 && e.detail!==1)return;
    if(travel===e.detail)return;
    travel=e.detail;queue();
  });
})();
