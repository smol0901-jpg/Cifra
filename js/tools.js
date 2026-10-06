/* NOVA Tools — конвертер единиц, финансы с диаграммами, дата-калькулятор, график функций. */
const Tools=(()=>{
const $=(e,s)=>e.querySelector(s),$$=(e,s)=>[...e.querySelectorAll(s)];
const tpl=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
const num=v=>parseFloat(String(v).replace(/\s|\u00a0/g,'').replace(',','.'));
const opt=(a,s)=>a.map(x=>`<option${x===s?' selected':''}>${esc(x)}</option>`).join('');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function chips(host,names,cur,on){host.innerHTML='';names.forEach(n=>{const b=tpl(`<button class="chip${n===cur?' on':''}">${esc(n)}</button>`);b.onclick=()=>on(n);host.append(b)})}

/* ================= КОНВЕРТЕР ================= */
const U={
'Длина':{'м':1,'км':1000,'см':.01,'мм':.001,'дм':.1,'микрон':1e-6,'миля':1609.344,'фут':.3048,'дюйм':.0254,'ярд':.9144,'морская миля':1852,'парсек':3.0857e16,'а.е.':1.496e11},
'Масса':{'кг':1,'г':.001,'т':1000,'мг':1e-6,'фунт':.45359237,'унция':.028349523,'карата':.0002,'гран':6.48e-5},
'Объём':{'л':1,'мл':.001,'м³':1000,'см³':1e-3,'галлон':3.785411784,'кварта':.946353,'пинта':.473176,'баррель':158.987,'столовая ложка':.015,'чайная ложка':.005,'флюид. унция':.0295735},
'Площадь':{'м²':1,'км²':1e6,'см²':1e-4,'га':1e4,'ар':100,'акр':4046.8564,'фут²':.09290304,'дюйм²':.00064516,'сотка':100},
'Скорость':{'м/с':1,'км/ч':1/3.6,'миль/ч':.44704,'узел':.514444,'фут/с':.3048,'Мах':340.29},
'Время':{'сек':1,'мс':.001,'мин':60,'час':3600,'сутки':86400,'неделя':604800,'месяц':2629800,'год':31557600,'мкс':1e-6,'нс':1e-9},
'Энергия':{'Дж':1,'кДж':1000,'ккал':4184,'кал':4.184,'Вт·ч':3600,'кВт·ч':3.6e6,'эВ':1.602e-19,'БТЕ':1055.06},
'Мощность':{'Вт':1,'кВт':1000,'МВт':1e6,'л.с.':735.5,'л.с. (имп.)':745.7,'BTU/ч':.29307,'кал/с':4.184},
'Давление':{'Па':1,'кПа':1000,'МПа':1e6,'бар':1e5,'атм':101325,'мм рт.ст.':133.322,'psi':6894.76,'кгс/см²':98066.5},
'Данные':{'Б':1,'КБ':1024,'МБ':1048576,'ГБ':1073741824,'ТБ':1099511627776,'ПБ':1125899906842624,'бит':.125,'Кбит':128,'Мбит':131072},
'Угол':{'°':1,'рад':180/Math.PI,'град':.9,'оборот':360,'′':1/60,'″':1/3600}};
const T={'°C':[x=>x,x=>x],'°F':[x=>(x-32)*5/9,x=>x*9/5+32],'K':[x=>x-273.15,x=>x+273.15],'°R':[x=>x*5/9,x=>x*9/5]};
function conv(root,C){
  let cat='Длина';
  root.innerHTML=`<div class="chips"></div>
  <div class="card pad">
    <div class="row convrow"><input inputmode="decimal" value="1" aria-label="Значение"><select aria-label="Из"></select></div>
    <div class="midrow"><button class="swap" aria-label="Поменять местами"><svg viewBox="0 0 24 24"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg></button><span class="mlabel"></span></div>
    <div class="row resrow convrow"><output>—</output><select aria-label="В"></select></div>
  </div>
  <div class="quick"></div>
  <div class="sub">Все единицы</div>
  <ul class="out clist"></ul>`;
  const cs=$(root,'.chips'),rows=$$(root,'.row'),a=$(rows[0],'input'),u1=$(rows[0],'select'),o=$(rows[1],'output'),u2=$(rows[1],'select');
  const sw=$(root,'.swap'),ml=$(root,'.mlabel'),qk=$(root,'.quick'),cl=$(root,'.clist');
  const convert=v=>cat==='Температура'?T[u2.value][1](T[u1.value][0](v)):v*U[cat][u1.value]/U[cat][u2.value];
  function calc(){const v=num(a.value);
    if(isNaN(v)){o.textContent='—';ml.textContent='';cl.innerHTML='';return}
    o.textContent=C.fmt(parseFloat(convert(v).toPrecision(12)));
    ml.textContent=`${C.fmt(v)} ${u1.value} →`;
    cl.innerHTML='';
    const units=cat==='Температура'?Object.keys(T):Object.keys(U[cat]);
    units.filter(x=>x!==u1.value&&x!==u2.value).forEach(x=>{
      const val=cat==='Температура'?T[x][1](T[u1.value][0](v)):v*U[cat][u1.value]/U[cat][x];
      const li=document.createElement('li');li.innerHTML='<span></span><b></b>';
      li.firstChild.textContent=x;li.lastChild.textContent=C.fmt(parseFloat(val.toPrecision(12)));
      li.onclick=()=>C.copy(li.lastChild.textContent);cl.append(li)});
    }
  function quickRow(){qk.innerHTML='';if(cat==='Температура')return;
    Object.keys(U[cat]).slice(0,6).forEach(x=>{
      const b=tpl(`<button>${esc(x)}</button>`);b.onclick=()=>{u2.value=x;calc();C.vib()};qk.append(b)})}
  const draw=()=>{chips(cs,[...Object.keys(U),'Температура'],cat,n=>{C.vib();cat=n;draw()});
    const ks=cat==='Температура'?Object.keys(T):Object.keys(U[cat]);
    u1.innerHTML=opt(ks,ks.includes(u1.value)?u1.value:ks[0]);
    u2.innerHTML=opt(ks,ks.includes(u2.value)&&u2.value!==u1.value?u2.value:(ks[1]||ks[0]));
    quickRow();calc()};
  a.oninput=calc;u1.onchange=u2.onchange=calc;o.onclick=()=>C.copy(o.textContent);
  sw.onclick=()=>{[u1.value,u2.value]=[u2.value,u1.value];calc();C.vib()};
  draw();
}

/* ================= ФИНАНСЫ ================= */
const FIN={
'НДС':{f:[['Сумма без НДС',100000],['Ставка, %',20]],c:([s,r])=>[['Сумма с НДС',s*(1+r/100)],['НДС сверху',s*r/100],['Если сумма уже с НДС — база',s*100/(100+r)],['НДС внутри суммы',s*r/(100+r)]]},
'Скидка':{f:[['Цена',50000],['Скидка, %',15],['Ещё скидка, %',0]],c:([p,d,d2])=>{const a=p*(1-d/100),b=a*(1-(d2||0)/100);
  return [['Цена со скидкой',b],['Экономия',p-b],['Итоговая скидка',((p-b)/p*100)+'%']]}},
'Чаевые':{f:[['Счёт',3000],['Чаевые, %',10],['Человек',2]],c:([b,t,n])=>[['Чаевые',b*t/100],['Итого',b*(1+t/100)],['С человека',b*(1+t/100)/(n||1)]]},
'Кредит':{f:[['Сумма кредита',3000000],['Ставка, % годовых',18],['Срок, лет',5]],c:([s,r,y])=>{const n=Math.round(y*12)||1,m=r/1200,
  p=m?s*m/(1-Math.pow(1+m,-n)):s/n,tot=p*n;
  return [['Платёж в месяц',p],['Переплата',tot-s],['Всего выплат',tot],['Процентов в 1-й платёж',s*m]]},viz:'loan'},
'Ипотека':{f:[['Стоимость жилья',8000000],['Первоначальный взнос, %',20],['Ставка, %',8],['Срок, лет',20]],c:([h,d,r,y])=>{const s=h*(1-d/100),n=Math.round(y*12)||1,m=r/1200,
  p=m?s*m/(1-Math.pow(1+m,-n)):s/n,tot=p*n;
  return [['Собственные средства',h*d/100],['Сумма кредита',s],['Платёж в месяц',p],['Переплата',tot-s],['Всего выплат',tot+h*d/100]]},viz:'mortgage'},
'Вклад':{f:[['Начальное вложение',500000],['Ставка, % годовых',16],['Срок, мес.',12],['Пополнение в мес.',10000]],c:([s,r,y,pmt])=>{const m=r/1200;let bal=s;
  for(let i=0;i<y;i++){bal=bal*(1+m)+(pmt||0)}
  const put=s+(pmt||0)*y;
  return [['Итого на конце срока',bal],['Накопленные проценты',bal-put],['Всего внесено',put],['Доходность',(bal-put)/put*100+'%']]},viz:'deposit'},
'Процент от числа':{f:[['Число A',15],['Число B',200]],c:([a,b])=>[['A% от B',a*b/100],['A составляет от B',(b?a/b*100:NaN)+'%'],['B + A%',b*(1+a/100)],['B − A%',b*(1-a/100)]]},
'Прибыль':{f:[['Выручка',1000000],['Расходы',650000]],c:([rv,c])=>[['Валовая прибыль',rv-c],['Рентабельность',((rv?(rv-c)/rv:NaN)*100)+'%'],['Маржинальность',((c?(rv-c)/c:NaN)*100)+'%']]},
'Разница цен':{f:[['Было',800],['Стало',1000]],c:([a,b])=>[['Изменение',((b-a)/a*100)+'%'],['На сколько выросло',b-a],['Во сколько раз',(b/a)+'×']]},
'Сложный процент':{f:[['Сумма',300000],['Ставка, % годовых',15],['Капитализация в год',12],['Срок, лет',3]],c:([s,r,k,y])=>{const f=s*Math.pow(1+r/100/k,k*y);
  return [['Сумма на конце',f],['Прирост',f-s],['Прирост',((f-s)/s*100)+'%']]},viz:'compound'}};
function fin(root,C){
  let k='Кредит';
  root.innerHTML='<div class="chips"></div><div class="card fields"></div><div class="chartbox" hidden></div><div class="sub">Результаты</div><ul class="out"></ul>';
  const cs=$(root,'.chips'),fl=$(root,'.fields'),ou=$(root,'.out'),cb=$(root,'.chartbox');
  const fmtVal=x=>!isFinite(x)?'—':typeof x==='string'?x:C.money(x);
  function calc(){const v=$$(fl,'input').map(i=>num(i.value));
    ou.innerHTML='';cb.hidden=true;cb.innerHTML='';
    const res=FIN[k].c(v);
    res.forEach(([l,x],idx)=>{const li=document.createElement('li');li.style.animationDelay=(idx*45)+'ms';
      li.innerHTML='<span></span><b></b>';li.firstChild.textContent=l;li.lastChild.textContent=fmtVal(x);
      li.onclick=()=>C.copy(li.lastChild.textContent);ou.append(li)});
    if(FIN[k].viz){cb.hidden=false;chart(res,v)}}
  function chart(res,v){
    if(k==='Кредит')Graph.donut(cb,[{n:'Тело кредита',v:v[0]},{n:'Переплата',v:Math.max(res[1][1],0)}],'Кредит');
    if(k==='Ипотека')Graph.donut(cb,[{n:'Взнос',v:res[0][1]},{n:'Тело кредита',v:res[1][1]},{n:'Переплата',v:Math.max(res[3][1],0)}],'Ипотека');
    if(k==='Вклад')Graph.bars(cb,[{n:'Внесено',v:res[2][1]},{n:'Проценты',v:res[1][1]},{n:'Итого',v:res[0][1]}],'₽');
    if(k==='Сложный процент'){const y=Math.max(1,Math.min(12,num(v[3])||1)),pts=[];
      for(let t=1;t<=y;t++)pts.push({n:t+' г.',v:v[0]*Math.pow(1+v[1]/100/v[2],v[2]*t)-v[0]});
      Graph.bars(cb,pts,'прирост, ₽')}}
  const draw=()=>{chips(cs,Object.keys(FIN),k,n=>{C.vib();k=n;draw()});
    fl.innerHTML='';
    FIN[k].f.forEach(([l,d])=>{const w=tpl('<label><small></small><input inputmode="decimal"></label>');
      w.firstChild.textContent=l;w.lastChild.value=d;w.lastChild.oninput=calc;fl.append(w)});calc()};
  draw();
}

/* ================= ДАТА ================= */
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const WD=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const dstr=d=>d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear()+', '+WD[d.getDay()];
function dateTool(root,C){
  const today=new Date().toISOString().slice(0,10);
  const inp=(id,label,v=today)=>`<label class="di"><small>${label}</small><input id="${id}" type="date" value="${v}"></label>`;
  const CATS=['Разница дат','Прибавить дни','Возраст'];
  root.innerHTML=`<div class="chips"></div>
  <div class="dt dt-diff"><div class="cols2">${inp('d1','Дата начала')}${inp('d2','Дата окончания')}</div><ul class="out" id="do1"></ul></div>
  <div class="dt dt-add" hidden><div class="cols2">${inp('d3','От какой даты')}</div>
    <div class="row"><input id="dadd" inputmode="numeric" value="100"><select id="dunit"><option>дней</option><option>недель</option><option>месяцев</option><option>лет</option></select><select id="dsgn"><option value="1">прибавить</option><option value="-1">вычесть</option></select></div>
    <ul class="out" id="do2"></ul></div>
  <div class="dt dt-age" hidden><div class="cols2">${inp('d4','Дата рождения / события')}</div><ul class="out" id="do3"></ul></div>`;
  const cs=$(root,'.chips');let mode='diff';
  const el=id=>root.querySelector('#'+id);
  const D=id=>{const x=el(id);return x&&x.value?new Date(x.value+'T00:00:00'):NaN};
  const out=(id,rows)=>{const u=el(id);u.innerHTML='';
    rows.forEach(([l,v],i)=>{const li=document.createElement('li');li.style.animationDelay=(i*45)+'ms';
      li.innerHTML='<span></span><b></b>';li.firstChild.textContent=l;li.lastChild.textContent=v;
      li.onclick=()=>C.copy(v);u.append(li)})};
  function calcDiff(){const a=D('d1'),b=D('d2');if(isNaN(a)||isNaN(b))return;
    const s=Math.round((b-a)/864e5);
    let y=b.getFullYear()-a.getFullYear(),mo=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();
    if(d<0){mo--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}
    if(mo<0){y--;mo+=12}
    out('do1',[['Разница, дней',(s>0?'+':'')+s],['Полных периодов',`${y>0?y+' г. ':''}${mo>0?mo+' мес. ':''}${Math.abs(d)} д.`],
      ['Рабочих дней (≈)',Math.sign(s||1)*Math.floor(Math.abs(s)*5/7)],['Выходных (≈)',Math.sign(s||1)*Math.ceil(Math.abs(s)*2/7)],
      ['Недель',(s>0?'+':'')+Math.trunc(s/7)],['Дата начала',dstr(a)],['Дата окончания',dstr(b)]])}
  function calcAdd(){const a=D('d3');if(isNaN(a))return;
    const v=parseInt(el('dadd').value)||0,u=el('dunit').value,sg=+el('dsgn').value;
    const b=new Date(a);
    if(u==='дней')b.setDate(b.getDate()+sg*v);else if(u==='недель')b.setDate(b.getDate()+sg*v*7);
    else if(u==='месяцев')b.setMonth(b.getMonth()+sg*v);else b.setFullYear(b.getFullYear()+sg*v);
    out('do2',[['Результат',dstr(b)],['ISO-формат',b.toISOString().slice(0,10)],['Сдвиг, дней',Math.round((b-a)/864e5)]])}
  function calcAge(){const a=D('d4'),now=new Date();if(isNaN(a))return;
    if(a>now){out('do3',[['—','Дата в будущем']]);return}
    let y=now.getFullYear()-a.getFullYear(),mo=now.getMonth()-a.getMonth(),d=now.getDate()-a.getDate();
    if(d<0){mo--;d+=new Date(now.getFullYear(),now.getMonth(),0).getDate()}
    if(mo<0){y--;mo+=12}
    const next=new Date(now.getFullYear(),a.getMonth(),a.getDate());if(next<now)next.setFullYear(now.getFullYear()+1);
    out('do3',[['Полных лет',y],['Полный возраст',`${y} г. ${mo} мес. ${d} д.`],['Прошло дней',Math.round((now-a)/864e5)],
      ['Следующая годовщина',dstr(next)],['До неё осталось дней',Math.round((next-now)/864e5)]])}
  const refresh=()=>mode==='diff'?calcDiff():mode==='add'?calcAdd():calcAge();
  const setMode=n=>{mode={'Разница дат':'diff','Прибавить дни':'add','Возраст':'age'}[n];
    $(root,'.dt-diff').hidden=mode!=='diff';$(root,'.dt-add').hidden=mode!=='add';$(root,'.dt-age').hidden=mode!=='age';
    chips(cs,CATS,n,setMode);refresh()};
  /* переключение режимов по data-mode — устойчиво к любому способу вызова */
  cs.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;C.vib();setMode(b.textContent)};
  ['d1','d2','d3','d4','dadd'].forEach(id=>{const x=el(id);if(x)x.oninput=refresh});
  el('dunit').onchange=el('dsgn').onchange=refresh;
  chips(cs,CATS,CATS[0],n=>{C.vib();setMode(n)});refresh();
}

/* ================= ГРАФИК ================= */
function graph(root,C){
  root.innerHTML=`<div class="card pad gform">
    <label><small>y = f(x)</small><input id="gf" value="sin(x)/x" spellcheck="false" autocomplete="off"></label>
    <div class="cols2">
      <label><small>x от</small><input id="gx0" inputmode="decimal" value="-20"></label>
      <label><small>x до</small><input id="gx1" inputmode="decimal" value="20"></label>
    </div>
    <div class="presets"></div>
  </div>
  <div class="plotwrap"><canvas id="gc"></canvas></div>
  <div class="bar zoom"><button data-z=".5" aria-label="Приблизить">−</button><button id="zr">Сброс</button><button data-z="2" aria-label="Отдалить">+</button><button id="gcopy">Копировать y = f(x)</button></div>`;
  const el=id=>root.querySelector('#'+id);
  const cv=el('gc'),inp=el('gf'),x0=el('gx0'),x1=el('gx1'),ps=$(root,'.presets'),pw=$(root,'.plotwrap');
  ['sin(x)/x','x^2','x^3−3x','√(x)','1/x','tan(x)','ln(x)','abs(x)−2','2^x−x^2','sin(x)+sin(3x)/3']
    .forEach(p=>{const b=tpl(`<button class="chip">${esc(p)}</button>`);b.onclick=()=>{inp.value=p;draw();C.vib()};ps.append(b)});
  function draw(){if(cv.hidden)return;
    try{const f=Engine.fnOf(inp.value.replace(/,/g,'.'),false);
      Graph.plot(cv,f,{xmin:num(x0.value),xmax:num(x1.value)});}
    catch(e){const g=cv.getContext('2d'),dpr=devicePixelRatio||1;
      g.clearRect(0,0,cv.width/dpr,cv.height/dpr);g.font='14px system-ui';g.fillStyle='#e5484d';
      g.fillText('Проверьте выражение, например: sin(x)/x',16,28)}}
  inp.oninput=x0.oninput=x1.oninput=draw;
  $$(root,'[data-z]').forEach(b=>b.onclick=()=>{const z=+b.dataset.z;x0.value=+x0.value*z;x1.value=+x1.value*z;draw()});
  el('zr').onclick=()=>{x0.value=-20;x1.value=20;draw()};
  el('gcopy').onclick=()=>C.copy('y = '+inp.value);
  /* рисуем при любом изменении размера контейнера и при входе во вкладку */
  new ResizeObserver(()=>draw()).observe(pw);
  const sync=()=>{const vis=!root.hidden;
    if(vis&&cv.hidden){cv.hidden=false;requestAnimationFrame(draw)}else if(!vis)cv.hidden=true};
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['hidden']});
  cv.hidden=!root.hidden;   /* старт: вкладка скрыта — не рисуем пустой canvas */
  if(!cv.hidden)draw();
}
return{conv,fin,dateTool,graph};
})();
