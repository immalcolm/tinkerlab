/* A/B experiment: identical trajectory, textures, particle count and resolution. */
(async () => {
  const mode = new URLSearchParams(location.search).get('renderer') || 'canvas';
  const resolution = Math.min(4, innerHeight / 960 * devicePixelRatio);
  const P = TechDropPhysics, run = P.simulateTrajectory(1007);
  const textures = {};
  function texture(name, size, draw) {
    const c = document.createElement('canvas'); c.width = c.height = size * resolution;
    const g = c.getContext('2d'); g.scale(resolution, resolution); draw(g, size);
    textures[name] = c;
  }
  texture('peg', 26, g => {
    const m = g.createLinearGradient(7, 5, 19, 22);
    [[0,'#f4fbff'],[.22,'#9db5c6'],[.45,'#244359'],[.5,'#d5e7f1'],[.64,'#527589'],[1,'#0a1726']].forEach(([p,c])=>m.addColorStop(p,c));
    g.fillStyle=m;g.beginPath();g.arc(13,13,8,0,Math.PI*2);g.fill();g.strokeStyle='#9bd6ed99';g.stroke();
    g.fillStyle='white';g.beginPath();g.ellipse(10.5,9,3.1,1.2,-.45,0,Math.PI*2);g.fill();
  });
  texture('ball', 36, g => {
    const m=g.createRadialGradient(13,12,1,18,18,16);
    [[0,'white'],[.24,'white'],[.54,'#D8FF3E'],[.82,'#183652'],[1,'#051020']].forEach(([p,c])=>m.addColorStop(p,c));
    g.fillStyle=m;g.beginPath();g.arc(18,18,14.5,0,Math.PI*2);g.fill();
  });
  texture('glow', 96, g => {
    const m=g.createRadialGradient(48,48,0,48,48,48);m.addColorStop(0,'#d8ff3eaa');m.addColorStop(.3,'#d8ff3e45');m.addColorStop(1,'#d8ff3e00');
    g.fillStyle=m;g.fillRect(0,0,96,96);
  });
  texture('spark', 8, g=>{g.fillStyle='#d8ff3e';g.fillRect(2,0,2,8);});
  const back=document.createElement('canvas');back.width=540*resolution;back.height=960*resolution;
  const b=back.getContext('2d');b.scale(resolution,resolution);b.fillStyle='#030712';b.fillRect(0,0,540,960);
  const grad=b.createLinearGradient(0,118,0,830);grad.addColorStop(0,'#09152b');grad.addColorStop(1,'#050c1b');b.fillStyle=grad;b.fillRect(24,118,492,714);
  b.strokeStyle='#73f4ff66';b.lineWidth=2;b.strokeRect(24,118,492,714);
  for(let i=0;i<6;i++){b.fillStyle=i%2?'#142136':'#0c192e';b.fillRect(30+i*80,755,79,70);}
  let canvas, context, app, ballSprite, glowSprite, pegSprites=[], sparks=[];
  const times=[], cpu=[];let previous=0, start=0, lastPoint=0;
  if(mode==='pixi'){
    app=new PIXI.Application();
    await app.init({width:540,height:960,resolution,autoDensity:true,preference:'webgl',antialias:true,autoStart:false,background:'#030712'});
    canvas=app.canvas;
    const sprite=(source,x,y,w,h)=>{const s=new PIXI.Sprite(PIXI.Texture.from(source));s.position.set(x,y);s.width=w;s.height=h;app.stage.addChild(s);return s;};
    sprite(back,0,0,540,960);
    pegSprites=P.PEGS.map(p=>sprite(textures.peg,p.x-13,p.y-13,26,26));
    glowSprite=sprite(textures.glow,0,0,96,96);glowSprite.blendMode='add';
    for(let i=0;i<120;i++){const s=sprite(textures.spark,0,0,4,6);s.blendMode='add';sparks.push(s);}
    ballSprite=sprite(textures.ball,0,0,36,36);
  } else {
    canvas=document.createElement('canvas');canvas.width=540*resolution;canvas.height=960*resolution;
    context=canvas.getContext('2d');context.scale(resolution,resolution);
  }
  // Pixi autoDensity installs inline logical CSS sizes. Normalize the displayed
  // footprint as well as backing pixels so compositing work is comparable.
  const displayScale = Math.min(innerWidth / 540, innerHeight / 960);
  canvas.style.width = `${540 * displayScale}px`;
  canvas.style.height = `${960 * displayScale}px`;
  document.body.appendChild(canvas);document.getElementById('label').textContent=mode+' · '+canvas.width+'×'+canvas.height+' · seed 1007';
  function frame(now){
    if(!start)start=now;if(previous)times.push(now-previous);previous=now;
    const t=((now-start)/1000)%run.duration;
    while(lastPoint<run.trajectory.length-1&&run.trajectory[lastPoint].t<t)lastPoint++;
    if(run.trajectory[lastPoint].t>t+.02)lastPoint=0;
    const p=run.trajectory[lastPoint], before=performance.now();
    if(context){context.drawImage(back,0,0,540,960);for(const peg of P.PEGS)context.drawImage(textures.peg,peg.x-13,peg.y-13,26,26);context.save();context.globalCompositeOperation='lighter';context.drawImage(textures.glow,p.x-48,p.y-48,96,96);}
    else {glowSprite.position.set(p.x-48,p.y-48);ballSprite.position.set(p.x-18,p.y-18);}
    for(let i=0;i<120;i++){
      const phase=(t*2+i*.037)%1,a=i*2.39996,x=p.x+Math.cos(a)*phase*75,y=p.y+Math.sin(a)*phase*75;
      if(context){context.globalAlpha=(1-phase)*.7;context.drawImage(textures.spark,x,y,4,6);}
      else {sparks[i].position.set(x,y);sparks[i].alpha=(1-phase)*.7;}
    }
    if(context){context.restore();context.drawImage(textures.ball,p.x-18,p.y-18,36,36);}else app.renderer.render(app.stage);
    cpu.push(performance.now()-before);requestAnimationFrame(frame);
  }
  window.__rendererComparison={mode,resolution,seed:1007,stats:()=>{
    const sample=times.slice(60), sorted=[...sample].sort((a,b)=>a-b),slow=sorted.slice(-Math.max(1,Math.ceil(sorted.length*.01)));
    return {renderer:mode,samples:sample.length,meanFrameMs:sample.reduce((a,b)=>a+b,0)/sample.length,p99FrameMs:sorted[Math.floor(sorted.length*.99)],onePercentLow:1000/(slow.reduce((a,b)=>a+b,0)/slow.length),meanSubmitMs:cpu.slice(60).reduce((a,b)=>a+b,0)/Math.max(1,cpu.length-60),width:canvas.width,height:canvas.height};
  }};
  requestAnimationFrame(frame);
})().catch(e=>{document.getElementById('error').textContent=e.message;window.__rendererError=e.message;});
