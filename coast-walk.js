// Deform the original painted figure on a textured mesh. All gait and camera
// positions are functions of document position, so stopping or reversing works.
(() => {
  const home = document.querySelector('#home');
  const layer = home.querySelector('.mechanic-layer');
  const art = layer.querySelector('img');
  const destination = document.querySelector('#experience');
  const canvas = document.createElement('canvas');
  canvas.className = 'coast-walker';
  canvas.setAttribute('aria-hidden','true');
  const gl = canvas.getContext('webgl', {alpha:true, antialias:true, premultipliedAlpha:true});
  if (!gl) return;
  function shader(type,source) {
    const result = gl.createShader(type);
    gl.shaderSource(result,source); gl.compileShader(result);
    return result;
  }
  const program = gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`
    attribute vec2 uv; varying vec2 tex;
    uniform float phase, strength;
    void main() {
      tex = uv;
      float y = uv.y;
      float split = mix(-1.,1.,smoothstep(.43,.60,uv.x));
      float swing = split*sin(phase);
      float lift = max(0., split*cos(phase));
      float thigh = smoothstep(.54,.78,y);
      float shin = smoothstep(.74,.96,y);
      float arm = smoothstep(.24,.47,abs(uv.x-.5)) * smoothstep(.18,.36,y)*(1.-smoothstep(.55,.69,y));
      vec2 p = uv;
      p.x += strength*(.19*swing*thigh + .10*lift*shin - .095*swing*arm + .012*sin(phase)*(1.-thigh));
      p.y += strength*(.008*cos(2.*phase)*(1.-shin) - .052*lift*shin + .009*swing*arm);
      gl_Position=vec4((p.x-.5)*1.42,(.5-p.y)*1.88,0.,1.);
    }`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
    precision mediump float; varying vec2 tex; uniform sampler2D portrait;
    void main(){gl_FragColor=texture2D(portrait,tex);}`));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const grid=[];
  for(let j=0;j<48;j++) for(let i=0;i<24;i++) {
    const l=i/24,r=(i+1)/24,t=j/48,b=(j+1)/48;
    grid.push(l,t,r,t,l,b,r,t,r,b,l,b);
  }
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(grid),gl.STATIC_DRAW);
  const uv=gl.getAttribLocation(program,'uv');
  gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
  const phase=gl.getUniformLocation(program,'phase'), strength=gl.getUniformLocation(program,'strength');
  const clamp=x=>Math.min(1,Math.max(0,x));
  let ready=false,frame=0;
  const garage=document.createElement('div');
  garage.className='mission-arrival';
  garage.setAttribute('aria-hidden','true');
  garage.innerHTML='<div class="garage-view"><i></i></div><div class="mission-caption"><small></small><strong></strong></div>';
  const firstJob=destination.querySelector('.fn-record');
  garage.querySelector('small').textContent=firstJob.querySelector('.fn-org').textContent;
  garage.querySelector('strong').textContent=firstJob.querySelector('h3').textContent;
  function hide() {
    canvas.hidden=true;
    home.classList.remove('walking-shot');
  }
  function draw() {
    frame=0;
    if (!ready || !document.documentElement.classList.contains('signal-motion')) return hide();
    const stage=garage.getBoundingClientRect();
    const arrival=stage.top;
    const viewport=document.documentElement.clientHeight;
    const approach=clamp((viewport-arrival)/(viewport*.88));
    const follow=approach*approach*(3-2*approach);
    const title=clamp((approach-.77)/.20);
    garage.style.setProperty('--tracking',follow.toFixed(4));
    garage.style.setProperty('--title-in',title.toFixed(4));
    const start=home.parentElement.getBoundingClientRect().top + scrollY;
    const distance=Math.max(0,scrollY-start);
    if(distance<1 || stage.bottom < 0) return hide();
    home.classList.add('walking-shot');
    const rect=layer.getBoundingClientRect();
    const w=Math.min(rect.width,rect.height*art.naturalWidth/art.naturalHeight);
    const h=w*art.naturalHeight/art.naturalWidth;
    const progress=clamp(distance/Math.max(1,distance+arrival-innerHeight*.12));
    const handoff=clamp((innerHeight-arrival)/innerHeight);
    const scale=(1-.42*progress)*(1+.18*follow);
    const ground=Math.max(rect.bottom,Math.min(innerHeight*.86,rect.bottom+distance));
    const freeX=rect.left+rect.width/2-innerWidth*.18*progress;
    const x=freeX+(innerWidth*.75-freeX)*follow;
    const freeFoot=ground-innerHeight*.06*handoff;
    const foot=freeFoot+(arrival+stage.height*.87-freeFoot)*follow;
    canvas.hidden=false;
    canvas.style.width=w*scale/.71+'px'; canvas.style.height=h*scale/.94+'px';
    canvas.style.left=x+'px'; canvas.style.top=foot+'px';
    canvas.style.opacity=1-clamp((viewport*.25-stage.bottom)/(viewport*.25));
    gl.uniform1f(phase,distance/Math.max(22,h*.09));gl.uniform1f(strength,clamp(distance/65)*(1-clamp((approach-.80)/.20)));
    gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES,0,grid.length/2);
  }
  function queue(){if(!frame)frame=requestAnimationFrame(draw)}
  art.decode().then(()=>{
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,art);
    for(const axis of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,axis,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    canvas.height=Math.min(1200,art.naturalHeight);canvas.width=Math.ceil(canvas.height*art.naturalWidth/art.naturalHeight*.94/.71);
    gl.viewport(0,0,canvas.width,canvas.height);
    canvas.hidden=true;document.body.append(canvas); destination.prepend(garage); ready=true;queue();
  }).catch(hide);
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);
  new MutationObserver(queue).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  canvas.addEventListener('webglcontextlost',()=>{ready=false;hide()});
})();
