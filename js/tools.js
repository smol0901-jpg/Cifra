/* Конвертер единиц и финансовые расчёты. */
const Tools=(()=>{
const $=(e,s)=>e.querySelector(s);
const U={Длина:{'м':1,'км':1000,'см':.01,'мм':.001,'миля':1609.344,'фут':.3048,'дюйм':.0254},
Масса:{'кг':1,'г':.001,'т':1000,'фунт':.45359237,'унция':.028349523},
Объём:{'л':1,'мл':.001,'м³':1000,'галлон':3.785411784},
Площадь:{'м²':1,'га':1e4,'км²':1e6,'фут²':.09290304,'акр':4046.8564},
Скорость:{'м/с':1,'км/ч':1/3.6,'миль/ч':.44704,'узел':.514444},
Данные:{'Б':1,'КБ':1024,'МБ':1048576,'ГБ':1073741824,'ТБ':1099511627776}};
const T={'°C':[x=>x,x=>x],'°F':[x=>(x-32)*5/9,x=>x*9/5+32],'K':[x=>x-273.15,x=>x+273.15]};
const FIN={
'НДС':{f:[['Сумма',1000],['Ставка, %',20]],c:([s,r])=>[['Сумма с НДС',s*(1+r/100)],['НДС сверху',s*r/100],['Без НДС, если сумма с НДС',s*100/(100+r)],['НДС внутри суммы',s*r/(100+r)]]},
'Скидка':{f:[['Цена',5000],['Скидка, %',15]],c:([p,d])=>[['Итоговая цена',p*(1-d/100)],['Экономия',p*d/100]]},
'Чаевые':{f:[['Счёт',3000],['Чаевые, %',10],['Человек',2]],c:([b,t,n])=>[['Чаевые',b*t/100],['Итого',b*(1+t/100)],['С человека',b*(1+t/100)/(n||1)]]},
'Кредит':{f:[['Сумма',1000000],['Ставка, % годовых',16],['Срок, мес.',36]],c:([s,r,n])=>{const m=r/1200,p=m?s*m/(1-Math.pow(1+m,-n)):s/n;return[['Платёж в месяц',p],['Переплата',p*n-s],['Всего выплат',p*n]]}},
'Процент':{f:[['Число A',15],['Число B',200]],c:([a,b])=>[['A% от B',a*b/100],['A составляет от B, %',b?a/b*100:NaN]]}};
const num=v=>parseFloat(String(v).replace(/\s/g,'').replace(',','.'));
const opt=(a,s)=>a.map(x=>`<option${x===s?' selected':''}>${x}</option>`).join('');
function chips(el,names,cur,on){el.innerHTML='';names.forEach(n=>{const b=document.createElement('button');b.className='chip'+(n===cur?' on':'');b.textContent=n;b.onclick=()=>on(n);el.append(b)})}
function conv(el,C){
  let cat='Длина';
  el.innerHTML='<div class="chips"></div><div class="row"><input inputmode="decimal" value="1" aria-label="Значение"><select aria-label="Из"></select></div><button class="swap" aria-label="Поменять местами">⇅</button><div class="row"><output></output><select aria-label="В"></select></div>';
  const [r1,r2]=el.querySelectorAll('.row'),[a,u1]=r1.children,[o,u2]=r2.children,cs=$(el,'.chips');
  const calc=()=>{const v=num(a.value);if(isNaN(v)){o.textContent='—';return}
    const r=cat==='Температура'?T[u2.value][1](T[u1.value][0](v)):v*U[cat][u1.value]/U[cat][u2.value];
    o.textContent=C.fmt(parseFloat(r.toPrecision(12)))};
  const draw=()=>{chips(cs,[...Object.keys(U),'Температура'],cat,n=>{C.vib();cat=n;draw()});
    const k=cat==='Температура'?Object.keys(T):Object.keys(U[cat]);u1.innerHTML=opt(k,k[0]);u2.innerHTML=opt(k,k[1]);calc()};
  a.oninput=u1.onchange=u2.onchange=calc;o.onclick=()=>C.copy(o.textContent);
  $(el,'.swap').onclick=()=>{[u1.value,u2.value]=[u2.value,u1.value];calc();C.vib()};
  draw();
}
function fin(el,C){
  let k='НДС';
  el.innerHTML='<div class="chips"></div><div class="fields"></div><ul class="out"></ul>';
  const cs=$(el,'.chips'),fl=$(el,'.fields'),ou=$(el,'.out');
  const calc=()=>{const v=[...fl.querySelectorAll('input')].map(i=>num(i.value));ou.innerHTML='';
    FIN[k].c(v).forEach(([l,x])=>{const li=document.createElement('li');li.innerHTML='<span></span><b></b>';
      li.firstChild.textContent=l;li.lastChild.textContent=isFinite(x)?C.money(x):'—';li.onclick=()=>C.copy(li.lastChild.textContent);ou.append(li)})};
  const draw=()=>{chips(cs,Object.keys(FIN),k,n=>{C.vib();k=n;draw()});fl.innerHTML='';
    FIN[k].f.forEach(([l,d])=>{const w=document.createElement('label');w.innerHTML='<small></small><input inputmode="decimal">';
      w.firstChild.textContent=l;w.lastChild.value=d;w.lastChild.oninput=calc;fl.append(w)});calc()};
  draw();
}
return{conv,fin};
})();
