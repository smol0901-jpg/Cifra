/* NOVA Engine — безопасный парсер выражений без eval(). Поддержка x (переменная), tau и расширенных функций. */
const Engine=(()=>{
const F={sin:Math.sin,cos:Math.cos,tan:Math.tan,ln:Math.log,log:Math.log10,lg:Math.log10,log2:Math.log2,
sqrt:Math.sqrt,cbrt:Math.cbrt,abs:Math.abs,exp:Math.exp,floor:Math.floor,ceil:Math.ceil,round:Math.round,sign:Math.sign,
asin:Math.asin,acos:Math.acos,atan:Math.atan,sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh};
const ERR='Ошибка';
function fact(n){if(n<0||n%1||n>170)throw Error(ERR);let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function tokenize(s){
  s=s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/τ/g,'tau').replace(/,/g,'.');
  const t=[],re=/\s*(\d+\.?\d*|\.\d+|[a-z]+|[-+*\/^()!%])/gy;let m,last=0;
  while((m=re.exec(s))){t.push(m[1]);last=re.lastIndex}
  if(s.slice(last).trim())throw Error(ERR);
  return t;
}
function calc(s,deg,xv){
  const t=tokenize(s);let o=0,i=0;
  for(const q of t){if(q==='(')o++;if(q===')')o--}
  while(o-->0)t.push(')');           // автозакрытие скобок
  const peek=()=>t[i],next=()=>t[i++];
  const rad=v=>deg?v*Math.PI/180:v;
  const clean=r=>Math.abs(r)<1e-12?0:r;
  function expr(){let v=term().v;
    while(peek()==='+'||peek()==='-'){const op=next(),r=term(),b=r.pct?v*r.v:r.v;v=op==='+'?v+b:v-b}
    return v}                        // 100+10% = 110
  function term(){let v=unary(),mul=false;
    for(;;){const p=peek();
      if(p==='*'||p==='/'){next();mul=true;const r=unary();
        if(p==='/'){if(r===0)throw Error('Деление на 0');v/=r}else v*=r}
      else if(p&&(p==='('||/^[a-z\d.]/.test(p))){mul=true;v*=unary()}   // 2π, 3(4+1)
      else break}
    return{v,pct:!mul&&t[i-1]==='%'}}
  function unary(){const p=peek();if(p==='-'){next();return -unary()}if(p==='+'){next();return unary()}return power()}
  function power(){const b=post();if(peek()==='^'){next();return Math.pow(b,unary())}return b}
  function post(){let v=prim();while(peek()==='!'||peek()==='%'){v=next()==='!'?fact(v):v/100}return v}
  function prim(){const x=next();
    if(x===undefined)throw Error(ERR);
    if(/^[\d.]/.test(x))return parseFloat(x);
    if(x==='('){const v=expr();if(next()!==')')throw Error(ERR);return v}
    if(x==='pi')return Math.PI;
    if(x==='tau')return 2*Math.PI;
    if(x==='e')return Math.E;
    if(x==='x'){if(xv===undefined)throw Error(ERR);return xv}
    if(F[x]){if(next()!=='(')throw Error(ERR);const v=expr();if(next()!==')')throw Error(ERR);
      return /^(sin|cos|tan)$/.test(x)?clean(F[x](rad(v))):/^a(sin|cos|tan)$/.test(x)?clean(F[x](v)*(deg?180/Math.PI:1)):F[x](v)}
    throw Error(ERR)}
  const r=expr();
  if(i<t.length||!isFinite(r))throw Error(ERR);
  return parseFloat(r.toPrecision(12));  // 0.1+0.2 = 0.3
}
/* Функция y=f(x) из строки выражения (для графика). */
function fnOf(s,deg){
  return x=>calc(s,deg,x);
}
function fmt(n,dec=10,sep='sp'){
  if(n===0)return '0';
  const a=Math.abs(n);
  if(a>=1e15||a<1e-9)return n.toExponential(6).replace(/\.?0+e/,'e').replace('e+','×10^');
  return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:dec,useGrouping:sep!=='no'}).format(n);
}
return{calc,fmt,fnOf};
})();
if(typeof module!=='undefined')module.exports=Engine;
