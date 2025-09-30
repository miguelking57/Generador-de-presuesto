// Lista de productos (con precio)
const PRODUCTS = [
  {id:'jar1', name:'jardinería de parque > 500 m2', price: 22000},
  {id:'jar2', name:'jardinería de parque > 1000 m2', price: 40000},
  {id:'jar3', name:'jardinería de parque > 1500 m2', price: 58000},
  {id:'jar4', name:'jardinería de parque PERSONALIZADO', price: 65000},
  {id:'jar5', name:'Poda de árbol Chico (< 5mts)', price: 120000},
  {id:'jar6', name:'Poda de árbol Chico (> 5mts)', price: 280000},
  {id:'jar7', name:'Mantenimiento de canteros florales ($ x mts)', price: 5000},
  {id:'jar8', name:'Plantación de árbol ($ x Unidad)', price: 6000},
  {id:'jar9', name:'Arreglo - poda floral ($ x mts)', price: 3000},
  {id:'jar10', name:'Mantenimiento mensual de Bonsai', price: 35000},
  {id:'jar11', name:'Service Super Fertilizante Floral ($ x mts)', price: 4500}
];

const tbody = document.querySelector('#tabla tbody');

// Renderizo 5 filas fijas
for(let i=1; i<=5; i++){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${i}</td>
    <td>
      <input class="qty" type="number" min="0" value="0" />
      <span class="print-only"></span>
    </td>
    <td>
      <select class="prod">
        <option value="">-- Seleccionar servicio --</option>
        ${PRODUCTS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}
      </select>
      <span class="print-only"></span>
    </td>
    <td>
      <input class="unit" type="number" min="0" step="0.01" value="0.00" />
      <span class="print-only"></span>
    </td>
    <td class="right lineTotal">$ 0.00</td>
  `;
  tbody.appendChild(tr);
}

const $ = sel => document.querySelector(sel);
function fmt(n){ return Number(n||0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2}) }

// valor del IVA fijo.
function getIvaPct(){
  return 21;
}

function calcular(){
  try {
    const ivaPct = getIvaPct();
    let subtotal = 0;
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(r=>{
      const qtyInput = r.querySelector('.qty');
      const unitInput = r.querySelector('.unit');
      const prodSelect = r.querySelector('.prod');

      const qty = parseFloat(qtyInput.value) || 0;
      const unit = parseFloat(unitInput.value) || 0;
      const line = qty * unit;
      subtotal += line;
      r.querySelector('.lineTotal').textContent = '$ ' + fmt(line);

      // Sincronizamos los spans para la impresión
      qtyInput.nextElementSibling.textContent = qtyInput.value;
      prodSelect.nextElementSibling.textContent = prodSelect.options[prodSelect.selectedIndex].text;
      unitInput.nextElementSibling.textContent = fmt(unitInput.value);
    });

    const iva = subtotal * ivaPct / 100;
    const total = subtotal + iva;
    const ahora12_cuota = total / 12;
    const ahora18_total = total * 1.75;
    const ahora18_cuota = ahora18_total / 18;
    const cliente = ($('#nombre')?.value||'').trim();

    document.getElementById('resumen').innerHTML = `
      <div class="box" style="min-width:220px">
        <div class="small">Cliente</div>
        <div><strong>${cliente || '[sin nombre]'}</strong></div>
      </div>
      <div class="box" style="min-width:220px">
        <div class="small">Subtotal (sin IVA)</div>
        <div><strong>$ ${fmt(subtotal)}</strong></div>
        <div class="small">IVA ${ivaPct}%</div>
        <div><strong>$ ${fmt(iva)}</strong></div>
      </div>
      <div class="box" style="min-width:260px">
        <div class="small">Total (con IVA)</div>
        <div style="font-size:18px"><strong>$ ${fmt(total)}</strong></div>
        <div class="small" style="margin-top:6px">Ahora 12 (sin interés): 12 cuotas de $ ${fmt(ahora12_cuota)}</div>
        <div class="small">Ahora 18 (75% interés): total $ ${fmt(ahora18_total)} / 18 cuotas de $ ${fmt(ahora18_cuota)}</div>
      </div>
    `;
  } catch(err){
    console.error('Error en calcular():', err);
  }
}

// Cuando cambio producto: seteo precio unitario y, si cantidad está en 0, la pongo 1
tbody.addEventListener('change', e=>{
  if(e.target.classList.contains('prod')){
    const id = e.target.value;
    const product = PRODUCTS.find(p=>p.id===id);
    const tr = e.target.closest('tr');
    const unitInput = tr.querySelector('.unit');
    const qtyInput = tr.querySelector('.qty');

    if(product){
      unitInput.value = product.price.toFixed(2);
      if(Number(qtyInput.value) <= 0) qtyInput.value = 1;
    } else {
      unitInput.value = '0.00';
    }
    calcular();
  }
});

// Recalcular en input (qty o unit)
tbody.addEventListener('input', calcular);

// Listener seguro para el nombre (si existe)
const nombreEl = document.getElementById('nombre');
if(nombreEl) nombreEl.addEventListener('input', calcular);

// Iniciar
calcular();

function imprimirPresupuesto() {
  const rows = tbody.querySelectorAll('tr');
  // Ocultamos las filas con cantidad 0
  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    if (qty === 0) {
      row.classList.add('fila-oculta');
    } else {
      row.classList.remove('fila-oculta');
    }
  });

  // Mostramos la ventana de impresión
  window.print();
}


// Exportar PDF
function exportPDF() {
  const opt = {
    margin: 10,
    filename: `${(document.getElementById('nombre')?.value || 'cliente')}_presupuesto.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const element = document.getElementById('presupuesto').cloneNode(true);
  
  // --- P1: Reemplaza todos los inputs/selects por texto estático ---
  const originalNodes = document.querySelectorAll('#presupuesto input, #presupuesto select, #presupuesto button');
  const clonedNodes = element.querySelectorAll('input, select, button');

  clonedNodes.forEach((clonedNode, index) => {
    // Es importante que el nodo original exista para evitar errores
    if (originalNodes[index]) {
      const originalNode = originalNodes[index];
      const span = document.createElement('span');

      if (originalNode.tagName.toLowerCase() === 'select') {
        span.textContent = originalNode.options[originalNode.selectedIndex]?.text || '';
      } else {
        span.textContent = originalNode.value || '';
      }
      
      // Añadimos una clase al span de cantidad para poder encontrarlo después
      if (originalNode.classList.contains('qty')) {
        span.classList.add('qty-span-pdf');
      }
      
      clonedNode.parentNode.replaceChild(span, clonedNode);
    }
  });

  // --- P2: eliminamos las filas con cantidad "0" ---
  const clonedRows = element.querySelectorAll('#tabla tbody tr');
  clonedRows.forEach(row => {
    const qtySpan = row.querySelector('.qty-span-pdf');
    // Si el span de cantidad existe y su texto es "0", eliminamos la fila completa
    if (qtySpan && qtySpan.textContent === '0') {
      row.remove();
    }
  });

  html2pdf().set(opt).from(element).save();
}

// Copiar resumen
function addToClipboard(){
  const txt = document.getElementById('resumen').innerText;
  navigator.clipboard?.writeText(txt).then(
    ()=>alert('Resumen copiado al portapapeles'),
    ()=>alert('No se pudo copiar')
  );
}