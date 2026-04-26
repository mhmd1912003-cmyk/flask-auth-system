
// ════ DB ════
let DB={products:[],sales:[],activity:[],orders:[],wholesaleReqs:[],
  settings:{storeName:'EmBoo',phone:'',whatsapp:'201094918310',address:'',currency:'ج.م',password:'1234',wholesaleDisc:15},nextId:1};

function loadDB(){const s=localStorage.getItem('emboo_db');if(s){try{DB=JSON.parse(s);if(!DB.settings)DB.settings={storeName:'EmBoo',phone:'',whatsapp:'201094918310',address:'',currency:'ج.م',password:'1234',wholesaleDisc:15};if(!DB.wholesaleReqs)DB.wholesaleReqs=[];if(!DB.orders)DB.orders=[];}catch(e){}}}
function saveDB(){localStorage.setItem('emboo_db',JSON.stringify(DB));}
function cur(){return DB.settings.currency||'ج.م';}

const BRAND_EMOJI={Samsung:'📘',iPhone:'🍎',Huawei:'🌸',Realme:'🟡',Xiaomi:'🔴',Oppo:'🟢',Vivo:'💜','أخرى':'📱'};
const BRAND_CLASS={Samsung:'bdg-samsung',iPhone:'bdg-iphone',Huawei:'bdg-huawei',Realme:'bdg-realme',Xiaomi:'bdg-xiaomi',Oppo:'bdg-oppo',Vivo:'bdg-vivo','أخرى':'bdg-other'};
const BG_COLORS=['linear-gradient(135deg,#1a1a2e,#16213e)','linear-gradient(135deg,#0f3460,#533483)','linear-gradient(135deg,#1e3a5f,#2d6a4f)','linear-gradient(135deg,#2c1810,#6b3a2a)','linear-gradient(135deg,#1a0533,#4a1942)','linear-gradient(135deg,#0d2137,#1b4f72)'];

// ════ MOBILE NAV ════
function toggleMobNav(){
  const d=document.getElementById('mobNav');
  const open=d.classList.toggle('open');
  document.body.classList.toggle('mob-menu-open',open);
}
function closeMobNav(){document.getElementById('mobNav').classList.remove('open');document.body.classList.remove('mob-menu-open');}

// ════ MOBILE ADMIN SIDEBAR ════
function toggleMobSidebar(){
  const s=document.getElementById('adminSidebar');
  const bd=document.getElementById('sidebarBd');
  const open=s.classList.toggle('mob-open');
  bd.style.display=open?'block':'none';
}
function closeMobSidebar(){
  document.getElementById('adminSidebar').classList.remove('mob-open');
  document.getElementById('sidebarBd').style.display='none';
}

// ════ AUTH ════
function doLogin(){
  const u=document.getElementById('loginUser').value.trim();
  const p=document.getElementById('loginPass').value;
  if(u==='admin'&&p===DB.settings.password){
    showPage('adminPage');renderAdmDashboard();document.getElementById('loginError').style.display='none';
  }else{document.getElementById('loginError').style.display='block';}
}
function doLogout(){showPage('loginPage');}
function showLogin(){showPage('loginPage');}
function backToStore(){showPage('storePage');renderStore();}
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>{p.classList.remove('active');p.style.display='none';});
  const el=document.getElementById(id);
  el.classList.add('active');
  el.style.display=id==='adminPage'?'flex':'block';
  // Update sticky contact visibility
  const sc=document.getElementById('stickyContact');
  if(sc)sc.style.display=id==='storePage'?'flex':'none';
}

// ════ NAVIGATION ════
function showAdm(name,el){
  document.querySelectorAll('.adm-sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));
  document.getElementById('adm-'+name).classList.add('active');
  if(el)el.classList.add('active');
  if(name==='dashboard')renderAdmDashboard();
  if(name==='products')renderAdmProducts();
  if(name==='sales')renderSales();
  if(name==='orders')renderOrders();
  if(name==='wholesale')renderWholesale();
  if(name==='reports')renderReports();
  if(name==='activity')renderActivity();
  if(name==='settings')loadSettings();
  if(window.innerWidth<=768)closeMobSidebar();
}
function scrollToSec(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth'});}

// ════ IMAGE HANDLING ════
let pendingImages=[];

function handleImgUpload(e){
  const files=Array.from(e.target.files);
  files.forEach(f=>{
    if(!f.type.startsWith('image/'))return;
    const reader=new FileReader();
    reader.onload=ev=>{pendingImages.push(ev.target.result);renderImgPreview();};
    reader.readAsDataURL(f);
  });
  e.target.value='';
}
function handleDragOver(e){e.preventDefault();e.stopPropagation();document.getElementById('imgUploadArea').classList.add('drag-over');}
function handleDrop(e){
  e.preventDefault();e.stopPropagation();
  document.getElementById('imgUploadArea').classList.remove('drag-over');
  const files=Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/'));
  files.forEach(f=>{
    const reader=new FileReader();
    reader.onload=ev=>{pendingImages.push(ev.target.result);renderImgPreview();};
    reader.readAsDataURL(f);
  });
}
function renderImgPreview(){
  const g=document.getElementById('imgPreviewGrid');
  if(!g)return;
  g.innerHTML=pendingImages.map((src,i)=>`
    <div class="img-preview-item">
      <img src="${src}" alt="صورة ${i+1}">
      <button class="ipi-del" onclick="removeImg(${i})">✕</button>
    </div>`).join('');
}
function removeImg(i){pendingImages.splice(i,1);renderImgPreview();}

// ════ CAROUSEL ════
function buildCarousel(p){
  const imgs=p.images&&p.images.length?p.images:null;
  const emoji=BRAND_EMOJI[p.brand]||'📱';
  if(!imgs||!imgs.length){
    return `<div class="img-carousel" style="background:${p.bgColor||BG_COLORS[0]}">
      <div class="img-carousel-track"><div class="img-carousel-slide">${emoji}</div></div>
    </div>`;
  }
  const id='car'+p.id;
  const dots=imgs.map((_,i)=>`<span class="cdot${i===0?' active':''}" onclick="goSlide('${id}',${i})"></span>`).join('');
  const slides=imgs.map(src=>`<div class="img-carousel-slide"><img src="${src}" alt="${p.name}" loading="lazy"></div>`).join('');
  return `<div class="img-carousel" style="background:${p.bgColor||BG_COLORS[0]}" id="${id}">
    <div class="img-carousel-track" id="${id}track">${slides}</div>
    ${imgs.length>1?`<button class="carousel-arr right" onclick="event.stopPropagation();slideDir('${id}',-1)">‹</button>
    <button class="carousel-arr left" onclick="event.stopPropagation();slideDir('${id}',1)">›</button>
    <div class="carousel-dot-wrap">${dots}</div>`:''}
  </div>`;
}
const carState={};
function goSlide(id,idx){
  const track=document.getElementById(id+'track');
  if(!track)return;
  const count=track.children.length;
  if(idx<0)idx=count-1;if(idx>=count)idx=0;
  track.style.transform=`translateX(${idx*100}%)`;
  carState[id]=idx;
  document.querySelectorAll(`#${id} .cdot`).forEach((d,i)=>d.classList.toggle('active',i===idx));
}
function slideDir(id,dir){
  const cur=carState[id]||0;
  goSlide(id,cur-dir);
}

// ════ STORE ════
let cart=[];
let activeBrandFilter='';

function renderStore(){
  const search=document.getElementById('storeSearch')?.value.toLowerCase()||'';
  const condition=document.getElementById('storeCondition')?.value||'';
  const sort=document.getElementById('storePriceSort')?.value||'';
  const grid=document.getElementById('storeGrid');if(!grid)return;
  let items=DB.products.filter(p=>{
    if(p.status==='مباع')return false;
    if(activeBrandFilter&&p.brand!==activeBrandFilter)return false;
    if(search&&!p.name.toLowerCase().includes(search)&&!p.brand.toLowerCase().includes(search))return false;
    if(condition&&p.condition!==condition)return false;
    return true;
  });
  if(sort==='asc')items.sort((a,b)=>a.salePrice-b.salePrice);
  if(sort==='desc')items.sort((a,b)=>b.salePrice-a.salePrice);
  document.getElementById('hStatTotal').textContent=items.length;
  if(!items.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--muted)"><div style="font-size:56px;margin-bottom:15px;opacity:.3">📭</div><p>لا يوجد موبايلات مطابقة</p></div>';return;}
  const wDisc=DB.settings.wholesaleDisc||15;
  grid.innerHTML=items.map(p=>{
    const wPrice=p.wholesalePrice||(p.salePrice*(1-wDisc/100)).toFixed(0);
    const ytBtn=p.ytLink?`<a class="btn-yt" href="${p.ytLink}" target="_blank" onclick="event.stopPropagation()">▶ يوتيوب</a>`:'';
    const fbBtn=p.fbLink?`<a class="btn-fb" href="${p.fbLink}" target="_blank" onclick="event.stopPropagation()">f فيسبوك</a>`:'';
    return `<div class="prod-card" onclick="showProdModal(${p.id})">
      ${buildCarousel(p)}
      <div class="prod-badges">
        <span class="prod-badge ${p.condition==='جديد'?'badge-new':'badge-used'}">${p.condition}</span>
        <span class="prod-badge badge-brand">${p.brand}</span>
      </div>
      <div class="prod-card-body">
        <h3>${p.name}</h3>
        <div class="prod-specs">
          ${p.storage?`<span class="spec-tag">${p.storage}</span>`:''}
          ${p.ram?`<span class="spec-tag">${p.ram}</span>`:''}
          ${p.color?`<span class="spec-tag">${p.color}</span>`:''}
        </div>
        <div class="prod-price-row">
          <span class="price-main">${Number(p.salePrice).toLocaleString()} ${cur()}</span>
          <span class="price-wholesale">💼 ${Number(wPrice).toLocaleString()} ${cur()}</span>
        </div>
        <div class="prod-card-actions" onclick="event.stopPropagation()">
          <button class="btn-add-cart" onclick="addToCart(${p.id})">🛒 السلة</button>
          <button class="btn-details" onclick="showProdModal(${p.id})">تفاصيل</button>
          ${ytBtn}${fbBtn}
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterByBrand(brand,ev){
  activeBrandFilter=brand;
  document.querySelectorAll('.brand-chip').forEach(c=>c.classList.remove('active'));
  if(ev&&ev.target)ev.target.classList.add('active');
  renderStore();
  document.getElementById('products-section').scrollIntoView({behavior:'smooth'});
}

// ════ PRODUCT MODAL ════
function showProdModal(id){
  const p=DB.products.find(x=>x.id==id);if(!p)return;
  const wDisc=DB.settings.wholesaleDisc||15;
  const wPrice=p.wholesalePrice||(p.salePrice*(1-wDisc/100)).toFixed(0);
  const imgs=p.images&&p.images.length?p.images:null;
  let galleryHtml='';
  if(imgs&&imgs.length){
    const main=imgs.map((src,i)=>`<div class="pmb-gallery-main${i>0?' pmb-gm-hidden':''}" id="pmgm${id}_${i}"><img src="${src}" alt="${p.name}"></div>`).join('');
    const thumbs=imgs.map((src,i)=>`<div class="pmb-thumb${i===0?' active':''}" onclick="switchGallery(${id},${i})" id="pmgt${id}_${i}"><img src="${src}"></div>`).join('');
    galleryHtml=`<div class="pmb-gallery">
      ${main}
      ${imgs.length>1?`<div class="pmb-thumbs">${thumbs}</div>`:''}
    </div>`;
  }else{
    galleryHtml=`<div class="pmb-gallery"><div class="pmb-gallery-main" style="background:${p.bgColor||BG_COLORS[0]}">${BRAND_EMOJI[p.brand]||'📱'}</div></div>`;
  }
  const reviewHtml=(p.ytLink||p.fbLink)?`<div class="pmb-reviews">
    ${p.ytLink?`<a class="pmb-review-btn yt" href="${p.ytLink}" target="_blank">▶ مراجعة على يوتيوب</a>`:''}
    ${p.fbLink?`<a class="pmb-review-btn fb" href="${p.fbLink}" target="_blank">f مراجعة على فيسبوك</a>`:''}
  </div>`:'';
  document.getElementById('prodModalBox').innerHTML=`
    <div class="pmb-head">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="prod-badge ${p.condition==='جديد'?'badge-new':'badge-used'}">${p.condition}</span>
        <span class="prod-badge badge-brand">${p.brand}</span>
      </div>
      <button class="pmb-close" onclick="closeProdModal()">✕</button>
    </div>
    ${galleryHtml}
    <div class="pmb-body">
      <h2>${p.name}</h2>
      <div class="pmb-prices">
        <div class="price-block retail"><div class="pb-label">سعر البيع للأفراد</div><div class="pb-val">${Number(p.salePrice).toLocaleString()} ${cur()}</div></div>
        <div style="width:1px;background:var(--border)"></div>
        <div class="price-block wholesale"><div class="pb-label">💼 سعر التجار (5+)</div><div class="pb-val">${Number(wPrice).toLocaleString()} ${cur()}</div></div>
      </div>
      <div class="detail-row"><span>التخزين</span><span>${p.storage||'—'}</span></div>
      <div class="detail-row"><span>الرام</span><span>${p.ram||'—'}</span></div>
      <div class="detail-row"><span>اللون</span><span>${p.color||'—'}</span></div>
      <div class="detail-row"><span>الحالة</span><span>${p.condition}</span></div>
      ${p.notes?`<div class="detail-row"><span>ملاحظات</span><span>${p.notes}</span></div>`:''}
      ${reviewHtml}
      <div class="pmb-actions">
        <button class="btn-add-cart" style="flex:1;padding:13px" onclick="addToCart(${p.id});closeProdModal()">🛒 أضف للسلة</button>
        <button class="btn-details" onclick="closeProdModal()">إغلاق</button>
      </div>
    </div>`;
  document.getElementById('prodModal').classList.add('open');
}
function switchGallery(pid,idx){
  const all=document.querySelectorAll(`[id^="pmgm${pid}_"]`);
  const thumbs=document.querySelectorAll(`[id^="pmgt${pid}_"]`);
  all.forEach((el,i)=>el.style.display=i===idx?'flex':'none');
  thumbs.forEach((el,i)=>el.classList.toggle('active',i===idx));
}
function closeProdModal(){document.getElementById('prodModal').classList.remove('open');}

// ════ CART ════
function toggleCart(){
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartBackdrop').classList.toggle('open');
  renderCart();
}
function addToCart(id){
  const p=DB.products.find(x=>x.id==id);
  if(!p||p.status==='مباع')return;
  if(cart.find(c=>c.id==id)){showToast('⚠️ الموبايل ده موجود في السلة','error');return;}
  cart.push({id:p.id,name:p.name,brand:p.brand,price:p.salePrice,condition:p.condition});
  updateCartCount();showToast('✅ تمت الإضافة للسلة','success');
}
function removeFromCart(id){cart=cart.filter(c=>c.id!=id);renderCart();updateCartCount();}
function updateCartCount(){document.getElementById('cartCount').textContent=cart.length;}
function renderCart(){
  const el=document.getElementById('cartItems');
  const foot=document.getElementById('cartFoot');
  if(!cart.length){el.innerHTML='<div class="cart-empty"><div class="ce-icon">🛒</div><p>السلة فاضية</p></div>';foot.style.display='none';return;}
  foot.style.display='block';
  el.innerHTML=cart.map(c=>`<div class="cart-item">
    <div class="cart-item-icon">${BRAND_EMOJI[c.brand]||'📱'}</div>
    <div class="cart-item-info"><h4>${c.name}</h4><span>${c.condition} · ${c.brand}</span></div>
    <div class="cart-item-price">${Number(c.price).toLocaleString()} ${cur()}</div>
    <button class="cart-remove" onclick="removeFromCart(${c.id})">✕</button>
  </div>`).join('');
  const total=cart.reduce((a,c)=>a+c.price,0);
  document.getElementById('cartTotal').textContent=`${total.toLocaleString()} ${cur()}`;
}

// ════ ORDER ════
function openOrderModal(){
  if(!cart.length){showToast('السلة فاضية!','error');return;}
  const total=cart.reduce((a,c)=>a+c.price,0);
  document.getElementById('obSummary').innerHTML=`
    ${cart.map(c=>`<div class="ob-summary-item"><span>${BRAND_EMOJI[c.brand]||'📱'} ${c.name}</span><span>${Number(c.price).toLocaleString()} ${cur()}</span></div>`).join('')}
    <div class="ob-total"><span>الإجمالي</span><span>${total.toLocaleString()} ${cur()}</span></div>`;
  document.getElementById('orderModal').classList.add('open');
}
function closeOrderModal(){document.getElementById('orderModal').classList.remove('open');}
function submitOrder(){
  const name=document.getElementById('obName').value.trim();
  const phone=document.getElementById('obPhone').value.trim();
  const address=document.getElementById('obAddress').value.trim();
  const notes=document.getElementById('obNotes').value.trim();
  if(!name||!phone){document.getElementById('orderAlert').innerHTML='<div class="alert alert-danger">⚠️ من فضلك اكتب اسمك ورقم هاتفك</div>';return;}
  const total=cart.reduce((a,c)=>a+c.price,0);
  const itemsText=cart.map(it=>`- ${it.name} (${it.price} ${cur()})`).join('\n');
  const msg=`📦 طلب جديد:\n👤 الاسم: ${name}\n📞 الهاتف: ${phone}\n📍 العنوان: ${address}\n\n🛒 الطلب:\n${itemsText}\n\n💰 الإجمالي: ${total} ${cur()}\n\n📝 ملاحظات: ${notes||'لا يوجد'}`;
  const wa=DB.settings.whatsapp||'201094918310';
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,'_blank');
  // Save order
  DB.orders.push({id:DB.nextId++,name,phone,address,items:[...cart],total,date:new Date().toISOString().split('T')[0],status:'جديد',notes});
  addActivity('📦',`طلب جديد من: ${name}`,'green');
  saveDB();
  cart=[];updateCartCount();closeOrderModal();
  if(document.getElementById('cartSidebar').classList.contains('open'))toggleCart();
  showToast('✅ تم إرسال طلبك على واتساب','success');
}

// ════ WHOLESALE ════
function submitWholesale(){
  const name=document.getElementById('wName').value.trim();
  const phone=document.getElementById('wPhone').value.trim();
  const qty=parseInt(document.getElementById('wQty').value)||0;
  if(!name||!phone){document.getElementById('wholesaleAlert').innerHTML='<div class="alert alert-danger">⚠️ اكمل البيانات الأساسية</div>';return;}
  if(qty<5){document.getElementById('wholesaleAlert').innerHTML='<div class="alert alert-danger">⚠️ الحد الأدنى 5 موبايلات</div>';return;}
  DB.wholesaleReqs.push({id:DB.nextId++,name,phone,business:document.getElementById('wBusiness').value,qty,details:document.getElementById('wDetails').value,date:new Date().toISOString().split('T')[0],status:'معلق'});
  addActivity('💼',`طلب جملة من: ${name} - ${qty} موبايل`,'gold');
  saveDB();
  ['wName','wPhone','wBusiness','wQty','wDetails'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('wholesaleAlert').innerHTML='<div class="alert alert-success">✅ تم الإرسال! هنتواصل معاك خلال 24 ساعة</div>';
  setTimeout(()=>{document.getElementById('wholesaleAlert').innerHTML='';},4000);
}

// ════ ADMIN PRODUCTS ════
function saveProduct(){
  const name=document.getElementById('pName').value.trim();
  const salePrice=parseFloat(document.getElementById('pSalePrice').value)||0;
  const editId=document.getElementById('editId').value;
  if(!name){showAdmAlert('productAlert','danger','⚠️ أدخل اسم الموبايل');return;}
  if(salePrice<=0){showAdmAlert('productAlert','danger','⚠️ أدخل سعر البيع');return;}
  const data={
    name,brand:document.getElementById('pBrand').value,
    condition:document.getElementById('pCondition').value,
    storage:document.getElementById('pStorage').value.trim(),
    ram:document.getElementById('pRam').value.trim(),
    color:document.getElementById('pColor').value.trim(),
    status:document.getElementById('pStatus').value,
    costPrice:parseFloat(document.getElementById('pCostPrice').value)||0,
    salePrice,wholesalePrice:parseFloat(document.getElementById('pWholesalePrice').value)||0,
    notes:document.getElementById('pNotes').value.trim(),
    ytLink:document.getElementById('pYtLink').value.trim(),
    fbLink:document.getElementById('pFbLink').value.trim(),
    images:pendingImages.length?[...pendingImages]:undefined
  };
  if(editId){
    const idx=DB.products.findIndex(p=>p.id==editId);
    if(idx!==-1){
      // Keep existing images if no new ones uploaded
      if(!pendingImages.length&&DB.products[idx].images)data.images=DB.products[idx].images;
      DB.products[idx]={...DB.products[idx],...data,updatedAt:new Date().toISOString()};
    }
    addActivity('✏️',`تعديل: ${name}`,'blue');
  }else{
    DB.products.push({id:DB.nextId++,...data,createdAt:new Date().toISOString(),bgColor:BG_COLORS[Math.floor(Math.random()*BG_COLORS.length)]});
    addActivity('➕',`إضافة: ${name} - ${salePrice} ${cur()}`,'green');
  }
  saveDB();clearForm();showAdmAlert('productAlert','success',editId?'✅ تم التعديل!':'✅ تمت الإضافة!');
}

function clearForm(){
  ['pName','pStorage','pRam','pColor','pNotes','pCostPrice','pSalePrice','pWholesalePrice','editId','pYtLink','pFbLink'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('pBrand').value='Samsung';
  document.getElementById('pCondition').value='جديد';
  document.getElementById('pStatus').value='متاح';
  document.getElementById('addFormTitle').textContent='➕ إضافة موبايل';
  pendingImages=[];renderImgPreview();
}

function editProd(id){
  const p=DB.products.find(x=>x.id==id);if(!p)return;
  document.getElementById('editId').value=p.id;
  document.getElementById('pName').value=p.name;
  document.getElementById('pBrand').value=p.brand;
  document.getElementById('pCondition').value=p.condition;
  document.getElementById('pStorage').value=p.storage||'';
  document.getElementById('pRam').value=p.ram||'';
  document.getElementById('pColor').value=p.color||'';
  document.getElementById('pStatus').value=p.status;
  document.getElementById('pCostPrice').value=p.costPrice;
  document.getElementById('pSalePrice').value=p.salePrice;
  document.getElementById('pWholesalePrice').value=p.wholesalePrice||'';
  document.getElementById('pNotes').value=p.notes||'';
  document.getElementById('pYtLink').value=p.ytLink||'';
  document.getElementById('pFbLink').value=p.fbLink||'';
  document.getElementById('addFormTitle').textContent='✏️ تعديل الموبايل';
  // Load existing images as pending
  pendingImages=p.images?[...p.images]:[];
  renderImgPreview();
  showAdm('addProduct',document.querySelector('[onclick*="addProduct"]'));
}

function deleteProd(id){document.getElementById('deleteId').value=id;openM('deleteModal');}
function confirmDelete(){
  const id=document.getElementById('deleteId').value;
  const p=DB.products.find(x=>x.id==id);
  if(p){DB.products=DB.products.filter(x=>x.id!=id);addActivity('🗑️',`حذف: ${p.name}`,'red');saveDB();}
  closeM('deleteModal');renderAdmProducts();
}

function openSellM(id){
  const p=DB.products.find(x=>x.id==id);if(!p)return;
  const profit=p.salePrice-p.costPrice;
  document.getElementById('sellInfoBox').innerHTML=`<h4>${BRAND_EMOJI[p.brand]||'📱'} ${p.name}</h4>
    <div class="sell-prices">
      <span class="sp">💰 سعر البيع: <strong>${p.salePrice.toLocaleString()} ${cur()}</strong></span>
      <span class="sp">🔒 التكلفة: <strong>${p.costPrice.toLocaleString()} ${cur()}</strong></span>
      <span class="sp" style="color:var(--green)">📈 الربح: <strong>+${profit.toLocaleString()} ${cur()}</strong></span>
    </div>`;
  document.getElementById('sActualPrice').value=p.salePrice;
  document.getElementById('sDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('sBuyer').value='';
  document.getElementById('sNotesTxt').value='';
  document.getElementById('sellInfoBox').dataset.pid=id;
  openM('sellModal');
}
function confirmSale(){
  const id=parseInt(document.getElementById('sellInfoBox').dataset.pid);
  const p=DB.products.find(x=>x.id==id);if(!p)return;
  const actualPrice=parseFloat(document.getElementById('sActualPrice').value)||p.salePrice;
  const date=document.getElementById('sDate').value;
  const profit=actualPrice-p.costPrice;
  p.status='مباع';p.soldAt=date;p.soldPrice=actualPrice;
  DB.sales.push({id:DB.nextId++,productId:id,productName:p.name,brand:p.brand,date,actualPrice,costPrice:p.costPrice,profit,buyer:document.getElementById('sBuyer').value,notes:document.getElementById('sNotesTxt').value});
  addActivity('💰',`بيع: ${p.name} - ${actualPrice.toLocaleString()} ${cur()} | ربح: +${profit.toLocaleString()} ${cur()}`,'green');
  saveDB();closeM('sellModal');renderAdmProducts();
}

function renderAdmProducts(){
  const search=document.getElementById('admSearch')?.value.toLowerCase()||'';
  const fStatus=document.getElementById('admFStatus')?.value||'';
  const fBrand=document.getElementById('admFBrand')?.value||'';
  const tbody=document.getElementById('admProdTable');if(!tbody)return;
  let items=DB.products.filter(p=>{
    if(search&&!p.name.toLowerCase().includes(search)&&!p.brand.toLowerCase().includes(search))return false;
    if(fStatus&&p.status!==fStatus)return false;
    if(fBrand&&p.brand!==fBrand)return false;
    return true;
  });
  if(!items.length){tbody.innerHTML='<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:40px">لا يوجد موبايلات</td></tr>';return;}
  const wDisc=DB.settings.wholesaleDisc||15;
  tbody.innerHTML=items.map((p,i)=>{
    const wPrice=p.wholesalePrice||(p.salePrice*(1-wDisc/100)).toFixed(0);
    return `<tr>
      <td style="color:var(--muted)">${i+1}</td>
      <td><strong style="color:white">${p.name}</strong>${(p.ytLink||p.fbLink)?`<br><span style="font-size:10px;color:var(--muted)">${p.ytLink?'▶':''}${p.fbLink?' f':''} مراجعات</span>`:''}</td>
      <td><span class="bdg ${BRAND_CLASS[p.brand]||'bdg-other'}">${p.brand}</span></td>
      <td><span class="bdg ${p.condition==='جديد'?'bdg-new':'bdg-used'}">${p.condition}</span></td>
      <td style="color:var(--muted)">${p.storage||'—'}</td>
      <td style="color:var(--gold)">🔒 ${p.costPrice.toLocaleString()} ${cur()}</td>
      <td style="color:var(--accent);font-weight:700">${p.salePrice.toLocaleString()} ${cur()}</td>
      <td style="color:var(--gold)">🔒 ${Number(wPrice).toLocaleString()} ${cur()}</td>
      <td><span class="bdg ${p.status==='متاح'?'bdg-avail':'bdg-sold'}">${p.status}</span></td>
      <td>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${p.status==='متاح'?`<button class="btn btn-success btn-sm" onclick="openSellM(${p.id})">💰</button>`:''}
          <button class="btn btn-outline btn-sm" onclick="editProd(${p.id})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProd(${p.id})">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ════ TABLES ════
function renderSales(){
  const tbody=document.getElementById('salesTable');
  if(!DB.sales.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:40px">لا توجد مبيعات</td></tr>';return;}
  tbody.innerHTML=[...DB.sales].reverse().map((s,i)=>`<tr>
    <td style="color:var(--muted)">${i+1}</td>
    <td><strong style="color:white">${s.productName}</strong></td>
    <td><span class="bdg ${BRAND_CLASS[s.brand]||'bdg-other'}">${s.brand}</span></td>
    <td style="color:var(--muted)">${s.date}</td>
    <td style="color:var(--accent);font-weight:700">${s.actualPrice?.toLocaleString()} ${cur()}</td>
    <td style="color:var(--gold)">🔒 ${s.costPrice?.toLocaleString()} ${cur()}</td>
    <td style="color:var(--green);font-weight:700">+${s.profit?.toLocaleString()} ${cur()}</td>
    <td style="color:var(--muted)">${s.buyer||'—'}</td>
  </tr>`).join('');
}

function renderOrders(){
  const tbody=document.getElementById('ordersTable');
  if(!DB.orders?.length){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">لا توجد طلبات</td></tr>';return;}
  tbody.innerHTML=[...DB.orders].reverse().map((o,i)=>`<tr>
    <td style="color:var(--muted)">${i+1}</td>
    <td><strong style="color:white">${o.name}</strong></td>
    <td style="color:var(--muted)">${o.phone}</td>
    <td style="color:var(--muted);font-size:12px">${o.items?.map(it=>it.name).join(' • ')||'—'}</td>
    <td style="color:var(--accent);font-weight:700">${o.total?.toLocaleString()} ${cur()}</td>
    <td style="color:var(--muted)">${o.address||'—'}</td>
    <td style="color:var(--muted)">${o.date}</td>
    <td><span class="wr-status ${o.status==='جديد'?'wr-pending':o.status==='مكتمل'?'wr-approved':'wr-rejected'}">${o.status}</span></td>
    <td><select style="background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:5px 8px;color:var(--text);font-family:'Cairo',sans-serif;font-size:12px;outline:none" onchange="updateOrderStatus(${o.id},this.value)">
      <option ${o.status==='جديد'?'selected':''}>جديد</option>
      <option ${o.status==='مؤكد'?'selected':''}>مؤكد</option>
      <option ${o.status==='مكتمل'?'selected':''}>مكتمل</option>
      <option ${o.status==='ملغي'?'selected':''}>ملغي</option>
    </select></td>
  </tr>`).join('');
}
function updateOrderStatus(id,status){const o=DB.orders.find(x=>x.id==id);if(o){o.status=status;addActivity('📦',`تحديث طلب #${id} إلى: ${status}`,'blue');saveDB();}}

function renderWholesale(){
  const tbody=document.getElementById('wholesaleTable');
  if(!DB.wholesaleReqs?.length){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">لا توجد طلبات جملة</td></tr>';return;}
  tbody.innerHTML=[...DB.wholesaleReqs].reverse().map((w,i)=>`<tr>
    <td style="color:var(--muted)">${i+1}</td>
    <td><strong style="color:white">${w.name}</strong></td>
    <td style="color:var(--muted)">${w.phone}</td>
    <td style="color:var(--muted)">${w.business||'—'}</td>
    <td style="color:var(--accent);font-weight:700">${w.qty}</td>
    <td style="color:var(--muted);font-size:12px;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${w.details||'—'}</td>
    <td style="color:var(--muted)">${w.date}</td>
    <td><span class="wr-status ${w.status==='معلق'?'wr-pending':w.status==='موافق'?'wr-approved':'wr-rejected'}">${w.status}</span></td>
    <td><div style="display:flex;gap:4px">
      <button class="btn btn-success btn-sm" onclick="updateWR(${w.id},'موافق')">✅</button>
      <button class="btn btn-danger btn-sm" onclick="updateWR(${w.id},'مرفوض')">❌</button>
    </div></td>
  </tr>`).join('');
}
function updateWR(id,status){const w=DB.wholesaleReqs.find(x=>x.id==id);if(w){w.status=status;addActivity('💼',`طلب جملة ${w.name}: ${status}`,'blue');saveDB();renderWholesale();}}

// ════ DASHBOARD ════
function renderAdmDashboard(){
  const now=new Date();
  document.getElementById('admDate').textContent=now.toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const total=DB.products.length,avail=DB.products.filter(p=>p.status==='متاح').length,sold=DB.products.filter(p=>p.status==='مباع').length;
  const revenue=DB.sales.reduce((a,s)=>a+(s.actualPrice||0),0);
  const profit=DB.sales.reduce((a,s)=>a+(s.profit||0),0);
  const stockVal=DB.products.filter(p=>p.status==='متاح').reduce((a,p)=>a+p.salePrice,0);
  const newOrders=(DB.orders||[]).filter(o=>o.status==='جديد').length;
  const pendingWR=(DB.wholesaleReqs||[]).filter(w=>w.status==='معلق').length;
  document.getElementById('admStats').innerHTML=`
    <div class="stat-card c-blue"><div class="sc-label">إجمالي الموبايلات</div><div class="sc-val">${total}</div><div class="sc-sub">${avail} متاح • ${sold} مباع</div><div class="sc-icon">📱</div></div>
    <div class="stat-card c-green"><div class="sc-label">الإيرادات الكلية</div><div class="sc-val">${revenue.toLocaleString()}</div><div class="sc-sub">${cur()}</div><div class="sc-icon">💵</div></div>
    <div class="stat-card c-gold"><div class="sc-label">الأرباح 🔒</div><div class="sc-val">${profit.toLocaleString()}</div><div class="sc-sub">${cur()}</div><div class="sc-icon">📈</div></div>
    <div class="stat-card c-purple"><div class="sc-label">قيمة المخزون</div><div class="sc-val">${stockVal.toLocaleString()}</div><div class="sc-sub">${cur()}</div><div class="sc-icon">🏪</div></div>
    <div class="stat-card c-orange"><div class="sc-label">طلبات جديدة</div><div class="sc-val">${newOrders}</div><div class="sc-sub">من الموقع</div><div class="sc-icon">📦</div></div>
    <div class="stat-card c-red"><div class="sc-label">طلبات جملة معلقة</div><div class="sc-val">${pendingWR}</div><div class="sc-sub">تحتاج رد</div><div class="sc-icon">💼</div></div>`;
  const days=['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
  const wData=Array(7).fill(0);
  const today=new Date();
  DB.sales.forEach(s=>{const d=new Date(s.date);const diff=Math.floor((today-d)/86400000);if(diff>=0&&diff<7)wData[6-diff]+=(s.actualPrice||0);});
  const maxV=Math.max(...wData,1);
  const chartEl=document.getElementById('admChart');
  if(chartEl)chartEl.innerHTML=wData.map((v,i)=>{const di=(today.getDay()-(6-i)+7)%7;return `<div class="bar-col"><div class="bar-val">${v>0?v.toLocaleString():''}</div><div class="bar" style="height:${Math.round((v/maxV)*100)}px"></div><div class="bar-lbl">${days[di]}</div></div>`;}).join('');
  const brands={};DB.products.forEach(p=>{brands[p.brand]=(brands[p.brand]||0)+1;});
  const bEl=document.getElementById('admBrands');
  if(bEl){if(!Object.keys(brands).length)bEl.innerHTML='<p style="color:var(--muted);font-size:13px">لا يوجد موبايلات</p>';
  else bEl.innerHTML=Object.entries(brands).map(([b,c])=>`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px"><span>${BRAND_EMOJI[b]||'📱'} ${b}</span><span style="color:var(--muted)">${c}</span></div><div class="prog-bar"><div class="prog-fill" style="width:${Math.round((c/total)*100)}%"></div></div></div>`).join('');}
  const recEl=document.getElementById('admRecent');
  if(recEl){const recent=[...DB.activity].slice(-5).reverse();
  if(!recent.length)recEl.innerHTML='<p style="color:var(--muted);font-size:13px">لا يوجد نشاط</p>';
  else recEl.innerHTML=recent.map(a=>`<div class="act-item"><div class="act-dot" style="background:${a.color==='green'?'var(--green)':a.color==='red'?'var(--red)':a.color==='gold'?'var(--gold)':'var(--accent)'}"></div><div class="act-info"><strong>${a.text}</strong><span>${new Date(a.time).toLocaleString('ar-EG')}</span></div></div>`).join('');}
}

// ════ REPORTS ════
function renderReports(){
  const total=DB.products.length,avail=DB.products.filter(p=>p.status==='متاح').length,sold=DB.products.filter(p=>p.status==='مباع').length;
  const revenue=DB.sales.reduce((a,s)=>a+(s.actualPrice||0),0),cost=DB.sales.reduce((a,s)=>a+(s.costPrice||0),0),profit=DB.sales.reduce((a,s)=>a+(s.profit||0),0);
  const stockVal=DB.products.filter(p=>p.status==='متاح').reduce((a,p)=>a+p.salePrice,0);
  document.getElementById('repStats').innerHTML=`
    <div class="stat-card c-blue"><div class="sc-label">إجمالي الموبايلات</div><div class="sc-val">${total}</div><div class="sc-sub">${avail} متاح • ${sold} مباع</div></div>
    <div class="stat-card c-green"><div class="sc-label">الإيرادات</div><div class="sc-val">${revenue.toLocaleString()}</div><div class="sc-sub">${cur()}</div></div>
    <div class="stat-card c-gold"><div class="sc-label">التكلفة الكلية 🔒</div><div class="sc-val">${cost.toLocaleString()}</div><div class="sc-sub">${cur()}</div></div>
    <div class="stat-card c-purple"><div class="sc-label">صافي الربح 🔒</div><div class="sc-val">${profit.toLocaleString()}</div><div class="sc-sub">${revenue>0?((profit/revenue)*100).toFixed(1):0}% هامش</div></div>`;
  const brands={};DB.products.forEach(p=>{brands[p.brand]=(brands[p.brand]||0)+1;});
  document.getElementById('repStock').innerHTML=Object.entries(brands).map(([b,c])=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>${BRAND_EMOJI[b]||'📱'} ${b}</span><strong style="color:white">${c} موبايل</strong></div>`).join('')||'<p style="color:var(--muted)">لا يوجد</p>';
  const soldB={};DB.sales.forEach(s=>{soldB[s.brand]=(soldB[s.brand]||0)+1;});
  document.getElementById('repBrands').innerHTML=Object.entries(soldB).sort((a,b)=>b[1]-a[1]).map(([b,c])=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>${BRAND_EMOJI[b]||'📱'} ${b}</span><strong style="color:var(--accent)">${c} مبيعات</strong></div>`).join('')||'<p style="color:var(--muted)">لا توجد مبيعات</p>';
  document.getElementById('repProfit').innerHTML=`
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>💵 الإيرادات</span><strong style="color:white">${revenue.toLocaleString()} ${cur()}</strong></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>🔒 التكاليف</span><strong style="color:var(--gold)">${cost.toLocaleString()} ${cur()}</strong></div>
    <div style="display:flex;justify-content:space-between;padding:15px 0;font-size:16px"><span style="color:var(--green);font-weight:700">📈 صافي الربح</span><strong style="color:var(--green);font-size:20px">${profit.toLocaleString()} ${cur()}</strong></div>
    <div style="display:flex;justify-content:space-between;font-size:13px"><span>هامش الربح</span><strong style="color:white">${revenue>0?((profit/revenue)*100).toFixed(1):0}%</strong></div>`;
  const nP=DB.products.filter(p=>p.condition==='جديد').length,uP=DB.products.filter(p=>p.condition==='مستعمل').length;
  const nS=DB.sales.filter(s=>{const p=DB.products.find(x=>x.id===s.productId);return p?.condition==='جديد';}).length;
  const uS=DB.sales.filter(s=>{const p=DB.products.find(x=>x.id===s.productId);return p?.condition==='مستعمل';}).length;
  document.getElementById('repCondition').innerHTML=`
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>🆕 جديد - إجمالي</span><strong style="color:white">${nP}</strong></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>🆕 جديد - مباع</span><strong style="color:var(--green)">${nS}</strong></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span>♻️ مستعمل - إجمالي</span><strong style="color:white">${uP}</strong></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:13px"><span>♻️ مستعمل - مباع</span><strong style="color:var(--gold)">${uS}</strong></div>`;
}

// ════ ACTIVITY & SETTINGS ════
function addActivity(icon,text,color){DB.activity.push({icon,text,time:new Date().toISOString(),color});if(DB.activity.length>300)DB.activity=DB.activity.slice(-300);}
function renderActivity(){
  const el=document.getElementById('activityLog');
  if(!DB.activity.length){el.innerHTML='<p style="color:var(--muted);text-align:center;padding:40px">لا يوجد نشاط</p>';return;}
  el.innerHTML=[...DB.activity].reverse().map(a=>`<div class="act-item"><div class="act-dot" style="background:${a.color==='green'?'var(--green)':a.color==='red'?'var(--red)':a.color==='gold'?'var(--gold)':'var(--accent)'}"></div><div class="act-info"><strong>${a.icon} ${a.text}</strong><span>${new Date(a.time).toLocaleString('ar-EG')}</span></div></div>`).join('');
}
function loadSettings(){
  document.getElementById('sName').value=DB.settings.storeName||'';
  document.getElementById('sPhone').value=DB.settings.phone||'';
  document.getElementById('sWhatsapp').value=DB.settings.whatsapp||'';
  document.getElementById('sAddress').value=DB.settings.address||'';
  document.getElementById('sCurrency').value=DB.settings.currency||'ج.م';
  document.getElementById('sWholesaleDisc').value=DB.settings.wholesaleDisc||15;
}
function saveSettings(){
  DB.settings.storeName=document.getElementById('sName').value;
  DB.settings.phone=document.getElementById('sPhone').value;
  DB.settings.whatsapp=document.getElementById('sWhatsapp').value;
  DB.settings.address=document.getElementById('sAddress').value;
  DB.settings.currency=document.getElementById('sCurrency').value;
  DB.settings.wholesaleDisc=parseInt(document.getElementById('sWholesaleDisc').value)||15;
  // Update sticky contact WhatsApp link
  const waBtns=document.querySelectorAll('.sticky-contact-btn.whatsapp');
  waBtns.forEach(b=>b.href=`https://wa.me/${DB.settings.whatsapp||'201094918310'}`);
  saveDB();showAdmAlert('settingsAlert','success','✅ تم الحفظ!');
}
function changePass(){
  const old=document.getElementById('oldPass').value;
  const nw=document.getElementById('newPass').value;
  const cf=document.getElementById('confPass').value;
  if(old!==DB.settings.password){showAdmAlert('passAlert','danger','❌ كلمة المرور الحالية غلط');return;}
  if(nw!==cf){showAdmAlert('passAlert','danger','❌ كلمة المرور مش متطابقة');return;}
  if(nw.length<4){showAdmAlert('passAlert','danger','❌ 4 أحرف على الأقل');return;}
  DB.settings.password=nw;saveDB();addActivity('🔑','تم تغيير كلمة المرور','blue');
  showAdmAlert('passAlert','success','✅ تم التغيير!');
  ['oldPass','newPass','confPass'].forEach(id=>document.getElementById(id).value='');
}
function clearAll(){if(confirm('⚠️ هل أنت متأكد؟ كل البيانات هتتمسح!')){DB.products=[];DB.sales=[];DB.activity=[];DB.orders=[];DB.wholesaleReqs=[];DB.nextId=1;saveDB();renderAdmDashboard();alert('✅ تم المسح');}}

// ════ HELPERS ════
function openM(id){document.getElementById(id).classList.add('open');}
function closeM(id){document.getElementById(id).classList.remove('open');}
function showAdmAlert(id,type,msg){const el=document.getElementById(id);if(!el)return;el.innerHTML=`<div class="alert alert-${type}">${msg}</div>`;setTimeout(()=>el.innerHTML='',3500);}
function showToast(msg,type='success'){const t=document.getElementById('toast');t.textContent=msg;t.className=`toast ${type} show`;setTimeout(()=>t.classList.remove('show'),3000);}

// Close on overlay click
document.querySelectorAll('.modal-ov').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');});});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('loginPage').classList.contains('active'))doLogin();});
// Back to top & scroll hide/show
window.addEventListener('scroll',()=>{
  const bt=document.getElementById('backTop');
  if(bt)bt.classList.toggle('show',window.scrollY>400);
},{ passive:true });
// Responsive grid fix
function fixGrids(){
  const isMob=window.innerWidth<=768;
  document.querySelectorAll('.dash-grid-2').forEach(g=>{
    g.style.gridTemplateColumns=isMob?'1fr':'1fr 1fr';
  });
}
window.addEventListener('resize',fixGrids);

// ════ INIT + SAMPLE DATA ════
loadDB();

if(!DB.products.length){
  const samples=[
    {name:'Samsung Galaxy A55 5G',brand:'Samsung',condition:'جديد',storage:'256GB',ram:'8GB',color:'أزرق',costPrice:8200,salePrice:11500,wholesalePrice:9800,notes:'شاشة Super AMOLED 6.6 بوصة',ytLink:'',fbLink:''},
    {name:'iPhone 15 Pro',brand:'iPhone',condition:'جديد',storage:'256GB',ram:'8GB',color:'تيتانيوم طبيعي',costPrice:38000,salePrice:48000,wholesalePrice:42000,notes:'كاميرا 48MP',ytLink:'',fbLink:''},
    {name:'Xiaomi Redmi Note 13 Pro',brand:'Xiaomi',condition:'جديد',storage:'256GB',ram:'12GB',color:'أسود',costPrice:5500,salePrice:7500,wholesalePrice:6500,notes:'شاشة AMOLED 120Hz',ytLink:'',fbLink:''},
    {name:'Realme C67',brand:'Realme',condition:'جديد',storage:'128GB',ram:'6GB',color:'أخضر',costPrice:3200,salePrice:4500,wholesalePrice:3900,notes:'بطارية 5000mAh',ytLink:'',fbLink:''},
    {name:'Huawei Nova 12',brand:'Huawei',condition:'مستعمل',storage:'256GB',ram:'8GB',color:'ذهبي',costPrice:7000,salePrice:9500,wholesalePrice:8200,notes:'حالة ممتازة - معاه علبته',ytLink:'',fbLink:''},
    {name:'Samsung Galaxy S24',brand:'Samsung',condition:'جديد',storage:'256GB',ram:'12GB',color:'أسود',costPrice:22000,salePrice:29000,wholesalePrice:25000,notes:'Snapdragon 8 Gen 3',ytLink:'',fbLink:''},
    {name:'iPhone 14',brand:'iPhone',condition:'مستعمل',storage:'128GB',ram:'6GB',color:'أبيض',costPrice:18000,salePrice:23000,wholesalePrice:20000,notes:'بطارية 89%',ytLink:'',fbLink:''},
    {name:'Oppo Reno 11',brand:'Oppo',condition:'جديد',storage:'256GB',ram:'12GB',color:'بنفسجي',costPrice:9000,salePrice:12500,wholesalePrice:11000,notes:'كاميرا أمامية 32MP',ytLink:'',fbLink:''},
  ];
  samples.forEach(s=>{DB.products.push({id:DB.nextId++,...s,status:'متاح',createdAt:new Date().toISOString(),bgColor:BG_COLORS[Math.floor(Math.random()*BG_COLORS.length)]});});
  const sp=DB.products[2];sp.status='مباع';sp.soldAt='2025-04-20';sp.soldPrice=sp.salePrice;
  DB.sales.push({id:DB.nextId++,productId:sp.id,productName:sp.name,brand:sp.brand,date:'2025-04-20',actualPrice:sp.salePrice,costPrice:sp.costPrice,profit:sp.salePrice-sp.costPrice,buyer:'أحمد محمد',notes:''});
  DB.wholesaleReqs.push({id:DB.nextId++,name:'محمد التاجر',phone:'01011223344',business:'محل محمد',qty:10,details:'5 Samsung A55 + 5 Xiaomi Note 13',date:'2025-04-21',status:'معلق'});
  DB.orders.push({id:DB.nextId++,name:'فاطمة أحمد',phone:'01099887766',address:'القاهرة - مدينة نصر',items:[{id:DB.products[0].id,name:DB.products[0].name,brand:DB.products[0].brand,price:DB.products[0].salePrice}],total:DB.products[0].salePrice,date:'2025-04-22',status:'جديد',notes:''});
  addActivity('🎉','تم إنشاء متجر EmBoo بنجاح','green');
  saveDB();
}
renderStore();
fixGrids();
