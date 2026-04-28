// === ÉTAT GLOBAL ===
let vehicles = [];
let currentIndex = null;
let currentMode = 'view';
let tempTires = null, tempFluids = null, tempMaintenance = null;
let searchFilter = { field: 'owner', text: '' };
let pwdMode = 'create';

const DB_KEY = 'vehicules_db';
const PWD_KEY = 'db_password_hash';
const isElectron = !!window.electronAPI;
const fmt = v => (v && String(v).trim() !== '') ? v : 'Non spécifié';

const BRANDS = [
  { name: "Renault", file: "renault" }, { name: "Peugeot", file: "peugeot" },
  { name: "Citroën", file: "citroen" }, { name: "DS Automobiles", file: "ds" },
  { name: "Volkswagen", file: "volkswagen" }, { name: "Audi", file: "audi" },
  { name: "BMW", file: "bmw" }, { name: "Mercedes-Benz", file: "mercedes" },
  { name: "Toyota", file: "toyota" }, { name: "Honda", file: "honda" },
  { name: "Nissan", file: "nissan" }, { name: "Hyundai", file: "hyundai" },
  { name: "Kia", file: "kia" }, { name: "Ford", file: "ford" },
  { name: "Opel", file: "opel" }, { name: "Fiat", file: "fiat" },
  { name: "Jeep", file: "jeep" }, { name: "Alfa Romeo", file: "alfa-romeo" },
  { name: "Mazda", file: "mazda" }, { name: "Subaru", file: "subaru" },
  { name: "Volvo", file: "volvo" }, { name: "Porsche", file: "porsche" },
  { name: "Land Rover", file: "land-rover" }, { name: "Jaguar", file: "jaguar" },
  { name: "Tesla", file: "tesla" }, { name: "Mini", file: "mini" },
  { name: "Seat", file: "seat" }, { name: "Skoda", file: "skoda" },
  { name: "Mitsubishi", file: "mitsubishi" }, { name: "Suzuki", file: "suzuki" },
  { name: "Chevrolet", file: "chevrolet" }, { name: "Cadillac", file: "cadillac" },
  { name: "Lexus", file: "lexus" }, { name: "Infiniti", file: "infiniti" },
  { name: "Acura", file: "acura" }, { name: "Ferrari", file: "ferrari" },
  { name: "Lamborghini", file: "lamborghini" }, { name: "Maserati", file: "maserati" },
  { name: "Bentley", file: "bentley" }, { name: "Rolls-Royce", file: "rolls-royce" },
  { name: "McLaren", file: "mclaren" }, { name: "Lotus", file: "lotus" },
  { name: "Bugatti", file: "bugatti" }, { name: "Aston Martin", file: "aston-martin" },
  { name: "Dacia", file: "dacia" }, { name: "Smart", file: "smart" },
  { name: "Autre", file: "default" }
].sort((a, b) => a.name.localeCompare(b.name));

const FALLBACK_SVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZjNzU3ZCI+PHBhdGggZD0iTTE4LjkyIDYuMDFDMTguNzIgNS40MiAxOC4xNiA1IDE3LjUgNWgtMTFjLS42NiAwLTEuMjEuNDItMS40MiAxLjAxTDMgMTJ2OGMwIC41NS40NSAxIDEgMWgxYy41NSAwIDEtLjQ1IDEtMXYtMWgxMnYxYzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi04bC0yLjA4LTUuOTl6TTYuNSAxNmMtLjgzIDAtMS41LS42Ny0xLjUtMS41UzUuNjcgMTMgNi41IDEzczEuNS42NyAxLjUgMS41UzcuMzMgMTYgNi41IDE2em0xMSAwYy0uODMgMC0xLjUtLjY3LTEuNS0xLjVzLjY3LTEuNSAxLjUtMS41IDEuNS42NyAxLjUgMS41LS42NyAxLjUtMS41IDEuNXpNNSAxMWwxLjUtNC41aDExTDE5IDExSDV6Ii8+PC9zdmc+`;

function getBrandLogoPath(brandName) {
  const brand = BRANDS.find(b => b.name === brandName) || BRANDS.find(b => b.name === "Autre");
  return `logos/${brand.file}.png`;
}

const db = {
  async load() { if (isElectron) return await window.electronAPI.loadDb(); const d = localStorage.getItem(DB_KEY); return d ? JSON.parse(d) : []; },
  async save(data) { if (isElectron) return await window.electronAPI.saveDb(data); localStorage.setItem(DB_KEY, JSON.stringify(data)); return true; }
};

const defaultTires = { front: {brand:'',size:'',pressure:'',date:''}, rear: {brand:'',size:'',pressure:'',date:''}, lastCheck: '' };
const defaultFluids = {
  engine: { brand: '', capacity: '', mileage: '', notes: '' },
  transmission: { brand: '', capacity: '', mileage: '', notes: '' },
  coolant: { brand: '', notes: '' },
  brake: { brand: '', notes: '' },
  washer: { brand: '', notes: '' }
};
const defaultMaintenance = { timingBelt: { km: '', date: '', notes: '' }, oilChange: { km: '', date: '', notes: '' }, brakeFluid: { km: '', date: '', notes: '' }, tiresRotation: { km: '', date: '', notes: '' }, generalCheck: { km: '', date: '', notes: '' } };

// === INIT ===
document.addEventListener('DOMContentLoaded', async () => {
  initTheme(); initSearch(); updateLockUI();
  
  // Migration douce des données existantes vers les nouvelles structures
  vehicles = (await db.load()).map(v => ({
    tires: { ...JSON.parse(JSON.stringify(defaultTires)), ...v.tires },
    fluids: {
      engine: { ...JSON.parse(JSON.stringify(defaultFluids.engine)), ...v.fluids?.engine },
      transmission: { ...JSON.parse(JSON.stringify(defaultFluids.transmission)), ...v.fluids?.transmission },
      coolant: { ...JSON.parse(JSON.stringify(defaultFluids.coolant)), ...v.fluids?.coolant },
      brake: { ...JSON.parse(JSON.stringify(defaultFluids.brake)), ...v.fluids?.brake },
      washer: { ...JSON.parse(JSON.stringify(defaultFluids.washer)), ...v.fluids?.washer }
    },
    maintenance: { ...JSON.parse(JSON.stringify(defaultMaintenance)), ...v.maintenance },
    ...v
  }));

  const hasPwd = localStorage.getItem(PWD_KEY);
  document.querySelector('.card').style.display = hasPwd ? 'none' : 'block';
  if (hasPwd) toggleLockScreen(true);
  else renderList();
});

// === THEME & SEARCH ===
function initTheme() {
  const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('themeToggle').checked = saved === 'dark';
  document.getElementById('themeToggle').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
    localStorage.setItem('theme', e.target.checked ? 'dark' : 'light');
  });
}
function initSearch() {
  document.getElementById('searchInput').addEventListener('input', (e) => { searchFilter.text = e.target.value.toLowerCase(); renderList(); });
  document.getElementById('searchField').addEventListener('change', (e) => { searchFilter.field = e.target.value; renderList(); });
}
function clearSearch() { document.getElementById('searchInput').value = ''; searchFilter.text = ''; renderList(); }
function matchesSearch(v) {
  if (!searchFilter.text) return true;
  const t = searchFilter.text, f = searchFilter.field;
  let val = '';
  switch(f) { case 'owner': val=v.owner.toLowerCase(); break; case 'brand': val=v.brand.toLowerCase(); break; case 'model': val=v.model.toLowerCase(); break; case 'engine': val=(v.engine||'').toLowerCase(); break; case 'year': val=String(v.year||''); break; default: return true; }
  return val.includes(t);
}
function renderList() {
  const ul = document.getElementById('ownerList'), empty = document.getElementById('emptyMsg'), count = document.getElementById('countDisplay');
  ul.innerHTML = '';
  const filtered = vehicles.filter(matchesSearch);
  count.textContent = `(${filtered.length})`;
  empty.style.display = filtered.length === 0 ? 'block' : 'none';
  empty.textContent = vehicles.length === 0 ? 'Aucun véhicule enregistré.' : 'Aucun résultat trouvé.';
  filtered.forEach((v, i) => {
    const li = document.createElement('li'); li.className = 'owner-item';
    li.innerHTML = `<span style="font-weight:500">${v.owner}</span><span style="opacity:0.85;font-size:0.9em">${v.brand} ${v.model} (${v.year||'N/A'})</span>`;
    li.onclick = () => showDetails(vehicles.indexOf(v)); ul.appendChild(li);
  });
}

// === MODALS & VEHICLE CRUD ===
function openAddModal() { currentMode='add'; currentIndex=null; tempTires=JSON.parse(JSON.stringify(defaultTires)); tempFluids=JSON.parse(JSON.stringify(defaultFluids)); tempMaintenance=JSON.parse(JSON.stringify(defaultMaintenance)); renderMainModal({owner:'',brand:'',model:'',year:'',engine:'',energy:'Essence',immat:'',vin:'',km:''}); updateMainButtons(); showModal('mainModal'); }
function showDetails(i) { currentMode='view'; currentIndex=i; renderMainModal(vehicles[i]); updateMainButtons(); showModal('mainModal'); }
function enableEditMode() { currentMode='edit'; renderMainModal(vehicles[currentIndex]); updateMainButtons(); }

function renderMainModal(d) {
  const body = document.getElementById('mainBody'), title = document.getElementById('mainTitle'), logo = getBrandLogoPath(d.brand);
  document.getElementById('mainFooter').style.display = 'flex';
  if (currentMode==='view') {
    title.innerHTML = `<span class="brand-wrapper"><img src="${logo}" class="brand-logo" onerror="this.src='${FALLBACK_SVG}'"><span>${d.owner}</span></span>`;
    body.innerHTML = `<div class="detail-grid">
      <div class="detail-item"><div class="detail-label">🚗 Marque</div><div class="detail-value"><img src="${logo}" style="width:24px;height:24px;vertical-align:middle;margin-right:6px" onerror="this.style.display='none'">${d.brand||'Autre'}</div></div>
      <div class="detail-item"><div class="detail-label">📦 Modèle</div><div class="detail-value">${d.model}</div></div>
      <div class="detail-item"><div class="detail-label">📅 Année</div><div class="detail-value">${fmt(d.year)}</div></div>
      <div class="detail-item"><div class="detail-label">⚙️ Moteur</div><div class="detail-value">${fmt(d.engine)}</div></div>
      <div class="detail-item"><div class="detail-label">⛽ Énergie</div><div class="detail-value">${fmt(d.energy)}</div></div>
      <div class="detail-item"><div class="detail-label">🛣️ Kilométrage</div><div class="detail-value">${fmt(d.km)} km</div></div>
      <div class="detail-item"><div class="detail-label">🔤 Immatriculation</div><div class="detail-value">${fmt(d.immat)}</div></div>
      <div class="detail-item"><div class="detail-label">🔑 VIN</div><div class="detail-value" style="font-family:monospace">${fmt(d.vin)}</div></div>
      <div class="detail-item"><div class="detail-label">📝 Ajouté le</div><div class="detail-value">${fmt(d.addedAt)}</div></div>
    </div>
    <div class="btn-sub-group">
      <button class="btn btn-sub" onclick="openTireModal()" title="Pneumatiques">🛞 Pneumatiques</button>
      <button class="btn btn-sub" onclick="openFluidModal()" title="Liquides">💧 Liquides</button>
      <button class="btn btn-sub" onclick="openMaintenanceModal()" title="Entretien">🔧 Entretien</button>
    </div>`;
  } else {
    title.textContent = currentMode==='add' ? '➕ Nouveau véhicule' : '✏️ Modifier le véhicule';
    let opts = BRANDS.map(b => `<option value="${b.name}" ${d.brand===b.name?'selected':''}>${b.name}</option>`).join('');
    body.innerHTML = `<div class="form-grid">
      <div class="form-group"><label class="form-label">Propriétaire <span class="required">*</span></label><input id="m_owner" value="${d.owner}" required></div>
      <div class="form-group"><label class="form-label">Marque <span class="required">*</span></label><select id="m_brand" required>${opts}</select></div>
      <div class="form-group"><label class="form-label">Modèle <span class="required">*</span></label><input id="m_model" value="${d.model}" required></div>
      <div class="form-group"><label class="form-label">Année</label><input type="number" id="m_year" value="${d.year||''}"></div>
      <div class="form-group"><label class="form-label">Kilométrage</label><input type="number" id="m_km" value="${d.km||''}" placeholder="ex: 125000"></div>
      <div class="form-group"><label class="form-label">Immatriculation</label><input id="m_immat" value="${d.immat||''}"></div>
      <div class="form-group"><label class="form-label">VIN</label><input id="m_vin" value="${d.vin||''}" style="text-transform:uppercase"></div>
      <div class="form-group"><label class="form-label">Moteur</label><input id="m_engine" value="${d.engine||''}"></div>
      <div class="form-group"><label class="form-label">Énergie <span class="required">*</span></label><select id="m_energy"><option value="Essence" ${d.energy==='Essence'?'selected':''}>Essence</option><option value="Diesel" ${d.energy==='Diesel'?'selected':''}>Diesel</option><option value="Hybride" ${d.energy==='Hybride'?'selected':''}>Hybride</option><option value="Électrique" ${d.energy==='Électrique'?'selected':''}>Électrique</option><option value="GPL" ${d.energy==='GPL'?'selected':''}>GPL</option></select></div>
    </div>
    <div class="btn-sub-group">
      <button class="btn btn-sub" onclick="openTireModal()" title="Pneumatiques">🛞 Pneumatiques</button>
      <button class="btn btn-sub" onclick="openFluidModal()" title="Liquides">💧 Liquides</button>
      <button class="btn btn-sub" onclick="openMaintenanceModal()" title="Entretien">🔧 Entretien</button>
    </div>`;
  }
}

function updateMainButtons() {
  const footer = document.getElementById('mainFooter');
  
  if (currentMode === 'view') {
    // Mode lecture : Modifier + Fermer + SUPPRIMER
    footer.innerHTML = `
      <button class="btn btn-edit" onclick="enableEditMode()" title="Modifier">✏️ Modifier</button>
      <button class="btn btn-cancel" onclick="deleteVehicle()" style="background:var(--danger);color:white" title="Supprimer">🗑️ Supprimer</button>
      <button class="btn btn-close" onclick="closeModal('mainModal')" title="Fermer">Fermer</button>
    `;
  } else {
    // Mode ajout/modif : Valider + Retour
    footer.innerHTML = `
      <button class="btn btn-validate" onclick="validateMainForm()" title="Valider">✅ Valider</button>
      <button class="btn btn-cancel" onclick="closeModal('mainModal')" title="Retour">Retour</button>
    `;
  }
}

async function validateMainForm() {
  const d = { owner:get('m_owner'), brand:get('m_brand'), model:get('m_model'), year:get('m_year'), km:get('m_km'), immat:get('m_immat'), vin:get('m_vin').toUpperCase(), engine:get('m_engine')||'Non spécifié', energy:get('m_energy') };
  if (!d.owner||!d.brand||!d.model) return alert('⚠️ Remplissez les champs obligatoires (*).');
  d.addedAt = currentMode==='add' ? new Date().toLocaleDateString('fr-FR') : vehicles[currentIndex].addedAt;
  d.tires = currentMode==='add' ? tempTires : vehicles[currentIndex].tires;
  d.fluids = currentMode==='add' ? tempFluids : vehicles[currentIndex].fluids;
  d.maintenance = currentMode==='add' ? tempMaintenance : vehicles[currentIndex].maintenance;
  if (currentMode==='add') vehicles.push(d); else vehicles[currentIndex] = d;
  await db.save(vehicles); renderList(); closeModal('mainModal');
}

async function deleteVehicle() {
  if (currentIndex === null) return;
  
  const v = vehicles[currentIndex];
  const confirmed = window.confirm(
    `⚠️ Supprimer définitivement :\n\n${v.owner}\n${v.brand} ${v.model} (${v.year || 'N/A'})\n\nCette action est irréversible.`
  );
  
  if (!confirmed) return;
  
  vehicles.splice(currentIndex, 1);
  await db.save(vehicles);
  renderList();
  closeModal('mainModal');
  alert('✅ Véhicule supprimé.');
}

// === SOUS-MODALS ===
function openTireModal() {
  const ro = currentMode==='view', t = currentMode==='add'?tempTires:vehicles[currentIndex].tires;
  const fields = [{id:'t_f_brand',v:t.front.brand,l:'🟦 Avant - Marque'},{id:'t_f_size',v:t.front.size,l:'🟦 Avant - Taille'},{id:'t_f_pres',v:t.front.pressure,l:'🟦 Avant - Pression',t:'number'},{id:'t_f_date',v:t.front.date,l:'🟦 Avant - Date',t:'month'},{id:'t_r_brand',v:t.rear.brand,l:'🟥 Arrière - Marque'},{id:'t_r_size',v:t.rear.size,l:'🟥 Arrière - Taille'},{id:'t_r_pres',v:t.rear.pressure,l:'🟥 Arrière - Pression',t:'number'},{id:'t_r_date',v:t.rear.date,l:'🟥 Arrière - Date',t:'month'}];
  if (ro) {
    document.getElementById('tireBody').innerHTML = `<div class="detail-grid">${fields.map(f=>`<div class="detail-item"><div class="detail-label">${f.l}</div><div class="detail-value">${fmt(f.v)}</div></div>`).join('')}<div class="detail-item"><div class="detail-label">📅 Dernier contrôle</div><div class="detail-value">${fmt(t.lastCheck)}</div></div></div>`;
    document.getElementById('tireFooter').innerHTML = `<button class="btn btn-close" onclick="closeModal('tireModal')" title="Fermer">Fermer</button>`;
  } else {
    document.getElementById('tireBody').innerHTML = `<div class="form-grid">${fields.map(f=>`<div class="form-group"><label class="form-label">${f.l}</label><input id="${f.id}" value="${f.v}" ${f.t?`type="${f.t}" step="0.1"`:''}></div>`).join('')}</div><div class="form-group"><label class="form-label">📅 Dernier contrôle</label><input type="date" id="t_check" value="${t.lastCheck}"></div>`;
    document.getElementById('tireFooter').innerHTML = `<button class="btn btn-validate" onclick="saveTires()" title="Enregistrer">💾 Enregistrer</button><button class="btn btn-cancel" onclick="closeModal('tireModal')" title="Fermer">Fermer</button>`;
  }
  showModal('tireModal');
}
async function saveTires() { const t = currentMode==='add'?tempTires:vehicles[currentIndex].tires; t.front={brand:get('t_f_brand'),size:get('t_f_size'),pressure:get('t_f_pres'),date:get('t_f_date')}; t.rear={brand:get('t_r_brand'),size:get('t_r_size'),pressure:get('t_r_pres'),date:get('t_r_date')}; t.lastCheck=get('t_check'); if(currentMode!=='add') await db.save(vehicles); closeModal('tireModal'); }

// Configuration dynamique des liquides
const FLUID_CONFIG = [
  { key: 'engine', label: '🛢️ Huile moteur', color: '#e67e22', fields: ['brand', 'capacity', 'mileage', 'notes'] },
  { key: 'transmission', label: '⚙️ Transmission', color: '#8e44ad', fields: ['brand', 'capacity', 'mileage', 'notes'] },
  { key: 'coolant', label: '🌡️ Refroidissement', color: '#2ecc71', fields: ['brand', 'notes'], placeholder: 'dernier remplacement à *** KM ou appoint fait à *** KM' },
  { key: 'brake', label: '🛑 Liquide Frein', color: '#e74c3c', fields: ['brand', 'notes'], placeholder: 'dernier remplacement à *** KM' },
  { key: 'washer', label: '💧 Lave-glace', color: '#3498db', fields: ['brand', 'notes'] }
];

function openFluidModal() {
  const ro = currentMode==='view', f = currentMode==='add'?tempFluids:vehicles[currentIndex].fluids;
  
  if (ro) {
    let html = '';
    FLUID_CONFIG.forEach(cfg => {
      html += `<div style="background:var(--bg);padding:1rem;border-radius:10px;margin-bottom:1rem;border-left:4px solid ${cfg.color}"><h3 style="margin:0 0 0.5rem;font-size:1rem;color:${cfg.color}">${cfg.label}</h3><div class="detail-grid">`;
      cfg.fields.forEach(field => {
        let label = ''; let val = f[cfg.key][field] || '';
        if(field==='brand') label='Marque/Type';
        else if(field==='capacity') label='Capacité';
        else if(field==='mileage') label='Kilométrage';
        else if(field==='notes') label='Notes';
        html += `<div class="detail-item"><div class="detail-label">${label}</div><div class="detail-value">${field==='notes' ? fmt(val) : fmt(val) + (field==='capacity'?' L':'') + (field==='mileage'?' km':'')}</div></div>`;
      });
      html += `</div></div>`;
    });
    document.getElementById('fluidBody').innerHTML = html;
    document.getElementById('fluidFooter').innerHTML = `<button class="btn btn-close" onclick="closeModal('fluidModal')">Fermer</button>`;
  } else {
    let html = '';
    FLUID_CONFIG.forEach(cfg => {
      html += `<div style="background:var(--bg);padding:1rem;border-radius:10px;margin-bottom:1rem;border-left:4px solid ${cfg.color}"><h3 style="margin:0 0 0.5rem;font-size:1rem;color:${cfg.color}">${cfg.label}</h3><div class="form-grid">`;
      cfg.fields.forEach(field => {
        let label='', type='text', ph='';
        if(field==='brand') { label='Marque/Type'; }
        else if(field==='capacity') { label='Capacité (L)'; type='number'; }
        else if(field==='mileage') { label='Kilométrage'; type='number'; }
        else if(field==='notes') { label='Notes'; ph=cfg.placeholder||''; }
        html += `<div class="form-group" ${field==='notes'?'style="grid-column:1/-1"':''}><label class="form-label">${label}</label><input type="${type}" id="f_${cfg.key}_${field}" value="${f[cfg.key][field]||''}" placeholder="${ph}"></div>`;
      });
      html += `</div></div>`;
    });
    document.getElementById('fluidBody').innerHTML = html;
    document.getElementById('fluidFooter').innerHTML = `<button class="btn btn-validate" onclick="saveFluids()" title="Enregistrer">💾 Enregistrer</button><button class="btn btn-cancel" onclick="closeModal('fluidModal')" title="Fermer">Fermer</button>`;
  }
  showModal('fluidModal');
}

async function saveFluids() { 
  const target = currentMode==='add'?tempFluids:vehicles[currentIndex].fluids; 
  FLUID_CONFIG.forEach(cfg => {
    cfg.fields.forEach(field => {
      target[cfg.key][field] = document.getElementById(`f_${cfg.key}_${field}`).value.trim();
    });
  });
  if(currentMode!=='add') await db.save(vehicles); 
  closeModal('fluidModal'); 
}

function openMaintenanceModal() {
  const ro = currentMode==='view', m = currentMode==='add'?tempMaintenance:vehicles[currentIndex].maintenance;
  const items = [{k:'timingBelt',l:'🔗 Kit Distribution'},{k:'oilChange',l:'🛢️ Vidange'},{k:'brakeFluid',l:'🛑 Liquide Frein'},{k:'tiresRotation',l:'🔄 Rotation Pneus'},{k:'generalCheck',l:'🔍 Contrôle Général'}];
  if (ro) {
    document.getElementById('maintenanceBody').innerHTML = items.map(i=>`<div style="background:var(--bg);padding:1rem;border-radius:10px;margin-bottom:1rem;border-left:4px solid var(--primary)"><h3 style="margin:0 0 0.5rem;font-size:1rem">${i.l}</h3><div class="detail-grid"><div class="detail-item"><div class="detail-label">Kilométrage</div><div class="detail-value">${fmt(m[i.k].km)} km</div></div><div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${fmt(m[i.k].date)}</div></div><div class="detail-item" style="grid-column:1/-1"><div class="detail-label">Notes</div><div class="detail-value">${fmt(m[i.k].notes)}</div></div></div></div>`).join('');
    document.getElementById('maintenanceFooter').innerHTML = `<button class="btn btn-close" onclick="closeModal('maintenanceModal')" title="Fermer">Fermer</button>`;
  } else {
    document.getElementById('maintenanceBody').innerHTML = items.map(i=>`<div style="background:var(--bg);padding:1rem;border-radius:10px;margin-bottom:1rem;border-left:4px solid var(--primary)"><h3 style="margin:0 0 0.5rem;font-size:1rem">${i.l}</h3><div class="form-grid"><div class="form-group"><label class="form-label">Kilométrage</label><input type="number" id="m_${i.k}_km" value="${m[i.k].km}"></div><div class="form-group"><label class="form-label">Date</label><input type="date" id="m_${i.k}_date" value="${m[i.k].date}"></div><div class="form-group" style="grid-column:1/-1"><label class="form-label">Notes</label><input id="m_${i.k}_notes" value="${m[i.k].notes}"></div></div></div>`).join('');
    document.getElementById('maintenanceFooter').innerHTML = `<button class="btn btn-validate" onclick="saveMaintenance()" title="Enregistrer">💾 Enregistrer</button><button class="btn btn-cancel" onclick="closeModal('maintenanceModal')" title="Fermer">Fermer</button>`;
  }
  showModal('maintenanceModal');
}
async function saveMaintenance() { const m = currentMode==='add'?tempMaintenance:vehicles[currentIndex].maintenance; ['timingBelt','oilChange','brakeFluid','tiresRotation','generalCheck'].forEach(k=>m[k]={km:get(`m_${k}_km`),date:get(`m_${k}_date`),notes:get(`m_${k}_notes`)}); if(currentMode!=='add') await db.save(vehicles); closeModal('maintenanceModal'); }

// === SÉCURITÉ & À PROPOS ===
async function hashPwd(pwd) { const enc = new TextEncoder(); const buf = await crypto.subtle.digest('SHA-256', enc.encode(pwd)); return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join(''); }
async function checkPwd(pwd, stored) { return (await hashPwd(pwd)) === stored; }

function updateLockUI() {
  const has = !!localStorage.getItem(PWD_KEY);
  const btn = document.getElementById('lockBtn');
  btn.textContent = has ? '🔒' : '🔓';
  btn.className = `btn ${has ? 'locked' : 'unlocked'}`;
}
function handleLockClick() { openPasswordModal(localStorage.getItem(PWD_KEY) ? 'manage' : 'create'); }
function openPasswordModal(mode) {
  pwdMode = mode;
  const m = document.getElementById('passwordModal'), title = document.getElementById('pwdTitle');
  const currentGrp = document.getElementById('pwdCurrentGroup'), notice = document.getElementById('pwdNotice'), btn = document.getElementById('pwdSubmitBtn');
  document.getElementById('pwdCurrent').value = ''; document.getElementById('pwdNew').value = ''; document.getElementById('pwdConfirm').value = '';
  if (mode === 'create') { title.textContent = '🔐 Définir un mot de passe'; currentGrp.style.display = 'none'; notice.textContent = '⚠️ Ce mot de passe protégera l\'accès à votre base de données.'; btn.textContent = '🔒 Définir'; }
  else { title.textContent = '🔑 Gérer le mot de passe'; currentGrp.style.display = 'block'; notice.textContent = '⚠️ Laisser "Nouveau" vide pour supprimer. En cas d\'oubli, les données seront perdues.'; btn.textContent = '💾 Appliquer'; }
  m.style.display = 'flex'; setTimeout(() => m.classList.add('show'), 10);
}
async function savePassword() {
  const current = document.getElementById('pwdCurrent').value;
  const newPwd = document.getElementById('pwdNew').value;
  const confirmPwd = document.getElementById('pwdConfirm').value;
  const stored = localStorage.getItem(PWD_KEY);
  if (pwdMode === 'manage' && stored && !(await checkPwd(current, stored))) return alert('❌ Mot de passe actuel incorrect.');
  if (newPwd === '' && pwdMode === 'manage') {
    if (window.confirm('⚠️ Supprimer le mot de passe ? L\'accès sera libre.')) { localStorage.removeItem(PWD_KEY); updateLockUI(); closeModal('passwordModal'); alert('✅ Protection désactivée.'); }
    return;
  }
  if (newPwd.length < 4) return alert('⚠️ Minimum 4 caractères.');
  if (newPwd !== confirmPwd) return alert('❌ Les mots de passe ne correspondent pas.');
  localStorage.setItem(PWD_KEY, await hashPwd(newPwd)); updateLockUI(); closeModal('passwordModal'); alert(`✅ Mot de passe ${pwdMode==='create' ? 'défini' : 'modifié'}.`);
}
function toggleLockScreen(show) { document.getElementById('lockScreen').style.display = show ? 'flex' : 'none'; if(show) document.getElementById('lockInput').value=''; }
async function unlockApp() {
  const input = document.getElementById('lockInput'), err = document.getElementById('lockError'), stored = localStorage.getItem(PWD_KEY);
  if (!stored) return toggleLockScreen(false);
  if (await checkPwd(input.value, stored)) { err.style.display = 'none'; toggleLockScreen(false); document.querySelector('.card').style.display = 'block'; renderList(); }
  else { err.style.display = 'block'; input.value = ''; }
}

// === TOGGLE RECHERCHE ===
function toggleSearchBar() {
  const bar = document.getElementById('searchBar');
  const btn = document.getElementById('searchToggle');
  const isHidden = bar.classList.toggle('hidden');
  btn.classList.toggle('active', !isHidden);
  localStorage.setItem('searchBarVisible', !isHidden);
}

// Dans document.addEventListener('DOMContentLoaded', ...) ajoute après initSearch():
const searchBarVisible = localStorage.getItem('searchBarVisible') !== 'true';
if (!searchBarVisible) {
  document.getElementById('searchBar').classList.add('hidden');
  document.getElementById('searchToggle').classList.remove('active');
}

// === IMPORT/EXPORT & UTILS ===
function exportDB() { const blob = new Blob([JSON.stringify(vehicles, null, 2)], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `vehicules_backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); }
function importDB(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const imp = JSON.parse(e.target.result);
      if (!Array.isArray(imp)) throw new Error('Format invalide');
      if (window.confirm(`📥 Importer ${imp.length} véhicule(s) ?\n⚠️ Cela remplacera la base actuelle.`)) {
        vehicles = imp.map(v=>({tires:{...JSON.parse(JSON.stringify(defaultTires)),...v.tires}, fluids:{...JSON.parse(JSON.stringify(defaultFluids)),...v.fluids}, maintenance:{...JSON.parse(JSON.stringify(defaultMaintenance)),...v.maintenance},...v}));
        await db.save(vehicles); renderList(); alert('✅ Import réussi !');
      }
    } catch(err) { alert('❌ Erreur d\'import : '+err.message); }
    input.value='';
  };
  reader.readAsText(file);
}
function openAboutModal() { const m = document.getElementById('aboutModal'); m.style.display='flex'; setTimeout(()=>m.classList.add('show'),10); }
function get(id) { return document.getElementById(id)?.value.trim() || ''; }
function showModal(id) { const m=document.getElementById(id); m.style.display='flex'; setTimeout(()=>m.classList.add('show'),10); }
function closeModal(id) { const m=document.getElementById(id); m.classList.remove('show'); setTimeout(()=>{m.style.display='none'; if(id==='mainModal') currentIndex=null;},350); }
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if(e.target===m) closeModal(m.id); }));
document.getElementById('lockInput').addEventListener('keyup', e => { if(e.key==='Enter') unlockApp(); });
