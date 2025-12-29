const GOAL_ECTS = 240;
const STORAGE_KEY = "career_progress_teleco_ects_v3";

const SUBJECTS = [
  // 1º S1
  { id:"1s1-01", name:"Fundamentos de física", ects:6, group:"1º · S1" },
  { id:"1s1-02", name:"Fundamentos de informática", ects:6, group:"1º · S1" },
  { id:"1s1-03", name:"Fundamentos de administración de empresas", ects:6, group:"1º · S1" },
  { id:"1s1-04", name:"Cálculo", ects:6, group:"1º · S1" },
  { id:"1s1-05", name:"Álgebra", ects:6, group:"1º · S1" },

  // 1º S2
  { id:"1s2-01", name:"Circuitos y sistemas", ects:6, group:"1º · S2" },
  { id:"1s2-02", name:"Fundamentos de redes", ects:6, group:"1º · S2" },
  { id:"1s2-03", name:"Cálculo vectorial y diferencial", ects:6, group:"1º · S2" },
  { id:"1s2-04", name:"Introducción a los computadores", ects:6, group:"1º · S2" },
  { id:"1s2-05", name:"Matemáticas para la telecomunicación", ects:6, group:"1º · S2" },

  // 2º S1
  { id:"2s1-01", name:"Señales y sistemas", ects:6, group:"2º · S1" },
  { id:"2s1-02", name:"Fundamentos de electrónica", ects:6, group:"2º · S1" },
  { id:"2s1-03", name:"Probabilidad y procesos", ects:6, group:"2º · S1" },
  { id:"2s1-04", name:"Electromagnetismo y ondas", ects:6, group:"2º · S1" },
  { id:"2s1-05", name:"Interconexión de redes", ects:6, group:"2º · S1" },

  // 2º S2
  { id:"2s2-01", name:"Electrónica analógica", ects:6, group:"2º · S2" },
  { id:"2s2-02", name:"Procesado digital de señales", ects:6, group:"2º · S2" },
  { id:"2s2-03", name:"Teoría de comunicación", ects:6, group:"2º · S2" },
  { id:"2s2-04", name:"Electrónica digital", ects:6, group:"2º · S2" },
  { id:"2s2-05", name:"Programación de redes y servicios", ects:6, group:"2º · S2" },

  // 3º S1
  { id:"3s1-01", name:"Comunicaciones digitales", ects:6, group:"3º · S1" },
  { id:"3s1-02", name:"Sistemas electrónicos con microprocesadores", ects:6, group:"3º · S1" },
  { id:"3s1-03", name:"Tecnologías de red", ects:6, group:"3º · S1" },
  { id:"3s1-04", name:"Procesado de audio e imagen", ects:6, group:"3º · S1" },
  { id:"3s1-05", name:"Medios de transmisión guiada", ects:6, group:"3º · S1" },

  // 3º S2
  { id:"3s2-01", name:"Gestión de proyectos de telecomunicación", ects:6, group:"3º · S2" },
  { id:"3s2-02", name:"Electrónica de comunicaciones", ects:6, group:"3º · S2" },
  { id:"3s2-03", name:"Radiación y propagación", ects:6, group:"3º · S2" },
  { id:"3s2-04", name:"Análisis y dimensionado de redes", ects:6, group:"3º · S2" },
  { id:"3s2-05", name:"Producción de audio y vídeo", ects:6, group:"3º · S2" },

  // 4º S1
  { id:"4s1-01", name:"Redes de comunicaciones móviles", ects:6, group:"4º · S1" },
  { id:"4s1-02", name:"Gestión de red", ects:6, group:"4º · S1" },
  { id:"4s1-03", name:"Seguridad en redes y servicios", ects:6, group:"4º · S1" },
  { id:"4s1-04", name:"Análisis y diseño de software", ects:6, group:"4º · S1" },
  { id:"4s1-05", name:"Prácticas Externas", ects:6, group:"4º · S1" },

  // 4º S2 (TFG 12 ECTS)
  { id:"4s2-01", name:"Transporte de servicios multimedia", ects:6, group:"4º · S2" },
  { id:"4s2-02", name:"Diseño y evaluación de redes", ects:6, group:"4º · S2" },
  { id:"4s2-03", name:"Comercio electrónico", ects:6, group:"4º · S2" },
  { id:"4s2-04", name:"Trabajo de Final de Grado (TFG)", ects:12, group:"4º · S2", isTFG:true }
];

// ====== UI ======
const groupsEl = document.getElementById("groups");
const fillEl = document.getElementById("progressFill");
const stApproved = document.getElementById("stApproved");
const stTotal = document.getElementById("stTotal");
const stEcts = document.getElementById("stEcts");
const progressText = document.getElementById("progressText");
const pctBadge = document.getElementById("pctBadge");
const searchEl = document.getElementById("search");

const expandAllBtn = document.getElementById("expandAll");
const collapseAllBtn = document.getElementById("collapseAll");
const markAllBtn = document.getElementById("markAll");
const unmarkAllBtn = document.getElementById("unmarkAll");
const resetBtn = document.getElementById("reset");

// ====== STATE ======
let state = loadState();
let filterText = "";

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object") ? parsed : {};
  }catch{
    return {};
  }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function isDone(id){ return !!state[id]; }
function setDone(id, value){
  state[id] = !!value;
  saveState();
  render();
}
function resetAll(){
  state = {};
  localStorage.removeItem(STORAGE_KEY);
  render();
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function matchesFilter(s){
  if(!filterText) return true;
  const t = filterText.toLowerCase().trim();
  return (s.name + " " + s.group).toLowerCase().includes(t);
}

function groupBy(list, key){
  const map = new Map();
  list.forEach(item => {
    const k = item[key];
    if(!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  });
  return map;
}

function sumEcts(list){
  return list.reduce((acc, s) => acc + (Number(s.ects) || 0), 0);
}

function compute(){
  const approvedCount = SUBJECTS.filter(s => isDone(s.id)).length;
  const ectsApproved = SUBJECTS.reduce(
    (acc, s) => acc + (isDone(s.id) ? (Number(s.ects)||0) : 0),
    0
  );
  const pct = Math.max(0, Math.min(100, Math.round((ectsApproved / GOAL_ECTS) * 100)));
  return { approvedCount, ectsApproved, pct };
}

function groupProgress(fullGroupList){
  const total = fullGroupList.length;
  const approved = fullGroupList.filter(s => isDone(s.id)).length;
  const ectsApproved = fullGroupList.reduce(
    (acc, s) => acc + (isDone(s.id) ? (Number(s.ects)||0) : 0),
    0
  );
  const ectsTotal = sumEcts(fullGroupList);
  const pct = ectsTotal ? Math.round((ectsApproved/ectsTotal)*100) : 0;
  return { total, approved, ectsApproved, ectsTotal, pct };
}

function render(){
  const { approvedCount, ectsApproved, pct } = compute();

  stApproved.textContent = approvedCount;
  stTotal.textContent = SUBJECTS.length; // 39
  stEcts.textContent = ectsApproved;
  progressText.textContent = `${ectsApproved} / ${GOAL_ECTS} ECTS`;
  pctBadge.textContent = `${pct}%`;
  fillEl.style.width = `${pct}%`;

  groupsEl.innerHTML = "";

  const visible = SUBJECTS.filter(matchesFilter);
  const groupedVisible = groupBy(visible, "group");
  const order = ["1º · S1","1º · S2","2º · S1","2º · S2","3º · S1","3º · S2","4º · S1","4º · S2"];

  let renderedAny = false;

  order.forEach(groupName => {
    const items = groupedVisible.get(groupName) || [];
    if(items.length === 0) return;

    renderedAny = true;

    const fullGroupItems = SUBJECTS.filter(s => s.group === groupName);
    const p = groupProgress(fullGroupItems);

    const details = document.createElement("details");
    if(filterText) details.open = true;

    const summary = document.createElement("summary");
    summary.innerHTML = `
      <div class="sumLeft">
        <div class="courseTitle">${escapeHtml(groupName)}</div>
        <div class="courseMeta">${p.approved}/${p.total} aprobadas · ${p.ectsApproved}/${p.ectsTotal} ECTS</div>
      </div>
      <div class="pill">${p.pct}%</div>
    `;

    const list = document.createElement("div");
    list.className = "list";

    items.forEach(s => {
      const done = isDone(s.id);
      const row = document.createElement("div");
      row.className = "row" + (done ? " done" : "");

      const tagText = s.isTFG ? "TFG ⭐" : (done ? "Aprobada ✅" : "Pendiente ⏳");

      row.innerHTML = `
        <div class="main">
          <label>
            <input type="checkbox" ${done ? "checked" : ""} data-id="${s.id}">
            <div>
              <span class="name">${escapeHtml(s.name)}</span>
              <span class="meta">${Number(s.ects)||0} ECTS</span>
            </div>
          </label>
        </div>
        <div class="tag">${tagText}</div>
      `;
      list.appendChild(row);
    });

    details.appendChild(summary);
    details.appendChild(list);
    groupsEl.appendChild(details);
  });

  groupsEl.querySelectorAll('input[type="checkbox"][data-id]').forEach(cb => {
    cb.addEventListener("change", (e) => {
      const id = e.target.getAttribute("data-id");
      setDone(id, e.target.checked);
    });
  });

  if(!renderedAny){
    const empty = document.createElement("div");
    empty.className = "accordion";
    empty.innerHTML = `
      <div class="row">
        <div class="main">
          <div>
            <div class="name">No hay resultados</div>
            <div class="meta">Prueba con otra búsqueda</div>
          </div>
        </div>
        <div class="tag">🔎</div>
      </div>
    `;
    groupsEl.appendChild(empty);
  }
}

// ====== CONTROLES ======
searchEl.addEventListener("input", (e) => {
  filterText = e.target.value || "";
  render();
});

expandAllBtn.addEventListener("click", () => {
  document.querySelectorAll("details").forEach(d => d.open = true);
});

collapseAllBtn.addEventListener("click", () => {
  document.querySelectorAll("details").forEach(d => d.open = false);
});

markAllBtn.addEventListener("click", () => {
  SUBJECTS.forEach(s => state[s.id] = true);
  saveState();
  render();
});

unmarkAllBtn.addEventListener("click", () => {
  SUBJECTS.forEach(s => state[s.id] = false);
  saveState();
  render();
});

resetBtn.addEventListener("click", () => {
  const ok = confirm("¿Seguro que quieres borrar todo el progreso guardado?");
  if(ok) resetAll();
});

render();
