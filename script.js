let chartInstance = null;
let currentProduct = null;

fetch("data.json")
.then(response => response.json())
.then(data => {

  const container = document.getElementById("productsContainer");
const productColors = {
  "PAPS": "#1e40af",
  "PAPS Gamificada": "#7c3aed",
  "CDATS": "#0ea5e9",
  "FINCO EDUCAR": "#f59e0b",
  "FINCO GO": "#ec4899"
};
  data.products.forEach(product => {

    const total = product.monthlyData.reduce((s,m)=>s+m.valorTotal,0);
    const auto = product.monthlyData.reduce((s,m)=>s+m.valorAutogestionado,0);
    const madurez = ((auto/total)*100).toFixed(1);

    const card = document.createElement("div");
    card.className = "card";

card.style.borderLeft = `6px solid ${productColors[product.name] || "#3b82f6"}`;
card.style.boxShadow = `0px 0px 15px ${productColors[product.name]}33`;

    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>Total: $${Math.round(total).toLocaleString()}</p>
      <p>Madurez Digital: ${madurez}%</p>
    `;

    card.onclick = () => openModal(product);

    container.appendChild(card);
  });

});

function openModal(product) {

  currentProduct = product;

  document.getElementById("modalTitle").innerText = product.name;

  document.getElementById("metrics").innerHTML = `
    <button onclick="toggleDataset(0)">Valor Total</button>
    <button onclick="toggleDataset(1)">Autogestionado</button>
    <button onclick="toggleDataset(2)">Asesor</button>
  `;

  renderChart();

  document.getElementById("modal").classList.remove("hidden");
}

function renderChart() {

  const ctx = document.getElementById("chart");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: currentProduct.monthlyData.map(m=>m.mes.substring(0,7)),
      datasets: [
        {
          label: 'Valor Total',
          data: currentProduct.monthlyData.map(m=>Math.round(m.valorTotal)),
          borderColor: '#3b82f6',
          borderWidth: 3,
          tension: 0.3
        },
        {
          label: 'Autogestionado',
          data: currentProduct.monthlyData.map(m=>Math.round(m.valorAutogestionado)),
          borderColor: '#22c55e',
          borderWidth: 3,
          tension: 0.3
        },
        {
          label: 'Asesor',
          data: currentProduct.monthlyData.map(m=>Math.round(m.valorAsesor)),
          borderColor: '#f97316',
          borderWidth: 3,
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
        x: { ticks: { color: "white" } },
        y: {
          ticks: {
            color: "white",
            callback: value => "$"+value.toLocaleString()
          }
        }
      }
    }
  });

  renderAnalysis();
}

function toggleDataset(index) {
  const meta = chartInstance.getDatasetMeta(index);
  meta.hidden = meta.hidden === null ? true : null;
  chartInstance.update();
}

function renderAnalysis() {

  const total = currentProduct.monthlyData.reduce((s,m)=>s+m.valorTotal,0);
  const auto = currentProduct.monthlyData.reduce((s,m)=>s+m.valorAutogestionado,0);
  const madurez = ((auto/total)*100).toFixed(1);

  document.getElementById("analysisPanel").innerHTML = `
    <h3>Análisis Ejecutivo</h3>
    <p><strong>Total Acumulado:</strong><br>$${Math.round(total).toLocaleString()}</p>
    <p><strong>Madurez Digital:</strong><br>${madurez}%</p>
    <p>${madurez < 20 ? 
      "Alta dependencia del asesor." : 
      "Avance en digitalización."}
    </p>
  `;
}

function showSection(section, btn) {

  document.querySelectorAll(".section").forEach(sec=>sec.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active-btn"));

  if(section==="status") document.getElementById("statusSection").classList.add("active");
  if(section==="proyecciones") document.getElementById("proyeccionesSection").classList.add("active");
  if(section==="plan") document.getElementById("planSection").classList.add("active");

  btn.classList.add("active-btn");
}

document.getElementById("closeBtn").onclick = function() {
  document.getElementById("modal").classList.add("hidden");
};