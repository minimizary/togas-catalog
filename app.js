'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]/g,'');
const plural=(n,a,b,c)=>n%100>=11&&n%100<=14?c:n%10===1?a:n%10>=2&&n%10<=4?b:c;
const money=(n,c='UZS')=>n?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+(c==='USD'?' $':' сум'):'Цена по запросу';
const price=v=>(v.oldPrice?'<del>'+money(v.oldPrice,v.currency)+'</del>':'')+money(v.price,v.currency);
const colors=p=>[...new Set(p.variants.map(v=>v.color||'Цвет не указан'))];
const min=p=>Math.min(...p.variants.filter(v=>v.price).map(v=>v.price),Infinity);
const sale=p=>p.variants.some(v=>v.discount||v.sale);
const available=p=>p.variants.some(v=>v.stock>0);
const swatch=c=>{c=c.toLowerCase();for(const [k,v] of Object.entries({'бел':'#f8f8f4','экр':'#e8dfce','айвори':'#e8dfce','крем':'#ede1cb','сер':'#969a9c','чер':'#20242b','антрацит':'#44464a','роз':'#d9a3b3','беж':'#cdb597','корич':'#77583f','коф':'#967a61','син':'#263c60','гол':'#afc9db','бир':'#4e999e','зелен':'#7a8f79','изумруд':'#2c6858','сирен':'#ac98b7','лаванд':'#b6a8c6','золот':'#b99853','слив':'#6b405d','bron':'#9d734e','butter':'#e8d9ac','perla':'#d8d6cd','buro':'#816b54','black':'#292b2b','laguna':'#50989b'}))if(c.includes(k))return v;return '#e5e2dc'};
let products=[],filtered=[],cat='',page=1,onlyFav=false,current=null,lastFocus=null;
let favorites=[];try{favorites=JSON.parse(localStorage.getItem('togas-favorites-v2')||'[]')}catch{}
function photo(url,name){return url?'<img src="'+esc(url)+'" alt="'+esc(name)+'" loading="lazy" onerror="this.outerHTML=\'<div class=noimage><b>TOGAS</b><span>Фотография недоступна</span></div>\'">':'<div class="noimage"><b>Фото уточняется</b><span>Точный вариант пока не найден</span></div>'}
function heroVariant(p){return p.variants.find(v=>v.image)||p.variants[0]}
function render(){
 filtered=products.filter(p=>(!cat||p.category===cat)&&(!onlyFav||favorites.includes(p.id))&&(!$('#brand').value||p.brand===$('#brand').value)&&(!$('#search').value||norm(JSON.stringify([p.name,p.brand,p.category,p.variants.map(v=>[v.color,v.size])])).includes(norm($('#search').value)))&&(!$('#kind').value||($('#kind').value==='new'?p.isNew:$('#kind').value==='sale'?sale(p):available(p))));
 const sort=$('#sort').value;
 if(sort==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
 if(sort==='asc'||sort==='desc')filtered.sort((a,b)=>{if(min(a)===Infinity)return 1;if(min(b)===Infinity)return -1;const ca=a.variants.find(v=>v.price)?.currency||'UZS',cb=b.variants.find(v=>v.price)?.currency||'UZS';if(ca!==cb)return ca.localeCompare(cb);return sort==='asc'?min(a)-min(b):min(b)-min(a)});
 const totalPages=Math.ceil(filtered.length/24);if(page>totalPages)page=1;
 $('#heading').textContent=onlyFav?'Избранное':cat||'Все коллекции';
 $('#count').textContent=filtered.length+' '+plural(filtered.length,'коллекция','коллекции','коллекций');$('#favCount').textContent=favorites.length;
 $('#cats').innerHTML=['',...new Set(products.map(p=>p.category))].map(c=>'<button data-cat="'+esc(c)+'" class="'+(cat===c?'active':'')+'">'+esc(c||'Все коллекции')+'<small>'+products.filter(p=>!c||p.category===c).length+'</small></button>').join('');
 $('#grid').innerHTML=filtered.slice((page-1)*24,page*24).map(p=>{
  const v=p.variants.find(v=>v.price===min(p))||p.variants[0],h=heroVariant(p),d=Math.max(...p.variants.map(x=>x.discount||0)),cs=colors(p),sizes=[...new Set(p.variants.map(v=>v.size).filter(Boolean))];
  return '<article class="card"><div class="photo" data-open="'+p.id+'">'+photo(h.image,p.name)+(d?'<span class="tag sale">−'+d+'%</span>':p.isNew?'<span class="tag">НОВОЕ ПОСТУПЛЕНИЕ</span>':'')+'<button class="heart" aria-label="В избранное" aria-pressed="'+favorites.includes(p.id)+'" data-fav="'+p.id+'">'+(favorites.includes(p.id)?'♥':'♡')+'</button></div><div class="brand">'+esc(p.brand)+'</div><button class="title" data-open="'+p.id+'">'+esc(p.name)+'</button><div class="meta">'+esc(cs.length>1?cs.length+' '+plural(cs.length,'цвет','цвета','цветов'):cs[0]==='Цвет не указан'?p.category:cs[0])+'<br>'+esc(sizes.length>1?sizes.length+' '+plural(sizes.length,'размер','размера','размеров'):sizes[0]||'Размер уточняется')+'</div><div class="price">'+(p.variants.some(x=>x.price!==v.price)&&v.price?'от ':'')+price(v)+'</div>'+(p.variants.every(v=>v.stock===0)?'<div class="availability">Нет в наличии</div>':'')+(cs.length>1?'<div class="card-swatches">'+cs.map(c=>'<button aria-label="'+esc(c)+'" title="'+esc(c)+'" data-open="'+p.id+'" data-open-color="'+esc(c)+'" style="background:'+swatch(c)+'"></button>').join('')+'</div>':'')+'<button class="more" data-open="'+p.id+'">ОПИСАНИЕ, ЦВЕТА И РАЗМЕРЫ ↗</button></article>';
 }).join('')||'<div class="empty">Ничего не найдено. Попробуйте другой запрос.</div>';
 $('#pages').innerHTML=Array.from({length:totalPages},(_,i)=>'<button aria-label="Страница '+(i+1)+'" data-page="'+(i+1)+'" class="'+(i+1===page?'active':'')+'">'+(i+1)+'</button>').join('');
}
function specsHtml(specs){return Object.entries(specs||{}).filter(([k,v])=>v!=null&&v!=='').map(([k,v])=>'<div class="spec"><span>'+esc(k)+'</span><span>'+esc(Array.isArray(v)?v.join(', '):v)+'</span></div>').join('')}
function openProduct(id,selectedColor){
 const p=products.find(x=>x.id===id);if(!p)return;
 lastFocus=document.activeElement;const initialColor=selectedColor||colors(p)[0];current={p,index:Math.max(0,p.variants.findIndex(v=>(v.color||'Цвет не указан')===initialColor)),color:initialColor,galleryIndex:0};
 $('#detail').innerHTML='<div class="detail"><div class="detail-images"><div class="photo" id="mainPhoto"></div><div class="gallery-thumbs" id="gallery"></div><div class="photo-credit" id="photoCredit"></div></div><div><div class="eyebrow">'+esc(p.brand)+' · '+esc(p.category)+'</div><h2>'+esc(p.name)+'</h2><div class="label">ЦВЕТ: <span id="colorLabel"></span></div><div class="swatches" id="swatches"></div><div class="label">РАЗМЕР / КОМПЛЕКТАЦИЯ</div><select id="variant" aria-label="Размер и комплектация"></select><div class="price" id="detailPrice"></div><div id="stock" class="spec"></div><p class="description" id="description"></p><div id="localDetails"></div><div id="specifications"></div><details id="allSizes"><summary>Все размеры, цвета и цены</summary><div class="tablewrap"><table class="size-table"><thead><tr><th>Цвет / размер</th><th>Остаток</th><th>Цена</th></tr></thead><tbody>'+p.variants.map(v=>'<tr><td>'+esc([v.color,v.size].filter(Boolean).join(' · ')||'Уточняется')+'</td><td>'+(v.stock==null?'Уточнить':v.stock)+'</td><td>'+price(v)+'</td></tr>').join('')+'</tbody></table></div></details><div class="notice" id="detailNote"></div><button class="primary" id="copy">Скопировать запрос консультанту</button><div id="sources"></div></div></div>';
 $('#swatches').innerHTML=colors(p).map(c=>'<button data-color="'+esc(c)+'" style="--swatch:'+swatch(c)+'">'+esc(c)+'</button>').join('');
 $('#swatches').onclick=e=>{let b=e.target.closest('[data-color]');if(!b)return;current.color=b.dataset.color;current.index=p.variants.findIndex(v=>(v.color||'Цвет не указан')===current.color);current.galleryIndex=0;setVariants();updateVariant()};
 $('#variant').onchange=()=>{current.index=+$('#variant').value;current.galleryIndex=0;updateVariant()};
 $('#gallery').onclick=e=>{const b=e.target.closest('[data-gallery]');if(b){current.galleryIndex=+b.dataset.gallery;showGallery()}};
 $('#copy').onclick=copyRequest;
 setVariants();updateVariant();$('#overlay').classList.add('open');document.body.style.overflow='hidden';$('.close').focus();
}
function setVariants(){
 const {p,color,index}=current;
 $('#colorLabel').textContent=color;
 $('#swatches').querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.dataset.color===color);b.setAttribute('aria-pressed',b.dataset.color===color)});
 $('#variant').innerHTML=p.variants.map((v,i)=>({v,i})).filter(({v})=>(v.color||'Цвет не указан')===color).map(({v,i})=>'<option value="'+i+'">'+esc(v.size||'Размер уточняется')+(v.stock===0?' · нет в наличии':'')+'</option>').join('');$('#variant').value=index;
}
function variantGallery(){const v=current.p.variants[current.index];return [...new Set([v.image,...(v.gallery||[])].filter(Boolean))]}
function showGallery(){
 const {p}=current,v=p.variants[current.index],g=variantGallery();const src=g[current.galleryIndex]||g[0];
 $('#mainPhoto').innerHTML=photo(src,p.name+' · '+current.color);
 $('#gallery').innerHTML=g.length>1?g.map((url,i)=>'<button data-gallery="'+i+'" class="'+(i===current.galleryIndex?'active':'')+'" aria-label="Фото '+(i+1)+'"><img src="'+esc(url)+'" alt="'+esc(p.name)+' — фото '+(i+1)+'"></button>').join(''):'';
 $('#photoCredit').textContent=src?(v.imageNote||'Фото из каталога источника. Наличие и комплектация — по списку бутика.'):'Точное фото выбранного цвета пока не найдено. Фото другого цвета не подставляется.';
}
function updateVariant(){
 const {p,index}=current,v=p.variants[index];$('#detailPrice').innerHTML=price(v);$('#stock').innerHTML='<span>Наличие по списку</span><span>'+esc(v.stock===0?'Нет в наличии':v.stock==null?'Уточнить у консультанта':v.stock+' шт.')+'</span>';
 $('#description').textContent=v.description||p.description||'Описание производителя для этой модели пока уточняется.';
 $('#localDetails').innerHTML=v.localDetails?'<div class="label">ПО ДАННЫМ БУТИКА</div><p>'+esc(v.localDetails)+'</p>':'';
 const specs={...(p.specs||{}),...(v.specs||{})};if(v.size)specs['Размер / формат']=v.size;if(v.color)specs['Цвет']=v.color;
 $('#specifications').innerHTML='<div class="specs-title">Детали изделия</div>'+specsHtml(specs);
 $('#detailNote').textContent=[p.note,v.note,'Наличие и окончательную стоимость подтвердит консультант бутика.'].filter(Boolean).join(' ');
 const sources=[...new Set([...(p.sources||[]),v.source].filter(Boolean))];$('#sources').innerHTML=sources.map((u,i)=>'<a class="source" href="'+esc(u)+'" target="_blank" rel="noopener">'+(sources.length>1?'Источник '+(i+1):'Описание и фото: источник')+' ↗</a>').join('');
 $('#allSizes').hidden=p.variants.length<2;showGallery();
}
async function copyRequest(){const {p,index}=current,v=p.variants[index];const text='Здравствуйте! Интересует '+p.brand+' '+p.name+', '+(v.color||'цвет уточнить')+', '+(v.size||'размер уточнить')+'. Цена в каталоге: '+money(v.price,v.currency)+'. Подтвердите, пожалуйста, наличие и стоимость.';try{await navigator.clipboard.writeText(text);$('#toast').textContent='Запрос скопирован — отправьте его консультанту';$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3500)}catch{prompt('Скопируйте запрос',text)}}
function close(){$('#overlay').classList.remove('open');document.body.style.overflow='';current=null;lastFocus?.focus()}
$('.close').onclick=close;$('#overlay').onclick=e=>{if(e.target.id==='overlay')close()};
document.addEventListener('keydown',e=>{if(!current)return;if(e.key==='Escape')close();if(e.key==='Tab'){const all=[...$('.dialog').querySelectorAll('button,a,select,summary')].filter(e=>e.offsetParent!==null);const first=all[0],last=all[all.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
document.addEventListener('click',e=>{let t=e.target.closest('[data-fav]');if(t){const id=t.dataset.fav;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];try{localStorage.setItem('togas-favorites-v2',JSON.stringify(favorites))}catch{}render();return}t=e.target.closest('[data-open]');if(t)openProduct(t.dataset.open,t.dataset.openColor);t=e.target.closest('[data-cat]');if(t){cat=t.dataset.cat;onlyFav=false;page=1;render()}t=e.target.closest('[data-page]');if(t){page=+t.dataset.page;render();$('#catalog').scrollIntoView()}});
['search','brand','kind','sort'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',()=>{page=1;render()}));$('#favBtn').onclick=()=>{onlyFav=!onlyFav;page=1;render();$('#catalog').scrollIntoView()};
fetch('catalog.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json()}).then(data=>{products=data;$('#brand').innerHTML+=[...new Set(products.map(p=>p.brand))].sort().map(b=>'<option>'+esc(b)+'</option>').join('');render()}).catch(()=>{$('#grid').innerHTML='<div class="empty">Не удалось загрузить каталог. Обновите страницу.</div>'});
