let chartInstance = null;
let currentProduct = null;
let currentMetric = "valorTotal";

fetch("data.json")
.then(response => response.json())
.then(data => {

  const container = document.getElementById("productsContainer");

  data.products.forEach(product => {

    const total = product.monthlyData.reduce(
      (sum, m) => sum + m.valorTotal, 0);

    const auto = product.monthlyData.reduce(
      (sum, m) => sum + m.valorAutogestionado, 0);

    const madurez = ((auto / total) * 100).toFixed(1);

    const card = document.createElement("div");
    card.className = "card";

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
  currentMetric = "valorTotal";

  document.getElementById("modalTitle").innerText = product.name;

  document.getElementById("metrics").innerHTML = `
    <div style="margin:20px 0;">
      <button onclick="changeMetric('valorTotal')">Valor Total</button>
      <button onclick="changeMetric('valorAutogestionado')">Autogestionado</button>
      <button onclick="changeMetric('valorAsesor')">Asesor</button>
    </div>
  `;

  renderChart();

  document.getElementById("modal").classList.remove("hidden");
}

function changeMetric(metric) {
  currentMetric = metric;
  renderChart();
}

function renderChart() {

  const ctx = document.getElementById("chart");

  const labels = currentProduct.monthlyData.map(m => 
    m.mes.substring(0,7) // Solo año-mes
  );

  const values = currentProduct.monthlyData.map(m => 
    Math.round(m[currentMetric]) // Sin decimales
  );

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: getMetricLabel(),
        data: values,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.2)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white"
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
              return "$" + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

function getMetricLabel() {
  if (currentMetric === "valorTotal") return "Valor Total";
  if (currentMetric === "valorAutogestionado") return "Valor Autogestionado";
  if (currentMetric === "valorAsesor") return "Valor Asesor";
}

document.getElementById("closeBtn").onclick = function() {
  document.getElementById("modal").classList.add("hidden");
}