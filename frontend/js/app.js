'use strict';
const $=(s,r=document)=>r.querySelector(s);
const money=n=>'$'+Number(n).toLocaleString('es-CO');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SEED={
productos:[
{codigo:'MR-001',nombre:'Pastillas de freno delanteras',categoria:'Frenos',precio:32000,stock:18},
{codigo:'MR-002',nombre:'Kit de arrastre 428',categoria:'Transmisión',precio:95000,stock:7},
{codigo:'MR-003',nombre:'Aceite 20W-50 1L',categoria:'Lubricantes',precio:28000,stock:40},
{codigo:'MR-004',nombre:'Bujía NGK CR7HSA',categoria:'Motor',precio:12000,stock:4},
{codigo:'MR-005',nombre:'Filtro de aire',categoria:'Motor',precio:18000,stock:12},
{codigo:'MR-006',nombre:'Cadena de transmisión',categoria:'Transmisión',precio:60000,stock:3},
{codigo:'MR-007',nombre:'Llanta trasera 90/90-18',categoria:'Llantas',precio:145000,stock:6},
{codigo:'MR-008',nombre:'Bombillo de farola H4',categoria:'Eléctrico',precio:9000,stock:25}],
clientes:[
{nombre:'Carlos Gómez',documento:'1010203040',telefono:'3105551020',correo:'carlos@correo.com'},
{nombre:'Laura Pérez',documento:'52123456',telefono:'3205557788',correo:'laura@correo.com'},
{nombre:'Taller El Pistón',documento:'900123456',telefono:'3015554433',correo:'taller@correo.com'}],
usuarios:[
{nombre:'Administrador MR',correo:'admin@motomr.co',rol:'Administrador'},
{nombre:'Vendedor Uno',correo:'vendedor@motomr.co',rol:'Vendedor'}]};
const ses={get:()=>{try{return sessionStorage.getItem('mr_user')||localStorage.getItem('mr_sesion')}catch{return null}},
set:v=>{try{sessionStorage.setItem('mr_user',v)}catch{}try{localStorage.setItem('mr_sesion',v)}catch{}},
del:()=>{try{sessionStorage.removeItem('mr_user')}catch{}try{localStorage.removeItem('mr_sesion')}catch{}}};
const mem={};
const data=k=>mem[k]||(mem[k]=(()=>{try{const v=JSON.parse(localStorage.getItem('mr_'+k));if(v)return v}catch{}return structuredClone(SEED[k]||[])})());
const save=k=>{try{localStorage.setItem('mr_'+k,JSON.stringify(mem[k]))}catch{}};
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.append(t)}
t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2800)}

/* Formulario modal reutilizable con validación en línea */
function openForm(title,fields,onSave){
const d=document.createElement('dialog');
d.innerHTML=`<form method="dialog" novalidate><h2>${title}</h2>${fields.map(f=>`<label>${f.l}${f.s?`<select name="${f.n}">${f.s.map(o=>`<option>${o}</option>`).join('')}</select>`:`<input name="${f.n}" type="${f.t||'text'}" ${f.t==='number'?'min="0"':''} autocomplete="off">`}<small class="err" data-e="${f.n}"></small></label>`).join('')}<div class="row end"><button type="button" class="btn ghost" data-x>Cancelar</button><button class="btn">Guardar</button></div></form>`;
document.body.append(d);d.showModal();
const f=$('form',d);$('[data-x]',d).onclick=()=>d.close();d.addEventListener('close',()=>d.remove());
f.onsubmit=e=>{e.preventDefault();let ok=true;const v={};
fields.forEach(x=>{const val=f.elements[x.n].value.trim();let m='';
if(!val)m='Completa este campo.';
else if(x.t==='number'&&!(+val>=0))m='Escribe un número válido.';
else if(x.t==='email'&&!/^\S+@\S+\.\S+$/.test(val))m='Escribe un correo válido, por ejemplo nombre@correo.com.';
$(`[data-e="${x.n}"]`,d).textContent=m;if(m)ok=false;v[x.n]=x.t==='number'?+val:val});
if(ok){onSave(v);d.close()}};
$('input,select',f).focus()}

/* Estructura común: barra lateral + encabezado */
const NAV=[['index','Inicio'],['venta','Punto de venta'],['productos','Productos'],['clientes','Clientes'],['usuarios','Usuarios y roles']];
function shell(page){
const user=ses.get();if(!user){location.replace('login.html');return false}
const main=$('main'),lay=document.createElement('div');lay.className='layout';
lay.innerHTML=`<aside id="lateral"><div class="marca"><b>MR</b> Moto MR</div><nav aria-label="Principal">${NAV.map(([p,t])=>`<a href="${p}.html"${p===page?' aria-current="page"':''}>${t}</a>`).join('')}</nav><button class="salir" id="salir">Cerrar sesión</button></aside><div><header class="top"><button class="menu" id="menu" aria-label="Abrir menú" aria-controls="lateral">☰</button><strong>${esc(document.title.split('·')[0])}</strong><span class="quien">${esc(user)}</span></header></div>`;
document.body.prepend(lay);lay.lastChild.append(main);
$('#menu').onclick=()=>$('#lateral').classList.toggle('open');
$('#salir').onclick=()=>{ses.del();location.href='login.html'};
return true}

/* Tabla con búsqueda */
function lista({key,cols,fields,titulo,extra}){
const body=$('#filas'),q=$('#q'),cat=$('#cat');
if(cat&&extra)extra.opts().forEach(o=>cat.add(new Option(o)));
const draw=()=>{const t=q.value.toLowerCase(),c=cat?cat.value:'';
const rows=data(key).filter(r=>JSON.stringify(Object.values(r)).toLowerCase().includes(t)&&(!c||r.categoria===c));
body.innerHTML=rows.length?rows.map(r=>`<tr>${cols.map(c=>`<td class="${c.n?'num':''}">${c.f(r)}</td>`).join('')}</tr>`).join(''):`<tr><td class="vacio" colspan="${cols.length}">No hay resultados. Prueba con otra búsqueda o agrega un registro nuevo.</td></tr>`};
q.oninput=draw;if(cat)cat.onchange=draw;
$('#nuevo').onclick=()=>openForm(titulo,fields,v=>{data(key).unshift(v);save(key);draw();toast('Guardado: '+v.nombre)});
draw()}

const P={
login(){
$('#login').onsubmit=e=>{e.preventDefault();const c=$('#correo').value.trim().toLowerCase(),k=$('#clave').value,er=$('#error');
const u=[...SEED.usuarios,...data('usuarios')].find(x=>x.correo.toLowerCase()===c||x.correo.split('@')[0]===c);
if(!c||!k){er.textContent='Escribe tu correo y tu contraseña.';return}
if(!u||k!=='1234'){er.textContent='Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.';return}
ses.set(u.nombre);location.href='index.html'}},
index(){
const v=data('ventas'),hoy=new Date().toLocaleDateString('es-CO'),dh=v.filter(x=>x.fecha===hoy),pr=data('productos'),bajos=pr.filter(p=>p.stock<=5);
$('#k').innerHTML=`<div class="kpi v"><span>Ventas de hoy</span><strong>${money(dh.reduce((s,x)=>s+x.total,0))}</strong></div><div class="kpi"><span>Facturas emitidas hoy</span><strong>${dh.length}</strong></div><div class="kpi a"><span>Productos por agotarse</span><strong>${bajos.length}</strong></div>`;
$('#bajos').innerHTML=bajos.length?bajos.map(p=>`<li><span>${esc(p.nombre)}</span><span class="tag bajo">${p.stock} en stock</span></li>`).join(''):'<li>Todo el inventario está al día.</li>';
$('#ult').innerHTML=v.length?v.slice(0,5).map(x=>`<li><span>Factura ${x.n} · ${esc(x.cliente)}</span><strong>${money(x.total)}</strong></li>`).join(''):'<li>Aún no hay ventas. Registra la primera en Punto de venta.</li>'},
productos(){lista({key:'productos',titulo:'Nuevo producto',
extra:{opts:()=>[...new Set(data('productos').map(p=>p.categoria))]},
fields:[{n:'codigo',l:'Código'},{n:'nombre',l:'Nombre del producto'},{n:'categoria',l:'Categoría'},{n:'precio',l:'Precio (COP)',t:'number'},{n:'stock',l:'Unidades en stock',t:'number'}],
cols:[{f:r=>esc(r.codigo)},{f:r=>esc(r.nombre)},{f:r=>`<span class="tag">${esc(r.categoria)}</span>`},{n:1,f:r=>money(r.precio)},{n:1,f:r=>`<span class="tag ${r.stock<=5?'bajo':'ok'}">${r.stock<=5?'Bajo: ':''}${r.stock}</span>`}]})},
clientes(){lista({key:'clientes',titulo:'Nuevo cliente',
fields:[{n:'nombre',l:'Nombre completo'},{n:'documento',l:'Documento o NIT'},{n:'telefono',l:'Teléfono',t:'tel'},{n:'correo',l:'Correo electrónico',t:'email'}],
cols:[{f:r=>esc(r.nombre)},{f:r=>esc(r.documento)},{f:r=>esc(r.telefono)},{f:r=>esc(r.correo)}]})},
usuarios(){lista({key:'usuarios',titulo:'Nuevo usuario',
fields:[{n:'nombre',l:'Nombre completo'},{n:'correo',l:'Correo electrónico',t:'email'},{n:'rol',l:'Rol',s:['Vendedor','Administrador']}],
cols:[{f:r=>esc(r.nombre)},{f:r=>esc(r.correo)},{f:r=>`<span class="tag ${r.rol==='Administrador'?'':'ok'}">${r.rol}</span>`}]})},
venta(){
const cart={},IVA=.19,pr=data('productos');
const cl=$('#cliente');cl.add(new Option('Cliente general'));data('clientes').forEach(c=>cl.add(new Option(c.nombre)));
const total=()=>Object.entries(cart).reduce((s,[i,q])=>s+pr[i].precio*q,0);
const grid=()=>{const t=$('#q').value.toLowerCase();
$('#cat').innerHTML=pr.map((p,i)=>({p,i})).filter(({p})=>(p.nombre+p.codigo).toLowerCase().includes(t)).map(({p,i})=>`<button class="prod" data-i="${i}" ${p.stock-(cart[i]||0)<=0?'disabled':''}><strong>${esc(p.nombre)}</strong><span class="nota">${esc(p.codigo)} · ${p.stock-(cart[i]||0)} disponibles</span><span class="p">${money(p.precio)}</span></button>`).join('')||'<p class="vacio">No encontramos productos con ese nombre.</p>'};
const draw=()=>{const e=Object.entries(cart);
$('#lineas').innerHTML=e.length?e.map(([i,q])=>`<div class="linea"><span>${esc(pr[i].nombre)}</span><strong>${money(pr[i].precio*q)}</strong><div class="cant"><button data-m="${i}" aria-label="Quitar una unidad">−</button><span>${q}</span><button data-s="${i}" aria-label="Agregar una unidad">+</button></div><button class="btn ghost sm" data-d="${i}">Quitar</button></div>`).join(''):'<p class="vacio">El carrito está vacío. Toca un producto para agregarlo.</p>';
const s=total();$('#sub').textContent=money(s);$('#iva').textContent=money(Math.round(s*IVA));$('#tot').textContent=money(Math.round(s*(1+IVA)));$('#cobrar').disabled=!e.length;grid()};
$('#q').oninput=grid;
$('#cat').onclick=e=>{const b=e.target.closest('[data-i]');if(b){cart[b.dataset.i]=(cart[b.dataset.i]||0)+1;draw()}};
$('#lineas').onclick=e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
if(d.s){if(cart[d.s]<pr[d.s].stock)cart[d.s]++;else toast('No hay más unidades en stock.')}
if(d.m&&--cart[d.m]<=0)delete cart[d.m];if(d.d)delete cart[d.d];draw()};
$('#cobrar').onclick=()=>{
const v=data('ventas'),n=1001+v.length,s=total(),f=new Date().toLocaleDateString('es-CO'),it=Object.entries(cart);
const r={n,fecha:f,cliente:cl.value,total:Math.round(s*(1+IVA))};v.unshift(r);save('ventas');
const items=it.map(([i,q])=>{pr[i].stock-=q;return{...pr[i],q}});save('productos');
const dlg=document.createElement('dialog');dlg.className='factura';
dlg.innerHTML=`<h2>Factura N.º ${n}</h2><p class="nota">${f} · Cliente: ${esc(r.cliente)}</p><table><thead><tr><th>Producto</th><th class="num">Cant.</th><th class="num">Valor</th></tr></thead><tbody>${items.map(x=>`<tr><td>${esc(x.nombre)}</td><td class="num">${x.q}</td><td class="num">${money(x.precio*x.q)}</td></tr>`).join('')}</tbody></table><div class="tot"><span>IVA 19%</span><span>${money(Math.round(s*IVA))}</span><strong>Total</strong><strong class="g">${money(r.total)}</strong></div><div class="row end"><button class="btn ghost" onclick="print()">Imprimir</button><button class="btn ok" data-n>Nueva venta</button></div>`;
document.body.append(dlg);dlg.showModal();
$('[data-n]',dlg).onclick=()=>{dlg.close();dlg.remove();for(const k in cart)delete cart[k];draw();toast('Venta registrada. Factura '+n)}};
draw()}};

document.addEventListener('DOMContentLoaded',()=>{const p=document.body.dataset.page;
if(p!=='login'&&!shell(p))return;if(P[p])P[p]()});
