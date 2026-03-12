let mainChart = null;
let currentProductData = null;

/* ================= SECCIONES ================= */

function showSection(sectionName, btn){

  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach(b=>{
    b.classList.remove("active-btn");
  });

  if(btn) btn.classList.add("active-btn");

  document.getElementById(sectionName + "Section").classList.add("active");
}

/* ================= BENCHMARK EXPLICATIVO ================= */

fetch("benchmark.json")
.then(res => res.json())
.then(data => {

  const cdat = data.filter(d => d.Entidad.includes("CDAT"));
  const pap = data.filter(d => d.Entidad.includes("PAP"));

  renderBenchmarkContext(cdat, pap);
});

function renderBenchmarkContext(cdat, pap){

  const avgCDAT = average(cdat);
  const avgPAP = average(pap);

  document.getElementById("benchmarkCDAT").innerHTML = `
    <h3>CDAT Digital</h3>
    <p><strong>Promedio mercado:</strong> ${avgCDAT}%</p>
    <p>El mercado CDAT muestra niveles heterogéneos de digitalización,
    con líderes sobre 60% y cooperativas entre 20%–35%.</p>
  `;

  document.getElementById("benchmarkPAP").innerHTML = `
    <h3>PAP Digital</h3>
    <p><strong>Promedio mercado:</strong> ${avgPAP}%</p>
    <p>El ahorro programado digital presenta mayor adopción en banca y billeteras
    que en cooperativas tradicionales.</p>
  `;
}

function average(arr){
  if(arr.length === 0) return 0;
  return (arr.reduce((a,b)=>a+b.Adopcion,0) / arr.length).toFixed(1);
}

/* ================= STATUS PRODUCTOS ================= */

fetch("data.json")
.then(res => res.json())
.then(data => {

  const container = document.getElementById("productsContainer");

  data.products.forEach(product => {

    const last = product.monthlyData[product.monthlyData.length - 1];

    const adopcion = (
      (last.valorAutogestionado / last.valorTotal) * 100
    ).toFixed(1);

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
});

/* ================= MODAL ================= */

function openModal(product){

  currentProductData = product;

  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modalTitle").innerText = product.name;

  const labels = product.monthlyData.map(d => d.mes.substring(0,7));

  const totalData = product.monthlyData.map(d => d.valorTotal);
  const autoData = product.monthlyData.map(d => d.valorAutogestionado);
  const asesorData = product.monthlyData.map(d => d.valorAsesor);

  const ctx = document.getElementById("chart");

  if(mainChart) mainChart.destroy();

  mainChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: "Valor Total",
          data: totalData,
          borderColor: "#3b82f6",
          tension: 0.3
        },
        {
          label: "Autogestionado",
          data: autoData,
          borderColor: "#22c55e",
          tension: 0.3
        },
        {
          label: "Asesor",
          data: asesorData,
          borderColor: "#f59e0b",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "white" } }
      },
      scales: {
        x: { ticks: { color:"white" } },
        y: { ticks: { color:"white" } }
      }
    }
  });

  renderProductAnalysis(product);
}

/* ================================================= */
/* PROYECCIÓN SOLO AUTOGESTIONADO (VERSIÓN JUEVES) */
/* ================================================= */

document.getElementById("projectionSlider").addEventListener("input", function(){

  if(!currentProductData) return;

  const percent = parseFloat(this.value);
  document.getElementById("projectionValue").innerText = percent;

  const totals = currentProductData.monthlyData.map(d => d.valorTotal);
  const projectedAuto = totals.map(t => t * (percent / 100));

  // 🔥 Si vuelve a 0 → eliminar línea de proyección
  if(percent === 0){

    mainChart.data.datasets = mainChart.data.datasets.filter(d =>
      d.label !== "Proyección Autogestionado"
    );

    mainChart.update();
    return;
  }

  // 🔥 Eliminar proyección previa si existe
  mainChart.data.datasets = mainChart.data.datasets.filter(d =>
    d.label !== "Proyección Autogestionado"
  );

  // 🔥 Agregar línea simulada SOLO autogestionado
  mainChart.data.datasets.push({
    label: "Proyección Autogestionado",
    data: projectedAuto,
    borderColor: "#a855f7",
    borderDash: [6,6],
    tension: 0.3
  });

  mainChart.update();
});

/* ================= TOGGLE DATASETS ================= */

function toggleDataset(index){
  const meta = mainChart.getDatasetMeta(index);
  meta.hidden = meta.hidden === null ? !mainChart.data.datasets[index].hidden : null;
  mainChart.update();
}

/* ================= ANÁLISIS ================= */

function renderProductAnalysis(product){

  const last = product.monthlyData[product.monthlyData.length - 1];

  const adopcion = (
    (last.valorAutogestionado / last.valorTotal) * 100
  ).toFixed(1);

  document.getElementById("analysisPanel").innerHTML = `
    <h3>Gestión del Canal Virtual</h3>
    <p>Adopción Digital actual: <strong>${adopcion}%</strong></p>
    <p>Existe margen estratégico para aumentar participación digital
    y reducir dependencia comercial.</p>
  `;
}

/* ================= UTIL ================= */

function formatNumber(num){
  return new Intl.NumberFormat("es-CO").format(Math.round(num));
}

/* ================= CERRAR MODAL ================= */

document.getElementById("closeBtn").addEventListener("click", ()=>{
  document.getElementById("modal").classList.add("hidden");
});