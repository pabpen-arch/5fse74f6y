let chartInstance = null;
let currentProduct = null;

const productColors = {
  "PAPS": "#1e40af",
  "PAPS Gamificada": "#7c3aed",
  "CDATS": "#0ea5e9",
  "FINCO EDUCAR": "#f59e0b",
  "FINCO GO": "#ec4899"
};

fetch("data.json")
.then(res => res.json())
.then(data => {

  const container = document.getElementById("productsContainer");

  data.products.forEach(product => {

    const total = product.monthlyData.reduce((s,m)=>s+m.valorTotal,0);
    const auto = product.monthlyData.reduce((s,m)=>s+m.valorAutogestionado,0);
    const madurez = ((auto/total)*100).toFixed(1);

    const card = document.createElement("div");
    card.className = "card";
    card.style.borderLeft = `6px solid ${productColors[product.name] || "#3b82f6"}`;

    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>Total: $${Math.round(total).toLocaleString()}</p>
      <p>Adopción Digital: ${madurez}%</p>
    `;

    card.onclick = () => openModal(product);
    container.appendChild(card);
  });

});

function openModal(product) {
  currentProduct = product;
  document.getElementById("modalTitle").innerText = product.name;
  renderChart();
  document.getElementById("modal").classList.remove("hidden");
}

function renderChart() {

  const ctx = document.getElementById("chart");

  const labels = currentProduct.monthlyData.map(m=>m.mes.substring(0,7));
  const totalData = currentProduct.monthlyData.map(m=>Math.round(m.valorTotal));
  const autoReal = currentProduct.monthlyData.map(m=>Math.round(m.valorAutogestionado));
  const asesorReal = currentProduct.monthlyData.map(m=>Math.round(m.valorAsesor));

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label:'Valor Total', data:totalData, borderColor:'#3b82f6', borderWidth:3 },
        { label:'Autogestionado (Real)', data:autoReal, borderColor:'#22c55e', borderWidth:3 },
        { label:'Asesor (Real)', data:asesorReal, borderColor:'#f97316', borderWidth:3 },
        { label:'Autogestionado (Proyección)', data:[], borderColor:'#22c55e', borderDash:[5,5], borderWidth:3 }
      ]
    },
    options: {
      responsive:true,
      plugins:{ legend:{ labels:{ color:"white"} } },
      scales:{
        x:{ ticks:{ color:"white"} },
        y:{ ticks:{ color:"white", callback:v=>"$"+v.toLocaleString()} }
      }
    }
  });

  setupProjection(totalData);
  renderAnalysis();
}

function setupProjection(totalData) {

  const slider = document.getElementById("projectionSlider");
  const label = document.getElementById("projectionValue");

  const totalAcum = currentProduct.monthlyData.reduce((s,m)=>s+m.valorTotal,0);
  const autoAcum = currentProduct.monthlyData.reduce((s,m)=>s+m.valorAutogestionado,0);
  const currentMadurez = ((autoAcum/totalAcum)*100).toFixed(1);

  slider.value = currentMadurez;
  label.innerText = currentMadurez;

  slider.oninput = function() {

    const percent = parseFloat(this.value);
    label.innerText = percent;

    const projected = totalData.map(total =>
      Math.round(total * (percent/100))
    );

    chartInstance.data.datasets[3].data = projected;
    chartInstance.update();
  };
}

function toggleDataset(index){
  const meta = chartInstance.getDatasetMeta(index);
  meta.hidden = meta.hidden === null ? true : null;
  chartInstance.update();
}

function renderAnalysis(){

  const totalAcum = currentProduct.monthlyData.reduce((s,m)=>s+m.valorTotal,0);
  const autoAcum = currentProduct.monthlyData.reduce((s,m)=>s+m.valorAutogestionado,0);

  const adopcion = ((autoAcum/totalAcum)*100);
  const adopcionFormatted = adopcion.toFixed(1);

  const brecha = (100 - adopcion).toFixed(1);

  // Tendencia simple (comparando primer vs último mes)
  const firstMonth = currentProduct.monthlyData[0];
  const lastMonth = currentProduct.monthlyData[currentProduct.monthlyData.length - 1];

  const adopcionInicio = (firstMonth.valorAutogestionado / firstMonth.valorTotal) * 100;
  const adopcionFinal = (lastMonth.valorAutogestionado / lastMonth.valorTotal) * 100;

  const variacion = (adopcionFinal - adopcionInicio).toFixed(1);

  let tendenciaTexto = "";

  if (variacion > 0.5) {
    tendenciaTexto = "Evolución positiva en la participación digital.";
  } else if (variacion < -0.5) {
    tendenciaTexto = "Comportamiento estable con variaciones menores.";
  } else {
    tendenciaTexto = "Participación digital consistente en el periodo.";
  }

  document.getElementById("analysisPanel").innerHTML = `
    <h3>Visión Ejecutiva</h3>

    <p><strong>Adopción Digital:</strong><br>
    ${adopcionFormatted}%</p>

    <p><strong>Potencial de Expansión Digital:</strong><br>
    ${brecha}%</p>

    <p><strong>Tendencia del Periodo:</strong><br>
    ${tendenciaTexto}</p>

    <hr style="border: 1px solid rgba(255,255,255,0.1); margin:15px 0;">

    <p style="font-size:13px; color:#94a3b8;">
    La adopción digital refleja la participación del canal virtual dentro del modelo comercial del producto.
    </p>
  `;
}

function showSection(section,btn){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active-btn"));

  if(section==="status") document.getElementById("statusSection").classList.add("active");
  if(section==="proyecciones") document.getElementById("proyeccionesSection").classList.add("active");
  if(section==="plan") document.getElementById("planSection").classList.add("active");

  btn.classList.add("active-btn");
}

document.getElementById("closeBtn").onclick = function(){
  document.getElementById("modal").classList.add("hidden");
};