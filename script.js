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

fetch("data.json")
.then(res=>res.json())
.then(data=>{

  const container=document.getElementById("productsContainer");

  data.products.forEach(product=>{

    const last=product.monthlyData.at(-1);

    const adopcion=((last.valorAutogestionado/last.valorTotal)*100).toFixed(1);

    const card=document.createElement("div");
    card.classList.add("card");

    card.innerHTML=`
      <h3>${product.name}</h3>
      <p><strong>Total:</strong> ${formatNumber(last.valorTotal)}</p>
      <p><strong>Adopción Digital:</strong> ${adopcion}%</p>
    `;

    card.onclick=()=>openModal(product);

    container.appendChild(card);
  });
});

/* ================= MODAL ================= */

function openModal(product){

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

  const last=product.monthlyData.at(-1);
  const adopcion=((last.valorAutogestionado/last.valorTotal)*100).toFixed(1);

  document.getElementById("analysisPanel").innerHTML=`
    <h3>Gestión del Canal Virtual</h3>
    <p>Adopción Digital actual: <strong>${adopcion}%</strong></p>
    <p>Existe oportunidad de expansión estratégica
    mediante fortalecimiento de journeys digitales
    y reducción de fricción operativa.</p>
  `;
}

/* ================= UTIL ================= */

function formatNumber(num){
  return "$"+new Intl.NumberFormat("es-CO").format(Math.round(num));
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

renderBenchmark();

/* ================= DIGITAL IMPACT LAB ================= */

let impactLineChart = null;
let impactPieChart = null;

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