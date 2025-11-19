const API = 'http://localhost:5000/api/tables';

const el = (id) => document.getElementById(id);
const tablesDiv = el('tables');
const tableArea = el('table-area');
const tableNameEl = el('table-name');
const refreshBtn = el('refresh');
const createBtn = el('create-row');

let currentTable = null;
let currentRows = [];

function prettyHeader(k){
  const map = {
    CategoriaID: 'ID',
    CategoriaNombre: 'NOMBRE',
    'Descripción': 'DESCRIPCION',
    Imagen: 'IMAGEN',
    id: 'ID',
    ID: 'ID',
    Id: 'ID',
    nombre: 'NOMBRE',
    Nombre: 'NOMBRE',
    nombre_categoria: 'NOMBRE',
    descripcion: 'DESCRIPCION',
    Descripcion: 'DESCRIPCION',
    imagen: 'IMAGEN'
  };
  return map[k] || k.toUpperCase();
}

function isImageKey(k){
  return /imagen|image|foto|img/i.test(k);
}

function looksLikeUrl(v){
  if (!v) return false;
  return /^https?:\/\//i.test(v) || /^data:\w+\//i.test(v) || /\.(jpg|jpeg|png|gif|svg)$/i.test(String(v));
}

function getOrderedKeys(keys){
  // If this is the categories table, prefer the common category column order.
  if (currentTable && /categor/i.test(currentTable)){
    const groups = [
      ['CategoriaID','categoriaID','categoria_id','id','ID','Id'],
      ['CategoriaNombre','categoriaNombre','categoria_nombre','categoria','Categoria','nombre','Nombre','name','Name'],
      ['Descripción','descripcion','Descripcion','descrip','detalle','detalles'],
      ['Imagen','imagen','imagen_url','image','Image','url_imagen','foto','foto_url']
    ];
    const ordered = [];
    const remaining = new Set(keys);
    for (const g of groups){
      for (const cand of g){
        if (keys.includes(cand) && !ordered.includes(cand)){
          ordered.push(cand);
          remaining.delete(cand);
          break;
        }
      }
    }
    // append any keys that weren't matched
    for (const k of keys){ if (remaining.has(k)) ordered.push(k); }
    return ordered;
  }
  return keys;
}

async function listTables(){
  tablesDiv.textContent = 'Cargando...';
  const res = await fetch(API);
  const tables = await res.json();
  tablesDiv.innerHTML = '';
  tables.forEach(t => {
    const d = document.createElement('div');
    d.className = 'table-item';
    d.textContent = t;
    d.onclick = () => selectTable(t, d);
    tablesDiv.appendChild(d);
  });
  // auto-select categorias if exists
  const prefer = tables.find(x => /categor/i.test(x));
  if (prefer) {
    const node = Array.from(tablesDiv.children).find(n => n.textContent === prefer);
    if (node) selectTable(prefer, node);
  }
}

async function selectTable(table, node){
  currentTable = table;
  tableNameEl.textContent = table;
  Array.from(document.querySelectorAll('.table-item')).forEach(n=>n.classList.remove('active'));
  if (node) node.classList.add('active');
  await loadTableData(table);
}

async function loadTableData(table){
  tableArea.textContent = 'Cargando datos...';
  const res = await fetch(`${API}/${encodeURIComponent(table)}`);
  if (!res.ok){ tableArea.textContent = 'Error al cargar datos'; return; }
  const rows = await res.json();
  currentRows = rows;
  renderTable(rows);
}

function renderTable(rows){
  if (!rows || rows.length === 0){
    tableArea.innerHTML = '<p>No hay filas en esta tabla.</p>';
    return;
  }
  const rawKeys = Object.keys(rows[0]);
  const keys = getOrderedKeys(rawKeys);
  const headerHtml = keys.map(k=>`<th>${prettyHeader(k)}</th>`).join('') + '<th>DETALLES</th><th>EDITAR</th><th>BORRAR</th>';

  const tbody = rows.map(r=>{
    const cols = keys.map(k=>{
      const v = r[k] == null ? '' : r[k];
      if (isImageKey(k) || looksLikeUrl(v)){
        return `<td><img class="thumb" src="${escapeAttr(v)}" alt="img"></td>`;
      }
      return `<td>${escapeHtml(v)}</td>`;
    }).join('');
    const idVal = r[keys[0]]; // assume first column is PK
    return `<tr>${cols}<td class="actions"><button class="btn details" onclick="onDetails('${idVal}')">Detalles</button></td><td class="actions"><button class="btn edit" onclick="onEdit('${idVal}')">Editar</button></td><td class="actions"><button class="btn delete" onclick="onDelete('${idVal}')">Borrar</button></td></tr>`;
  }).join('');
  tableArea.innerHTML = `<table><thead><tr>${headerHtml}</tr></thead><tbody>${tbody}</tbody></table>`;
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

window.onDetails = function(id){
  const item = currentRows.find(r=>String(r[Object.keys(r)[0]]) === String(id));
  alert(JSON.stringify(item, null, 2));
}

window.onEdit = function(id){
  const item = currentRows.find(r=>String(r[Object.keys(r)[0]]) === String(id));
  if (!item) return alert('Fila no encontrada');
  const keys = Object.keys(item);
  const formHtml = keys.map(k=>`<label>${k}:<br><input name="${k}" value="${escapeAttr(item[k])}"></label><br>`).join('') + '<br><button id="save-edit" class="btn edit">Guardar</button>';
  tableArea.innerHTML = `<div><h3>Editar fila</h3><form id="edit-form">${formHtml}</form></div>`;
  el('save-edit').onclick = async ()=>{
    const form = el('edit-form');
    const data = {};
    keys.forEach(k=> data[k] = form.elements[k].value);
    const res = await fetch(`${API}/${encodeURIComponent(currentTable)}/${encodeURIComponent(id)}`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    if (!res.ok) return alert('Error al guardar');
    alert('Guardado');
    await loadTableData(currentTable);
  };
}

window.onDelete = async function(id){
  if (!confirm('¿Borrar fila?')) return;
  const res = await fetch(`${API}/${encodeURIComponent(currentTable)}/${encodeURIComponent(id)}`,{method:'DELETE'});
  if (!res.ok) return alert('Error al borrar');
  alert('Borrado');
  await loadTableData(currentTable);
}

createBtn.onclick = function(){
  if (!currentTable) return alert('Seleccione una tabla');
  const keys = currentRows.length>0 ? Object.keys(currentRows[0]) : [];
  if (keys.length === 0){
    const cols = prompt('No hay filas para inferir columnas. Escribe los nombres de columnas separados por coma:');
    if (!cols) return;
    const arr = cols.split(',').map(s=>s.trim()).filter(Boolean);
    renderCreateForm(arr);
  } else renderCreateForm(keys);
}

function renderCreateForm(keys){
  const formHtml = keys.map(k=>`<label>${k}:<br><input name="${k}" value=""></label><br>`).join('') + '<br><button id="save-create" class="btn details">Crear</button>';
  tableArea.innerHTML = `<div><h3>Crear fila en ${currentTable}</h3><form id="create-form">${formHtml}</form></div>`;
  el('save-create').onclick = async ()=>{
    const form = el('create-form');
    const data = {};
    keys.forEach(k=> data[k] = form.elements[k].value);
    const res = await fetch(`${API}/${encodeURIComponent(currentTable)}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    if (!res.ok) return alert('Error al crear');
    alert('Creado');
    await loadTableData(currentTable);
  };
}

function escapeAttr(s){ return (s==null?'':String(s)).replace(/"/g,'&quot;'); }

refreshBtn.onclick = async ()=>{ if (currentTable) await loadTableData(currentTable); else await listTables(); }

// initial
listTables();
