(()=>{
'use strict';
const W=540,H=960,TAU=Math.PI*2,EPS=1e-7;
const $=id=>document.getElementById(id);
const canvas=$('scene'),g=canvas.getContext('2d',{alpha:false}),stage=$('stage');
const ui={start:$('start'),bottom:$('bottom'),signal:$('boardSignal'),status:$('gameStatus'),phase:$('phaseLabel'),pct:$('phasePct'),phaseFill:$('phaseFill'),capture:$('capture'),result:$('result'),resultParticles:$('resultParticles'),resultTitle:$('resultTitle'),resultIcon:$('resultIcon'),resultDescription:$('resultDescription'),resultTags:$('resultTags'),resultNext:$('resultNext'),resultProgress:$('resultProgress'),resetCountdown:$('resetCountdown'),roundId:$('roundId'),callout:$('callout'),flash:$('flash'),announcer:$('announcer'),mute:$('mute'),fullscreen:$('fullscreen'),debug:$('debug'),debugStatus:$('debugStatus'),forceOutcome:$('forceOutcome')};
const THEMES=[
 {key:'AI',first:'AI',second:'ARCHITECT',glyph:'AI',color:'#DEFF52',desc:'You imagine intelligent tools that make the impossible feel possible.',tags:['INTELLIGENCE','CREATIVITY','AI SOLUTIONS'],cta:'THINK BIG. BUILD SMART.'},
 {key:'CYBER',first:'CYBER',second:'GUARDIAN',glyph:'⌑',color:'#66F4EF',desc:'You defend the digital world and protect what matters.',tags:['CYBERSECURITY','DEFENCE','DIGITAL TRUST'],cta:'SECURE WHAT COMES NEXT.'},
 {key:'CODE',first:'CODE',second:'CREATOR',glyph:'</>',color:'#B69CFF',desc:'You take a wild idea and turn it into something real.',tags:['SOFTWARE','BUILDING','INNOVATION'],cta:'DON’T JUST USE TECH. BUILD IT.'},
 {key:'DATA',first:'DATA',second:'DETECTIVE',glyph:'Σ',color:'#FFBF77',desc:'You spot the patterns everyone else misses.',tags:['ANALYTICS','INSIGHTS','DISCOVERY'],cta:'FIND THE SIGNAL IN THE NOISE.'},
 {key:'CLOUD',first:'CLOUD',second:'PILOT',glyph:'∞',color:'#83B5FF',desc:'You create systems that connect, power and scale big ideas.',tags:['CLOUD','SYSTEMS','TECH OPS'],cta:'TAKE IDEAS FURTHER.'},
 {key:'UX',first:'UX',second:'INVENTOR',glyph:'◈',color:'#FF86C8',desc:'You make technology feel brilliant, effortless and human.',tags:['DESIGN','PRODUCTS','EXPERIENCE'],cta:'DESIGN WHAT MATTERS.'}
];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),lerp=(a,b,t)=>a+(b-a)*t;
const random=(a=0,b=1)=>a+Math.random()*(b-a);
const rr=(c,x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r)};
const drawLine=(c,x1,y1,x2,y2,color,width=1)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke()};
const ellipseGlow=(c,x,y,r,stops)=>{let k=c.createRadialGradient(x,y,0,x,y,r);for(const s of stops)k.addColorStop(s[0],s[1]);c.fillStyle=k;c.fillRect(x-r,y-r,r*2,r*2)};
let reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const qualityLite=new URLSearchParams(location.search).has('lite');
let state='idle',stateTime=0,clock=0,last=0,round=0,target=2,outcome=2,bag=[],frameScale=1,muted=false,audioContext=null,pointerDown=false;
let track=[],impactEvents=[],nextImpact=0,ball={x:270,y:343,rotation:0,vx:0,vy:0},trail=[],particles=[],rings=[],pegs=[],ambient=[],impactFlash=0,shake=0,capturePulse=0,liveParticles=true,activeResult=6.4;
const pegRows=9;const slotCenter=i=>47+(i+.5)*(446/6);const board={x:30,y:273,w:480,h:535};
for(let r=0;r<pegRows;r++)for(let col=0;col<(r%2?8:9);col++)pegs.push({x:(r%2?91:65)+col*50,y:381+r*39.3,r,col,glow:0,id:r+'-'+col});
for(let i=0;i<85;i++)ambient.push({x:random(37,505),y:random(304,804),radius:random(.3,1.25),v:random(.2,.55),phase:random(0,TAU),alpha:random(.06,.35)});
const bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');
function background(){
 let grad=b.createLinearGradient(0,0,540,960);grad.addColorStop(0,'#050a15');grad.addColorStop(.48,'#081329');grad.addColorStop(1,'#110b29');b.fillStyle=grad;b.fillRect(0,0,W,H);
 ellipseGlow(b,50,176,320,[[0,'#3154a23e'],[1,'#3154a200']]);ellipseGlow(b,504,720,365,[[0,'#7c39c435'],[1,'#7c39c400']]);ellipseGlow(b,310,410,360,[[0,'#085b6542'],[1,'#085b6500']]);
 for(let y=0;y<H;y+=27)drawLine(b,0,y,W,y,'#93bbf406');for(let x=0;x<W;x+=27)drawLine(b,x,0,x,H,'#93bbf408');
 for(let i=0;i<25;i++){let x=(i*83+39)%540,y=(i*97+123)%960;drawLine(b,x-17,y,x+3,y,'#4dddfb13');drawLine(b,x+3,y,x+20,y-14,'#4dddfb13');b.fillStyle=i%4?'#d8ff3e35':'#80f9ff35';b.fillRect(x+19,y-15,2,2)}
 // Hero technical symbol and anchor glyph
 b.save();b.translate(466,137);b.rotate(.16);b.strokeStyle='#c4edff10';b.lineWidth=1;for(let r=57;r<=110;r+=26){b.beginPath();b.arc(0,0,r,0,TAU);b.stroke()}b.restore();
 // Header separator and accent stitching
 drawLine(b,31,84,509,84,'#b6ccef29');b.fillStyle='#d8ff3e';b.fillRect(31,83,44,2);
 // Blue-violet shadow under main board, rim gradients
 b.save();b.shadowColor='#000000b5';b.shadowBlur=31;rr(b,24,268,492,545,24);b.fillStyle='#020912';b.fill();b.restore();
 let rim=b.createLinearGradient(24,270,516,813);rim.addColorStop(0,'#d8ff3ea5');rim.addColorStop(.25,'#77eaff64');rim.addColorStop(.68,'#569dd64c');rim.addColorStop(1,'#bb8cffac');b.strokeStyle=rim;b.lineWidth=2;rr(b,25,269,490,543,24);b.stroke();
 const boardG=b.createLinearGradient(0,276,0,810);boardG.addColorStop(0,'#10273b');boardG.addColorStop(.42,'#071b2e');boardG.addColorStop(1,'#0e1029');b.fillStyle=boardG;rr(b,32,276,476,529,20);b.fill();
 b.save();rr(b,32,276,476,529,20);b.clip();ellipseGlow(b,280,352,237,[[0,'#d9ff3e12'],[1,'#d9ff3e00']]);ellipseGlow(b,451,668,230,[[0,'#8a6dfe14'],[1,'#8a6dfe00']]);
 // Engineered diagonal micromesh + electronic traces
 for(let x=-500;x<850;x+=38)drawLine(b,x,310,x+420,790,'#7da9c30a');
 for(let x=0;x<W;x+=48)drawLine(b,x,334,x,745,'#add2ec0c');for(let y=359;y<752;y+=39.3)drawLine(b,44,y,493,y,'#add2ec0c');
 for(let r=0;r<9;r++)for(let col=0;col<7;col++){let x=77+col*61+(r%2)*15,y=384+r*39.3;b.beginPath();for(let k=0;k<=6;k++){let a=k*TAU/6;let px=x+20*Math.cos(a),py=y+20*Math.sin(a);k?b.lineTo(px,py):b.moveTo(px,py)}b.strokeStyle='#65b3d614';b.lineWidth=1;b.stroke()}
 // Side energy rails and corner registers
 const rl=b.createLinearGradient(0,331,0,730);rl.addColorStop(0,'#d8ff3e7a');rl.addColorStop(.5,'#7beaf64c');rl.addColorStop(1,'#ab8bff7a');drawLine(b,43,329,43,734,rl,2);drawLine(b,497,329,497,734,rl,2);
 for(let i=0;i<10;i++){let yy=346+i*39;b.fillStyle=i%2?'#6deafc35':'#d8ff3e32';b.fillRect(42,yy,4,13);b.fillRect(494,yy,4,13)}
 // Collector bins: distinct colour and typography
 b.fillStyle='#040b1d';rr(b,40,746,460,55,9);b.fill();b.strokeStyle='#a9daeb68';b.lineWidth=1;rr(b,40,746,460,55,9);b.stroke();
 for(let i=0;i<6;i++){let x=46+i*448/6,w=448/6,t=THEMES[i];b.fillStyle=i%2?'#142239':'#101e32';rr(b,x,750,w-2,46,4);b.fill();b.fillStyle=t.color+'75';b.fillRect(x+5,751,w-13,2);b.fillStyle='#daeafa';b.font='900 10px Arial';b.textAlign='center';b.fillText(t.key,x+w/2,782);b.fillStyle=t.color;b.fillRect(x+w/2-9,788,18,1.5);}
 // Emitter support shape top
 b.save();b.translate(270,337);b.fillStyle='#0a2434';b.strokeStyle='#86cddd98';b.lineWidth=1.6;b.beginPath();b.moveTo(-36,-20);b.lineTo(36,-20);b.lineTo(27,0);b.lineTo(0,11);b.lineTo(-27,0);b.closePath();b.fill();b.stroke();b.fillStyle='#d8ff3e';b.fillRect(-12,-21,24,3);b.restore();
 b.restore();
 // Technical side notches, annotations
 b.fillStyle='#d8ff3e';b.fillRect(30,268,25,2);b.fillStyle='#ba95ff';b.fillRect(485,806,25,2);
 b.fillStyle='#8aa9ba';b.font='800 8px monospace';b.textAlign='left';b.fillText('INPUT / SIGNAL 001',49,323);b.textAlign='right';b.fillText('PEG ARRAY / ACTIVE',489,323);
 b.font='750 7px monospace';b.textAlign='left';b.fillStyle='#698da5';/* keep the transition between chamber and start control uncluttered */
 for(let n=0;n<5;n++){b.fillStyle='#7ca8cf60';b.fillRect(14,322+n*111,2,18);b.fillRect(523,322+n*111,2,18)}
}
background();
function resize(){let s=Math.min(innerWidth/W,innerHeight/H);stage.style.setProperty('--scale',s);let effective=Math.min(qualityLite?1.35:2.3,Math.max(.7,s*(devicePixelRatio||1)));let newW=Math.round(W*effective),newH=Math.round(H*effective);if(canvas.width!==newW||canvas.height!==newH){canvas.width=newW;canvas.height=newH}g.setTransform(newW/W,0,0,newH/H,0,0);}
addEventListener('resize',resize,{passive:true});addEventListener('fullscreenchange',resize);resize();
const soundStart=()=>{if(muted)return;try{audioContext ||=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume()}catch(e){muted=true}};
function blip(f,d=.08,type='sine',volume=.016,delay=0,to=1){if(muted)return;try{soundStart();if(!audioContext)return;let now=audioContext.currentTime+delay,o=audioContext.createOscillator(),v=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(f,60),now);o.frequency.exponentialRampToValueAtTime(Math.max(f*to,60),now+d);v.gain.setValueAtTime(.0001,now);v.gain.exponentialRampToValueAtTime(volume,now+Math.min(.018,d*.23));v.gain.exponentialRampToValueAtTime(.0001,now+d);o.connect(v).connect(audioContext.destination);o.start(now);o.stop(now+d+.025);}catch(e){}}
function launchSound(){blip(128,.37,'sawtooth',.023,0,3.2);blip(730,.14,'sine',.028,.16,1.25);blip(880,.16,'triangle',.018,.29,1.5)}
function hitSound(ev){let intensity=clamp(ev.force/170,.15,1);blip(random(480,1020),.04+intensity*.055,'sine',.004+intensity*.014,0,.65);if(ev.force>170)blip(150,.08,'triangle',.006,0,1.5)}
function captureSound(){blip(100,.54,'sawtooth',.020,0,5);blip(659,.3,'triangle',.032,.18,1.75);blip(1244,.18,'sine',.02,.42,.9)}
function victorySound(){[392,493.9,587.3,783.99,1174.7,1568].forEach((hz,i)=>blip(hz,.44,i%2?'sine':'triangle',.032,i*.115,1.018));blip(196,.82,'sine',.023,0,1.6)}
function setState(next){state=next;stateTime=0;document.documentElement.dataset.state=next;ui.debugStatus.textContent=`STATE ${next} | ROUND ${round} | OUTCOME ${THEMES[outcome].key}`;ui.signal.textContent=next==='idle'?'SYSTEM ONLINE':next==='result'?'POWER UNLOCKED':next==='capture'?'CORE CAPTURED':'SIGNAL ACTIVE';}
function seeded(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function newCycleTarget(){if(!bag.length){bag=[0,1,2,3,4,5];for(let i=5;i>0;i--){let j=Math.floor(random(0,i+1));[bag[j],bag[i]]=[bag[i],bag[j]]}}return bag.pop()}
/* Fixed-timestep, circular-peg physics with a weak lateral attractor.  Positions and collisions are recorded before rendering to make every visual repeatable and independent of frame rate. */
function simulate(dropTarget,seed){
 let rng=seeded(seed),pos={x:270+(rng()-.5)*20,y:339,vx:(slotCenter(dropTarget)-270)*.28+(rng()-.5)*27,vy:45},sim=[],hits=[],hitSet=new Set();const dt=1/120,R=9.3,P=6.1,gravity=475;
 let step=0,lowTime=0;const limit=1080;
 for(;step<limit;step++){
  let t=step*dt;
  let desired=slotCenter(dropTarget),attractor=pos.y>640?5.2:pos.y>540?2.5:1.0;
  let ax=clamp((desired-pos.x)*attractor,-495,495);
  pos.vx=(pos.vx+ax*dt)*.997;pos.vy+=gravity*dt;
  pos.vx=clamp(pos.vx,-235,235);pos.vy=clamp(pos.vy,-255,340);
  pos.x+=pos.vx*dt;pos.y+=pos.vy*dt;
  if(pos.x<51+R){pos.x=51+R;pos.vx=Math.abs(pos.vx)*.7+15}
  if(pos.x>489-R){pos.x=489-R;pos.vx=-Math.abs(pos.vx)*.7-15}
  for(let i=0;i<pegs.length;i++){
   const p=pegs[i],dx=pos.x-p.x,dy=pos.y-p.y,dist2=dx*dx+dy*dy,min=R+P;
   if(dist2>=min*min||Math.abs(dy)>19)continue;
   let length=Math.sqrt(dist2)||.001,nx=dx/length,ny=dy/length;
   let offset=min-length+0.1;pos.x+=nx*offset;pos.y+=ny*offset;
   let into=pos.vx*nx+pos.vy*ny;
   if(into<0){let force=-into,elastic=.52;pos.vx-=(1+elastic)*into*nx;pos.vy-=(1+elastic)*into*ny;
     pos.vx+=(nx===0?(rng()>.5?1:-1):Math.sign(nx))* (8+rng()*10);
     if(pos.vy< -120)pos.vy=-120;
     if(force>24 && (!hitSet.has(i)||t-(hits.filter(h=>h.peg===i).at(-1)?.t||0)>.2)){
      hits.push({t,peg:i,x:p.x,y:p.y,force});hitSet.add(i);
     }
   }
  }
  sim.push({t,x:pos.x,y:pos.y,vx:pos.vx,vy:pos.vy});
  if(pos.y>=762){break}
  if(pos.y<355 && t>1.2){lowTime+=dt;if(lowTime>.6){pos.vy=Math.abs(pos.vy)+65;lowTime=0;}}
 }
 // Last visual approach is a gentle captured slide if the physical trajectory just missed the lane centre.
 let last=sim[sim.length-1];if(!last){last={x:270,y:339,t:0};sim.push(last)}
 if(last.y<762){for(let j=1;j<=48;j++){let k=j/48;sim.push({t:last.t+j*dt,x:lerp(last.x,slotCenter(dropTarget),k*k*(3-2*k)),y:lerp(last.y,762,k),vx:0,vy:120})}}
 else {let desired=slotCenter(dropTarget);if(Math.abs(last.x-desired)>24){let base=sim.length-95;for(let j=Math.max(0,base);j<sim.length;j++){let k=(j-Math.max(0,base))/(sim.length-Math.max(0,base));sim[j].x+= (desired-last.x)*k*k*.97;}}}
 return {sim,hits,duration:sim[sim.length-1].t};
}
let playingDuration=4.6;
function start(){if(state!=='idle')return false;soundStart();round++;let forced=parseInt(ui.forceOutcome.value,10);target=forced>=0?forced:newCycleTarget();outcome=target;const generated=simulate(target,0x9e3779b9+round*233+target*1783);track=generated.sim;impactEvents=generated.hits.map(e=>({...e,showT:e.t/Math.max(.1,generated.duration)*playingDuration}));nextImpact=0;ball={x:track[0].x,y:track[0].y,rotation:0,vx:0,vy:0};trail.length=0;particles.length=0;rings.length=0;impactFlash=1;shake=3;capturePulse=0;ui.capture.classList.remove('active');ui.result.classList.remove('visible');ui.resultParticles.replaceChildren();ui.bottom.classList.add('hidden');ui.status.classList.add('visible');ui.phase.textContent='MAPPING YOUR TECH DNA';ui.phaseFill.style.transform='scaleX(0)';ui.pct.textContent='00%';setState('launch');burst(270,342,'#D8FF3E',28,1.15);addRing(270,343,'#D8FF3E',10,.65);launchSound();announce('Launching Tech Drop. Discovering your tech superpower.');return true}
function announce(s){ui.announcer.textContent=s}
function addRing(x,y,color,r=7,d=.42){rings.push({x,y,color,r,life:d,max:d});if(rings.length>40)rings.shift()}
function burst(x,y,color='#D8FF3E',count=16,energy=1,kind='spark'){
 if(!liveParticles)return;
 let countAdj=reduced?Math.ceil(count*.22):qualityLite?Math.ceil(count*.52):count;
 for(let i=0;i<countAdj;i++){let a=random(0,TAU),v=random(70,215)*energy,life=random(.28,.83)*(kind==='confetti'?2.4:1),sz=random(1.4,3.4);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='confetti'?70:0),life,max:life,size:sz*(kind==='confetti'?2:1),color:kind==='confetti'?THEMES[Math.floor(random(0,6))].color:color,angle:a,spin:random(-9,9),kind})}
 if(particles.length>420)particles.splice(0,particles.length-420);
}
function impact(e){let p=pegs[e.peg];p.glow=1;p.hot=THEMES[target].color;shake=Math.max(shake,clamp(e.force/120,1,3));addRing(p.x,p.y,p.hot,7,.48);burst(p.x,p.y,e.peg%3===0?'#D8FF3E':p.hot,clamp(Math.round(e.force/14),6,18),.8);hitSound(e);if((nextImpact%3)===1){const words=['NICE HIT!','COMBO x'+(nextImpact+1),'SIGNAL BOOST','POWER UP!'];ui.callout.textContent=words[(nextImpact>>>1)%words.length];ui.callout.style.left=p.x/W*100+'%';ui.callout.style.top=(p.y-20)/H*100+'%';ui.callout.classList.remove('pop');void ui.callout.offsetWidth;ui.callout.classList.add('pop')}}
function atTrack(time){let trackTime=(time/playingDuration)*(track[track.length-1]?.t||1);if(trackTime<=0)return track[0];let lo=0,hi=track.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(track[mid].t<trackTime)lo=mid+1;else hi=mid}let j=Math.max(1,lo),a=track[j-1],b=track[j],k=clamp((trackTime-a.t)/((b.t-a.t)||EPS),0,1);return {x:lerp(a.x,b.x,k),y:lerp(a.y,b.y,k),vx:lerp(a.vx,b.vx,k),vy:lerp(a.vy,b.vy,k)}}
function capture(){setState('capture');capturePulse=1;impactFlash=1;shake=9;let x=slotCenter(target);ball.x=x;ball.y=762;ui.status.classList.add('visible');ui.phase.textContent='SIGNAL CAPTURED // CORE UNLOCKED';ui.phaseFill.style.transform='scaleX(1)';ui.pct.textContent='100%';burst(x,755,THEMES[target].color,150,1.5,'confetti');for(let i=0;i<3;i++)addRing(x,754,THEMES[target].color,10+i*12,1.1+i*.22);ui.capture.style.left=clamp(x,115,425)/W*100+'%';ui.capture.classList.remove('active');void ui.capture.offsetWidth;ui.capture.classList.add('active');captureSound();announce('Power core captured. Your tech superpower is about to be revealed.')}
function createResultParticles(color){ui.resultParticles.replaceChildren();if(reduced)return;for(let i=0;i<95;i++){let item=document.createElement('i');let x=28+random(0,44),y=27+random(0,36);item.style.setProperty('--left',x+'%');item.style.setProperty('--top',y+'%');item.style.setProperty('--w',random(2,5)+'px');item.style.setProperty('--h',random(5,15)+'px');item.style.setProperty('--c',random()<.47?color:random()<.5?'#FFFFFF':'#DEFF52');item.style.setProperty('--r',random(-90,90)+'deg');item.style.setProperty('--dx',random(-310,310)+'px');item.style.setProperty('--dy',random(-360,410)+'px');item.style.setProperty('--spin',random(-850,850)+'deg');item.style.setProperty('--delay',random(0,.9)+'s');ui.resultParticles.append(item)}}
function reveal(){setState('result');ui.capture.classList.remove('active');ui.status.classList.remove('visible');const c=THEMES[outcome];ui.result.style.setProperty('--result-color',c.color);ui.resultTitle.innerHTML=c.first+'<span>'+c.second+'</span>';ui.resultIcon.textContent=c.glyph;ui.resultIcon.style.fontSize=c.glyph.length>2?'40px':'56px';ui.resultDescription.textContent=c.desc;ui.resultTags.replaceChildren(...c.tags.map(x=>{let el=document.createElement('span');el.textContent=x;return el}));ui.resultNext.textContent=c.cta;ui.roundId.textContent=String(round).padStart(3,'0');ui.resultProgress.style.transform='scaleX(1)';createResultParticles(c.color);ui.result.classList.add('visible');ui.flash.classList.remove('on');void ui.flash.offsetWidth;ui.flash.classList.add('on');victorySound();announce(`Congratulations. You are a ${c.first} ${c.second}. ${c.desc} For fun only: this is not a physical prize.`)}
function reset(){setState('idle');ui.capture.classList.remove('active');ui.result.classList.remove('visible');ui.status.classList.remove('visible');ui.bottom.classList.remove('hidden');ui.resultParticles.replaceChildren();ui.callout.classList.remove('pop');track=[];trail.length=0;particles.length=0;rings.length=0;impactFlash=.35;shake=0;announce('Tech Drop ready for the next player. Tap play or press Space or Enter.')}
function tick(dt){clock+=dt;stateTime+=dt;shake=Math.max(0,shake-dt*15);impactFlash=Math.max(0,impactFlash-dt*2.2);capturePulse=Math.max(0,capturePulse-dt*.55);
 for(const p of pegs)p.glow=Math.max(0,p.glow-dt*2.4);
 for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.life-=dt;if(p.life<=0){particles.splice(i,1);continue}p.vy+=(p.kind==='confetti'?130:300)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.max(0,1-.33*dt);p.angle+=p.spin*dt}
 for(let i=rings.length-1;i>=0;i--){rings[i].life-=dt;if(rings[i].life<=0)rings.splice(i,1)}
 if(state==='launch'&&stateTime>.55){setState('playing');}
 if(state==='playing'){let t=clamp(stateTime,0,playingDuration),p=atTrack(t);ball.x=p.x;ball.y=p.y;ball.vx=p.vx;ball.vy=p.vy;ball.rotation+=dt*7;trail.push({x:ball.x,y:ball.y});if(trail.length>29)trail.shift();let percent=clamp(t/playingDuration,0,1);ui.phaseFill.style.transform=`scaleX(${percent})`;ui.pct.textContent=String(Math.round(percent*100)).padStart(2,'0')+'%';while(nextImpact<impactEvents.length&&t>=impactEvents[nextImpact].showT){impact(impactEvents[nextImpact]);nextImpact++}if(t>=playingDuration)capture();}
 if(state==='capture'&&stateTime>1.38)reveal();
 if(state==='result'){let remaining=Math.max(0,activeResult-stateTime);ui.resultProgress.style.transform=`scaleX(${clamp(remaining/activeResult,0,1)})`;ui.resetCountdown.textContent='NEXT DROP IN '+Math.ceil(remaining)+'S';if(remaining<=0)setState('resetting')}
 if(state==='resetting'&&stateTime>.5)reset();
}
function drawPeg(c,p){const power=p.glow;let idlePulse=.5+.5*Math.sin(clock*1.9+p.col+p.r);
 if(power>.03)ellipseGlow(c,p.x,p.y,35,[[0,`rgba(218,255,71,${power*.40})`],[1,'#d8ff3e00']]);
 c.save();c.shadowColor=power>.1?'#D8FF3E':'#8fdcff';c.shadowBlur=power*20+4;
 const grad=c.createRadialGradient(p.x-2.8,p.y-3,0.5,p.x+.4,p.y+1.5,8);
 grad.addColorStop(0,'#fff');grad.addColorStop(.3,power>.1?'#dfff87':'#e0f7ff');grad.addColorStop(.55,power>.1?'#88bf48':'#7298b6');grad.addColorStop(1,'#0a2539');c.fillStyle=grad;c.beginPath();c.arc(p.x,p.y,5.8+power*2+idlePulse*.22,0,TAU);c.fill();c.restore();c.beginPath();c.arc(p.x-1.95,p.y-2.1,1.45,0,TAU);c.fillStyle='#ffffffd2';c.fill();
 if(power>.38){c.globalAlpha=power*.35;c.strokeStyle='#d8ff3e';c.lineWidth=1;c.beginPath();c.arc(p.x,p.y,10+(1-power)*8,0,TAU);c.stroke();c.globalAlpha=1}
}
function drawBall(c){let color=THEMES[target].color;
 c.save();c.globalCompositeOperation='screen';
 for(let k=1;k<trail.length;k++){let prev=trail[k-1],p=trail[k],a=k/trail.length;c.strokeStyle=color;c.globalAlpha=.12+a*.32;c.lineWidth=1+7*a;c.lineCap='round';c.beginPath();c.moveTo(prev.x,prev.y);c.lineTo(p.x,p.y);c.stroke()}
 c.globalAlpha=1;ellipseGlow(c,ball.x,ball.y,46,[[0,'#ffffffe0'],[.22,color+'8f'],[.47,color+'3b'],[1,color+'00']]);c.restore();
 let vx=ball.vx,vy=ball.vy,angle=Math.atan2(vy,vx);c.save();c.translate(ball.x,ball.y);c.rotate(angle);const stretch=clamp(Math.hypot(vx,vy)/270,0,1);c.scale(1+stretch*.13,1-stretch*.09);c.shadowColor=color;c.shadowBlur=28;
 let grad=c.createRadialGradient(-3.8,-4.7,0.5,0,0,12);grad.addColorStop(0,'#ffffff');grad.addColorStop(.33,'#ffffff');grad.addColorStop(.64,color);grad.addColorStop(1,'#315477');c.beginPath();c.arc(0,0,10.8,0,TAU);c.fillStyle=grad;c.fill();c.restore();
 c.beginPath();c.arc(ball.x,ball.y,15,clock*5,clock*5+Math.PI*1.2);c.strokeStyle='#dfffffc4';c.lineWidth=1.5;c.stroke();
}
function drawParticles(c){for(const p of particles){let a=clamp(p.life/p.max,0,1);c.save();c.globalAlpha=a;c.translate(p.x,p.y);c.rotate(p.angle);c.fillStyle=p.color;c.shadowBlur=p.kind==='spark'?10:0;c.shadowColor=p.color;if(p.kind==='confetti')c.fillRect(-p.size/2,-p.size/2,p.size,p.size*2.4);else{c.beginPath();c.arc(0,0,p.size*a,0,TAU);c.fill()}c.restore()}}
function drawRings(c){for(const r of rings){let p=1-r.life/r.max;c.globalAlpha=(1-p)*.92;c.strokeStyle=r.color;c.lineWidth=2.3*(1-p)+.3;c.beginPath();c.arc(r.x,r.y,r.r+p*65,0,TAU);c.stroke()}c.globalAlpha=1}
function render(){g.clearRect(0,0,W,H);g.drawImage(bg,0,0);
 // The board is shifted by one or two logical pixels on sharp impacts.
 g.save();g.translate(random(-shake*.5,shake*.5),random(-shake*.5,shake*.5));rr(g,32,276,476,529,20);g.clip();
 let scan=345+(clock*35)%390,scanner=g.createLinearGradient(0,scan-22,0,scan+22);scanner.addColorStop(0,'#81ffb500');scanner.addColorStop(.5,'#81ffb516');scanner.addColorStop(1,'#81ffb500');g.fillStyle=scanner;g.fillRect(42,scan-24,456,48);
 // high-end controlled idle animation: moving data pulses
 for(let i=0;i<6;i++){const yy=370+((clock*(19+i*3)+i*91)%345),xx=47+(i%2)*7;g.strokeStyle=i%2?'#d8ff3e48':'#77f5ff4e';g.lineWidth=1.4;g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+11,yy);g.stroke()}
 for(const dot of ambient){let a=dot.alpha*(.5+.5*Math.sin(clock*dot.v+dot.phase));g.beginPath();g.arc(dot.x+Math.sin(clock*.23+dot.phase)*5,dot.y,dot.radius,0,TAU);g.fillStyle=`rgba(142,220,255,${a})`;g.fill()}
 // dynamic progress rail
 let powered=state==='playing'?clamp(stateTime/playingDuration,0,1):0;const lineY=336;g.strokeStyle='#D8FF3E';g.lineWidth=2.2;g.globalAlpha=.26+powered*.55;g.beginPath();g.moveTo(235,lineY);g.lineTo(235+70*powered,lineY);g.stroke();g.globalAlpha=1;
 for(const p of pegs)drawPeg(g,p);
 if(state==='idle'||state==='launch'){const x=270,y=339;ellipseGlow(g,x,y,50,[[0,'#eaffaaa0'],[.2,'#d9ff3e30'],[1,'#d9ff3e00']]);g.strokeStyle='#d8ff3e89';g.lineWidth=2;g.beginPath();g.arc(x,y,19+Math.sin(clock*2)*2,clock*.8,clock*.8+Math.PI*1.5);g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(x,y,6,0,TAU);g.fill()}
 if(state==='playing')drawBall(g);
 if(state==='capture'){let x=slotCenter(target);ellipseGlow(g,x,758,135,[[0,'#ffffffe3'],[.18,THEMES[target].color+'99'],[.55,THEMES[target].color+'30'],[1,THEMES[target].color+'00']]);}
 drawRings(g);drawParticles(g);g.restore();
 if(impactFlash>.01){g.globalAlpha=impactFlash*.11;g.fillStyle='#ddfff2';rr(g,32,276,476,529,20);g.fill();g.globalAlpha=1}
 const orbit=12+Math.sin(clock*2.2)*3;ellipseGlow(g,270,285,orbit*1.7,[[0,'#d8ff3e88'],[1,'#d8ff3e00']]);
}
function frame(now){if(!last)last=now;let dt=clamp((now-last)/1000,0,.045);last=now;tick(dt);render();requestAnimationFrame(frame)}requestAnimationFrame(frame);
ui.start.addEventListener('click',start);
const heldKeys=new Set();
document.addEventListener('keyup',ev=>heldKeys.delete(ev.code));
addEventListener('blur',()=>heldKeys.clear());
document.addEventListener('keydown',ev=>{if(!['Space','Enter','NumpadEnter'].includes(ev.code))return;if(ev.repeat||heldKeys.has(ev.code))return;heldKeys.add(ev.code);const tg=ev.target;if(tg instanceof Element && tg.closest('#mute,#fullscreen,#skip,#forceReset,#forceOutcome'))return;ev.preventDefault();start()});
ui.mute.addEventListener('click',()=>{muted=!muted;ui.mute.style.color=muted?'#708198':'#D8FF3E';ui.mute.setAttribute('aria-label',muted?'Unmute sound':'Mute sound');if(!muted){soundStart();blip(750,.12,'sine',.022)}});
ui.fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('app').requestFullscreen()}catch(e){ui.fullscreen.title='Fullscreen is available in a regular browser tab'}});
let qp=new URLSearchParams(location.search);if(qp.has('debug')){ui.debug.classList.add('on');$('skip').addEventListener('click',()=>{if(state==='idle')start();if(state==='launch'||state==='playing')capture();if(state==='capture')reveal()});$('forceReset').addEventListener('click',reset)}
if(qp.has('mute')){muted=true;ui.mute.style.color='#708198';ui.mute.setAttribute('aria-label','Unmute sound')}
Object.defineProperty(window,'__techDropQA',{value:{snapshot:()=>({state,round,target,outcome,pegs:pegs.length,impacts:impactEvents.length,impactHandled:nextImpact,trackPoints:track.length,landingX:track.at(-1)?.x,expectedX:slotCenter(target),particles:particles.length}),forceOutcome:n=>ui.forceOutcome.value=String(n),start,reset,skip:()=>{if(state==='idle')start();if(state==='launch'||state==='playing')capture();if(state==='capture')reveal()}}});
setState('idle');
})();
