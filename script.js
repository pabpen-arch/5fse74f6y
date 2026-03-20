let mainChart = null;
let currentProductData = null;

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

  const labels=product.monthlyData.map(d=>d.mes.substring(0,7));
  const totals=product.monthlyData.map(d=>d.valorTotal);
  const auto=product.monthlyData.map(d=>d.valorAutogestionado);
  const asesor=product.monthlyData.map(d=>d.valorAsesor);

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

  renderProductAnalysis(product);

  /* ===== INYECTAR BENCHMARK DENTRO DEL PRODUCTO ===== */

let benchmarkHTML = "";

const name = product.name.toLowerCase();

if(name.includes("cdat")){

benchmarkHTML = `
<div class="benchmark-block benchmark-inline-scroll">

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

</div>
`;
}

if(name.includes("pap") && 
  !name.includes("whatsapp") && 
  !name.includes("brigadas")){

benchmarkHTML = `
<div class="benchmark-block benchmark-inline-scroll">

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

</div>
`;
}

document.getElementById("benchmarkInlineContainer").innerHTML = benchmarkHTML;

}

/* ================= PROYECCION SOLO AUTOGESTIONADO ================= */

document.getElementById("projectionSlider").addEventListener("input",function(){

  if(!currentProductData) return;

  const percent=parseFloat(this.value);
  document.getElementById("projectionValue").innerText=percent;

  const totals=currentProductData.monthlyData.map(d=>d.valorTotal);
  const realAuto=currentProductData.monthlyData.map(d=>d.valorAutogestionado);

  const projectedAuto=totals.map(t=>t*(percent/100));

  mainChart.data.datasets=mainChart.data.datasets.filter(d=>d.label!=="Proyección Autogestionado");

  if(percent>0){

    mainChart.data.datasets.push({
      label:"Proyección Autogestionado",
      data:projectedAuto,
      borderColor:"#a855f7",
      borderDash:[6,6],
      tension:0.3
    });

    const lastTotal=totals.at(-1);
    const realLast=realAuto.at(-1);
    const projectedLast=lastTotal*(percent/100);

    const impacto=projectedLast-realLast;

    document.getElementById("impactValue").innerText=
      formatNumber(impacto>0?impacto:0);

  }else{
    document.getElementById("impactValue").innerText="$0";
  }

  mainChart.update();
});

/* ================= ANALISIS ================= */

function renderProductAnalysis(product){

  const last = product.monthlyData.at(-1);

  const adopcion = ((last.valorAutogestionado / last.valorTotal) * 100).toFixed(1);

  const html = `
    <h3>Resumen del Producto</h3>

    <p><strong>Adopción Digital:</strong> ${adopcion}%</p>

    <hr>

    <h4>Promedios Generales</h4>
    <p><strong>Monto Promedio:</strong> ${formatNumber(last.promMonto)}</p>
    <p><strong>Plazo Promedio:</strong> ${last.plazoPromedio} días</p>

    <hr>

    <h4>Autogestionado</h4>
    <p><strong>Monto:</strong> ${formatNumber(last.promMontoAutogestionado)}</p>
    <p><strong>Plazo:</strong> ${last.plazoPromAutogestionado} días</p>

    <hr>

    <h4>Asesor</h4>
    <p><strong>Monto:</strong> ${formatNumber(last.promMontoAsesor)}</p>
    <p><strong>Plazo:</strong> ${last.plazoPromAsesor} días</p>
  `;

  document.getElementById("analysisPanel").innerHTML = html;
}

/* ================= UTIL ================= */

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

document.getElementById("closeBtn").addEventListener("click",()=>{
  document.getElementById("modal").classList.add("hidden");
});

/* ================= PLAN DE TRABAJO ================= */

const roadmapData = [
  {
    producto:"FincoGo",
    proyectos:[
      {
        nombre:"IA para nómina y créditos instantáneos",
        estado:"En proceso de certificación",
        clase:"certificacion"
      },
      {
        nombre:"Flujo de caja y parametrización",
        estado:"Redacción de control de cambio",
        clase:"control"
      }
    ]
  },
  {
    producto:"CDAT Digital",
    proyectos:[
      {
        nombre:"CDAT 100% digital en Sibanco + automatización",
        estado:"En proceso de pruebas",
        clase:"pruebas"
      }
    ]
  },
  {
    producto:"Chatbot",
    proyectos:[
      {
        nombre:"Integración IA generativa (GNS)",
        estado:"En proceso de pruebas",
        clase:"pruebas"
      }
    ]
  },
  {
    producto:"APP+",
    proyectos:[
      {
        nombre:"Versión 4 con mejoras UX",
        estado:"En proceso de cotización",
        clase:"cotizacion"
      }
    ]
  },
  {
    producto:"Agentes Virtuales",
    proyectos:[
      {
        nombre:"Venta seguro + extractos automáticos",
        estado:"Diseño de POC",
        clase:"poc"
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
      `;
    });

    card.innerHTML = content;

    container.appendChild(card);
  });
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
  if(event.key === "Escape"){
    document.getElementById("modal").classList.add("hidden");
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