let mainChart = null;
let currentProductData = null;
let currentTimeFilter = 12; // default último año

/* ================= SECCIONES ================= */

function showSection(sectionName, btn){

  document.querySelectorAll(".section").forEach(sec=>{
    sec.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach(b=>{
    b.classList.remove("active-btn");
  });

  if(btn) btn.classList.add("active-btn");

  document.getElementById(sectionName+"Section").classList.add("active");
}

function setTimeFilter(months){

  currentTimeFilter = months;

  if(currentProductData){
    openModal(currentProductData);
  }
}

/* ================= STATUS PRODUCTOS ================= */
// 🔹 1. CARGAR PRODUCTOS (data.json)
fetch("data.json")
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("productsContainer");

    data.products.forEach(product => {

      const last = product.monthlyData.at(-1);

      const adopcion = ((last.valorAutogestionado / last.valorTotal) * 100).toFixed(1);

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${product.name}</h3>
        <p><strong>Total:</strong> ${formatNumber(last.valorTotal)}</p>
        <p><strong>Adopción Digital:</strong> ${adopcion}%</p>
      `;

      card.onclick = () => openModal(product);

      container.appendChild(card);

    });

  })
  .catch(err => console.error("Error data.json:", err));

// 🔹 2. CARGAR APP (base_instalada.json)
fetch("base_instalada.json")
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("productsContainer");

    const last = data.at(-1);

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>APP</h3>
      <p><strong>Usuarios:</strong> ${formatNumber(last.Colombia.valor)}</p>
      <p><strong>Variación:</strong> ${last.Colombia.variacion}%</p>
    `;

    card.onclick = () => openAppModal(data);

    container.appendChild(card);

  })
  .catch(err => console.error("Error APP:", err));

/* ================= MODAL ================= */

function openModal(product){

  document.getElementById("benchmarkInlineContainer").innerHTML = "";

  // Mostrar botones nuevamente para productos
  document.querySelectorAll("#metrics button").forEach(btn=>{
    btn.style.display = "inline-block";
  });

  currentProductData=product;

  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modalTitle").innerText=product.name;
  // Volver a mostrar controles para productos
  document.querySelector(".projection-control").style.display = "block";
  document.querySelector(".impact-indicator").style.display = "block";

  let data = product.monthlyData;

  // 🔥 aplicar filtro
  if(currentTimeFilter){
    data = data.slice(-currentTimeFilter);
  }

  const labels = data.map(d=>d.mes.substring(0,7));
  const totals = data.map(d=>d.valorTotal);
  const auto = data.map(d=>d.valorAutogestionado);
  const asesor = data.map(d=>d.valorAsesor);

  if(mainChart) mainChart.destroy();

    document.getElementById("chartProduct").style.display = "block";
    document.getElementById("chartImpact").style.display = "none";

    mainChart=new Chart(document.getElementById("chartProduct"),{
    type:'line',
    data:{
      labels,
      datasets:[
        {label:"Valor Total",data:totals,borderColor:"#3b82f6",tension:0.3},
        {label:"Autogestionado",data:auto,borderColor:"#22c55e",tension:0.3},
        {label:"Asesor",data:asesor,borderColor:"#f59e0b",tension:0.3}
      ]
    },
    options:{
      responsive:true,
      animation:{duration:800},
      plugins:{legend:{labels:{color:"white"}}},
      scales:{
        x:{ticks:{color:"white"}},
        y:{ticks:{color:"white"}}
      }
    }
  });

  avatarProducto(product);

  function avatarProducto(product){

  const name = product.name.toLowerCase();

  const last = product.monthlyData.at(-1);

  const adopcion = (
    last.valorAutogestionado / last.valorTotal * 100
  ).toFixed(1);

  if(name.includes("cdat")){

    hablar(`
    Estás viendo CDAT.

    La adopción digital es ${adopcion} por ciento.

    ¿Sabías que en el mercado puede superar el 65 por ciento?

    Existe una oportunidad clara de crecimiento.
    `);

  }else if(name.includes("pap")){

    hablar(`
    Estás viendo ahorro programado.

    La adopción digital es ${adopcion} por ciento.

    Las fintech alcanzan hasta 90 por ciento.

    Este producto tiene alto potencial de digitalización.
    `);

  }else{

    hablar(`
    Estás viendo ${product.name}.

    ¿Quieres explorar oportunidades de crecimiento digital?
    `);

  }
}

  function preguntaEstrategica(){

  hablar(`
  Si aumentamos la adopción digital en 10 puntos,
  podríamos reducir la carga operativa del canal asesor.

  ¿Quieres ver ese escenario?
  `);
}

  renderProductAnalysis(product);

  /* ===== INYECTAR BENCHMARK DENTRO DEL PRODUCTO ===== */

let benchmarkHTML = "";

const name = product.name.toLowerCase();

if(name.includes("cdat")){

benchmarkHTML = `
<div class="benchmark-block benchmark-inline-scroll">

  <div class="benchmark-title">CDAT Digital - Benchmark Estratégico</div>

  <table class="benchmark-table">

    <tr>
      <th>Indicador</th>
      <th>Dato Estimado / Tendencia</th>
      <th>Referentes del Mercado</th>
      <th>Fuentes</th>
    </tr>

    <tr>
      <td>% Apertura Autogestionada</td>
      <td>65% - 70%</td>
      <td>Bancolombia, Davivienda, MejorCDT</td>
      <td>Superfinanciera, Asobancaria</td>
    </tr>

    <tr>
      <td>Valor Promedio</td>
      <td>$58.000.000 COP</td>
      <td>Banco de Bogotá, Banco Popular</td>
      <td>Reportes inclusión financiera</td>
    </tr>

    <tr>
      <td>Plazo Promedio</td>
      <td>180 a 360 días</td>
      <td>MiBanco, La Hipotecaria</td>
      <td>Análisis sectorial CDT</td>
    </tr>

    <tr>
      <td>Perfil Usuario</td>
      <td>26 - 45 años (Millennials / Gen X)</td>
      <td>Nu Colombia, Lulo Bank</td>
      <td>Estudios comportamiento digital</td>
    </tr>

  </table>

  <br>

  <table class="benchmark-table">

    <tr>
      <th>Característica</th>
      <th>Banca / Fintech</th>
      <th>Cooperativas</th>
    </tr>

    <tr>
      <td>Motivación</td>
      <td>Maximización de tasa</td>
      <td>Rentabilidad + beneficios</td>
    </tr>

    <tr>
      <td>Lealtad</td>
      <td>Baja (cambio frecuente)</td>
      <td>Alta (sentido de pertenencia)</td>
    </tr>

    <tr>
      <td>Comportamiento</td>
      <td>Transaccional</td>
      <td>Relacional</td>
    </tr>

    <tr>
      <td>Conocimiento</td>
      <td>Alto (uso de simuladores)</td>
      <td>Medio (requiere asesoría)</td>
    </tr>

    <tr>
      <td>Ticket</td>
      <td>Alto ($40M - $100M)</td>
      <td>Medio ($10M - $35M)</td>
    </tr>

  </table>

  <div class="insight-box">

    <strong>Insights de Mercado:</strong><br><br>

    • Bancolombia lidera UX digital con aperturas < 3 minutos.<br>
    • Davivienda impulsa captación 100% digital con CDT móvil.<br>
    • Fintechs eliminan fricción → ventaja competitiva clave.<br>
    • Cooperativas deben migrar a experiencias híbridas (digital + asesor).<br>
    • La tasa sigue siendo el principal driver de decisión.<br>

  </div>

</div>
`;
}

if(name.includes("pap") && 
  !name.includes("whatsapp") && 
  !name.includes("brigadas")){


benchmarkHTML = `
<div class="benchmark-block benchmark-inline-scroll">

  <div class="benchmark-title">Ahorro Programado PAP - Benchmark Estratégico</div>

  <table class="benchmark-table">

    <tr>
      <th>Variable de Análisis</th>
      <th>Segmento Bancario y Fintech</th>
      <th>Sector Cooperativo</th>
      <th>Observación Estratégica</th>
    </tr>

    <tr>
      <td>% Apertura Autogestionada</td>
      <td>75% - 90% (Nu Colombia, Lulo Bank, Bancolombia)</td>
      <td>30% - 45% (Bancoomeva, Fincomercio, Cooppcentral)</td>
      <td>Las Fintech operan casi al 100% digital. Cooperativas líderes están cerrando la brecha.</td>
    </tr>

    <tr>
      <td>Valor Promedio de Apertura</td>
      <td>$180.000 - $500.000 COP (BBVA, Bancolombia)</td>
      <td>$60.000 - $250.000 COP (Cootrapeldar, Coface, Cogran)</td>
      <td>Los bancos captan montos mayores por nómina, cooperativas captan ahorro recurrente.</td>
    </tr>

    <tr>
      <td>Plazo Promedio de Ahorro</td>
      <td>6 a 15 meses (Banco de Bogotá, Scotiabank)</td>
      <td>8 a 12 meses (Juriscoop, Canapro)</td>
      <td>El usuario digital busca metas de corto plazo.</td>
    </tr>

    <tr>
      <td>Perfil Usuario Digital</td>
      <td>Centennials y Millennials (18-35)</td>
      <td>Adultos jóvenes y empleados (25-45)</td>
      <td>Fintech busca inmediatez; cooperativas buscan respaldo y beneficios.</td>
    </tr>

    <tr>
      <td>Canal Predominante</td>
      <td>App móvil (90%)</td>
      <td>App (55%) / Web (45%)</td>
      <td>La "appficación" es total en banca.</td>
    </tr>

    <tr>
      <td>Adopción Digital</td>
      <td>66.6%</td>
      <td>Entidades cooperativas líderes en crecimiento</td>
      <td>El sector cooperativo está acelerando transformación digital.</td>
    </tr>

    <tr>
      <td>Beneficio en Costo</td>
      <td>60% menor vs canal físico</td>
      <td>Optimización progresiva</td>
      <td>Reducción de costos operativos clave para escalabilidad.</td>
    </tr>

  </table>

  <br>

  <div class="benchmark-title">Fuentes de Consulta</div>

  <div class="insight-box">
    • Banca de las Oportunidades (2025): Inclusión financiera.<br>
    • Superintendencia Financiera: comportamiento de depósitos.<br>
    • Colombia Fintech: tendencias de ahorro digital.<br>
    • BBVA Research: ahorro en Colombia.<br>
  </div>

  <div class="benchmark-title">Insights de comparativo entre entidades</div>

  <div class="insight-box">

    • Nu Colombia & Lulo Bank: líderes en autogestión (cero fricción).<br>
    • Bancolombia: referente en volumen y experiencia de usuario.<br>
    • Bancoomeva & Fincomercio: digitalización progresiva manteniendo esencia solidaria.<br>
    • BBVA: enfoque en visualización de metas de ahorro.<br>

  </div>

</div>
`;
}

document.getElementById("benchmarkInlineContainer").innerHTML = benchmarkHTML;

}

/* ================= PROYECCION SOLO AUTOGESTIONADO ================= */
document.getElementById("projectionSlider").addEventListener("input", function(){

  if(!currentProductData) return;

  const percent = parseFloat(this.value);
  document.getElementById("projectionValue").innerText = percent;

  // 🔥 DATA BASE
  let data = currentProductData.monthlyData;

  // 🔥 APLICAR FILTRO
  if(currentTimeFilter){
    data = data.slice(-currentTimeFilter);
  }

  // 🔥 ÚLTIMO DATO
  const last = data.at(-1);

  // 🔥 ADOPCIÓN ACTUAL
  const adopcionActual = (last.valorAutogestionado / last.valorTotal * 100);

  // 🔥 DIFERENCIA
  const diferencia = (percent - adopcionActual).toFixed(1);

  // 🔥 COLOR
  const color = diferencia >= 0 ? "#22c55e" : "#ef4444";

  // 🔥 PINTAR KPI
  const el = document.getElementById("impactValue");
  el.innerText = (diferencia >= 0 ? "+" : "") + diferencia + "%";
  el.style.color = color;

  // ================= HISTÓRICO =================
  const labelsHist = data.map(d=>d.mes.substring(0,7));
  const autoHist = data.map(d=>d.valorAutogestionado);
  const asesorHist = data.map(d=>d.valorAsesor);
  const totalHist = data.map(d=>d.valorTotal);

  // ================= PROYECCIÓN =================
  const {futureLabels, futureAuto, futureAsesor, futureTotal} =
    generarProyeccionFutura(data, percent);

  const labels = [...labelsHist, ...futureLabels];

  // ================= LIMPIAR =================
  mainChart.data.datasets = [];

  // 🔵 TOTAL REAL
  mainChart.data.datasets.push({
    label:"Valor Total (Real)",
    data: totalHist.concat(Array(futureTotal.length).fill(null)),
    borderColor:"#3b82f6",
    tension:0.3
  });

  // 🔵 TOTAL FUTURO
  mainChart.data.datasets.push({
    label:"Valor Total (Proyección)",
    data: Array(totalHist.length-1).fill(null)
          .concat([totalHist.at(-1)])
          .concat(futureTotal),
    borderColor:"#3b82f6",
    borderDash:[6,6],
    tension:0.3
  });

  // 🟢 AUTO REAL
  mainChart.data.datasets.push({
    label:"Autogestionado (Real)",
    data: autoHist.concat(Array(futureAuto.length).fill(null)),
    borderColor:"#22c55e",
    tension:0.3
  });

  // 🟢 AUTO FUTURO
  mainChart.data.datasets.push({
    label:"Autogestionado (Proyección)",
    data: Array(autoHist.length-1).fill(null)
          .concat([autoHist.at(-1)])
          .concat(futureAuto),
    borderColor:"#22c55e",
    borderDash:[6,6],
    tension:0.3
  });

  // 🟡 ASESOR REAL
  mainChart.data.datasets.push({
    label:"Asesor (Real)",
    data: asesorHist.concat(Array(futureAsesor.length).fill(null)),
    borderColor:"#f59e0b",
    tension:0.3
  });

  // 🟡 ASESOR FUTURO
  mainChart.data.datasets.push({
    label:"Asesor (Proyección)",
    data: Array(asesorHist.length-1).fill(null)
          .concat([asesorHist.at(-1)])
          .concat(futureAsesor),
    borderColor:"#f59e0b",
    borderDash:[6,6],
    tension:0.3
  });

  mainChart.data.labels = labels;
  mainChart.update();

});

/* ================= ANALISIS ================= */

function renderProductAnalysis(product){

  const data = product.monthlyData;
  const last = data.at(-1);

  const prev = data.at(-2);

  let variacion = 0;

  if(prev){
    variacion = ((last.valorTotal - prev.valorTotal) / prev.valorTotal * 100).toFixed(1);
  }

  const promMonto = calcularPromedio(data, "promMonto");
  const promAuto = calcularPromedio(data, "promMontoAutogestionado");
  const promAsesor = calcularPromedio(data, "promMontoAsesor");

  const plazoProm = calcularPromedio(data, "plazoPromedio");
  const plazoAuto = calcularPromedio(data, "plazoPromAutogestionado");
  const plazoAsesor = calcularPromedio(data, "plazoPromAsesor");

  const adopcion = ((last.valorAutogestionado / last.valorTotal) * 100).toFixed(1);

  const html = `
    <h3>Resumen del Producto</h3>

    <p><strong>Adopción Digital:</strong> ${adopcion}%</p>
    <p><strong>Variación mensual:</strong> ${variacion}%</p>

    <hr>

    <h4>Promedios Generales</h4>
    <p><strong>Monto Promedio:</strong> ${formatNumber(promMonto)}</p>
    <p><strong>Plazo Promedio:</strong> ${plazoProm} días</p>

    <hr>

    <h4>Autogestionado</h4>
    <p><strong>Monto:</strong> ${formatNumber(promAuto)}</p>
    <p><strong>Plazo:</strong> ${plazoAuto} días</p>

    <hr>

    <h4>Asesor</h4>
    <p><strong>Monto:</strong> ${formatNumber(promAsesor)}</p>
    <p><strong>Plazo:</strong> ${plazoAsesor} días</p>
  `;

  document.getElementById("analysisPanel").innerHTML = html;
}

/* ================= UTIL ================= */

function calcularPromedio(data, campo){

  const valores = data
    .map(d => d[campo])
    .filter(v => v !== undefined && v !== null && !isNaN(v));

  if(valores.length === 0) return 0;

  return Math.round(
    valores.reduce((acc, v) => acc + v, 0) / valores.length
  );
}

function formatNumber(num){
  return "$"+new Intl.NumberFormat("es-CO").format(Math.round(num));
}

/* ================= TOGGLE DATASET ================= */

function toggleDataset(index){

  if(!mainChart) return;

  const meta = mainChart.getDatasetMeta(index);
  meta.hidden = meta.hidden === null ? !mainChart.data.datasets[index].hidden : null;

  mainChart.update();
}

/* ================= CERRAR MODAL ================= */
document.addEventListener("click", function(e){

  if(e.target.id === "closeBtn"){
    document.getElementById("modal").classList.add("hidden");
  }

});

/* ================= PLAN DE TRABAJO ================= */
const roadmapData = [
  {
    producto:"FincoGo",
    proyectos:[
      {
        nombre:"IA para nómina y créditos instantáneos",
        estado:"En proceso de certificación",
        clase:"certificacion",
        estadoActual:"certificacion"
      },
      {
        nombre:"Flujo de caja y parametrización",
        estado:"Redacción de control de cambio",
        clase:"control",
        estadoActual:"control"
      }
    ]
  },
  {
    producto:"CDAT Digital",
    proyectos:[
      {
        nombre:"CDAT 100% digital en Sibanco + automatización",
        estado:"En proceso de pruebas",
        clase:"pruebas",
        estadoActual:"pruebas"
      }
    ]
  },
  {
    producto:"Chatbot",
    proyectos:[
      {
        nombre:"Integración IA generativa (GNS)",
        estado:"En proceso de pruebas",
        clase:"pruebas",
        estadoActual:"pruebas"
      }
    ]
  },
  {
    producto:"APP+",
    proyectos:[
      {
        nombre:"Versión 4 con mejoras UX",
        estado:"En proceso de cotización",
        clase:"cotizacion",
        estadoActual:"cotizacion"
      }
    ]
  },
  {
    producto:"Agentes Virtuales",
    proyectos:[
      {
        nombre:"Venta seguro + extractos automáticos",
        estado:"Diseño de POC",
        clase:"diseño",
        estadoActual:"diseño"
      }
    ]
  }
];

function renderRoadmap(){

  const container = document.getElementById("roadmapContainer");

  roadmapData.forEach(block=>{

    const card = document.createElement("div");
    card.classList.add("roadmap-card");

    let content = `<h3>${block.producto}</h3>`;

    block.proyectos.forEach(p=>{
      content += `
        <div class="roadmap-item">
          <span>${p.nombre}</span>
          <span class="status-badge ${p.clase}">
            ${p.estado}
          </span>
        </div>

        ${renderTimeline(p)}
      `;
    });

    card.innerHTML = content;

    container.appendChild(card);
  });
}

function renderTimeline(p){

  const steps = ["diseño","desarrollo","control","pruebas","certificacion","cotizacion","produccion"];

  return `
    <div class="timeline">
      ${steps.map(step=>`
        <div class="timeline-step ${step === p.estadoActual ? "active" : ""}">
          <div class="dot"></div>
          <span>${step}</span>
        </div>
      `).join("")}
    </div>
  `;
}

renderRoadmap();

/* ================= BENCHMARK INTELLIGENCE ================= */
function renderBenchmark(){

  document.getElementById("benchmarkCDAT").innerHTML = `
    <div class="benchmark-title">CDAT Digital</div>

    <div class="segment-grid">

      <div class="segment-card">
        <h4>Bancos Tradicionales</h4>
        <p>Apertura Digital: 60% - 70%</p>
        <p>Ticket: $12M - $18M</p>
        <p>Plazo: 180 - 270 días</p>
      </div>

      <div class="segment-card">
        <h4>Neobancos / Fintech</h4>
        <p>Apertura Digital: 100%</p>
        <p>Ticket: $4M - $8M</p>
        <p>Plazo: 90 - 180 días</p>
      </div>

      <div class="segment-card">
        <h4>Cooperativas Digitales</h4>
        <p>Apertura Digital: 20% - 35%</p>
        <p>Ticket: $6M - $10M</p>
        <p>Plazo: 210 - 360 días</p>
      </div>

    </div>

    <div class="metric-grid">
      <div class="metric-card">
        <h3>60%</h3>
        <span>Abandono en validación biométrica</span>
      </div>
      <div class="metric-card">
        <h3>7PM - 10PM</h3>
        <span>Hora pico apertura digital</span>
      </div>
      <div class="metric-card">
        <h3>85%</h3>
        <span>Origen desde Mobile App</span>
      </div>
      <div class="metric-card">
        <h3>Tasa</h3>
        <span>Factor decisor principal</span>
      </div>
    </div>

    <div class="insight-box">
      <strong>Insights Estratégicos:</strong><br><br>
      • La guerra de tasas está impulsando la digitalización.<br>
      • El perfil cooperativo necesita soporte híbrido (chat/WhatsApp).<br>
      • El ticket promedio digital aún es menor al físico.
    </div>
  `;

  document.getElementById("benchmarkPAP").innerHTML = `
    <div class="benchmark-title">PAP Digital</div>

    <div class="segment-grid">

      <div class="segment-card">
        <h4>Bancos & Billeteras</h4>
        <p>Autogestionado: 28% - 35%</p>
        <p>Monto: $250.000 mensual</p>
        <p>Plazo: 180 días</p>
      </div>

      <div class="segment-card">
        <h4>Cooperativas</h4>
        <p>Autogestionado: 15% - 22%</p>
        <p>Monto: $120.000 mensual</p>
        <p>Plazo: 360 días</p>
      </div>

    </div>

    <div class="insight-box">
      <strong>Insights Estratégicos:</strong><br><br>
      • 70% menos costo operativo en digital vs ventanilla.<br>
      • 40% mayor permanencia con ahorro automático.<br>
      • Data en tiempo real habilita reinversión anticipada.
    </div>
  `;
}

/* ================= DIGITAL IMPACT LAB ================= */

let impactLineChart = null;
let impactPieChart = null;
let brigadasData = null;

async function loadImpactData(){

  const response = await fetch("Top_Intenciones_Mensual.json");
  const data = await response.json();

  const cantidades = data.cantidades;
  const totalRow = cantidades.find(c => c.Categoria === "TOTAL");

  const months = Object.keys(totalRow)
    .filter(k => k !== "Categoria" && k !== "Total");

  const totalValues = months.map(m => totalRow[m]);

  const topCategorias = cantidades
    .filter(c => c.Categoria !== "TOTAL")
    .sort((a,b)=>b.Total - a.Total)
    .slice(0,5);

  const labelsPie = topCategorias.map(c=>c.Categoria);
  const valuesPie = topCategorias.map(c=>c.Total);

  renderImpactCard(months, totalValues, labelsPie, valuesPie);
}

function renderImpactCard(months, totalValues, labelsPie, valuesPie){

  const container = document.getElementById("impactContainer");

  container.innerHTML = `
    <div class="product-card" onclick="openImpactModal()">
      <h3>WhatsApp Conversacional</h3>
      <p>Inteligencia de intención y automatización</p>
      <div class="metric-highlight">
        Total Conversaciones: ${totalValues.reduce((a,b)=>a+b,0).toLocaleString()}
      </div>
    </div>
  `;

  window.impactData = {months,totalValues,labelsPie,valuesPie};
}

function openImpactModal(){

    // Ocultar botones de métricas para WhatsApp
  document.querySelectorAll("#metrics button").forEach(btn=>{
    btn.style.display = "none";
  });

  currentProductData = null; // 🔥 desactiva proyección de productos

  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");

  document.getElementById("modalTitle").innerText = "WhatsApp Conversacional";
  // Ocultar controles de proyección para WhatsApp
  document.querySelector(".projection-control").style.display = "none";
  document.querySelector(".impact-indicator").style.display = "none";

  document.getElementById("chartProduct").style.display = "none";
  document.getElementById("chartImpact").style.display = "block";

  const ctx = document.getElementById("chartImpact").getContext("2d");

  // 🔥 destruimos SOLO el chart de productos
  if(mainChart){
    mainChart.destroy();
    mainChart = null;
  }

  // 🔥 destruimos solo charts de impacto
  if(impactLineChart){
    impactLineChart.destroy();
  }

  if(impactPieChart){
    impactPieChart.destroy();
  }

  impactLineChart = new Chart(ctx,{
    type:"line",
    data:{
      labels:window.impactData.months,
      datasets:[{
        label:"Volumetría Mensual",
        data:window.impactData.totalValues,
        borderColor:"#3b82f6",
        tension:0.4
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{labels:{color:"white"}}},
      scales:{
        x:{ticks:{color:"white"}},
        y:{ticks:{color:"white"}}
      }
    }
  });

  document.getElementById("analysisPanel").innerHTML = `
    <canvas id="pieChart"></canvas>
  `;

  impactPieChart = new Chart(document.getElementById("pieChart"),{
    type:"doughnut",
    data:{
      labels:window.impactData.labelsPie,
      datasets:[{
        data:window.impactData.valuesPie,
        backgroundColor:[
          "#3b82f6","#22c55e","#f59e0b",
          "#ef4444","#8b5cf6"
        ]
      }]
    },
    options:{
    plugins:{
      legend:{
        labels:{
          color:"#ffffff"   // 🔥 TEXTO BLANCO
        }
      }
    }
  }
});
  
}

loadImpactData();

/* ================= BRIGADAS ================= */
async function loadBrigadasData(){

  const response = await fetch("Analisis_Brigadas.json");
  const data = await response.json();

  // ===== Línea mensual =====
  const months = data.total_mes.map(d => d.Mes);
  const totalValues = data.total_mes.map(d => d["Total Brigadas"]);

  // ===== Agrupar por estado (acumulado total histórico) =====
  const estadosMap = {};

  data.por_estado.forEach(row => {
    if(!estadosMap[row.Estado]){
      estadosMap[row.Estado] = 0;
    }
    estadosMap[row.Estado] += row.Cantidad;
  });

  const labelsPie = Object.keys(estadosMap);
  const valuesPie = Object.values(estadosMap);

  brigadasData = { months, totalValues, labelsPie, valuesPie };

  renderBrigadasCard();
}

function renderBrigadasCard(){

  const container = document.getElementById("impactContainer");

  const card = document.createElement("div");
  card.classList.add("product-card");

  card.innerHTML = `
    <h3>Brigadas</h3>
    <p>Impacto territorial y ejecución operativa</p>
    <div class="metric-highlight">
      Total Histórico: ${brigadasData.totalValues.reduce((a,b)=>a+b,0).toLocaleString()}
    </div>
  `;

  card.onclick = openBrigadasModal;

  container.appendChild(card);
}

function openBrigadasModal(){

  document.querySelectorAll("#metrics button").forEach(btn=>{
    btn.style.display = "none";
  });

  document.querySelector(".projection-control").style.display = "none";
  document.querySelector(".impact-indicator").style.display = "none";

  currentProductData = null;

  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");

  document.getElementById("modalTitle").innerText = "Brigadas";

  document.getElementById("chartProduct").style.display = "none";
  document.getElementById("chartImpact").style.display = "block";

  if(mainChart){
    mainChart.destroy();
    mainChart = null;
  }

  if(impactLineChart){
    impactLineChart.destroy();
  }

  if(impactPieChart){
    impactPieChart.destroy();
  }

  // ===== GRÁFICA 1: EVOLUCIÓN MENSUAL =====
  impactLineChart = new Chart(document.getElementById("chartImpact"),{
    type:"line",
    data:{
      labels: brigadasData.months,
      datasets:[{
        label:"Total Brigadas",
        data: brigadasData.totalValues,
        borderColor:"#22c55e",
        backgroundColor:"rgba(34,197,94,0.2)",
        tension:0.4,
        fill:true
      }]
    },
    options:{
      plugins:{legend:{labels:{color:"white"}}},
      scales:{
        x:{ticks:{color:"white"}},
        y:{ticks:{color:"white"}}
      }
    }
  });

  // ===== GRÁFICA 2: PARTICIPACIÓN POR ESTADO =====
  document.getElementById("analysisPanel").innerHTML = `
    <canvas id="brigadasPie"></canvas>
  `;

  impactPieChart = new Chart(document.getElementById("brigadasPie"),{
    type:"doughnut",
    data:{
      labels: brigadasData.labelsPie,
      datasets:[{
        data: brigadasData.valuesPie,
        backgroundColor:[
          "#3b82f6","#22c55e","#f59e0b",
          "#ef4444","#8b5cf6","#06b6d4",
          "#14b8a6","#eab308"
        ]
      }]
    },
    options:{
      plugins:{
        legend:{
          labels:{
            color:"#ffffff"
          }
        }
      }
    }
  });
}

/* ================= CERRAR CON ESC ================= */

document.addEventListener("keydown", function(event){

  const modal = document.getElementById("modal");

  if(event.key === "Escape" && !modal.classList.contains("hidden")){
    modal.classList.add("hidden");
  }

});

loadBrigadasData();

function openAppModal(data){

  // Ocultar benchmark
  document.getElementById("benchmarkInlineContainer").innerHTML = "";

  // Ocultar botones de métricas (NO aplican aquí)
  document.querySelectorAll("#metrics button").forEach(btn=>{
    btn.style.display = "none";
  });

  // Ocultar slider
  document.querySelector(".projection-control").style.display = "none";
  document.querySelector(".impact-indicator").style.display = "none";

  // Mostrar modal
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modalTitle").innerText = "APP - Base Instalada";

  // ================= DATA =================

  const labels = data.map(d=>d.mes);

  const colombia = data.map(d=>d.Colombia.valor);
  const global = data.map(d=>d.Global.valor);
  const españa = data.map(d=>d.España.valor);
  const usa = data.map(d=>d.USA.valor);
  const chile = data.map(d=>d.Chile.valor);

  if(mainChart) mainChart.destroy();

  document.getElementById("chartProduct").style.display = "block";

  // ================= GRÁFICA =================
  mainChart = new Chart(document.getElementById("chartProduct"),{
    type:'line',
    data:{
      labels,
      datasets:[
        {
          label:"Colombia",
          data:colombia,
          borderColor:"#22c55e",
          tension:0.3
        },
        {
          label:"Global",
          data:global,
          borderColor:"#3b82f6",
          tension:0.3
        },
        {
          label:"España",
          data:españa,
          borderColor:"#f59e0b",
          tension:0.3
        },
        {
          label:"USA",
          data:usa,
          borderColor:"#ef4444",
          tension:0.3
        },
        {
          label:"Chile",
          data:chile,
          borderColor:"#a855f7",
          tension:0.3
        }
      ]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{labels:{color:"white"}}
      },
      scales:{
        x:{ticks:{color:"white"}},
        y:{ticks:{color:"white"}}
      }
    }
  });

  // ================= PANEL DERECHO =================
  const last = data.at(-1);

  document.getElementById("analysisPanel").innerHTML = `
    <h3>Base Instalada</h3>

    <p><strong>Colombia:</strong> ${formatNumber(last.Colombia.valor)}</p>
    <p><strong>Global:</strong> ${formatNumber(last.Global.valor)}</p>

    <hr>

    <p style="color:#22c55e;">
      Variación Colombia: ${last.Colombia.variacion}%
    </p>

    <p style="color:#3b82f6;">
      Variación Global: ${last.Global.variacion}%
    </p>

    <hr>

    <p>Este indicador muestra el crecimiento de usuarios activos en la APP.</p>
  `;
}

function generarProyeccionFutura(data, porcentaje, meses=6, escenario="base"){

  const futureTotal = [];

  const last = data.at(-1);

  const totalBase = last.valorTotal;

  const futureLabels = [];
  const futureAuto = [];
  const futureAsesor = [];

  // 🔥 ESCENARIOS
  const escenarios = {
    conservador: 0.02,
    base: 0.03,
    optimista: 0.05
  };

  const growthRate = escenarios[escenario];

  // 🔥 PARSE FECHA CORRECTO
  const [year, month] = last.mes.split("-").map(Number);
  let currentDate = new Date(year, month - 1);

  for(let i=1; i<=meses; i++){

    currentDate.setMonth(currentDate.getMonth() + 1);

    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth()+1).padStart(2,"0");

    futureLabels.push(`${y}-${m}`);

    // 📈 CRECIMIENTO
    const crecimiento = Math.pow(1 + growthRate, i);
    const total = totalBase * crecimiento;

    // 📊 ADOPCIÓN LOGÍSTICA
    const adopcionActual = last.valorAutogestionado / last.valorTotal * 100;

    const target = porcentaje;

    const progreso = i / meses;

    const adopcion = adopcionActual + (target - adopcionActual) * progreso;

    const auto = total * (adopcion/100);
    const asesor = total - auto;

    futureTotal.push(total);
    futureAuto.push(auto);
    futureAsesor.push(asesor);
  }

  return {futureLabels, futureAuto, futureAsesor, futureTotal};
}

function curvaLogistica(porcentaje, i){

  const k = 0.6; // velocidad de adopción
  const x0 = 3;  // punto medio

  return porcentaje / (1 + Math.exp(-k*(i - x0)));
}

document.getElementById("modal").addEventListener("click", function(e){

  if(e.target.id === "modal"){
    this.classList.add("hidden");
  }

});


function hablar(texto){

  const bubble = document.getElementById("avatarBubble");
  const textEl = document.getElementById("avatarText");

  textEl.innerText = texto;
  bubble.style.display = "block";

  const speech = new SpeechSynthesisUtterance(texto);
  speech.lang = "es-CO";
  speech.rate = 1;

  window.speechSynthesis.speak(speech);

  setTimeout(()=>{
    bubble.style.display = "none";
  }, 6000);
}
function modoDirector(){

  hablar(`
  Bienvenido.
  Hoy tienes tres decisiones clave.

  Uno, aumentar la adopción digital.
  Dos, optimizar el canal asesor.
  Tres, escalar el uso de la app.

  ¿Qué deseas analizar?
  `);
}