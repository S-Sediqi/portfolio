/*  ============================================================
    DASHBOARD.JS — Data loading, calculations, charts, filters
    KPI Dashboard - Sample Data
    ============================================================ */

/* ── State — single object holds everything ── */
const state = {
  rawData:      [],   // all rows from CSV, never modified
  filtered:     [],   // rows after filters applied
  discountRate: 0,    // from slider, 0–50%
  costIncrease: 0,    // from slider, 0–50%
};


/* ── Helpers ── */

function formatCurrency(value) {
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatPercent(value) {
  return value.toFixed(1) + "%";
}

function formatMonth(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}


/* ── Date display in header ── */
function setHeaderDate() {
  const el = document.getElementById("dash-date");
  if (!el) return;
  el.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}


/* ── Load CSV ── */
function loadData() {
  Papa.parse("kpi-data/superstore_clean.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function (results) {
      state.rawData = results.data.filter(r => r["Order Date"] && r["Sales"]);
      applyFilters();
    },
    error: function (err) {
      console.error("CSV load error:", err);
    },
  });
}


/* ── Apply filters and re-render everything ── */
function applyFilters() {
  const year     = document.getElementById("filter-year").value;
  const region   = document.getElementById("filter-region").value;
  const category = document.getElementById("filter-category").value;

  state.filtered = state.rawData.filter(row => {
    const d = new Date(row["Order Date"]);

    if (year     !== "all" && d.getFullYear() !== parseInt(year)) return false;
    if (region   !== "all" && row["Region"]   !== region)         return false;
    if (category !== "all" && row["Category"] !== category)       return false;

    return true;
  });

  render();
}


/* ── Apply scenario modifiers to a single row's values ── */
function applyScenario(sales, profit) {
  const discountFactor = 1 - (state.discountRate / 100);
  const costFactor     = 1 + (state.costIncrease / 100);

  const adjustedSales  = sales  * discountFactor;
  const adjustedProfit = (profit - (sales - adjustedSales)) * (1 / costFactor);

  return { sales: adjustedSales, profit: adjustedProfit };
}


/* ── Aggregate filtered data by month ── */
function aggregateByMonth() {
  const months = {};

  state.filtered.forEach(row => {
    const d     = new Date(row["Order Date"]);
    const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    if (!months[key]) {
      months[key] = { key, label, sales: 0, profit: 0, orders: 0 };
    }

    const { sales, profit } = applyScenario(row["Sales"], row["Profit"]);
    months[key].sales  += sales;
    months[key].profit += profit;
    months[key].orders += 1;
  });

  return Object.values(months).sort((a, b) => a.key.localeCompare(b.key));
}


/* ── Aggregate filtered data by category ── */
function aggregateByCategory() {
  const cats = {};

  state.filtered.forEach(row => {
    const cat = row["Category"];
    if (!cats[cat]) cats[cat] = { sales: 0, profit: 0 };

    const { sales, profit } = applyScenario(row["Sales"], row["Profit"]);
    cats[cat].sales  += sales;
    cats[cat].profit += profit;
  });

  return cats;
}


/* ── Update KPI cards ── */
function updateKPICards(monthlyData) {
  const totalSales  = monthlyData.reduce((s, m) => s + m.sales,  0);
  const totalProfit = monthlyData.reduce((s, m) => s + m.profit, 0);
  const totalOrders = monthlyData.reduce((s, m) => s + m.orders, 0);
  const margin      = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  document.getElementById("kpi-revenue").textContent = formatCurrency(totalSales);
  document.getElementById("kpi-profit").textContent  = formatCurrency(totalProfit);
  document.getElementById("kpi-margin").textContent  = formatPercent(margin);
  document.getElementById("kpi-orders").textContent  = totalOrders.toLocaleString();
}


/* ── Charts ── */
let chartRevenue  = null;
let chartCategory = null;

const CHART_COLORS = {
  teal:       "#14b8a6",
  tealFaint:  "rgba(20, 184, 166, 0.15)",
  blue:       "#38bdf8",
  blueFaint:  "rgba(56, 189, 248, 0.15)",
  grid:       "rgba(30, 51, 72, 0.6)",
  text:       "#7a96b0",
};

function getChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: CHART_COLORS.text, font: { family: "DM Sans", size: 12 } },
      },
      tooltip: {
        backgroundColor: "#101e30",
        borderColor: "#1e3348",
        borderWidth: 1,
        titleColor: "#e4edf6",
        bodyColor: "#7a96b0",
      },
    },
    scales: {
      x: {
        ticks: { color: CHART_COLORS.text, font: { family: "DM Sans", size: 11 } },
        grid:  { color: CHART_COLORS.grid },
      },
      y: {
        ticks: {
          color: CHART_COLORS.text,
          font: { family: "DM Sans", size: 11 },
          callback: value => "$" + (value / 1000).toFixed(0) + "k",
        },
        grid: { color: CHART_COLORS.grid },
      },
    },
  };
}

function updateRevenueChart(monthlyData) {
  const labels  = monthlyData.map(m => m.label);
  const revenue = monthlyData.map(m => m.sales);
  const profit  = monthlyData.map(m => m.profit);

  if (chartRevenue) {
    chartRevenue.data.labels           = labels;
    chartRevenue.data.datasets[0].data = revenue;
    chartRevenue.data.datasets[1].data = profit;
    chartRevenue.update();
    return;
  }

  const ctx = document.getElementById("chart-revenue").getContext("2d");
  chartRevenue = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label:           "Revenue",
          data:            revenue,
          borderColor:     CHART_COLORS.teal,
          backgroundColor: CHART_COLORS.tealFaint,
          borderWidth:     2,
          fill:            true,
          tension:         0.4,
          pointRadius:     3,
        },
        {
          label:           "Profit",
          data:            profit,
          borderColor:     CHART_COLORS.blue,
          backgroundColor: CHART_COLORS.blueFaint,
          borderWidth:     2,
          fill:            true,
          tension:         0.4,
          pointRadius:     3,
        },
      ],
    },
    options: getChartDefaults(),
  });
}

function updateCategoryChart(catData) {
  const labels  = Object.keys(catData);
  const revenue = labels.map(l => catData[l].sales);

  if (chartCategory) {
    chartCategory.data.labels           = labels;
    chartCategory.data.datasets[0].data = revenue;
    chartCategory.update();
    return;
  }

  const ctx = document.getElementById("chart-category").getContext("2d");
  chartCategory = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label:           "Revenue by Category",
          data:            revenue,
          backgroundColor: [
            CHART_COLORS.tealFaint,
            "rgba(56, 189, 248, 0.15)",
            "rgba(167, 139, 250, 0.15)",
          ],
          borderColor: [
            CHART_COLORS.teal,
            CHART_COLORS.blue,
            "#a78bfa",
          ],
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      ...getChartDefaults(),
      plugins: {
        ...getChartDefaults().plugins,
        legend: { display: false },
      },
    },
  });
}


/* ── Update data table ── */
function updateTable(monthlyData) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  monthlyData.forEach(m => {
    const margin   = m.sales > 0 ? (m.profit / m.sales) * 100 : 0;
    const positive = m.profit >= 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.label}</td>
      <td>${formatCurrency(m.sales)}</td>
      <td class="${positive ? "td-positive" : "td-negative"}">${formatCurrency(m.profit)}</td>
      <td class="${positive ? "td-positive" : "td-negative"}">${formatPercent(margin)}</td>
      <td>${m.orders.toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}


/* ── Main render — called after every filter or slider change ── */
function render() {
  const monthlyData = aggregateByMonth();
  const catData     = aggregateByCategory();

  updateKPICards(monthlyData);
  updateRevenueChart(monthlyData);
  updateCategoryChart(catData);
  updateTable(monthlyData);
}


/* ── Event listeners — filters ── */
function initFilters() {
  ["filter-year", "filter-region", "filter-category"].forEach(id => {
    document.getElementById(id).addEventListener("change", applyFilters);
  });
}


/* ── Event listeners — sliders ── */
/* ── Event listeners — sliders ── */
function initSliders() {
  const discountSlider = document.getElementById("slider-discount");
  const costSlider     = document.getElementById("slider-cost");
  let debounceTimer    = null;

  function debounce(fn) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, 300);
  }

  discountSlider.addEventListener("input", () => {
    state.discountRate = parseInt(discountSlider.value);
    document.getElementById("val-discount").textContent = state.discountRate + "%";
    debounce(render);
  });

  costSlider.addEventListener("input", () => {
    state.costIncrease = parseInt(costSlider.value);
    document.getElementById("val-cost").textContent = state.costIncrease + "%";
    debounce(render);
  });
}


/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  setHeaderDate();
  initFilters();
  initSliders();
  loadData();
});