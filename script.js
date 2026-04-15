let mainChart = null;
let currentProductData = null;
let currentTimeFilter = 12; // default último año
let currentViewMode = "cantidad"  // cantidad | valor
let mapaValentina = null;
let chartValentinaInst = null;
let chartPorcentajesValentinaInst = null;
let chartP7MensualInst = null;
let chartP7MotivosInst = null;
let chartP7MedioInst = null;
let chartP8ContactoInst = null;
let chartP8PercepcionMensualInst = null;
let chartEvolucionHitosInst = null;
let fincoEducarGeneroChart = null;
let fincoEducarEdadChart = null;
let fincoEducarProgramaChart = null;
let fincoEducarMapa = null;
let productoTimelineActivo = "FINCOEDUCAR";
let proyectoPlanActivo = "FincoGo";
let chartSegurosGeneralTipo = null;
let chartSegurosModalidad = null;
let chartSegurosAutoTipo = null;
let chartSegurosAutoMensual = null;
let benchmarkVisible = false;
let benchmarkHTMLActual = "";


/* ================= SECCIONES ================= */

function showSection(sectionName, btn){

  document.querySelectorAll(".section").forEach(sec=>{
    sec.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach(b=>{
    b.classList.remove("active-btn");
  });

  if(btn) btn.classList.add("active-btn");

  const section = document.getElementById(sectionName + "Section");

  if(section){
    section.classList.add("active");
  }else{
    console.error("Sección no encontrada:", sectionName + "Section");
  }

  if(sectionName === "home"){
    const portada = document.getElementById("homeSection");
    if(portada){
      portada.classList.remove("fade-out");
      portada.classList.add("fade-in-reset");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function setTimeFilter(months){

  currentTimeFilter = months;

  if(currentProductData){
    openModal(currentProductData);
  }
}

function toggleViewMode(){

  if(currentViewMode === "cantidad"){
    currentViewMode = "valor";
    document.getElementById("viewToggleBtn").innerText = "Ver en Cantidades 📊";
  }else{
    currentViewMode = "cantidad";
    document.getElementById("viewToggleBtn").innerText = "Ver en Valores 💰";
  }

  if(currentProductData){
    openModal(currentProductData);
  }
}

function generarProyeccion(data, porcentajeObjetivo){

  try{

    const mesesProyeccion = 12;

    const ultimaFila = data[data.length - 1];

    const totalActual = currentViewMode === "valor"
      ? ultimaFila.valorTotal
      : ultimaFila.cantidadTotal;

    const autoActual = currentViewMode === "valor"
      ? ultimaFila.valorAutogestionado
      : ultimaFila.cantidadAutogestionado;

    const adopcionActual = autoActual / totalActual * 100;

    const diferencia = porcentajeObjetivo - adopcionActual;

    let proyeccion = [];

    for(let i = 1; i <= mesesProyeccion; i++){

      const factor = i / mesesProyeccion;

      const nuevaAdopcion = adopcionActual + (diferencia * factor);

      const crecimientoMensual = 0.01;

      const totalMes = totalActual * Math.pow((1 + crecimientoMensual), i);

      const nuevoAuto = totalMes * (nuevaAdopcion / 100);
      const nuevoAsesor = totalMes - nuevoAuto;

      proyeccion.push({
        total: totalMes,
        auto: nuevoAuto,
        asesor: nuevoAsesor
      });
    }

    return proyeccion;

  }catch(e){
    console.error("Error en proyección:", e);
    return [];
  }
}

const resumenCanalesValentina = [
  {
    canal: "FUERZA DIRECTA",
    cantidad_brigadas: 691,
    costo: 24168019,
    total_creditos: 876883000,
    total_paps: 65774000,
    total_vinculaciones: 1553
  },
  {
    canal: "ATENCION AL ASOCIADO",
    cantidad_brigadas: 231,
    costo: 1400000,
    total_creditos: 55348960,
    total_paps: 7241201,
    total_vinculaciones: 173
  },
  {
    canal: "FUERZAS ESPECIALES",
    cantidad_brigadas: 33,
    costo: 150000,
    total_creditos: 1,
    total_paps: 1,
    total_vinculaciones: 8
  },
  {
    canal: "FINCOEDUCAR",
    cantidad_brigadas: 32,
    costo: 340000,
    total_creditos: 3000000,
    total_paps: 0,
    total_vinculaciones: 13
  },
  {
    canal: "CANALES NO PRESENCIALES",
    cantidad_brigadas: 29,
    costo: 0,
    total_creditos: 27824052,
    total_paps: 1850000,
    total_vinculaciones: 34
  },
  {
    canal: "SEGUROS",
    cantidad_brigadas: 2,
    costo: 0,
    total_creditos: 0,
    total_paps: 0,
    total_vinculaciones: 0
  },
  {
    canal: "BIENESTAR SOCIAL",
    cantidad_brigadas: 1,
    costo: 0,
    total_creditos: 0,
    total_paps: 0,
    total_vinculaciones: 0
  },
  {
    canal: "CALL IN HOUSE",
    cantidad_brigadas: 1,
    costo: 0,
    total_creditos: 0,
    total_paps: 0,
    total_vinculaciones: 0
  },
  {
    canal: "OFICINA VIRTUAL",
    cantidad_brigadas: 1,
    costo: 0,
    total_creditos: 0,
    total_paps: 0,
    total_vinculaciones: 0
  }
];

const segurosData = {
  general: {
    tipoSeguro: {
      labels: ["Seguro Vehículos", "Exequias", "Seguro Vida", "Mascotas"],
      values: [1050, 104, 75, 18]
    },
    modalidad: {
      labels: ["Acompañamiento", "Autogestionado"],
      values: [1218, 29]
    }
  },
  autogestionado: {
    tipoSeguro: {
      labels: ["Exequias", "Seguro Vida"],
      values: [16, 13]
    },
    mensual: {
      labels: ["mayo", "junio", "julio", "agosto", "septiembre", "octubre", "diciembre", "enero", "febrero", "marzo", "abril"],
      exequias: [50, 0, 42.86, 100, 66.67, 100, 50, 0, 100, 100, 100],
      vida:      [50, 100, 57.14, 0, 33.33, 0, 50, 100, 0, 0, 0]
    }
  }
};


function formatearMonedaCOP(valor){
  return "$" + Number(valor).toLocaleString("es-CO");
}

function renderTablaResumenCanalesValentina(){

  const tbody = document.getElementById("tablaResumenCanalesBody");
  if(!tbody) return;

  tbody.innerHTML = "";

  let totalBrigadas = 0;
  let totalCosto = 0;
  let totalCreditos = 0;
  let totalPaps = 0;
  let totalVinculaciones = 0;

  resumenCanalesValentina.forEach(item => {

    totalBrigadas += item.cantidad_brigadas;
    totalCosto += item.costo;
    totalCreditos += item.total_creditos;
    totalPaps += item.total_paps;
    totalVinculaciones += item.total_vinculaciones;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.canal}</td>
      <td>${item.cantidad_brigadas.toLocaleString("es-CO")}</td>
      <td>${formatearMonedaCOP(item.costo)}</td>
      <td>${formatearMonedaCOP(item.total_creditos)}</td>
      <td>${formatearMonedaCOP(item.total_paps)}</td>
      <td>${item.total_vinculaciones.toLocaleString("es-CO")}</td>
    `;
    tbody.appendChild(tr);
  });

  const trTotal = document.createElement("tr");
  trTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td><strong>${totalBrigadas.toLocaleString("es-CO")}</strong></td>
    <td><strong>${formatearMonedaCOP(totalCosto)}</strong></td>
    <td><strong>${formatearMonedaCOP(totalCreditos)}</strong></td>
    <td><strong>${formatearMonedaCOP(totalPaps)}</strong></td>
    <td><strong>${totalVinculaciones.toLocaleString("es-CO")}</strong></td>
  `;
  tbody.appendChild(trTotal);
}

/* ================= STATUS PRODUCTOS ================= */
// 🔹 1. CARGAR PRODUCTOS (data.json)
fetch("data.json")
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    data.products.forEach(product => {

      const last = product.monthlyData.at(-1);

      const dataDesdeMayo2025 = product.monthlyData.filter(d => {
        const fecha = new Date(d.mes);
        return fecha >= new Date("2025-05-01");
      });

      const totalAcumulado = dataDesdeMayo2025.reduce((acc, d) => {
        return acc + (Number(d.valorTotal) || 0);
      }, 0);

      const adopcion = last && last.valorTotal > 0
        ? ((last.valorAutogestionado / last.valorTotal) * 100).toFixed(1)
        : "0.0";

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${product.name}</h3>
        <p><strong>Total:</strong> ${formatNumber(totalAcumulado)}</p>
        <p><strong>Adopción Digital:</strong> ${adopcion}%</p>
      `;

      card.onclick = () => openModal(product);

      container.appendChild(card);

    });

    addSegurosCard();

  })
  .catch(err => console.error("Error data.json:", err));

let appDataStore = {};
let appMetricActive = "base_instalada";
let appChartInstance = null;

Promise.all([
  fetch("base_instalada.json").then(r => r.json()),
  fetch("usuarios_recurrentes_mensuales.json").then(r => r.json()),
  fetch("dispositivos_activos_ios.json").then(r => r.json()),
  fetch("valoracion_google_play.json").then(r => r.json())
])
.then(([baseInstalada, usuariosRecurrentes, dispositivosIOS, valoracionPlay]) => {

  appDataStore = {
    base_instalada: baseInstalada,
    usuarios_recurrentes: usuariosRecurrentes,
    dispositivos_ios: dispositivosIOS,
    valoracion_google_play: valoracionPlay
  };

  const container = document.getElementById("productsContainer");
  const last = baseInstalada.at(-1);

  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <h3>APP</h3>
    <p><strong>Usuarios:</strong> ${Math.round(Number(last.Colombia.valor)).toLocaleString("es-CO")}</p>
    <p><strong>Variación:</strong> ${last.Colombia.variacion}%</p>
  `;

  card.onclick = () => openAppModal();

  container.appendChild(card);

})
.catch(err => console.error("Error APP:", err));

function addSegurosCard(){
  const container = document.getElementById("productsContainer");
  if(!container) return;

  const totalGeneral = segurosData.general.tipoSeguro.values.reduce((a, b) => a + b, 0);
  const auto = segurosData.general.modalidad.values[1];
  const participacionAuto = ((auto / totalGeneral) * 100).toFixed(1);

  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <h3>Seguros</h3>
    <p><strong>Total:</strong> ${totalGeneral.toLocaleString("es-CO")}</p>
    <p><strong>Autogestionado:</strong> ${participacionAuto}%</p>
  `;

  card.onclick = () => openSegurosModal();

  container.appendChild(card);
}

function openSegurosModal(){

  document.querySelector(".modal-content").classList.add("seguros-mode");
  document.getElementById("benchmarkInlineContainer").innerHTML = "";

  document.querySelectorAll("#metrics button").forEach(btn=>{
    btn.style.display = "none";
  });

  document.querySelector(".projection-control").style.display = "none";
  document.querySelector(".impact-indicator").style.display = "none";

  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modalTitle").innerText = "Seguros - Indicadores";

  document.getElementById("chartProduct").style.display = "none";
  document.getElementById("chartImpact").style.display = "none";

  if(mainChart){
    mainChart.destroy();
    mainChart = null;
  }

  if(chartSegurosGeneralTipo){
    chartSegurosGeneralTipo.destroy();
    chartSegurosGeneralTipo = null;
  }
  if(chartSegurosModalidad){
    chartSegurosModalidad.destroy();
    chartSegurosModalidad = null;
  }
  if(chartSegurosAutoTipo){
    chartSegurosAutoTipo.destroy();
    chartSegurosAutoTipo = null;
  }
  if(chartSegurosAutoMensual){
    chartSegurosAutoMensual.destroy();
    chartSegurosAutoMensual = null;
  }

  const panel = document.getElementById("analysisPanel");
  panel.innerHTML = `
    <div class="insight-box" style="margin-top:0;">
      <strong>Resumen ejecutivo</strong><br><br>
      Total general: ${segurosData.general.tipoSeguro.values.reduce((a,b)=>a+b,0).toLocaleString("es-CO")}<br>
      Acompañamiento: ${segurosData.general.modalidad.values[0].toLocaleString("es-CO")}<br>
      Autogestionado: ${segurosData.general.modalidad.values[1].toLocaleString("es-CO")}<br><br>

      • Seguro Vehículos concentra la mayor participación del portafolio general.<br><br>
      • La modalidad acompañamiento domina ampliamente el volumen total.<br><br>
      • En autogestionado, la mezcla se concentra entre Exequias y Seguro Vida.<br><br>
      • La evolución mensual autogestionada muestra meses totalmente concentrados en un solo tipo de seguro, lo que puede servir para detectar campañas, estacionalidad o cambios de foco comercial.
    </div>
  `;

  document.getElementById("benchmarkInlineContainer").innerHTML = `
    <div class="charts-grid">
      <div class="chart-box" style="height:360px;">
        <canvas id="chartSegurosGeneralTipo"></canvas>
      </div>
      <div class="chart-box" style="height:360px;">
        <canvas id="chartSegurosModalidad"></canvas>
      </div>
    </div>

    <br>

    <div class="charts-grid">
      <div class="chart-box" style="height:360px;">
        <canvas id="chartSegurosAutoTipo"></canvas>
      </div>
      <div class="chart-box" style="height:480px;">
        <canvas id="chartSegurosAutoMensual"></canvas>
      </div>
    </div>
  `;

  renderSegurosCharts();
}

function renderSegurosCharts(){

  const generalLabels = segurosData.general.tipoSeguro.labels;
  const generalValues = segurosData.general.tipoSeguro.values;

  const modalidadLabels = segurosData.general.modalidad.labels;
  const modalidadValues = segurosData.general.modalidad.values;

  const autoLabels = segurosData.autogestionado.tipoSeguro.labels;
  const autoValues = segurosData.autogestionado.tipoSeguro.values;

  const mensualLabels = segurosData.autogestionado.mensual.labels;
  const mensualExequias = segurosData.autogestionado.mensual.exequias;
  const mensualVida = segurosData.autogestionado.mensual.vida;

  chartSegurosGeneralTipo = new Chart(document.getElementById("chartSegurosGeneralTipo"), {
    type: "doughnut",
    data: {
      labels: generalLabels,
      datasets: [{
        data: generalValues,
        backgroundColor: ["#cdbb67", "#264b63", "#e2d38a", "#86a9bf"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "white" } },
        title: {
          display: true,
          text: "% Tipo de Seguro - General",
          color: "white",
          font: { size: 16, weight: "bold" }
        }
      }
    }
  });

  chartSegurosModalidad = new Chart(document.getElementById("chartSegurosModalidad"), {
    type: "bar",
    data: {
      labels: modalidadLabels,
      datasets: [{
        label: "Cantidad",
        data: modalidadValues,
        backgroundColor: ["#5b96bf", "#3b82f6"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Modalidad - General",
          color: "white",
          font: { size: 16, weight: "bold" }
        }
      },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });

  chartSegurosAutoTipo = new Chart(document.getElementById("chartSegurosAutoTipo"), {
    type: "pie",
    data: {
      labels: autoLabels,
      datasets: [{
        data: autoValues,
        backgroundColor: ["#264b63", "#e2d38a"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "white" } },
        title: {
          display: true,
          text: "% Tipo de Seguro - Autogestionado",
          color: "white",
          font: { size: 16, weight: "bold" }
        }
      }
    }
  });

  chartSegurosAutoMensual = new Chart(document.getElementById("chartSegurosAutoMensual"), {
    type: "bar",
    data: {
      labels: mensualLabels,
      datasets: [
        {
          label: "Exequias",
          data: mensualExequias,
          backgroundColor: "#264b63"
        },
        {
          label: "Seguro Vida",
          data: mensualVida,
          backgroundColor: "#e2d38a"
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "white" } },
        title: {
          display: true,
          text: "Detalle Seguros Diarios - Autogestionado",
          color: "white",
          font: { size: 16, weight: "bold" }
        },
        tooltip: {
          callbacks: {
            label: function(context){
              return `${context.dataset.label}: ${context.raw}%`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          max: 100,
          ticks: {
            color: "white",
            callback: value => value + "%"
          }
        },
        y: {
          stacked: true,
          ticks: { color: "white" }
        }
      }
    }
  });
}

/* ================= MODAL ================= */

function openModal(product){

  document.getElementById("benchmarkInlineContainer").innerHTML = "";

  // Mostrar botones nuevamente para productos
  document.querySelectorAll("#metrics button.dataset-btn").forEach(btn=>{
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
  let totals, auto, asesor;

  if(currentViewMode === "valor"){

    totals = data.map(d=>d.valorTotal);
    auto = data.map(d=>d.valorAutogestionado);
    asesor = data.map(d=>d.valorAsesor);

  }else{

    totals = data.map(d=>d.cantidadTotal);
    auto = data.map(d=>d.cantidadAutogestionado);
    asesor = data.map(d=>d.cantidadAsesor);

  }

  if(mainChart) mainChart.destroy();

    document.getElementById("chartProduct").style.display = "block";
    document.getElementById("chartImpact").style.display = "none";

    mainChart=new Chart(document.getElementById("chartProduct"),{
    type:'line',
    data:{
      labels,
      datasets:[
        {label:"Valor Total",data:totals,borderColor:"#3b82f6",tension:0.3, segment: {
          borderDash: ctx => {
            const totalMesesHistoricos = currentProductData.monthlyData.length;
            return ctx.p0DataIndex >= totalMesesHistoricos - 1
              ? [6,6]  // punteado para proyección
              : undefined; // sólido para histórico
          }
        }},
        {label:"Autogestionado",data:auto,borderColor:"#22c55e",tension:0.3, segment: {
        borderDash: ctx => {
          const totalMesesHistoricos = currentProductData.monthlyData.length;
          return ctx.p0DataIndex >= totalMesesHistoricos - 1
            ? [6,6]  // punteado para proyección
            : undefined; // sólido para histórico
        }
      }},
        {label:"Asesor",data:asesor,borderColor:"#f59e0b",tension:0.3, segment: {
        borderDash: ctx => {
          const totalMesesHistoricos = currentProductData.monthlyData.length;
          return ctx.p0DataIndex >= totalMesesHistoricos - 1
            ? [6,6]  // punteado para proyección
            : undefined; // sólido para histórico
        }
      }}
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

  //avatarProducto(product);

  function avatarProducto(product){

  const name = product.name.toLowerCase();

  const last = product.monthlyData.at(-1);

  const adopcion = (
    last.valorAutogestionado / last.valorTotal * 100
  ).toFixed(1);

  if(name.includes("cdat")){

    hablar(`
    Hola Mauricio Estás viendo CDAT.

    La adopción digital es ${adopcion} por ciento.

    ¿Sabías que en el mercado puede superar el 65 por ciento?

    Existe una oportunidad clara de crecimiento.
    `);

  }else if(name.includes("pap")){

    hablar(`
    Hola Mauricio Estás viendo ahorro programado.

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
      <th>Variable</th>
      <th>Apertura 100% Digital (Autogestionada)</th>
      <th>Apertura Asistida (Asesor Comercial)</th>
      <th>Referente / Benchmark Sectorial</th>
    </tr>

    <tr>
      <td>Participación sobre el Total</td>
      <td>65% - 75% (En bancos líderes y neobancos)</td>
      <td>25% - 35% (Principalmente en banca tradicional y cooperativas)</td>
      <td>Bancolombia / Davivienda: Reportan que >70% de sus aperturas de inversión ya ocurren vía App.</td>
    </tr>

    <tr>
      <td>Plazo Promedio de Inversión</td>
      <td>90 a 180 días (Foco en liquidez y rotación)</td>
      <td>360 a 540 días (Foco en rentabilidad a largo plazo y estabilidad)</td>
      <td>Pibank / Lulo Bank: Líderes en captación digital de corto plazo con tasas competitivas.</td>
    </tr>

    <tr>
      <td>Perfil del Usuario</td>
      <td>"Optimizadores Digitales": 25-45 años, urbanos, valoran la inmediatez y comparan tasas en tiempo real.</td>
      <td>"Tradicionalistas / Rentistas": 50+ años, valoran la seguridad del contacto humano y el respaldo físico.</td>
      <td>Nubank / Lulo: Han captado el segmento joven; Banco de Bogotá: Domina el segmento de asesoría patrimonial.</td>
    </tr>

    <tr>
      <td>Tasa de Interés (E.A.)</td>
      <td>Preferencial (Digital +0.2% a +0.5%): Menor costo operativo se traslada al cliente.</td>
      <td>Estándar: Sujeta a negociación según el monto (spread de negociación).</td>
      <td>Ban100 / Credifamilia: Líderes en ofrecer tasas superiores en canales 100% digitales.</td>
    </tr>

      <tr>
      <td>Tiempo de Apertura</td>
      <td><5 minutos (Proceso asincrónico 24/7)</td>
      <td>30 - 60 minutos (Sujeto a horarios de oficina/visita)</td>
    </tr>

  </table>

<div class="fuentes">
  <em>Fuentes:</em>
  <ol>
    <li>Asobancaria: Informes trimestrales de "Banca y Economía" 2025 sobre digitalización del ahorro</li>
    <li>Superintendencia Financiera de Colombia (SFC): Reportes de operaciones por canales y quejas de usuarios (Digital vs. Presencial).</li>
    <li>Coltefinanciera: Logró tiempos de apertura digital de 8 minutos como estándar de mercado.</li>
    <li>Infobae / Portafolio: Análisis de competencia de tasas y digitalización de entidades financieras cierre 2025.</li>
    <li>Banco de la República: Estadísticas de tasas de captación (CDT 90, 180, 360 días) y reportes de sistemas de pago</li>
  </ol>
</div>

  <div class="perfil-box-container">

  <!-- DIGITAL -->
  <div class="perfil-box">
    <h3>📱 Digital</h3>

    <div class="item">
      <span>Comportamiento</span>
      <p>Uso de smartphone, simuladores, decisión autónoma.</p>
    </div>

    <div class="item">
      <span>Motivación</span>
      <p>Rapidez, autogestión y certificados inmediatos.</p>
    </div>

    <div class="item">
      <span>Canales</span>
      <p>App (80%) · Web (20%)</p>
    </div>
  </div>

  <!-- ASISTIDO -->
  <div class="perfil-box">
    <h3>🤝 Asistido</h3>

    <div class="item">
      <span>Comportamiento</span>
      <p>Busca validación experta y apoyo en montos altos.</p>
    </div>

    <div class="item">
      <span>Motivación</span>
      <p>Confianza + beneficios adicionales.</p>
    </div>

    <div class="item">
      <span>Canales</span>
      <p>Oficina (70%) · WhatsApp (30%)</p>
    </div>
  </div>

</div>

  <br>

  <table class="benchmark-table">

    <tr>
      <th>Tipo de Referente</th>
      <th>Entidades Líderes</th>
      <th>Ticket Promedio Est. (2025-2026)</th>
      <th>Por qué son el referente</th>
    </tr>

    <tr>
      <td>Banca Patrimonial (Asistida)</td>
      <td>Banco de Bogotá - GNB Sudameris - Itaú </td>
      <td>$120M - $350M COP</td>
      <td>Manejan los capitales más altos mediante asesores de "Banca Privada". El cliente busca negociación personalizada de tasas para montos institucionales o familiares.</td>
      </tr>

    <tr>
      <td>Digital de Alto Valor</td>
      <td>Davivienda</td>
      <td>$58M - $75M COP</td>
      <td>Según el reporte del banco, su ticket promedio subió a $58M en 2026. Son referentes en captar ahorradores profesionales que mueven capitales medianos sin ir a la oficina.</td>
      </tr>

    <tr>
      <td>Digital Masivo (Retail)</td>
      <td>Bancolombia / Banco de Occidente</td>
      <td>$8M - $15M COP</td>
      <td>Referentes en volumen. Captan el grueso del ahorro de la clase media trabajadora que reinvierte sus ahorros o primas directamente desde la App.</td>
    </tr>

    <tr>
      <td>Inclusión Digital (Micro-Ticket)</td>
      <td>Nu (Nubank) - Lulo Bank - Bold</td>
      <td>$50.000 - $3M COP</td>
      <td>Han democratizado el CDT/CDAT. Su referente es el monto mínimo de entrada ($50.000), atrayendo a jóvenes que invierten por primera vez.</td>
    </tr>

    <tr>
      <td>Cooperativo Asistido</td>
      <td>JFK - Coomeva - Colanta</td>
      <td>$12M - $25M COP</td>
      <td>Referentes en el sector solidario. Su ticket es superior al digital masivo porque el asociado confía en la "capitalización social" y suele invertir excedentes de sus ahorros de nómina.</td>
    </tr>

  </table>

  <div class="fuentes">
  <em>Fuentes:</em>
  <ol>
    <li>Superintendencia Financiera (SFC): Informe trimestral de operaciones por canales (Montos transados en Internet vs. Oficinas).</li>
    <li>Tarifarios y Reglamentos de Producto (2025-2026): De bancos como Nu, Banco de Bogotá y Bancolombia, consultados para validar montos mínimos y máximos de operación.</li>
    <li>Asobancaria: Análisis de la digitalización del pasivo en la banca tradicional colombiana.</li>
  </ol>
</div>

<div class="insight-box">

    <strong>Insights de Mercado:</strong><br><br>

    1. Bancos Tradicionales (Líderes en Volumen)<br>
    • Bancolombia: Referente en UX (Experiencia de Usuario). Su apertura de CDT desde la App es el estándar de agilidad (menos de 3 minutos).<br>
    • Davivienda: Pionero en comunicación digital. Su estrategia de "CDT Móvil" captura al usuario que busca seguridad institucional con flujo 100% autogestionado.<br>
    • Banco de Bogotá: Líder en tasas competitivas dentro de la banca tradicional, especialmente en plazos cortos (60-90 días).<br>
    2. Bancos Digitales y Fintech (Líderes en Tasa y Nicho).<br>
    • Nu Colombia & Lulo Bank: Referentes en transparencia y cero fricción. Aunque su fuerte son cuentas de ahorro, han presionado al mercado a eliminar trámites físicos.<br>
    • La Hipotecaria & MiBanco: Actualmente lideran el ranking de rentabilidad en canales digitales (tasas superiores al 12% E.A. en 2026).<br>
    3. Sector Cooperativo y/ entidades de financiamiento (Tus Competidores Directos)<br>
    • Coomeva: Referente en ecosistema digital. Integran el CDT con servicios de salud y seguros, creando una oferta de valor integral.<br>
    • Cofinal & Coasmedas: Han liderado la transformación tecnológica (Cooptech) en el sector, implementando biometría y firmas digitales para igualar la experiencia bancaria.<br>
    • KOA (Compañia de Financiamiento-Vigilada por la superintendencia Financiera): Referente en tasas para el sector solidario, logrando captar usuarios jóvenes mediante una identidad visual moderna y procesos 100% online.<br>
    * MejorCDT (Plataforma): Es el referente agregador. Permite comparar y abrir CDTs de múltiples entidades desde un solo lugar. Es tu competencia directa en el "proceso de decisión" del cliente.
  </div>

</div>
`;
}

else if(name.includes("educar") || name.includes("finco educar") || name.includes("fincoeducar")){

benchmarkHTML = `
<div class="benchmark-block benchmark-inline-scroll">

  <div class="benchmark-title">FINCO EDUCAR - Benchmark Estratégico Sociodemográfico</div>

  <div class="charts-grid">
    <div class="chart-box" style="height:380px;">
      <canvas id="chartFincoEducarGenero"></canvas>
    </div>

    <div class="chart-box" style="height:380px;">
      <canvas id="chartFincoEducarEdad"></canvas>
    </div>
  </div>

  <br>

  <div class="charts-grid">
    <div class="chart-box" style="height:420px;">
      <canvas id="chartFincoEducarPrograma"></canvas>
    </div>

    <div class="chart-box tabla-box">
      <h3>Top Universidades por Solicitudes</h3>
      <table class="tabla-brigadas">
        <thead>
          <tr>
            <th>Universidad</th>
            <th>Cantidad</th>
            <th>Monto Aprobado</th>
          </tr>
        </thead>
        <tbody id="tablaFincoEducarUniversidadesBody"></tbody>
      </table>
    </div>
  </div>

  <br>

  <div class="chart-box" style="height:430px;">
    <h3 style="margin-bottom:15px;">Solicitudes por Ciudad</h3>
    <div id="mapFincoEducarCiudades" style="height:360px; border-radius:18px;"></div>
  </div>

  <br>

  <div class="insight-box">
    <strong>Insights Clave:</strong><br><br>

    • La demanda de FINCO EDUCAR presenta una mayor participación femenina, con <strong>56,88%</strong> del monto desembolsado frente a <strong>43,12%</strong> en masculino, lo que sugiere una apropiación más fuerte del producto en este segmento.<br><br>

    • El grueso de las solicitudes se concentra en población joven: los rangos de <strong>19-25 años</strong>, <strong>26-30 años</strong> y <strong>31-38 años</strong> reúnen casi todo el volumen, confirmando que el producto está altamente alineado con etapas activas de formación profesional.<br><br>

    • <strong>Pregrado</strong> domina ampliamente la demanda con <strong>71,08%</strong> de los registros, seguido por <strong>Posgrado/Especialización</strong> con <strong>22,26%</strong>, lo que evidencia una concentración clara en educación formal universitaria.<br><br>

    • Existe una fuerte concentración institucional: <strong>Politécnico Grancolombiano</strong> lidera ampliamente tanto en cantidad como en monto aprobado, lo que abre oportunidades para alianzas, segmentación y acciones específicas por universidad.<br><br>

    • La distribución geográfica está fuertemente centralizada en <strong>Bogotá D.C.</strong>, seguida a gran distancia por Medellín y Soacha, lo que muestra una alta concentración urbana y deja espacio para expandir la penetración en otras ciudades intermedias.
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
      <th>Variable de Comparación</th>
      <th>Apertura 100% Digital (Autogestionada)</th>
      <th>Apertura Asistida (Asesor Comercial / Oficina)</th>
      <th>Referentes de Mercado</th>
    </tr>

    <tr>
      <td>Porcentaje de Participación</td>
      <td>66,6% del total de aperturas de depósito</td>
      <td>33,4% del total de aperturas de depósito</td>
      <td>Nu Colombia, Lulo Bank (Digital); Bancolombia, Davivienda (Híbrido)</td>
    </tr>

    <tr>
      <td>Valor Promedio de Apertura</td>
      <td>$100.000 - $500.000 COP</td>
      <td>$1.500.000 - $20.000.000 COP</td>
      <td>Pibank, Ualá (Digital); Banco Popular, Banco de Bogotá (Asistido)</td>
    </tr>

    <tr>
      <td>Plazo Promedio de Permanencia</td>
      <td>1 - 4 a  meses (Liquidez inmediata / Bolsillos)</td>
      <td>12 - 36 meses (Contractual / Metas de largo plazo)</td>
      <td>Nubank, RappiPay (Corto Plazo); FNA, Bancoomeva (Largo Plazo)</td>
    </tr>

    <tr>
      <td>Rentabilidad Promedio EA</td>
      <td>9,0% - 13,0% (Enfoque en tasa promocional)</td>
      <td>0,01%  - 8,0%  (Enfoque en servicios y premios)</td>
      <td>Ualá (13%), RappiPay (12%), Banco Popular (12% a 3 años)</td>
    </tr>

    <tr>
      <td>Tasa de Abandono (Onboarding)</td>
      <td>12% - 18% (Mucho abandono en validación de identidad)</td>
      <td>65% - 80% (El cierre es casi garantizado si llega al asesor)</td>
      <td>Nubank-LULO bank</td>
    </tr>

  </table>

    <div class="fuentes">
    <em>Fuentes:</em>
    <ol>
      <li>Superintendencia Financiera de Colombia (SFC): Reportes mensuales de actualidad del Sistema Financiero.</li>
      <li>Banca de las Oportunidades: Reporte Anual de Inclusión Financiera 2025.</li>
      <li>Confecoop / Supersolidaria: Boletines trimestrales sobre el comportamiento del ahorro en el sector solidario.</li>
      <li>Asobancaria: Informes de transaccionalidad y canales digitales.</li>
      <li>Estudios de Mercado (Cintel / Kantar): Perfil del consumidor digital colombiano 2025.</li>
    </ol>
  </div>

  <table class="benchmark-table">

    <tr>
      <th>Perfil</th>
      <th>Segmento - Edad</th>
      <th>Comportamiento Digital</th>
      <th>Motivación de Ahorro</th>
      <th>Barreras (Fricción)</th>
      <th>El "Gancho" de la Cooperativa</th>
    </tr>

    <tr>
      <td>1. El Nativo Optimizador</td>
      <td>Gen Z (18 - 28 años)</td>
      <td>100% Mobile. Usa "bolsillos" y apps de bajo monto. No concibe ir a una oficina.</td>
      <td>Metas inmediatas: Viajes, tecnología, conciertos. Ahorro de "lo que sobra".</td>
      <td>Odia el papeleo, las firmas físicas y esperar más de 3 minutos.</td>
      <td>Gamificación: Ver crecer su dinero diariamente y tasas competitivas en "bolsillos".</td>
    </tr>

    <tr>
      <td>2. El Planificador Estructurado</td>
      <td>Millennials (29 - 44 años)</td>
      <td>Híbrido Avanzado. Abre productos desde la web/app pero investiga en redes sociales.</td>
      <td>Propósito: Cuota inicial de vivienda, educación de hijos o fondo de emergencia.</td>
      <td>La falta de claridad en las condiciones y las apps que fallan en el registro.</td>
      <td>Seguridad + Tasa: Saber que su dinero está en una entidad sólida (Fogacoop) con mejor tasa que el banco.</td>
    </tr>

    <tr>
      <td>3. El Inversionista de Transición</td>
      <td>Gen X (45 - 60 años)</td>
      <td>Multicanal. Valora la banca móvil pero se siente cómodo hablando con un humano para montos altos.</td>
      <td>Estabilidad: Ahorros a largo plazo para proteger su capital y generar rentabilidad extra.</td>
      <td>Miedo a los fraudes digitales y a que no haya "a quién reclamar" si algo falla.</td>
      <td>Asistencia Digital: Un flujo digital que termine con una llamada de confirmación o un chat humano.</td>
    </tr>

    <tr>
      <td>4. El "Silver" Conectado</td>
      <td>Boomers / Seniors (+60 años)</td>
      <td>Digital Asistido. Usa WhatsApp y herramientas simples. Suele ser "referido" por un familiar.</td>
      <td>Patrimonio: Guardar su pensión o excedentes de negocios familiares.</td>
      <td>Interfaces complejas, letras pequeñas y procesos que exigen "reconocimiento facial" difícil.</td>
      <td>Sencillez y Beneficios: Una interfaz limpia y los beneficios sociales (salud, recreación) de la cooperativa.</td>
    </tr>

  </table>

    <table class="benchmark-table">

    <tr>
      <th>Segmento de Competencia</th>
      <th>Entidad Referente</th>
      <th>Tasa Ahorro (E.A)</th>
      <th>Ventaja Competitiva Digital</th>
    </tr>

    <tr>
      <td rowspan = "3">Neobancos (Líderes Digitales)/td>
      <td>Pibank</td>
      <td>11.00%</td>
      <td>Sin cuota de manejo, apertura en 3 min.</td>
    </tr>

    <tr>
      <td>Nu Colombia</td>
      <td>8.75% - 9.25%</td>
      <td>Interfaz ultra-simple, "Cajitas".</td>
    </tr>

    <tr>
      <td>Ualá</td>
      <td>12.0% - 15.0%*</td>
      <td>Tasa ligada a uso de tarjeta/nómina.</td>
    </tr>

    <tr>
      <td rowspan = "2">Banca Tradicional</td>
      <td>Bancolombia</td>
      <td>0.05% - 1.0%</td>
      <td>Confianza masiva, ecosistema de pagos.</td>
    </tr>

    <tr>
      <td>Banco Popular</td>
      <td>0.02% - 1.0%</td>
      <td>Fortalece captación digital con tasas bono.</td>
    </tr>

    <tr>
      <td rowspan = "2">Sector Cooperativo (Benchmark)</td>
      <td>Coogranada</td>
      <td>4.0% - 8.0%</td>
      <td>Alta rentabilidad en plazos cortos.</td>
    </tr>

    <tr>
      <td>Cotrafa</td>
      <td>4.8% - 8.4%</td>
      <td>Proceso híbrido con asesoría fuerte.</td>
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

if(name.includes("finco go")){

benchmarkHTML = `
<div class="benchmark-block benchmark-inline-scroll">

  <div class="benchmark-title">Crédito Digital - Benchmark Estratégico</div>

  <table class="benchmark-table">

    <tr>
      <th>Variable</th>
      <th>Banca Tradicional</th>
      <th>Fintechs & Neobancos</th>
      <th>Cooperativas Líderes</th>
    </tr>

    <tr>
      <td>Top 3</td>
      <td>Bancolombia,Banco de Bogota, Davivienda</td>
      <td>Nu Bank-lulo Bank-Addi-RappiPay</td>
      <td>Coomeva-Cooperativa Financiera de Antioquia-Crediasociado</td>
    </tr>

    <tr>
      <td>Modelo Desembolso</td>
      <td> 75% digital / 25% asistido (App/Web + validación humana)</td>
      <td>100% Digital: Autogestión total mediante App y biometría.</td>
      <td>Asistido/Digital: 15% - 30% digital. Gran peso en asesoría remota.</td>
    </tr>

    <tr>
      <td>Ticket Promedio</td>
      <td>$12M - $25M COP (Consumo / Libre Inversión)</td>
      <td>$500k - $4M COP (Nano-Créditos y consumo rápido)</td>
      <td>$5M - $12M COP (Aportes y Crédito Ordinario)</td>
    </tr>

    <tr>
      <td>Plazo Promedio</td>
      <td>12 - 60 meses</td>
      <td>1 - 12 meses (Rotativos o cuotas cortas)</td>
      <td>12 - 48 meses</td>
    </tr>

    <tr>
      <td>Tiempo de Respuesta</td>
      <td>15 min - 24 horas (Aprobación)</td>
      <td>< 5 minutos (Aporbación y desembolso inmediato)</td>
      <td>1 - 3 días (Procesos de comité o Validación)</td>
    </tr>

    <tr>
      <td>Perfil del Usuario</td>
      <td>30-55 años, bancarizado, ingresos estables (>2 SMMLV).</td>
      <td>18-35 años (Gen Z/Millennial), sub-bancarizado o freelancer.</td>
      <td>35-65 años, base social fiel, búsqueda de tasas bajas.</td>
    </tr>

    <tr>
      <td>Tasa Interés Prom.</td>
      <td>16% - 24% E.A. (Tendencia a la baja en 2025).</td>
      <td>20% - 25% E.A. (Cerca al límite de usura).</td>
      <td>14% - 19% E.A. (Su gran ventaja competitiva).</td>
    </tr>

    <tr>
      <td>Costos Adicionales</td>
      <td>Seguro de vida, cuotas de manejo (algunos).</td>
      <td>Comisiones por tecnología o avales (en algunas Fintech).</td>
      <td>Seguro de vida y aportes sociales obligatorios.</td>
    </tr>

    <tr>
      <td>% Colocación Digital</td>
      <td>65% de sus nuevos créditos hoy nacen en digital.</td>
      <td>100% de su operación es digital.</td>
      <td>10% - 15% (Aún hay brecha en autogestión).</td>
    </tr>

  </table>

  <div class="fuentes">
    <em>Fuentes:</em>
    <ol>
      <li>Reporte de Inclusión Financiera 2025 (Superintendencia Financiera de Colombia).</li>
      <li>Informe Trimestral de Crédito Digital - Colombia Fintech (Edición Dic 2025).</li>
      <li>Estudio "Digital Banking Maturity 2025" - Deloitte/Asobancaria.</li>
      <li>Certificaciones de Interés Bancario Corriente (Superfinanciera).</li>
    </ol>
  </div>

  <table class="benchmark-table">

    <tr>
      <th>Entidad / Tipo</th>
      <th>Enfoque Principal</th>
      <th>Tiempo de Respuesta</th>
      <th>Ticket Prom. Aprobado</th>
      <th>Diferenciador Competitivo</th>
    </tr>

    <tr>
      <td>
        <div class="titulo">Nu Colombia</div>
        <div class="subtitulo">Fintech</div>
      </td>
      <td>100 % Digital</td>
      <td> <3 Minutos</td>
      <td>$2.500.000 COP</td>
      <td>Experiencia UX inmejorable, sin cobros ocultos, transparencia total</td>
    </tr>

    <tr>
      <td>
        <div class="titulo">Lulo Bank</div>
        <div class="subtitulo">Neobanco</div>
      </td>
      <td>100 % Digital</td>
      <td> 5 Minutos</td>
      <td>$4.000.000 COP</td>
      <td>Devolución de intereses, cero costos de estudio, tasas personalizadas.</td>
    </tr>

    <tr>
      <td>
        <div class="titulo">Bancolombia</div>
        <div class="subtitulo">Banco</div>
      </td>
      <td>Mixto (Fuerte en Digital)</td>
      <td>Inmediato (Preaprobados)</td>
      <td>$3.800.000 COP</td>
      <td>Base de datos masiva, preaprobados constantes, ecosistema integrado</td>
    </tr>

    <tr>
      <td>
        <div class="titulo">Davivienda (app)</div>
        <div class="subtitulo">Banco</div>
      </td>
      <td>Mixto</td>
      <td>5 a 10 minutos</td>
      <td>$5.000.000 COP</td>
      <td>Facilidad de desembolso "A un clic", integración con productos de libranza</td>
    </tr>

    <tr>
      <td>
        <div class="titulo">Coopcentral</div>
        <div class="subtitulo">Cooperativa Red/div>
      </td>
      <td>Asistido y Digital</td>
      <td>2 a 4 horas</td>
      <td>$10.000.000 COP</td>
      <td>Red compartida, tasas solidarias bajas, enfoque en historial cooperativo</td>
    </tr>

    <tr>
      <td>
        <div class="titulo">Confiar Coop.</div>
        <div class="subtitulo">Cooperativa</div>
      </td>
      <td>Fuerte Asistido / Web</td>
      <td>24 horas</td>
      <td>$14.500.000 COP</td>
      <td>Acompañamiento humano, educación financiera, tasas preferenciales por aportes</td>
    </tr>

  </table>

  <div class="benchmark-title">Insights de comparativo entre entidades</div>

  <div class="insight-box">

    • Mientras la banca tradicional aprueba en 24h y las Fintech en 5 minutos, el sector cooperativo aún promedia 48h. El usuario digital 2026 valora la inmediatez por encima de unos puntos menos en la tasa.<br>
    • Las tasas de las cooperativas (14%-19% E.A.) son significativamente más bajas que las de las Fintech de consumo masivo (>20% E.A.). Las cooperativas son la opción más barata del mercado digital; solo se necesita que el proceso sea tan fácil como el de la competencia.<br>
    • Los líderes (Nu, Addi) usan IA para evaluar comportamiento, no solo historial crediticio. Utilizar la data interna de la cooperativa (hábitos de ahorro, antigüedad, cumplimiento de aportes) para crear pre-aprobados digitales que la banca tradicional no puede ver.<br>

  </div>

  <table class="benchmark-table">

    <tr>
      <th>Entidad</th>
      <th>Hito Digital</th>
      <th>Diferenciador Clave</th>
    </tr>

    <tr>
      <td>Coomeva</td>
      <td>Crediasociado</td>
      <td>Es el referente de velocidad y monto. Ofrecen hasta $38 millones con desembolso en 5 minutos 100% digital desde su App.</td>
    </tr>

    <tr>
      <td>CFA (Cooperativa Financiera de Antioquia)</td>
      <td>Estrategia IA 2025</td>
      <td>Líder en infraestructura. Han realizado inversiones masivas en Inteligencia Artificial para el análisis de riesgo, logrando una eficiencia operativa superior al promedio del sector.</td>
    </tr>

    <tr>
      <td>Fincomercio</td>
      <td>Crédito Educativo 100% Digital</td>
      <td>Especialista en segmentación. Han digitalizado totalmente el ciclo del crédito educativo, permitiendo que el estudiante/asociado gestione todo el proceso sin pisar una oficina.</td>
    </tr>

    <tr>
      <td>Coprocenva</td>
      <td>Crédito vía WhatsApp</td>
      <td>Pionera en canales conversacionales. Permite solicitar créditos de consumo de hasta $10 millones a través de WhatsApp, integrando chatbots para una respuesta inmediata.</td>
    </tr>

    <tr>
      <td>JFK Cooperativa Financiera</td>
      <td>Autogestión de Vinculación</td>
      <td>Referente en Onboarding. Implementaron formularios digitales de vinculación y autogestión que reducen la fricción inicial para nuevos asociados jóvenes.</td>
    </tr>

    <tr>
      <td>Banco Coopcentral</td>
      <td>Red Coopcentral / Marca Blanca</td>
      <td>El habilitador tecnológico. Aunque es un banco, es el cerebro detrás de la billetera digital de más de 700 cooperativas, permitiendo que entidades pequeñas compitan con tecnología de punta.</td>
    </tr>

  </table>


  
</div>
`;
}

document.getElementById("benchmarkInlineContainer").innerHTML = benchmarkHTML;

if(name.includes("educar") || name.includes("finco educar") || name.includes("fincoeducar")){
  setTimeout(() => {
    initFincoEducarBenchmark();
  }, 100);
}
}

function initFincoEducarBenchmark() {
  renderTablaFincoEducarUniversidades();
  renderChartFincoEducarGenero();
  renderChartFincoEducarEdad();
  renderChartFincoEducarPrograma();
  renderMapaFincoEducar();
}

function renderTablaFincoEducarUniversidades() {
  const tbody = document.getElementById("tablaFincoEducarUniversidadesBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  fincoEducarSocioData.universidades.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.nombre}</td>
      <td>${row.cantidad.toLocaleString("es-CO")}</td>
      <td>$${row.monto.toLocaleString("es-CO")}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderChartFincoEducarGenero() {
  const canvas = document.getElementById("chartFincoEducarGenero");
  if (!canvas) return;

  if (fincoEducarGeneroChart) {
    fincoEducarGeneroChart.destroy();
    fincoEducarGeneroChart = null;
  }

  fincoEducarGeneroChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: fincoEducarSocioData.genero.labels,
      datasets: [{
        label: "Monto Aprobado",
        data: fincoEducarSocioData.genero.montos,
        backgroundColor: "#3b82f6",
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "white" }
        },
        title: {
          display: true,
          text: "Montos Desembolsados por Género",
          color: "white",
          font: { size: 16, weight: "bold" }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const i = context.dataIndex;
              const monto = context.raw;
              const porcentaje = fincoEducarSocioData.genero.porcentajes[i];
              return `$${Number(monto).toLocaleString("es-CO")} | ${porcentaje}%`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "white",
            callback: value => "$" + Number(value).toLocaleString("es-CO")
          }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

function renderChartFincoEducarEdad() {
  const canvas = document.getElementById("chartFincoEducarEdad");
  if (!canvas) return;

  if (fincoEducarEdadChart) {
    fincoEducarEdadChart.destroy();
    fincoEducarEdadChart = null;
  }

  fincoEducarEdadChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: fincoEducarSocioData.edad.labels,
      datasets: [{
        label: "Créditos",
        data: fincoEducarSocioData.edad.cantidades,
        backgroundColor: "#22c55e",
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "white" }
        },
        title: {
          display: true,
          text: "Créditos por Rango de Edad",
          color: "white",
          font: { size: 16, weight: "bold" }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

function renderChartFincoEducarPrograma() {
  const canvas = document.getElementById("chartFincoEducarPrograma");
  if (!canvas) return;

  if (fincoEducarProgramaChart) {
    fincoEducarProgramaChart.destroy();
    fincoEducarProgramaChart = null;
  }

  fincoEducarProgramaChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: fincoEducarSocioData.programa.labels,
      datasets: [{
        label: "Registros",
        data: fincoEducarSocioData.programa.cantidades,
        backgroundColor: "#f59e0b",
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "white" }
        },
        title: {
          display: true,
          text: "Detalle Programa Educativo",
          color: "white",
          font: { size: 16, weight: "bold" }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const i = context.dataIndex;
              const cant = context.raw;
              const pct = fincoEducarSocioData.programa.porcentajes[i];
              return `${cant.toLocaleString("es-CO")} registros | ${pct}%`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

function renderMapaFincoEducar() {
  const mapId = "mapFincoEducarCiudades";
  const mapContainer = document.getElementById(mapId);
  if (!mapContainer) return;

  if (fincoEducarMapa) {
    fincoEducarMapa.remove();
    fincoEducarMapa = null;
  }

  fincoEducarMapa = L.map(mapId).setView([4.5709, -74.2973], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(fincoEducarMapa);

  fincoEducarSocioData.ciudades.forEach(p => {
    const radio = Math.max(5, Math.min(28, Math.sqrt(p.cantidad) * 0.35));

    L.circleMarker([p.lat, p.lng], {
      radius: radio,
      fillColor: "#3b82f6",
      color: "#ffffff",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.75
    })
    .addTo(fincoEducarMapa)
    .bindPopup(`<strong>${p.ciudad}</strong><br>Solicitudes: ${p.cantidad.toLocaleString("es-CO")}`);
  });

  setTimeout(() => {
    fincoEducarMapa.invalidateSize();
  }, 250);
}


/* ================= PROYECCION SOLO AUTOGESTIONADO ================= */
const projectionSlider = document.getElementById("projectionSlider");

if (projectionSlider) {
  projectionSlider.addEventListener("input", function () {
    if (!currentProductData || !mainChart) return;

    const data = currentProductData.monthlyData;

    const adopcionObjetivo = parseFloat(this.value);
    document.getElementById("projectionValue").innerText = adopcionObjetivo + "%";

    const last = data.at(-1);

    const totalActual = currentViewMode === "valor"
      ? last.valorTotal
      : last.cantidadTotal;

    const autoActual = currentViewMode === "valor"
      ? last.valorAutogestionado
      : last.cantidadAutogestionado;

    const asesorActual = currentViewMode === "valor"
      ? last.valorAsesor
      : last.cantidadAsesor;

    const adopcionActual = (autoActual / totalActual) * 100;
    const diferencia = adopcionObjetivo - adopcionActual;

    const ultimaFecha = new Date(last.mes);

    const labelsProy = [];
    const autoProy = [];
    const asesorProy = [];
    const totalProy = [];

    const growthRates = [];

    for (let i = 1; i < data.length; i++) {
      const prev = currentViewMode === "valor"
        ? data[i - 1].valorTotal
        : data[i - 1].cantidadTotal;

      const curr = currentViewMode === "valor"
        ? data[i].valorTotal
        : data[i].cantidadTotal;

      if (prev && prev !== 0) {
        growthRates.push((curr / prev) - 1);
      }
    }

    const crecimientoHistorico = growthRates.length > 0
      ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      : 0.01;

    const alpha = 0.4;
    const impactoDigital = (diferencia / 100) * alpha;

    const promedioGeneral =
      data.reduce((a, b) => a + (currentViewMode === "valor" ? b.valorTotal : b.cantidadTotal), 0) / data.length;

    const factoresEstacionales = data.map(d =>
      (currentViewMode === "valor" ? d.valorTotal : d.cantidadTotal) / promedioGeneral
    );

    for (let i = 1; i <= 12; i++) {
      const factor = i / 12;

      const nuevaAdopcion = adopcionActual + (diferencia * factor);

      const crecimientoBase = Math.pow((1 + crecimientoHistorico), i);
      const aceleracionDigital = Math.pow((1 + impactoDigital), i);

      const factorEstacional =
        factoresEstacionales[(data.length + i - 1) % factoresEstacionales.length];

      const totalMes =
        totalActual *
        crecimientoBase *
        aceleracionDigital *
        factorEstacional;

      const beta = 0.5;
      const efectoCanibalizacion = (diferencia / 100) * beta * factor;

      let asesorBase = totalMes * (1 - (nuevaAdopcion / 100));
      let nuevoAsesor = asesorBase * (1 - efectoCanibalizacion);
      let nuevoAuto = totalMes - nuevoAsesor;

      if (nuevoAsesor < 0) nuevoAsesor = 0;
      if (nuevoAuto < 0) nuevoAuto = 0;

      autoProy.push(nuevoAuto);
      asesorProy.push(nuevoAsesor);
      totalProy.push(totalMes);

      const nuevaFecha = new Date(ultimaFecha);
      nuevaFecha.setMonth(nuevaFecha.getMonth() + i);
      labelsProy.push(nuevaFecha.toISOString().substring(0, 7));
    }

    const labelsHist = data.map(d => d.mes.substring(0, 7));
    const totalHist = data.map(d => currentViewMode === "valor" ? d.valorTotal : d.cantidadTotal);
    const autoHist = data.map(d => currentViewMode === "valor" ? d.valorAutogestionado : d.cantidadAutogestionado);
    const asesorHist = data.map(d => currentViewMode === "valor" ? d.valorAsesor : d.cantidadAsesor);

    mainChart.data.labels = labelsHist.concat(labelsProy);

    mainChart.data.datasets[0].data = totalHist.concat(totalProy.map(v => Math.round(v)));
    mainChart.data.datasets[1].data = autoHist.concat(autoProy.map(v => Math.round(v)));
    mainChart.data.datasets[2].data = asesorHist.concat(asesorProy.map(v => Math.round(v)));

    mainChart.update();

    const incrementoAuto = autoProy[11] - autoActual;

    document.getElementById("impactValue").innerText =
      currentViewMode === "valor"
        ? formatNumber(incrementoAuto)
        : Math.round(incrementoAuto);
  });
}

/* ================= ANALISIS ================= */

function renderProductAnalysis(product){

  const data = product.monthlyData;
  const last = data.at(-1);
  const name = product.name.toLowerCase();

  let variacionTexto = "N/A";
  let flecha = "";
  let color = "#94a3b8";
  let alerta = "Sin suficientes datos";

  if(data.length >= 2){
    const current = data.at(-1).valorTotal;
    const prev = data.at(-2).valorTotal;

    const variacion = ((current - prev) / prev) * 100;
    const valor = variacion.toFixed(1);

    if(variacion > 2){
      flecha = "↑";
      color = "#22c55e";
      alerta = "Crecimiento sólido";
    }
    else if(variacion < -2){
      flecha = "↓";
      color = "#ef4444";
      alerta = "Caída relevante";
    }
    else{
      flecha = "→";
      color = "#eab308";
      alerta = "Comportamiento estable";
    }

    variacionTexto = `${flecha} ${valor}%`;
  }

  function tendenciaSuavizada(data){
    if(data.length < 3) return "N/A";

    const last3 = data.slice(-3).map(d => d.valorTotal);
    const crecimiento = (last3[2] - last3[0]) / last3[0] * 100;

    return crecimiento.toFixed(1) + "%";
  }

  const tendencia = tendenciaSuavizada(data);

  const promMonto = calcularPromedio(data, "promMonto");
  const promAuto = calcularPromedio(data, "promMontoAutogestionado");
  const promAsesor = calcularPromedio(data, "promMontoAsesor");

  const plazoPromDias = calcularPromedio(data, "plazoPromedio");
  const plazoAutoDias = calcularPromedio(data, "plazoPromAutogestionado");
  const plazoAsesorDias = calcularPromedio(data, "plazoPromAsesor");

  const productosEnMesesReales =
    name.includes("cdat");

  const productosSoloCambioTexto =
    name.includes("pap") ||
    name.includes("gamificada") ||
    name.includes("finco go") ||
    name.includes("fincogo") ||
    name.includes("educar") ||
    name.includes("finco educar") ||
    name.includes("fincoeducar");

  let plazoPromTexto = `${plazoPromDias} días`;
  let plazoAutoTexto = `${plazoAutoDias} días`;
  let plazoAsesorTexto = `${plazoAsesorDias} días`;

  if(productosEnMesesReales){
    const plazoPromMeses = (plazoPromDias / 30).toFixed(1);
    const plazoAutoMeses = (plazoAutoDias / 30).toFixed(1);
    const plazoAsesorMeses = (plazoAsesorDias / 30).toFixed(1);

    plazoPromTexto = `${plazoPromMeses} meses`;
    plazoAutoTexto = `${plazoAutoMeses} meses`;
    plazoAsesorTexto = `${plazoAsesorMeses} meses`;
  }
  else if(productosSoloCambioTexto){
    plazoPromTexto = `${plazoPromDias} meses`;
    plazoAutoTexto = `${plazoAutoDias} meses`;
    plazoAsesorTexto = `${plazoAsesorDias} meses`;
  }

  const adopcion = ((last.valorAutogestionado / last.valorTotal) * 100).toFixed(1);

  const html = `
    <h3>Resumen del Producto</h3>

    <p><strong>Adopción Digital:</strong> ${adopcion}%</p>

    <hr>

    <h4>Promedios Generales</h4>
    <p><strong>Monto Promedio:</strong> ${formatNumber(promMonto)}</p>
    <p><strong>Plazo Promedio:</strong> ${plazoPromTexto}</p>

    <hr>

    <h4>Autogestionado</h4>
    <p><strong>Monto:</strong> ${formatNumber(promAuto)}</p>
    <p><strong>Plazo:</strong> ${plazoAutoTexto}</p>

    <hr>

    <h4>Asesor</h4>
    <p><strong>Monto:</strong> ${formatNumber(promAsesor)}</p>
    <p><strong>Plazo:</strong> ${plazoAsesorTexto}</p>
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
    icono:"💳",
    proyectos:[
      {
        nombre:"IA para nómina y créditos instantáneos",
        estado:"En proceso de certificación",
        clase:"certificacion",
        estadoActual:"certificacion",
        detalle:"Extracción y cálculo con IA de la información de los desprendibles de nómina para generar créditos con flujo de respuesta inmediata, 100% digital."
      },
      {
        nombre:"Flujo de caja y parametrización",
        estado:"Redacción de control de cambio",
        clase:"control",
        estadoActual:"control",
        detalle:"Habilitación de flujo de caja y parametrización para crear productos de crédito."
      }
    ]
  },
  {
    producto:"CDAT Digital",
    icono:"📈",
    proyectos:[
      {
        nombre:"CDAT 100% digital en Sibanco + automatización",
        estado:"En proceso de pruebas",
        clase:"pruebas",
        estadoActual:"pruebas",
        detalle:"Mejora de CDAT Digital: creación de CDAT digital en línea en Sibanco, unificación del flujo de apertura y renovación por asesor en CDAT Digital, y automatización de puntos adicionales."
      }
    ]
  },
  {
    producto:"Chatbot",
    icono:"🤖",
    proyectos:[
      {
        nombre:"Integración IA generativa (GNS)",
        estado:"En proceso de pruebas",
        clase:"pruebas",
        estadoActual:"pruebas",
        detalle:"Integración del canal de chatbot con IA generativa usando proveedor GNS."
      }
    ]
  },
  {
    producto:"APP+",
    icono:"📱",
    proyectos:[
      {
        nombre:"Versión 4 con mejoras UX",
        estado:"En proceso de cotización",
        clase:"cotizacion",
        estadoActual:"cotizacion",
        detalle:"Proyecto de la versión 4 de FincoMóvil con mejoras en UX e integraciones nuevas."
      }
    ]
  },
  {
    producto:"Portal Juridico",
    icono:"⚖️",
    proyectos:[
      {
        nombre:"Inclusión de asociados jurídicos en la banca jurídica",
        estado:"Levantamiento de procedimiento",
        clase:"diseño",
        estadoActual:"diseño",
        detalle:"Inclusión de asociados jurídicos en la banca jurídica."
      }
    ]
  },
  {
    producto:"Agentes Virtuales",
    icono:"🧠",
    proyectos:[
      {
        nombre:"Venta seguro + extractos automáticos",
        estado:"Diseño de POC",
        clase:"diseño",
        estadoActual:"diseño",
        detalle:"Se está generando integración de agentes virtuales para venta de seguro de hogar, generación y envío de extractos y estados de cuenta."
      }
    ]
  },
  {
    producto:"Solicitud de Credito",
    icono:"📝",
    proyectos:[
      {
        nombre:"Whatsapp",
        estado:"Levantamiento de información y estructuración",
        clase:"diseño",
        estadoActual:"diseño",
        detalle:"Creación de un flujo conversacional de asesoría de crédito, aplicación de modelo de originación y respuesta al usuario para proceso de retoma y desembolso por canal de WhatsApp."
      }
    ]
  },
  {
    producto:"Tienda Virtual",
    icono:"🛒",
    proyectos:[
      {
        nombre:"Inclusión Tarjeta de Crédito",
        estado:"Aprobación de flujo de compra y proceso contable",
        clase:"control",
        estadoActual:"control",
        detalle:"Inclusion de Tarjeta de credito Fincomercio"
      },
      {
        nombre:"Ecommerce",
        estado:"Creación flujo mercadeo",
        clase:"diseño",
        estadoActual:"diseño",
        detalle:"Opcion de credito propia del ecommerce con visualizacion de cupo aprobado"
      },
      {
        nombre:"Notificaciones Whatssap",
        estado:"Creación flujo mercadeo",
        clase:"diseño",
        estadoActual:"diseño",
        detalle:"Diseño modulo de notificaciones integrado WhatsApp para marketing y remarketing"
      }
    ]
  }
];

function renderRoadmap(){

  const container = document.getElementById("roadmapContainer");
  if(!container) return;

  container.innerHTML = "";

  const block = roadmapData.find(item => item.producto === proyectoPlanActivo);
  if(!block) return;

  const card = document.createElement("div");
  card.className = "plan-product-card";

  card.innerHTML = `
    <div class="plan-product-header">
      <div class="plan-product-icon">${block.icono || "🚀"}</div>
      <div class="plan-product-title">${block.producto}</div>
    </div>

    ${block.proyectos.map(p => `
      <div class="plan-initiative-card">
        <div class="plan-initiative-top">
          <div class="plan-initiative-name">${p.nombre}</div>
          <div class="plan-status-badge status-${p.clase}">
            ${p.estado}
          </div>
        </div>

        ${renderTimeline(p)}

        <div class="plan-project-detail">
          ${p.detalle ? p.detalle : "Sin detalle registrado"}
        </div>
      `).join("")}
    </div>
  `;

  container.appendChild(card);
}

function renderPlanFilters(){
  const container = document.getElementById("planFilters");
  if(!container) return;

  container.innerHTML = "";

  roadmapData.forEach(item => {
    const btn = document.createElement("button");
    btn.className = `timeline-chip ${item.producto === proyectoPlanActivo ? "active" : ""}`;
    btn.textContent = item.producto;

    btn.onclick = () => {
      proyectoPlanActivo = item.producto;
      renderPlanFilters();
      renderRoadmap();
    };

    container.appendChild(btn);
  });
}

function renderTimeline(p){

  const etapasProyecto = ["diseño","desarrollo","control","pruebas","certificacion","cotizacion","produccion"];

  return `
    <div class="plan-stages">
      ${etapasProyecto.map(etapa => `
        <div class="plan-stage ${etapa === p.estadoActual ? "active" : ""}">
          <div class="plan-stage-dot"></div>
          <div class="plan-stage-label">${etapa}</div>
        </div>
      `).join("")}
    </div>
  `;
}

renderPlanFilters();
renderRoadmap();

function abrirPlanTrabajo(btn){
  showSection("plan", btn);
  renderPlanFilters();
  renderRoadmap();
}


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
        y:{
          ticks:{
            color:"white",
            callback: function(value){
              if(currentViewMode === "valor"){
                return formatNumber(value);
              }else{
                return value;
              }
            }
          }
        }
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

function openAppModal(){

  document.getElementById("benchmarkInlineContainer").innerHTML = "";

  document.querySelectorAll("#metrics button").forEach(btn=>{
    btn.style.display = "none";
  });

  document.querySelector(".projection-control").style.display = "none";
  document.querySelector(".impact-indicator").style.display = "none";

  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modalTitle").innerText = "APP - Indicadores Digitales";

  document.getElementById("chartProduct").style.display = "none";
  document.getElementById("chartImpact").style.display = "block";

  if(mainChart){
    mainChart.destroy();
    mainChart = null;
  }

  if(appChartInstance){
    appChartInstance.destroy();
    appChartInstance = null;
  }

  renderAppMetricButtons();
  renderAppChart(appMetricActive);
}

function renderAppMetricButtons(){

  const panel = document.getElementById("analysisPanel");
  if(!panel) return;

  panel.innerHTML = `
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
      <button onclick="changeAppMetric('base_instalada')">Base Instalada</button>
      <button onclick="changeAppMetric('usuarios_recurrentes')">Usuarios Recurrentes</button>
      <button onclick="changeAppMetric('dispositivos_ios')">iOS Activos</button>
      <button onclick="changeAppMetric('valoracion_google_play')">Valoración Google Play</button>
    </div>
    <div id="appMetricSummary" class="insight-box" style="margin-top:0;"></div>
  `;

  renderAppMetricSummary(appMetricActive);
}

function changeAppMetric(metricKey){
  appMetricActive = metricKey;
  renderAppMetricSummary(metricKey);
  renderAppChart(metricKey);
}

function renderAppMetricSummary(metricKey){

  const summary = document.getElementById("appMetricSummary");
  if(!summary) return;

  const data = appDataStore[metricKey];
  const last = data.at(-1);

  let titulo = "";
  let valorTexto = "";
  let variacionTexto = `${last.Colombia?.variacion ?? last.iOS?.variacion ?? 0}%`;
  let descripcion = "";

  if(metricKey === "base_instalada"){
    titulo = "Base Instalada";
    valorTexto = Math.round(Number(last.Colombia.valor)).toLocaleString("es-CO");
    descripcion = "Usuarios totales instalados en Colombia.";
  }

  if(metricKey === "usuarios_recurrentes"){
    titulo = "Usuarios Recurrentes Mensuales";
    valorTexto = Math.round(Number(last.Colombia.valor)).toLocaleString("es-CO");
    descripcion = "Usuarios que usan la APP de forma recurrente cada mes.";
  }

  if(metricKey === "dispositivos_ios"){
    titulo = "Dispositivos Activos iOS";
    valorTexto = Math.round(Number(last.iOS.valor)).toLocaleString("es-CO");
    descripcion = "Cantidad de dispositivos activos en iOS.";
  }

  if(metricKey === "valoracion_google_play"){
    titulo = "Valoración Google Play";
    valorTexto = Number(last.Colombia.valor).toFixed(2).replace(".", ",");
    descripcion = "Calificación promedio histórica en Google Play para Colombia.";
  }

  summary.innerHTML = `
    <strong>${titulo}</strong><br><br>
    Valor actual: ${valorTexto}<br>
    Variación: ${variacionTexto}<br><br>
    ${descripcion}
  `;
}

function renderAppChart(metricKey){

  const canvas = document.getElementById("chartImpact");
  if(!canvas) return;

  const data = appDataStore[metricKey];
  if(!data || !data.length) return;

  if(appChartInstance){
    appChartInstance.destroy();
    appChartInstance = null;
  }

  const labels = data.map(d => d.mes);

  let values = [];
  let label = "";
  let title = "";
  let isRating = false;

  if(metricKey === "base_instalada"){
    values = data.map(d => Number(d.Colombia.valor));
    label = "Base Instalada Colombia";
    title = "Base Instalada APP";
  }

  if(metricKey === "usuarios_recurrentes"){
    values = data.map(d => Number(d.Colombia.valor));
    label = "Usuarios Recurrentes Colombia";
    title = "Usuarios Recurrentes Mensuales";
  }

  if(metricKey === "dispositivos_ios"){
    values = data.map(d => Number(d.iOS.valor));
    label = "Dispositivos Activos iOS";
    title = "Dispositivos Activos iOS";
  }

  if(metricKey === "valoracion_google_play"){
    values = data.map(d => Number(d.Colombia.valor));
    label = "Valoración Colombia";
    title = "Valoración Google Play";
    isRating = true;
  }

  appChartInstance = new Chart(canvas,{
    type:"line",
    data:{
      labels,
      datasets:[{
        label,
        data: values,
        borderColor:"#3b82f6",
        backgroundColor:"rgba(59,130,246,0.15)",
        tension:0.35,
        fill:true
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{ labels:{ color:"white" } },
        title:{
          display:true,
          text:title,
          color:"white",
          font:{ size:16, weight:"bold" }
        }
      },
      scales:{
        x:{
          ticks:{ color:"white" }
        },
        y:{
          ticks:{
            color:"white",
            callback:function(value){
              if(isRating){
                return Number(value).toFixed(1);
              }
              return Math.round(value).toLocaleString("es-CO");
            }
          }
        }
      }
    }
  });
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

const modalEl = document.getElementById("modal");

if (modalEl) {
  modalEl.addEventListener("click", function(e){
    if(e.target.id === "modal"){
      this.classList.add("hidden");
    }
  });
}


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

function activarFincoBot(){

  const panel = document.getElementById("fincoBotPanel");
  const preguntaBox = document.getElementById("preguntaVisibleBot");
  const modal = document.getElementById("modal");

  if(!panel){
    console.error("No existe fincoBotPanel");
    return;
  }

  document.querySelectorAll(".section").forEach(sec=>{
    sec.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach(b=>{
    b.classList.remove("active-btn");
  });

  if(modal){
    modal.classList.add("hidden");
  }

  renderProductosBot();

  if(preguntaBox){
    preguntaBox.innerHTML = "";
    preguntaBox.classList.add("hidden");
  }

  panel.classList.remove("hidden");
  panel.style.display = "block";

  hablar("Selecciona un canal");
}

function seleccionarProducto(producto){

  let pregunta = "";
  const preguntaBox = document.getElementById("preguntaVisibleBot");

  if(producto === "captaciones"){
    pregunta = "¿Cómo optimizar el embudo de conversión digital en Fincomercio para aumentar la apertura autogestionada de productos de inversión?";
  }else if(producto === "credito"){
    pregunta = "¿Qué ajustes en el modelo de scoring y desembolso de FincoGo son necesarios para igualar la inmediatez de las fintech y convertirlo en el crédito digital líder de nuestros asociados?";
  }else if(producto === "fincoeducar"){
    pregunta = "¿Qué fricciones debemos eliminar en el proceso de solicitud de crédito educativo para elevar el porcentaje de conversión autogestionada y optimizar la rentabilidad de la línea?";
  }else if(producto === "marketing"){
    pregunta = "¿Cómo podemos optimizar el ROI de nuestros canales de comunicación para asegurar que cada impacto digital se traduzca en una conversión efectiva del asociado?";
  }else if(producto === "seguros"){
    pregunta = "¿Qué estrategias de personalización y automatización permitirían acelerar el crecimiento del canal digital en la colocación de seguros para nuestros asociados?";
  }else if(producto === "servicios"){
    pregunta = "¿Cómo podemos transformar los hallazgos de nuestras encuestas de servicio en acciones concretas que garanticen una experiencia WOW y personalizada para cada asociado?";
  }else if(producto === "integral"){
    pregunta = "¿De qué manera te conviertes en un embajador del ecosistema digital para asegurar que ningún asociado se quede atrás en esta evolución?";
  }else if(producto === "conceptogerencial"){
    pregunta = "Como líder de la fuerza comercial, ¿cuál considera que debe ser la hoja de ruta para evolucionar hacia un ecosistema digital integral que no solo empodere a los equipos y potencie la rentabilidad, sino que preserve nuestro propósito de transformar comunidades y marcando la diferencia competitiva en el mercado?";
  }

  if(preguntaBox && pregunta){
    preguntaBox.innerHTML = `
      <div class="pregunta-card-bot">
        <h3>Pregunta estratégica</h3>
        <p>${pregunta}</p>
      </div>
    `;
    preguntaBox.classList.remove("hidden");
  }

  if(pregunta){
    hablar(pregunta);
  }
}

document.addEventListener("click", function(e){

  const panel = document.getElementById("fincoBotPanel");
  const botonBot = document.querySelector(".finco-bot-btn");

  if(!panel || panel.classList.contains("hidden")) return;

  const clickDentroPanel = panel.contains(e.target);
  const clickEnBoton = botonBot && botonBot.contains(e.target);

  if(!clickDentroPanel && !clickEnBoton){
    ocultarFincoBot();
  }
});

function renderProductosBot(){

  const container = document.getElementById("productosBot");

  container.innerHTML = `

    <div class="producto-btn" onclick="seleccionarProducto('captaciones')">
      💰 Captaciones
    </div>

    <div class="producto-btn" onclick="seleccionarProducto('credito')">
      🚀 Crédito
    </div>

    <div class="producto-btn" onclick="seleccionarProducto('fincoeducar')">
      🎓 Finco Educar
    </div>

    <div class="producto-btn" onclick="seleccionarProducto('marketing')">
      📣 Marketing
    </div>

    <div class="producto-btn" onclick="seleccionarProducto('seguros')">
      🛡️ Seguros
    </div>

    <div class="producto-btn" onclick="seleccionarProducto('servicios')">
      ⭐ Servicios
    </div>

    <div class="producto-btn" onclick="seleccionarProducto('integral')">
      🌐 Integral
    </div>

    <div class="producto-btn" onclick="seleccionarProducto('conceptogerencial')">
      👔 Concepto Gerencial
    </div>

  `;
}

function seleccionarProducto(producto){

  let pregunta = "";

  if(producto === "captaciones"){

    pregunta = "¿Cómo optimizar el embudo de conversión digital en Fincomercio para aumentar la apertura autogestionada de productos de inversión?";

  }else if(producto === "credito"){

    pregunta = "¿Qué ajustes en el modelo de scoring y desembolso de FincoGo son necesarios para igualar la inmediatez de las fintech y convertirlo en el crédito digital líder de nuestros asociados?";

  }else if(producto === "fincoeducar"){

    pregunta = "¿Qué fricciones debemos eliminar en el proceso de solicitud de crédito educativo para elevar el porcentaje de conversión autogestionada y optimizar la rentabilidad de la línea?";

  }else if(producto === "marketing"){

    pregunta = "¿Cómo podemos optimizar el ROI de nuestros canales de comunicación para asegurar que cada impacto digital se traduzca en una conversión efectiva del asociado?";

  }else if(producto === "seguros"){

    pregunta = "¿Qué estrategias de personalización y automatización permitirían acelerar el crecimiento del canal digital en la colocación de seguros para nuestros asociados?";

  }else if(producto === "servicios"){

    pregunta = "¿Cómo podemos transformar los hallazgos de nuestras encuestas de servicio en acciones concretas que garanticen una experiencia WOW y personalizada para cada asociado?";

  }else if(producto === "integral"){

    pregunta = "¿De qué manera te conviertes en un embajador del ecosistema digital para asegurar que ningún asociado se quede atrás en esta evolución?";

  }else if(producto === "conceptogerencial"){

    pregunta = "Como líder de la fuerza comercial, ¿cuál considera que debe ser la hoja de ruta para evolucionar hacia un ecosistema digital integral que no solo empodere a los equipos y potencie la rentabilidad, sino que preserve nuestro propósito de transformar comunidades y marcando la diferencia competitiva en el mercado?";
  }

  if(pregunta){
    hablar(pregunta);
  }
}

function hacerPregunta(pregunta){

  hablar(pregunta);

  const respuesta = document.getElementById("respuestaUsuario");
  respuesta.classList.remove("hidden");
}

function ocultarFincoBot(){

  const panel = document.getElementById("fincoBotPanel");

  if(panel){
    panel.classList.add("hidden");
    panel.style.display = "none";
  }
}

function mostrarOrganigrama(){

  const org = document.getElementById("organigrama");

  org.classList.remove("hidden");

  org.scrollIntoView({
    behavior: "smooth"
  });

}

function irPersona(persona){

  // Aquí conectas con tus secciones reales
  console.log("Seleccionó:", persona);

  // Ejemplo:
  // showSection('status');
}

function irOrganigrama(){

  const portada = document.getElementById("homeSection");

  // aplicar animación de salida
  portada.classList.add("fade-out");

  setTimeout(()=>{
    showSection("organigrama");
  },300);
}

function irPersona(persona){

  ocultarFincoBot();

  if(persona === "tatiana"){
    showSection("tatiana");
    setTimeout(() => {
      renderTatiana();
    }, 300);
  }

  else if(persona === "jennifer"){
    showSection("plan");
  }

  else if(persona === "valentina"){
    showSection("valentina");
    setTimeout(() => {
      renderGraficasValentina();
      renderTablaResumenCanalesValentina();
      renderTablaBrigadas();
      renderMapaValentina();
    }, 400);
  }

  else if(persona === "p2"){
    const url = "https://centrodeinnovacion.fincomercio.com/FastSoft/index";
    window.open(url, "_blank");
  }

  else if(persona === "p3"){
    showSection("p3");
  }

  else if(persona === "p7"){
    showSection("p7");
    setTimeout(() => {
      renderP7();
    }, 400);
  }

  else if(persona === "p8"){
  showSection("p8");
  setTimeout(() => {
    renderP8();
  }, 400);
}


const dataTatiana = {
  meses: ["mar-25", "abr-25", "may-25", "jun-25", "jul-25", "ago-25", "sep-25", "oct-25", "nov-25", "dic-25", "ene-26", "feb-26", "mar-26"],

  enviados: [128254, 99621, 84171, 63735, 112905, 123117, 106129, 125599, 309999, 274941, 177019, 175150, 199621],
  entregados: [65253, 85313, 73271, 50523, 91665, 99239, 87734, 98386, 244757, 205172, 141650, 110919, 160554],
  vistos: [44568, 59193, 49525, 33723, 63544, 67176, 61009, 64783, 162329, 143247, 100401, 74302, 103960] // ajustable
};


function renderTatiana(){
  document.getElementById("kpiTotal").innerText = "1.988.920";
  document.getElementById("kpiEntregado").innerText = "76,52%";
  document.getElementById("kpiVisto").innerText = "67,90%";


  new Chart(document.getElementById("chartComunicaciones"),{
    type:'bar',
    data:{
      labels:dataTatiana.meses,
      datasets:[
        {
          label:"Enviado",
          data:dataTatiana.enviados,
          backgroundColor:"#3b82f6"
        },
        {
          label:"Entregado",
          data:dataTatiana.entregados,
          backgroundColor:"#22c55e"
        },
        {
          label:"Visto",
          data:dataTatiana.vistos,
          backgroundColor:"#f59e0b"
        }
      ]
    },
      options:{
        responsive:true,
        maintainAspectRatio:false,

        plugins:{
          legend:{
            labels:{color:"white"}
          },

          title:{
            display:true,
            text:"Volumetría de Comunicaciones",
            color:"white",
            font:{
              size:16,
              weight:"bold"
            },
            padding:{
              top:10,
              bottom:20
            }
          }
        },

        scales:{
          x:{ticks:{color:"white"}},
          y:{ticks:{color:"white"}}
        }
      }
  });  
    new Chart(document.getElementById("chartPorcentajes"),{
    type:'line',
    data:{
      labels:dataTatiana.meses,
      datasets:[
        {
          label:"% Entregado",
          data:[32.17,35.32,38.26,34.89,57.76,51.55,46.89,50.43,46.50,70.92,49.29,49.87,50.50],
          borderColor:"#22c55e",
          tension:0.3
        },
        {
          label:"% Visto",
          data:[26.48,27.97,29.81,28.09,46.31,41.57,38.62,41.63,37.95,62.44,43.86,41.73,41.61],
          borderColor:"#3b82f6",
          tension:0.3
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      
        plugins:{
          legend:{
            labels:{color:"white"}
          },

          title:{
            display:true,
            text:"Efectividad de Comunicaciones (%)",
            color:"white",
            font:{
              size:16,
              weight:"bold"
            },
            padding:{
              top:10,
              bottom:20
            }
          }
        },

        scales:{
          x:{ticks:{color:"white"}},
          y:{ticks:{color:"white"}}
        }
      }
  });  

    new Chart(document.getElementById("chartCDAT"),{
    type:'bar',
    data:{
      labels:["mar-25", "abr-25", "may-25", "jun-25", "jul-25", "ago-25", "sep-25", "oct-25", "nov-25", "dic-25", "ene-26", "feb-26", "mar-26"],
      datasets:[
        {
          label:"Retorno Total",
          data:[132297066, -66400, -194880, 23926160, 33549360, 28202680, 14024080, 53070880, 680441661, 5675696, 25697983, 303101280, 56383200],
          backgroundColor:"#22c55e"
        },
        {
          label:"Costo",
          data:[204000, 66400, 194880, 373840, 450640, 572320, 975920, 1319120, 1191120, 1596480, 1040080, 898720, 1066800],
          backgroundColor:"#ef4444"
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{labels:{color:"white"}}},
      scales:{
        x:{ticks:{color:"white"}},
        y:{ticks:{color:"white"}}
      }
    }
  });

    new Chart(document.getElementById("chartPAP"),{
    type:'bar',
    data:{
      labels:["abr-25", "may-25", "jun-25", "jul-25", "ago-25", "sep-25", "oct-25", "nov-25", "dic-25", "ene-26", "feb-26", "mar-26"],
      datasets:[
        {
          label:"Retorno Total",
          data:[396120, 3595640, 68320, 2147760, 587360, -587760, -872720, 1080320, 3000000, 3240640],
          backgroundColor:"#22c55e"
        },
        {
          label:"Costo",
          data:[168880, 400560, 281680, 102240, 962640, 787760, 1572720, 1039680, 1600000, 1017360],
          backgroundColor:"#ef4444"
        }
      ]
    },
        options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{labels:{color:"white"}}},
      scales:{
        x:{ticks:{color:"white"}},
        y:{ticks:{color:"white"}}
      }
    }
  });
}

const dataValentina = {
  meses: ["mar-25", "abr-25", "may-25", "jun-25", "jul-25", "ago-25", "sep-25", "oct-25", "nov-25", "dic-25", "ene-26", "feb-26", "mar-26"],
  brigadasRegistradas: [53, 55, 97, 109, 60, 103, 163, 115, 96, 23, 15, 54, 81],
  brigadasRealizadas: [39, 43, 76, 81, 46, 78, 123, 96, 79, 17, 15, 50, 69],
  porcentajeEntregado: [32.17, 35.32, 38.26, 34.89, 57.76, 51.55, 46.89, 50.43, 46.50, 70.92, 49.29, 49.87, 50.50],
  porcentajeVisto: [26.48, 27.97, 29.81, 28.09, 46.31, 41.57, 38.62, 41.63, 37.95, 62.44, 43.86, 41.73, 41.61]
};

const dataFuerzaDirecta = [
  { nombre: "SERGIO CARVAJAL", brigadas: 46, costo: 3145000, creditos: 338402000, paps: 5943000, vinculaciones: 138 },
  { nombre: "MARIA FERNANDA GONZALEZ", brigadas: 46, costo: 499019, creditos: 106000000, paps: 4771000, vinculaciones: 102 },
  { nombre: "JISETH ORTIZ", brigadas: 75, costo: 1390000, creditos: 88400000, paps: 7264000, vinculaciones: 247 },
  { nombre: "SANDRA OSPINA", brigadas: 40, costo: 2870000, creditos: 71000000, paps: 2850000, vinculaciones: 97 },
  { nombre: "CLAUDIA OCTAVIO", brigadas: 46, costo: 1270000, creditos: 37200000, paps: 14506000, vinculaciones: 113 },
  { nombre: "ZULMA GOMEZ", brigadas: 32, costo: 1300000, creditos: 36800000, paps: 2992000, vinculaciones: 78 },
  { nombre: "DIEGO PACHECO", brigadas: 60, costo: 500000, creditos: 35140000, paps: 3450000, vinculaciones: 122 },
  { nombre: "KATHERINE HERNANDEZ", brigadas: 28, costo: 150000, creditos: 30000000, paps: 3550000, vinculaciones: 108 },
  { nombre: "ALEJANDRO CORREDOR", brigadas: 56, costo: 2290000, creditos: 22817000, paps: 4178000, vinculaciones: 87 },
  { nombre: "WILLIAM RIVERA", brigadas: 29, costo: 680000, creditos: 22000000, paps: 800000, vinculaciones: 14 }
];

let metricaActualValentina = "creditos";

function cambiarMetricaValentina(metrica) {
  metricaActualValentina = metrica;
  renderRankingValentina();
}

const dataTablaBrigadas = [
  { anio: 2025, mes: "marzo", brigadas: 53, costo: 0, creditos: 32900001, paps: 3250150, vinc: 91 },
  { anio: 2025, mes: "abril", brigadas: 55, costo: 0, creditos: 0, paps: 0, vinc: 0 },
  { anio: 2025, mes: "mayo", brigadas: 97, costo: 0, creditos: 144741000, paps: 13510000, vinc: 314 },
  { anio: 2025, mes: "junio", brigadas: 109, costo: 3388000, creditos: 26600200, paps: 6044000, vinc: 180 },
  { anio: 2025, mes: "julio", brigadas: 60, costo: 2120000, creditos: 3000001, paps: 968001, vinc: 37 },
  { anio: 2025, mes: "agosto", brigadas: 102, costo: 3310000, creditos: 46248959, paps: 4670000, vinc: 133 },
  { anio: 2025, mes: "septiembre", brigadas: 162, costo: 7370019, creditos: 88990000, paps: 15805051, vinc: 244 },
  { anio: 2025, mes: "octubre", brigadas: 115, costo: 4430000, creditos: 8400000, paps: 3483000, vinc: 128 },
  { anio: 2025, mes: "noviembre", brigadas: 95, costo: 3460000, creditos: 10000000, paps: 2312000, vinc: 64 },
  { anio: 2025, mes: "diciembre", brigadas: 23, costo: 300000, creditos: 3500000, paps: 100000, vinc: 81 },
  { anio: 2026, mes: "enero", brigadas: 15, costo: 150000, creditos: 13300000, paps: 3320000, vinc: 115 },
  { anio: 2026, mes: "febrero", brigadas: 54, costo: 385000, creditos: 277200000, paps: 7777000, vinc: 121 },
  { anio: 2026, mes: "marzo", brigadas: 81, costo: 1145000, creditos: 68774052, paps: 13626000, vinc: 273 }
];

function renderGraficasValentina() {
  document.getElementById("kpiTotalValentina").innerText = "1021";
  document.getElementById("kpiEntregadoValentina").innerText = "93.55%";
  document.getElementById("kpiVistoValentina").innerText = "6.45%";

  const canvasBar = document.getElementById("chartValentina");
  const canvasLine = document.getElementById("chartPorcentajesValentina");

  if (!canvasBar || !canvasLine) {
    console.error("No existen los canvas principales de Valentina");
    return;
  }

  if (chartValentinaInst) {
    chartValentinaInst.destroy();
    chartValentinaInst = null;
  }

  if (chartPorcentajesValentinaInst) {
    chartPorcentajesValentinaInst.destroy();
    chartPorcentajesValentinaInst = null;
  }

  chartValentinaInst = new Chart(canvasBar, {
    type: "bar",
    data: {
      labels: dataValentina.meses,
      datasets: [
        {
          label: "Brigadas Registradas",
          data: dataValentina.brigadasRegistradas,
          backgroundColor: "#3b82f6"
        },
        {
          label: "Brigadas Realizadas",
          data: dataValentina.brigadasRealizadas,
          backgroundColor: "#22c55e"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "white" }
        },
        title: {
          display: true,
          text: "Brigadas",
          color: "white",
          font: {
            size: 16,
            weight: "bold"
          },
          padding: {
            top: 10,
            bottom: 20
          }
        }
      },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });


  renderRankingValentina();
}

function renderRankingValentina() {
  const canvasRanking = document.getElementById("chartPorcentajesValentina");

  if (!canvasRanking) {
    console.error("No existe chartPorcentajesValentina");
    return;
  }

  if (chartPorcentajesValentinaInst) {
    chartPorcentajesValentinaInst.destroy();
    chartPorcentajesValentinaInst = null;
  }

  const dataOrdenada = [...dataFuerzaDirecta].sort((a, b) => b[metricaActualValentina] - a[metricaActualValentina]);

  const labels = dataOrdenada.map(d => d.nombre);
  const valores = dataOrdenada.map(d => d[metricaActualValentina]);

  const titulos = {
    creditos: "Top Ejecutivos por Créditos",
    paps: "Top Ejecutivos por PAPS",
    vinculaciones: "Top Ejecutivos por Vinculaciones",
    brigadas: "Top Ejecutivos por Brigadas",
    costo: "Top Ejecutivos por Costo"
  };

  chartPorcentajesValentinaInst = new Chart(canvasRanking, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: titulos[metricaActualValentina],
        data: valores,
        backgroundColor: "#3b82f6",
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: titulos[metricaActualValentina],
          color: "white",
          font: {
            size: 16,
            weight: "bold"
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;

              if (
                metricaActualValentina === "creditos" ||
                metricaActualValentina === "paps" ||
                metricaActualValentina === "costo"
              ) {
                return "$" + Number(value).toLocaleString("es-CO");
              }

              return Number(value).toLocaleString("es-CO");
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "white",
            callback: function(value) {
              return Number(value).toLocaleString("es-CO");
            }
          }
        },
        y: {
          ticks: {
            color: "white"
          }
        }
      }
    }
});
}

function renderMapaValentina() {
  const mapContainer = document.getElementById("mapColombia");

  if (!mapContainer) {
    console.error("No existe mapColombia");
    return;
  }

  if (mapaValentina) {
    mapaValentina.remove();
    mapaValentina = null;
  }

  mapaValentina = L.map("mapColombia").setView([4.5709, -74.2973], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(mapaValentina);

  const puntos = [
    { ciudad: "Bogotá", lat: 4.7110, lng: -74.0721, valor: 667 },
    { ciudad: "Medellín", lat: 6.2442, lng: -75.5812, valor: 76 },
    { ciudad: "Cali", lat: 3.4516, lng: -76.5320, valor: 27 },
    { ciudad: "Barranquilla", lat: 10.9639, lng: -74.7964, valor: 7 },
    { ciudad: "Soacha", lat: 4.5794, lng: -74.2168, valor: 3 },
    { ciudad: "Chía", lat: 4.8612, lng: -74.0327, valor: 3 },
    { ciudad: "Funza", lat: 4.7164, lng: -74.2110, valor: 4 },
    { ciudad: "Neiva", lat: 2.9273, lng: -75.2819, valor: 2 },
    { ciudad: "Pereira", lat: 4.8133, lng: -75.6961, valor: 2 },
    { ciudad: "Tunja", lat: 5.5353, lng: -73.3678, valor: 2 },
    { ciudad: "Villavicencio", lat: 4.1420, lng: -73.6266, valor: 2 },
    { ciudad: "Bucaramanga", lat: 7.1193, lng: -73.1227, valor: 1 },
    { ciudad: "Cartagena", lat: 10.3910, lng: -75.4794, valor: 1 },
    { ciudad: "Cota", lat: 4.8094, lng: -74.0980, valor: 1 },
    { ciudad: "Ibagué", lat: 4.4389, lng: -75.2322, valor: 1 },
    { ciudad: "Mosquera", lat: 4.7059, lng: -74.2302, valor: 1 },
    { ciudad: "Tocancipá", lat: 4.9667, lng: -73.9167, valor: 1 }
  ];

puntos.forEach(p => {
  const radio = Math.max(4, Math.min(30, Math.sqrt(p.valor) * 2.2));

  L.circleMarker([p.lat, p.lng], {
    radius: radio,
    fillColor: "#22c55e",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  })
  .addTo(mapaValentina)
  .bindPopup(`
    <strong>${p.ciudad}</strong><br>
    Brigadas: ${p.valor}
  `);
});

  setTimeout(() => {
    mapaValentina.invalidateSize();
  }, 300);
}

function renderTablaBrigadas() {
  const tbody = document.getElementById("tablaBrigadasBody");

  if (!tbody) {
    console.error("No existe tablaBrigadasBody");
    return;
  }

  tbody.innerHTML = "";

  dataTablaBrigadas.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.anio}</td>
      <td>${row.mes}</td>
      <td>${row.brigadas.toLocaleString("es-CO")}</td>
      <td>$${row.costo.toLocaleString("es-CO")}</td>
      <td>$${row.creditos.toLocaleString("es-CO")}</td>
      <td>$${row.paps.toLocaleString("es-CO")}</td>
      <td>${row.vinc.toLocaleString("es-CO")}</td>
    `;

    tbody.appendChild(tr);
  });
}

const dataP7Mensual = {
  labels: [
    "ene-24","feb-24","mar-24","abr-24","may-24","jun-24","jul-24","ago-24","sep-24","oct-24","nov-24","dic-24",
    "ene-25","feb-25","mar-25","abr-25","may-25","jun-25","jul-25","ago-25","sep-25","oct-25","nov-25","dic-25",
    "ene-26","feb-26","mar-26"
  ],
  valores: [
    72,338,340,148,142,112,116,53,58,66,70,60,
    83,38,24,22,14,14,21,14,12,5,11,9,
    6,7,36
  ]
};

const dataP7Motivos = {
  labels: [
    "Acceso Denegado/Bloqueado",
    "Incidencia Autenticación Truora",
    "Incidencia usuario",
    "Usuario portal/App carácter especial",
    "Incidencia herramientas agencia virtual",
    "Usuario Inactivo",
    "Compras Tienda Virtual",
    "Uso exclusivo fincoeducar/virtual",
    "Solicitud excepción portal",
    "Soporte Autenticación Truora Crédito Digital",
    "Gestión AECSA",
    "Identificación ticket errada",
    "Aclaración débito automático",
    "Asociado interesado en crédito",
    "Información/Aclaración boletería",
    "Reenvío Boletería",
    "Sugerencia"
  ],
  valores: [769,452,402,112,46,42,27,16,8,7,3,2,1,1,1,1,1]
};

const dataP7Medio = {
  labels: [
    "Call Center",
    "Portal Web",
    "Carta",
    "Personalizado",
    "Asesor Comercial",
    "Teléfono",
    "Banca Virtual",
    "E-Mail",
    "FincoMovil",
    "Proceso Interno"
  ],
  valores: [1378,233,111,90,44,12,9,7,4,3]
};

function obtenerKPIsP7() {
  const totalGeneral = dataP7Mensual.valores.reduce((acc, val) => acc + val, 0);

  const total2024 = dataP7Mensual.valores.slice(0, 12).reduce((acc, val) => acc + val, 0);
  const total2025 = dataP7Mensual.valores.slice(12, 24).reduce((acc, val) => acc + val, 0);
  const total2026YTD = dataP7Mensual.valores.slice(24, 27).reduce((acc, val) => acc + val, 0);
  const total2024YTD = dataP7Mensual.valores.slice(0, 3).reduce((acc, val) => acc + val, 0);

  const var2025vs2024 = ((total2025 - total2024) / total2024) * 100;
  const varActualvs2024 = ((total2026YTD - total2024YTD) / total2024YTD) * 100;

  return {
    totalGeneral,
    total2024,
    total2025,
    total2026YTD,
    total2024YTD,
    var2025vs2024,
    varActualvs2024
  };
}

function renderP7() {
  const kpis = obtenerKPIsP7();

  const kpiTotal = document.getElementById("kpiTotalP7");
  const kpiVar2025 = document.getElementById("kpiVar2025P7");
  const kpiVarActual = document.getElementById("kpiVarActualP7");
  const insightsBox = document.getElementById("insightsP7");

  if (!kpiTotal || !kpiVar2025 || !kpiVarActual) {
    console.error("No existen los KPIs de p7");
    return;
  }

  kpiTotal.innerText = kpis.totalGeneral.toLocaleString("es-CO");
  kpiVar2025.innerText = `${kpis.var2025vs2024.toFixed(1)}%`;
  kpiVarActual.innerText = `${kpis.varActualvs2024.toFixed(1)}%`;

  renderGraficaP7Mensual();
  renderGraficaP7Motivos();
  renderGraficaP7Medio();

  if (insightsBox) {
    insightsBox.innerHTML = `
      <strong>Insights Clave:</strong><br><br>

      • El volumen total acumulado de casos ROM es de <strong>${kpis.totalGeneral.toLocaleString("es-CO")}</strong>, con una concentración muy marcada en 2024, especialmente en febrero y marzo, donde se observan los picos más altos de la serie.<br><br>

      • En 2025 se evidencia una reducción de <strong>${kpis.var2025vs2024.toFixed(1)}%</strong> frente al total de 2024, lo que muestra una caída importante del volumen operativo asociado a ROM.<br><br>

      • Los motivos están altamente concentrados en pocas tipologías, principalmente <strong>Acceso Denegado/Bloqueado</strong>, <strong>Incidencia Autenticación Truora</strong> e <strong>Incidencia usuario</strong>, mientras que el canal dominante de recepción es <strong>Call Center</strong>, muy por encima del resto.
    `;
  }
}

function renderGraficaP7Mensual() {
  const canvas = document.getElementById("chartP7Mensual");
  if (!canvas) {
    console.error("No existe chartP7Mensual");
    return;
  }

  if (chartP7MensualInst) {
    chartP7MensualInst.destroy();
    chartP7MensualInst = null;
  }

  chartP7MensualInst = new Chart(canvas, {
    type: "bar",
    data: {
      labels: dataP7Mensual.labels,
      datasets: [{
        label: "Total Casos ROM por mes",
        data: dataP7Mensual.valores,
        backgroundColor: "#3b82f6"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "white" }
        },
        title: {
          display: true,
          text: "Total Casos ROM por mes",
          color: "white",
          font: {
            size: 16,
            weight: "bold"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

function renderGraficaP7Motivos() {
  const canvas = document.getElementById("chartP7Motivos");
  if (!canvas) {
    console.error("No existe chartP7Motivos");
    return;
  }

  if (chartP7MotivosInst) {
    chartP7MotivosInst.destroy();
    chartP7MotivosInst = null;
  }

  chartP7MotivosInst = new Chart(canvas, {
    type: "bar",
    data: {
      labels: dataP7Motivos.labels,
      datasets: [{
        label: "ROM Radicados por Tipo de Motivo",
        data: dataP7Motivos.valores,
        backgroundColor: "#22c55e",
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "ROM Radicados por Tipo de Motivo",
          color: "white",
          font: {
            size: 16,
            weight: "bold"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

function renderGraficaP7Medio() {
  const canvas = document.getElementById("chartP7Medio");
  if (!canvas) {
    console.error("No existe chartP7Medio");
    return;
  }

  if (chartP7MedioInst) {
    chartP7MedioInst.destroy();
    chartP7MedioInst = null;
  }

  chartP7MedioInst = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: dataP7Medio.labels,
      datasets: [{
        label: "Detalle Medio de Recepción",
        data: dataP7Medio.valores,
        backgroundColor: [
          "#3b82f6",
          "#1d4ed8",
          "#f97316",
          "#7e22ce",
          "#ec4899",
          "#8b5cf6",
          "#eab308",
          "#ef4444",
          "#14b8a6",
          "#22c55e"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { color: "white" }
        },
        title: {
          display: true,
          text: "Detalle Medio de Recepción",
          color: "white",
          font: {
            size: 16,
            weight: "bold"
          }
        }
      }
    }
  });
}
}


const kpisP8 = {
  totalEncuestas: 1040,
  contactosAdicionales: 28.27,
  claridad: 3.74,
  conocimiento: 3.77,
  disposicion: 3.85,
  tiempoRespuesta: 3.66,
  recomendacionCanal: 7.61,
  recomendacionServicio: 7.72
};

const dataP8PromediosCanal = [
  {
    canal: "CALL DE VENTA",
    claridad: 4.13,
    conocimiento: 4.15,
    disponibilidad: 4.18,
    tiempoRespuesta: 4.04,
    recomendacionServicio: 8.67,
    recomendacionCanales: 8.54
  },
  {
    canal: "OFICINA VIRTUAL",
    claridad: 3.85,
    conocimiento: 3.88,
    disponibilidad: 3.94,
    tiempoRespuesta: 3.75,
    recomendacionServicio: 7.31,
    recomendacionCanales: 7.34
  },
  {
    canal: "LINEA AZUL IN HOUSE",
    claridad: 3.47,
    conocimiento: 3.53,
    disponibilidad: 3.59,
    tiempoRespuesta: 3.38,
    recomendacionServicio: 7.23,
    recomendacionCanales: 7.10
  },
  {
    canal: "LÍNEA AZUL",
    claridad: 3.41,
    conocimiento: 3.44,
    disponibilidad: 3.57,
    tiempoRespuesta: 3.36,
    recomendacionServicio: 7.05,
    recomendacionCanales: 6.91
  }
];

const dataP8Contacto = {
  labels: ["NO", "SI"],
  valores: [746, 294]
};

const dataP8PercepcionResumen = [
  { percepcion: "Neutra", total: 735, porcentaje: 70.67 },
  { percepcion: "Buena", total: 253, porcentaje: 24.33 },
  { percepcion: "Mala", total: 52, porcentaje: 5.00 }
];

const dataP8PercepcionCanal = [
  { canal: "CALL DE VENTA", buena: 27.86, mala: 2.34, neutra: 69.79, total: 100.00 },
  { canal: "LÍNEA AZUL", buena: 23.38, mala: 6.46, neutra: 70.15, total: 100.00 },
  { canal: "LINEA AZUL IN HOUSE", buena: 17.37, mala: 7.98, neutra: 74.65, total: 100.00 },
  { canal: "OFICINA VIRTUAL", buena: 27.97, mala: 4.24, neutra: 67.80, total: 100.00 }
];

const dataP8PercepcionMensual = {
  labels: ["2024", "2025", "2026"],
  buena: [15.79, 23.71, 29.24],
  mala: [2.63, 5.42, 3.51]
};

function renderTablaP8Promedios() {
  const tbody = document.getElementById("tablaP8PromediosBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  dataP8PromediosCanal.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.canal}</td>
      <td>${row.claridad.toFixed(2).replace(".", ",")}</td>
      <td>${row.conocimiento.toFixed(2).replace(".", ",")}</td>
      <td>${row.disponibilidad.toFixed(2).replace(".", ",")}</td>
      <td>${row.tiempoRespuesta.toFixed(2).replace(".", ",")}</td>
      <td>${row.recomendacionServicio.toFixed(2).replace(".", ",")}</td>
      <td>${row.recomendacionCanales.toFixed(2).replace(".", ",")}</td>
    `;
    tbody.appendChild(tr);
  });

  const trTotal = document.createElement("tr");
  trTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td><strong>3,73</strong></td>
    <td><strong>3,77</strong></td>
    <td><strong>3,84</strong></td>
    <td><strong>3,66</strong></td>
    <td><strong>7,71</strong></td>
    <td><strong>7,60</strong></td>
  `;
  tbody.appendChild(trTotal);
}

function renderTablaP8Percepcion() {
  const tbody = document.getElementById("tablaP8PercepcionBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  dataP8PercepcionResumen.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.percepcion}</td>
      <td>${row.total.toLocaleString("es-CO")}</td>
      <td>${row.porcentaje.toFixed(2).replace(".", ",")} %</td>
    `;
    tbody.appendChild(tr);
  });

  const trTotal = document.createElement("tr");
  trTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td><strong>1040</strong></td>
    <td><strong>100,00 %</strong></td>
  `;
  tbody.appendChild(trTotal);
}

function renderTablaP8CanalPercepcion() {
  const tbody = document.getElementById("tablaP8CanalPercepcionBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  dataP8PercepcionCanal.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.canal}</td>
      <td>${row.buena.toFixed(2).replace(".", ",")} %</td>
      <td>${row.mala.toFixed(2).replace(".", ",")} %</td>
      <td>${row.neutra.toFixed(2).replace(".", ",")} %</td>
      <td>${row.total.toFixed(2).replace(".", ",")} %</td>
    `;
    tbody.appendChild(tr);
  });

  const trTotal = document.createElement("tr");
  trTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td><strong>24,33 %</strong></td>
    <td><strong>5,00 %</strong></td>
    <td><strong>70,67 %</strong></td>
    <td><strong>100,00 %</strong></td>
  `;
  tbody.appendChild(trTotal);
}

function renderGraficaP8Contacto() {
  const canvas = document.getElementById("chartP8Contacto");
  if (!canvas) return;

  if (chartP8ContactoInst) {
    chartP8ContactoInst.destroy();
    chartP8ContactoInst = null;
  }

  chartP8ContactoInst = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: dataP8Contacto.labels,
      datasets: [{
        data: dataP8Contacto.valores,
        backgroundColor: ["#3b82f6", "#1d4ed8"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { color: "white" }
        },
        title: {
          display: true,
          text: "¿Requirió de otro contacto para resolver la misma consulta?",
          color: "white",
          font: {
            size: 16,
            weight: "bold"
          }
        }
      }
    }
  });
}

function renderGraficaP8PercepcionMensual() {
  const canvas = document.getElementById("chartP8PercepcionMensual");
  if (!canvas) return;

  if (chartP8PercepcionMensualInst) {
    chartP8PercepcionMensualInst.destroy();
    chartP8PercepcionMensualInst = null;
  }

  chartP8PercepcionMensualInst = new Chart(canvas, {
    type: "line",
    data: {
      labels: dataP8PercepcionMensual.labels,
      datasets: [
        {
          label: "% Percepción Buena Mensual",
          data: dataP8PercepcionMensual.buena,
          borderColor: "#22c55e",
          tension: 0.3
        },
        {
          label: "% Percepción Mala Mensual",
          data: dataP8PercepcionMensual.mala,
          borderColor: "#ef4444",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "white" }
        },
        title: {
          display: true,
          text: "% Percepción Buena y Mala Mensual",
          color: "white",
          font: {
            size: 16,
            weight: "bold"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: {
            color: "white",
            callback: function(value) {
              return value + "%";
            }
          }
        }
      }
    }
  });
}

function renderP8() {
  document.getElementById("kpiTotalP8").innerText = kpisP8.totalEncuestas.toLocaleString("es-CO");
  document.getElementById("kpiContactosP8").innerText = kpisP8.contactosAdicionales.toFixed(2).replace(".", ",");
  document.getElementById("kpiClaridadP8").innerText = kpisP8.claridad.toFixed(2).replace(".", ",");
  document.getElementById("kpiConocimientoP8").innerText = kpisP8.conocimiento.toFixed(2).replace(".", ",");
  document.getElementById("kpiDisposicionP8").innerText = kpisP8.disposicion.toFixed(2).replace(".", ",");
  document.getElementById("kpiTiempoP8").innerText = kpisP8.tiempoRespuesta.toFixed(2).replace(".", ",");
  document.getElementById("kpiRecCanalP8").innerText = kpisP8.recomendacionCanal.toFixed(2).replace(".", ",");
  document.getElementById("kpiRecServicioP8").innerText = kpisP8.recomendacionServicio.toFixed(2).replace(".", ",");

  renderTablaP8Promedios();
  renderTablaP8Percepcion();
  renderTablaP8CanalPercepcion();
  renderGraficaP8Contacto();
  renderGraficaP8PercepcionMensual();

  const insightsBox = document.getElementById("insightsP8");
  if (insightsBox) {
    insightsBox.innerHTML = `
      <strong>Insights Clave:</strong><br><br>

      • El volumen total de encuestas fue de <strong>1.040</strong>, con una calificación general sólida en variables de experiencia, destacándose <strong>Disposición (3,85)</strong> como el mejor atributo y <strong>Tiempo de Respuesta (3,66)</strong> como el principal frente de mejora.<br><br>

      • La operación muestra una carga relevante de reiteración de contacto: <strong>28,27%</strong> de los casos sí requirió un contacto adicional, lo que sugiere oportunidad para fortalecer resolución en primer contacto y consistencia en la información entregada.<br><br>

      • La percepción general del servicio está dominada por la categoría <strong>Neutra (70,67%)</strong>, mientras la percepción <strong>Buena (24,33%)</strong> supera ampliamente a la <strong>Mala (5,00%)</strong>. Esto indica una experiencia estable, pero todavía con espacio importante para mover usuarios desde neutralidad hacia satisfacción positiva.<br><br>

      • En la evolución temporal, la <strong>percepción buena</strong> muestra una tendencia creciente de <strong>15,79%</strong> en 2024 a <strong>29,24%</strong> en 2026, mientras la <strong>percepción mala</strong> se mantiene controlada y baja a <strong>3,51%</strong> en 2026. Además, <strong>Call de Venta</strong> y <strong>Oficina Virtual</strong> presentan los mejores resultados relativos frente a Línea Azul y Línea Azul In House.
    `;
  }
}

const dataEvolucionProyectos = [
  {
    proyecto: "FINCOEDUCAR",
    anio: 2020,
    mes: "",
    mejora: "Creación de aplicativo para renovación de créditos educativos",
    observacion: "Creación de un aplicativo autogestionable exclusivo para la renovación de créditos, optimizando, agilizando y centralizando el proceso para los asociados."
  },
  {
    proyecto: "FINCOEDUCAR",
    anio: 2021,
    mes: "",
    mejora: "Solicitud de crédito educativo por primera vez",
    observacion: "Se habilita la solicitud de crédito educativo por primera vez mediante un flujo claro y eficiente, tanto en autogestión como con acompañamiento del asesor."
  },
  {
    proyecto: "FINCOEDUCAR",
    anio: 2022,
    mes: "",
    mejora: "Implementación de garantía desmaterializada Deceval",
    observacion: "Se digitaliza la constitución, gestión y custodia de garantías, eliminando procesos físicos y optimizando tiempos operativos."
  },
  {
    proyecto: "FINCOEDUCAR",
    anio: 2023,
    mes: "",
    mejora: "Mejoras de UX en formulario flujo completo",
    observacion: "Optimización de experiencia de usuario mediante navegación más intuitiva, menos fricciones, validaciones en línea y mensajes más claros."
  },
  {
    proyecto: "FINCOEDUCAR",
    anio: 2024,
    mes: "",
    mejora: "Implementación de aval y marca blanca",
    observacion: "Se implementa funcionalidad de aval y marca blanca como parte de la evolución del producto."
  },
  {
    proyecto: "FINCOEDUCAR",
    anio: 2025,
    mes: "",
    mejora: "Línea Alianza por la Educación y mejoras de UX",
    observacion: "Se habilita una nueva oferta de crédito educativo con beneficios específicos, acompañada de mejoras de experiencia y conversión."
  },
  {
    proyecto: "FINCOEDUCAR",
    anio: 2026,
    mes: "",
    mejora: "Mejora de aceptación de condiciones",
    observacion: "Se optimiza la claridad, trazabilidad y experiencia del usuario durante la aceptación de condiciones, alineado a normatividad."
  },

  {
    proyecto: "PORTAL JURIDICO",
    anio: 2024,
    mes: "",
    mejora: "Levantamiento documental y pruebas fase 1",
    observacion: "Inicio de pruebas de la primera etapa del Portal Jurídico y marcha blanca con dos empresas para validar funcionamiento y estabilidad."
  },
  {
    proyecto: "PORTAL JURIDICO",
    anio: 2025,
    mes: "",
    mejora: "Pruebas de pago de nómina masivo",
    observacion: "Validación del detalle de movimientos, conciliación de información y trazabilidad de transacciones."
  },
  {
    proyecto: "PORTAL JURIDICO",
    anio: 2026,
    mes: "",
    mejora: "Pruebas de aumento de monto para PSE e interbancarias",
    observacion: "Se validan nuevos montos y el correcto procesamiento, conciliación y actualización de condiciones del crédito."
  },

  {
    proyecto: "FINCOGO",
    anio: 2023,
    mes: "",
    mejora: "Mejoras en aceptación, retoma, anulación y libranza digital",
    observacion: "Se optimizan procesos clave del producto digital para mejorar eficiencia y experiencia del usuario."
  },
  {
    proyecto: "FINCOGO",
    anio: 2024,
    mes: "1-2 PERIODO",
    mejora: "Cargue de desprendibles y optimización de pagaré",
    observacion: "Se implementa el cargue de desprendibles de nómina y se optimiza la aceptación de condiciones y firma del pagaré, además de ajustes de políticas de monto, plazo y nombre del producto."
  },
  {
    proyecto: "FINCOGO",
    anio: 2025,
    mes: "1-2 PERIODO",
    mejora: "Modelo de riesgo, flujo autogestionado e IA",
    observacion: "Se fortalece el modelo de riesgo, se implementan filtros duros, se habilita flujo autogestionado, validación de identidad e integración de IA para extracción de datos de desprendibles."
  },
  {
    proyecto: "FINCOGO",
    anio: 2026,
    mes: "",
    mejora: "Paso a producción IA y control de flujo de caja",
    observacion: "Fase previa a producción con IA para análisis de desprendibles y mejoras de control en flujo de caja y aceptación de condiciones."
  },

  {
    proyecto: "FORMULARIO VIRTUAL",
    anio: 2025,
    mes: "",
    mejora: "Inicio de evolución del Formulario Virtual",
    observacion: "Proyecto en etapa inicial de evolución funcional dentro del ecosistema digital."
  },
  {
    proyecto: "FORMULARIO VIRTUAL",
    anio: 2026,
    mes: "ABRIL",
    mejora: "Fase 3: mejoras de campos, aceptación y retoma",
    observacion: "Se optimizan campos del formulario, aceptación de condiciones y se habilita retomar/modificar el formulario."
  },

  {
    proyecto: "PAP GAMIFICADA",
    anio: 2024,
    mes: "OCTUBRE",
    mejora: "Salida a producción primer versión",
    observacion: "Se realiza salida a producción con la primera versión de integración de PAP en la Vinculación Gamificada para facilitar que el asociado se vincule y en la misma experiencia aperture ahorro."
  },
  {
    proyecto: "PAP GAMIFICADA",
    anio: 2025,
    mes: "DICIEMBRE",
    mejora: "Unificación de experiencia PAP Digital",
    observacion: "Se realiza integración embebida con PAP Digital para que, al finalizar la vinculación gamificada, el asociado pueda abrir un ahorro adicional sin salir de la experiencia."
  },
  {
    proyecto: "PAP GAMIFICADA",
    anio: 2026,
    mes: "ABRIL",
    mejora: "Mejora de experiencia web y apertura de PAP en Vinculación Gamificada",
    observacion: "Se trabaja en mejorar la experiencia web para hacer más clara e intuitiva la apertura y modificación de ahorros, integrando el flujo con la vinculación gamificada."
  },

  {
    proyecto: "TIENDA VIRTUAL",
    anio: 2024,
    mes: "",
    mejora: "Entrega primer versión PMO",
    observacion: "Se sale a producción con la primera versión de la tienda y la PMO realiza la entrega oficial para la administración a Canal Virtual."
  },
  {
    proyecto: "TIENDA VIRTUAL",
    anio: 2025,
    mes: "PRIMER SEMESTRE",
    mejora: "Mejora e inclusión medio de pago",
    observacion: "Se mejora la interfaz gráfica de la tienda y se incluye PSE como medio de pago para compras dentro de la misma."
  },
  {
    proyecto: "TIENDA VIRTUAL",
    anio: 2025,
    mes: "SEGUNDO SEMESTRE",
    mejora: "Nuevos convenios",
    observacion: "Se incluyeron nuevos convenios que pueden ser cotizados directamente por los asociados."
  },
  {
    proyecto: "TIENDA VIRTUAL",
    anio: 2026,
    mes: "ENE-ABR",
    mejora: "Mejoras",
    observacion: "Integración de medios de pago con tarjeta de crédito e integración del flujo de crédito directo con cupos aprobados y creación de flujo de venta."
  },
  {
    proyecto: "TIENDA VIRTUAL",
    anio: 2026,
    mes: "ABR-DIC",
    mejora: "Mejoras",
    observacion: "Creación de módulo de notificaciones automáticas para marketing y remarketing, definición del flujo de crédito directo y mejora de experiencia en compra con cupos aprobados."
  },

  {
    proyecto: "FINCOMOVIL",
    anio: 2016,
    mes: "",
    mejora: "Primer versión aplicación móvil",
    observacion: "Sale la primera versión de la aplicación móvil con funcionalidad de consulta de saldos."
  },
  {
    proyecto: "FINCOMOVIL",
    anio: 2025,
    mes: "ENERO",
    mejora: "FINCOMOVIL 3.0",
    observacion: "Nuevo diseño de interfaz gráfica, creación de bolsillos e incorporación de la opción de tarjeta de crédito directamente desde la app."
  },
  {
    proyecto: "FINCOMOVIL",
    anio: 2026,
    mes: "ABRIL",
    mejora: "MONITOR",
    observacion: "Proyecto registrado en fase 2026 dentro de la evolución de FincoMóvil."
  }
];

function renderKPIsEvolucionProyectos() {
  const proyectosUnicos = [...new Set(dataEvolucionProyectos.map(d => d.proyecto))];
  const anios = dataEvolucionProyectos.map(d => d.anio);

  document.getElementById("kpiProyectosTotal").innerText = proyectosUnicos.length;
  document.getElementById("kpiAnioInicio").innerText = Math.min(...anios);
  document.getElementById("kpiAnioActual").innerText = Math.max(...anios);
  document.getElementById("kpiMejorasTotal").innerText = dataEvolucionProyectos.length;
}
function renderFiltrosTimelineProductos() {
  const container = document.getElementById("productosTimelineFilters");
  if (!container) return;

  container.innerHTML = "";

  const productos = [...new Set(dataEvolucionProyectos.map(d => d.proyecto))];

  productos.forEach(producto => {
    const btn = document.createElement("button");
    btn.className = `timeline-chip ${producto === productoTimelineActivo ? "active" : ""}`;
    btn.textContent = producto;
    btn.onclick = () => {
      productoTimelineActivo = producto;
      renderFiltrosTimelineProductos();
      renderTimelineProducto(producto);
    };
    container.appendChild(btn);
  });
}

function renderTimelineProducto(producto) {
  const yearsRow = document.getElementById("timelineYearsRow");
  const roadContainer = document.getElementById("timelineRoadContainer");
  const resumen = document.getElementById("timelineProductoResumen");
  const titulo = document.getElementById("timelineProductoTitulo");
  const insights = document.getElementById("insightsEvolucionProyectos");

  if (!yearsRow || !roadContainer || !resumen || !titulo || !insights) return;

  const registros = dataEvolucionProyectos
    .filter(d => d.proyecto === producto)
    .sort((a, b) => a.anio - b.anio);

  const anios = [...new Set(registros.map(r => r.anio))];

  yearsRow.innerHTML = "";
  roadContainer.innerHTML = "";

  anios.forEach(anio => {
    const badge = document.createElement("div");
    badge.className = "timeline-year-badge";
    badge.textContent = anio;
    yearsRow.appendChild(badge);

    const columna = document.createElement("div");
    columna.className = "timeline-column";

    const eventos = registros.filter(r => r.anio === anio);

    columna.innerHTML = `
      <div class="timeline-node"></div>
      <div class="timeline-cards">
        ${eventos.map(ev => `
          <div class="timeline-event-card">
            <div class="timeline-month">${ev.mes || "Hito del año"}</div>
            <h4>${ev.mejora}</h4>
            <p>${ev.observacion}</p>
          </div>
        `).join("")}
      </div>
    `;

    roadContainer.appendChild(columna);
  });

  const inicio = Math.min(...anios);
  const ultimo = Math.max(...anios);
  const hitos = registros.length;

  titulo.textContent = producto;

  resumen.innerHTML = `
    <span class="summary-kpi">Inicio: ${inicio}</span>
    <span class="summary-kpi">Último hito: ${ultimo}</span>
    <span class="summary-kpi">Hitos: ${hitos}</span>
    <br><br>
    <strong>Lectura evolutiva:</strong><br>
    ${buildResumenProductoTimeline(producto, registros)}
  `;

  insights.innerHTML = `
    <strong>Insights Clave:</strong><br><br>
    ${buildInsightsProductoTimeline(producto, registros)}
  `;
}

function buildResumenProductoTimeline(producto, registros) {
  const ultimo = registros[registros.length - 1];
  const primero = registros[0];

  return `
    ${producto} muestra una evolución desde <strong>${primero.anio}</strong> hasta <strong>${ultimo.anio}</strong>,
    pasando de hitos iniciales de habilitación o salida a producción hacia mejoras más maduras en experiencia,
    integración, automatización o escalabilidad. El foco reciente se concentra en
    <strong>${ultimo.mejora}</strong>, lo que evidencia continuidad del producto dentro del ecosistema digital.
  `;
}

function buildInsightsProductoTimeline(producto, registros) {
  const hitos = registros.length;
  const primero = registros[0];
  const ultimo = registros[registros.length - 1];

  const insight1 = `• <strong>${producto}</strong> registra <strong>${hitos} hitos</strong> documentados entre <strong>${primero.anio}</strong> y <strong>${ultimo.anio}</strong>, lo que evidencia una evolución sostenida y no un esfuerzo aislado.<br><br>`;

  const insight2 = `• La trayectoria del producto muestra una secuencia clara: primero habilitación o salida inicial, luego optimización funcional y finalmente mejoras orientadas a experiencia, integración o eficiencia operativa.<br><br>`;

  const insight3 = `• El hito más reciente está concentrado en <strong>${ultimo.anio}</strong> con la mejora <strong>${ultimo.mejora}</strong>, lo que confirma que el producto sigue activo dentro del roadmap digital.<br><br>`;

  let insight4 = `• A nivel estratégico, ${producto} refleja una madurez creciente dentro del canal digital, con avances que fortalecen la propuesta de valor, la usabilidad y la continuidad del proceso para el usuario.<br><br>`;

  let insight5 = `• Esta línea de tiempo permite visualizar no solo qué se hizo, sino cómo el producto ha venido construyendo capacidades digitales año tras año, facilitando conversación ejecutiva sobre impacto y próximos pasos.`;

  if (producto.includes("FINCOGO")) {
    insight4 = `• En ${producto} se observa una evolución especialmente fuerte hacia automatización, validaciones, riesgo e inteligencia artificial, lo que lo convierte en uno de los productos más transformacionales del portafolio.<br><br>`;
  }

  if (producto.includes("PAP")) {
    insight4 = `• En ${producto} se percibe una línea de evolución centrada en integración de experiencia, reducción de fricción y continuidad del journey digital del asociado.<br><br>`;
  }

  if (producto.includes("TIENDA")) {
    insight4 = `• En ${producto} la evolución está marcada por expansión funcional: medios de pago, convenios, crédito directo y experiencia comercial, aumentando su potencial de negocio.<br><br>`;
  }

  if (producto.includes("FINCOMOVIL")) {
    insight4 = `• En ${producto} la evolución es representativa de madurez digital: pasó de una versión básica transaccional a mejoras de interfaz, bolsillos y nuevas capacidades dentro de la app.<br><br>`;
  }

  return insight1 + insight2 + insight3 + insight4 + insight5;
}

function renderEvolucionProyectos() {
  renderKPIsEvolucionProyectos();
  renderFiltrosTimelineProductos();
  renderTimelineProducto(productoTimelineActivo);
}


function abrirEvolucionProyectos(btn) {
  showSection("evolucionProyectos", btn);
  setTimeout(() => {
    renderEvolucionProyectos();
  }, 200);
}


const fincoEducarSocioData = {
  genero: {
    labels: ["Femenino", "Masculino"],
    montos: [7993311115, 6285419614],
    porcentajes: [56.88, 43.12]
  },

  edad: {
    labels: ["19-25 años", "31-38 años", "26-30 años", "39-45 años", "46-60 años", "Más de 60 años", "0-18 años"],
    cantidades: [4053, 3259, 3228, 1314, 727, 97, 25]
  },

  programa: {
    labels: [
      "Pregrado",
      "Posgrado/Especialización",
      "Diplomado",
      "Curso de Idiomas",
      "Pregrado matrícula > 10.000.000",
      "Programas en el exterior",
      "Colegios"
    ],
    cantidades: [9029, 2828, 315, 236, 224, 55, 16],
    porcentajes: [71.08, 22.26, 2.48, 1.86, 1.76, 0.43, 0.13]
  },

  universidades: [
    { nombre: "POLITECNICO GRANCOLOMBIANO", cantidad: 5023, monto: 4568538743 },
    { nombre: "ESC COLOMBIANA CARRER IND-ECCI", cantidad: 384, monto: 819388835 },
    { nombre: "CORP UNIVERSITARIA-UNIMINUTO", cantidad: 1198, monto: 809119878 },
    { nombre: "UNIVERSIDAD ANTONIO NARIÑO", cantidad: 375, monto: 516948779 },
    { nombre: "FUNDACION UNIV DEL AREA ANDINA", cantidad: 484, monto: 494474975 },
    { nombre: "UNIVERSIDAD SANTO TOMAS", cantidad: 303, monto: 446610222 },
    { nombre: "FUNDACION UNIVERSIDAD CENTRAL", cantidad: 203, monto: 406655215 },
    { nombre: "UNIAGUSTINIANA - AV CALI", cantidad: 210, monto: 403971882 },
    { nombre: "UNIVERSITARIA - UNIAGRARIA", cantidad: 163, monto: 399174207 },
    { nombre: "UNIVERSIDAD LIBRE", cantidad: 179, monto: 358814117 },
    { nombre: "UNIVERSIDAD EL BOSQUE", cantidad: 157, monto: 356739979 },
    { nombre: "UNIVERSIDAD JORGE TADEO LOZANO", cantidad: 110, monto: 299237453 },
    { nombre: "CORP UNIV IBEROAMERICANA", cantidad: 182, monto: 250232276 },
    { nombre: "UNIVERSIDAD LA GRAN COLOMBIA", cantidad: 127, monto: 222114693 },
    { nombre: "UNIV MANUELA BELTRAN - UMB", cantidad: 129, monto: 213812607 }
  ],

  ciudades: [
    { ciudad: "Bogotá D.C.", lat: 4.7110, lng: -74.0721, cantidad: 6481 },
    { ciudad: "Medellín", lat: 6.2442, lng: -75.5812, cantidad: 690 },
    { ciudad: "Soacha", lat: 4.5794, lng: -74.2168, cantidad: 320 },
    { ciudad: "Cartagena", lat: 10.3910, lng: -75.4794, cantidad: 269 },
    { ciudad: "Cali", lat: 3.4516, lng: -76.5320, cantidad: 235 },
    { ciudad: "Barranquilla", lat: 10.9639, lng: -74.7964, cantidad: 159 },
    { ciudad: "Bello", lat: 6.3389, lng: -75.5636, cantidad: 142 },
    { ciudad: "Pereira", lat: 4.8133, lng: -75.6961, cantidad: 122 },
    { ciudad: "Villavicencio", lat: 4.1420, lng: -73.6266, cantidad: 122 },
    { ciudad: "Santa Marta", lat: 11.2408, lng: -74.1990, cantidad: 111 },
    { ciudad: "Ibagué", lat: 4.4389, lng: -75.2322, cantidad: 96 },
    { ciudad: "Bucaramanga", lat: 7.1193, lng: -73.1227, cantidad: 87 },
    { ciudad: "Madrid", lat: 4.7325, lng: -74.2642, cantidad: 87 },
    { ciudad: "Riohacha", lat: 11.5444, lng: -72.9072, cantidad: 77 },
    { ciudad: "Itagüí", lat: 6.1719, lng: -75.6114, cantidad: 74 },
    { ciudad: "Chía", lat: 4.8612, lng: -74.0327, cantidad: 70 },
    { ciudad: "Manizales", lat: 5.0703, lng: -75.5138, cantidad: 67 },
    { ciudad: "Mosquera", lat: 4.7059, lng: -74.2302, cantidad: 64 },
    { ciudad: "Armenia", lat: 4.5339, lng: -75.6811, cantidad: 63 },
    { ciudad: "Cúcuta", lat: 7.8939, lng: -72.5078, cantidad: 62 },
    { ciudad: "Valledupar", lat: 10.4631, lng: -73.2532, cantidad: 56 }
  ]
};

