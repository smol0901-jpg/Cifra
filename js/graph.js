/* NOVA Graph — лёгкий офлайн-рисователь: графики функций (canvas) и диаграммы (SVG). Без библиотек. */
const Graph=(()=>{
const NS='http://www.w3.org/2000/svg';
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const el=(t,a={},...kids)=>{const n=document.createElementNS(NS,t);for(const k in a)n.setAttribute(k,a[k]);kids.forEach(c=>c&&n.append(c));return n};

/* ---------- График функции y=f(x) ---------- */
function niceStep(range){const r=range/8,p=Math.pow(10,Math.floor(Math.log10(r)||0)),n=r/p;return p*(n<1.5?1:n<3.5?2:n<7.5?5:10)}
function plot(canvas,fn,o){
  o=o||{};
  const dpr=devicePixelRatio||1,W=canvas.clientWidth,H=canvas.clientHeight;
  canvas.width=W*dpr;canvas.height=H*dpr;
  const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  let[x0,x1]=[o.xmin??-10,o.xmax??10];if(!(x1>x0))return;
  /* сбор точек */
  const N=Math.max(400,W*2),pts=[];let ymin=Infinity,ymax=-Infinity;
  for(let i=0;i<=N;i++){const x=x0+(x1-x0)*i/N;let y;try{y=fn(x)}catch(e){}
    if(typeof y!=='number'||!isFinite(y)){pts.push(null);continue}
    pts.push([x,y]);if(y<ymin)ymin=y;if(y>ymax)ymax=y}
  if(!isFinite(ymin)){g.font='15px system-ui';g.fillStyle=css('--mut')||'#888';g.fillText('Нет значений на этом участке',16,H/2);return}
  let pad=(ymax-ymin)*.12||1;let[y0,y1]=[ymin-pad,ymax+pad];
  if(y0>0)y0=-pad;if(y1<0)y1=pad;
  const px=x=>(x-x0)/(x1-x0)*(W-64)+40,py=y=>H-30-(y-y0)/(y1-y0)*(H-52);
  const acc=css('--eq')||'#7c5cff',line=css('--line')||'#333',mut=css('--mut')||'#888',fg=css('--fg')||'#ddd';
  /* сетка */
  g.lineWidth=1;g.font='11px system-ui';g.textAlign='center';
  const sx=niceStep(x1-x0),sy=niceStep(y1-y0);
  g.strokeStyle=line;g.fillStyle=mut;
  for(let x=Math.ceil(x0/sx)*sx;x<=x1;x+=sx){const X=px(x);g.globalAlpha=Math.abs(x)<sx/2?.9:.4;
    g.beginPath();g.moveTo(X,10);g.lineTo(X,H-20);g.stroke();g.globalAlpha=1;
    if(Math.abs(x)>sx/2)g.fillText(+x.toPrecision(6),X,H-8)}
  g.textAlign='right';
  for(let y=Math.ceil(y0/sy)*sy;y<=y1;y+=sy){const Y=py(y);g.globalAlpha=Math.abs(y)<sy/2?.9:.4;
    g.beginPath();g.moveTo(32,Y);g.lineTo(W-8,Y);g.stroke();g.globalAlpha=1;
    if(Math.abs(y)>sy/2)g.fillText(+y.toPrecision(6),34,Y+4)}
  /* оси */
  g.strokeStyle=mut;g.globalAlpha=.8;g.lineWidth=1.4;
  if(y0<0&&y1>0){g.beginPath();g.moveTo(32,py(0));g.lineTo(W-8,py(0));g.stroke()}
  if(x0<0&&x1>0){g.beginPath();g.moveTo(px(0),10);g.lineTo(px(0),H-20);g.stroke()}
  g.globalAlpha=1;
  /* кривая: сегменты со разрывом на выбросах/бесконечностях */
  g.strokeStyle=acc;g.lineWidth=2.4;g.lineJoin='round';g.lineCap='round';
  g.shadowColor=acc;g.shadowBlur=10;
  const seg=[];let prev=null;
  const lim=(y1-y0)*4;
  for(const p of pts){
    if(!p){if(seg.length>1)draw(seg);seg.length=0;prev=null;continue}
    if(prev&&(Math.abs(p[1]-prev[1])>lim)){if(seg.length>1)draw(seg);seg.length=0}
    seg.push(p);prev=p}
  if(seg.length>1)draw(seg);
  g.shadowBlur=0;
  function draw(s){g.beginPath();s.forEach(([x,y],i)=>i?g.lineTo(px(x),py(y)):g.moveTo(px(x),py(y)));g.stroke()}
  /* нули функции (корни) — точки пересечения с ОХ */
  if(o.roots!==false&&y0<0&&y1>0){
    g.fillStyle=fg;
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];
      if(!a||!b)continue;
      if((a[1]<0)!==(b[1]<0)&&Math.abs(b[1]-a[1])<(y1-y0)){
        const t=a[1]/(a[1]-b[1]),rx=a[0]+(b[0]-a[0])*t;
        g.beginPath();g.arc(px(rx),py(0),3.6,0,7);g.fill()}}}
}

/* ---------- Кольцевая диаграмма (SVG) ---------- */
function donut(host,data,title){
  host.innerHTML='';
  const total=data.reduce((s,d)=>s+d.v,0);if(!(total>0))return;
  const pal=[css('--eq'),'#22d3ee','#f59e0b','#e11d48','#0e9f6e','#8b5cf6','#64748b'];
  const R=54,C=2*Math.PI*R;let off=0;
  const svg=el('svg',{viewBox:'0 0 140 140',class:'donut'});
  data.forEach((d,i)=>{
    const frac=d.v/total,len=C*frac;
    svg.append(el('circle',{cx:70,cy:70,r:R,fill:'none',stroke:pal[i%pal.length],'stroke-width':18,
      'stroke-dasharray':`${len-1.5} ${C-len+1.5}`,'stroke-dashoffset':-off,transform:'rotate(-90 70 70)',class:'seg'}));
    off+=len});
  svg.append(el('text',{x:70,y:66,'text-anchor':'middle',class:'dt'},title||''),
             el('text',{x:70,y:84,'text-anchor':'middle',class:'dv'},fmtTotal(total)));
  host.append(svg);
  const lg=el('div',{class:'lg'});
  data.forEach((d,i)=>{const row=document.createElement('div');row.className='li';
    row.innerHTML=`<i style="background:${pal[i%pal.length]}"></i><span></span><b></b>`;
    row.querySelector('span').textContent=d.n;row.querySelector('b').textContent=fmtTotal(d.v)+' · '+Math.round(d.v/total*100)+'%';
    lg.append(row)});
  host.append(lg);
}
/* ---------- Столбчатая диаграмма (SVG) ---------- */
function bars(host,data,unit){
  host.innerHTML='';
  const max=Math.max(...data.map(d=>Math.abs(d.v)),1e-9);
  const W=300,H=150,n=data.length,bw=Math.min(46,(W-20)/n*.62);
  const svg=el('svg',{viewBox:`0 0 ${W} ${H+26}`,class:'barsv'});
  svg.append(el('line',{x1:6,y1:H,x2:W-6,y2:H,class:'axis'}));
  data.forEach((d,i)=>{
    const h=Math.max(3,Math.abs(d.v)/max*(H-14));
    const x=10+(W-20)*(i+.5)/n-bw/2;
    const r=el('rect',{x,y:H-h,width:bw,height:h,rx:7,class:'bar'});
    r.style.animationDelay=(i*70)+'ms';
    svg.append(r);
    const t=el('text',{x:x+bw/2,y:H+16,'text-anchor':'middle',class:'bl'},d.n.length>9?d.n.slice(0,8)+'…':d.n);
    svg.append(t)});
  host.append(svg);
  if(unit){const cap=document.createElement('small');cap.className='bunit';cap.textContent=unit;host.append(cap)}
}
const fmtTotal=v=>v>=1e6?(v/1e6).toFixed(1).replace('.0','')+' млн':v>=1e4?Math.round(v).toLocaleString('ru-RU'):Math.round(v*100)/100;
return{plot,donut,bars};
})();
