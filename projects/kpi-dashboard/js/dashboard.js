/*  ============================================================
    DASHBOARD.JS — Data loading, calculations, charts, filters
    Includes self-contained i18n system (EN/DE)
    Language shared with main portfolio via localStorage
    ============================================================ */

/* ── Translations ── */
const translations = {
  en: {
    back_link:            "← Portfolio",
    header_title:         "KPI Dashboard — Sample Data",
    header_badge:         "● Live Data",
    sidebar_filters:      "Filters",
    filter_year:          "Year",
    filter_all_years:     "All Years",
    filter_region:        "Region",
    filter_all_regions:   "All Regions",
    filter_category:      "Category",
    filter_all_cats:      "All Categories",
    cat_furniture:        "Furniture",
    cat_office:           "Office Supplies",
    cat_tech:             "Technology",
    sidebar_scenario:     "Scenario Modelling",
    slider_discount:      "Discount Rate:",
    slider_discount_hint: "Simulates applying a discount to all sales. Watch how profit margin drops.",
    slider_cost:          "Cost Increase:",
    slider_cost_hint:     "Simulates rising supply costs. Profit absorbs the increase directly.",
    kpi_revenue_label:    "Total Revenue",
    kpi_revenue_sub:      "Sum of all sales in selected period",
    kpi_profit_label:     "Total Profit",
    kpi_profit_sub:       "Revenue minus all costs",
    kpi_margin_label:     "Profit Margin",
    kpi_margin_sub:       "Profit as a percentage of revenue",
    kpi_orders_label:     "Total Orders",
    kpi_orders_sub:       "Number of individual line items sold",
    chart_revenue_title:  "Monthly Revenue vs Profit",
    chart_revenue_desc:   "Tracks revenue and profit trends over time. A widening gap indicates rising costs.",
    chart_category_title: "Sales by Category",
    chart_category_desc:  "Compares total revenue across product categories for the selected period.",
    table_title:          "Monthly Breakdown",
    table_desc:           "Detailed month-by-month figures for the selected filters.",
    col_month:            "Month",
    col_revenue:          "Revenue",
    col_profit:           "Profit",
    col_margin:           "Margin",
    col_orders:           "Orders",
    chart_label_revenue:  "Revenue",
    chart_label_profit:   "Profit",
    chart_label_category: "Revenue by Category",
  },
  de: {
    back_link:            "← Portfolio",
    header_title:         "KPI-Dashboard — Beispieldaten",
    header_badge:         "● Live-Daten",
    sidebar_filters:      "Filter",
    filter_year:          "Jahr",
    filter_all_years:     "Alle Jahre",
    filter_region:        "Region",
    filter_all_regions:   "Alle Regionen",
    filter_category:      "Kategorie",
    filter_all_cats:      "Alle Kategorien",
    cat_furniture:        "Möbel",
    cat_office:           "Bürobedarf",
    cat_tech:             "Technologie",
    sidebar_scenario:     "Szenariomodellierung",
    slider_discount:      "Rabattsatz:",
    slider_discount_hint: "Simuliert einen Rabatt auf alle Umsätze. Beobachten Sie den Rückgang der Gewinnmarge.",
    slider_cost:          "Kostensteigerung:",
    slider_cost_hint:     "Simuliert steigende Kosten. Der Gewinn absorbiert die Steigerung direkt.",
    kpi_revenue_label:    "Gesamtumsatz",
    kpi_revenue_sub:      "Summe aller Verkäufe im gewählten Zeitraum",
    kpi_profit_label:     "Gesamtgewinn",
    kpi_profit_sub:       "Umsatz abzüglich aller Kosten",
    kpi_margin_label:     "Gewinnmarge",
    kpi_margin_sub:       "Gewinn als Prozentsatz des Umsatzes",
    kpi_orders_label:     "Bestellungen gesamt",
    kpi_orders_sub:       "Anzahl der einzelnen verkauften Positionen",
    chart_revenue_title:  "Monatlicher Umsatz vs. Gewinn",
    chart_revenue_desc:   "Verfolgt Umsatz- und Gewinntrends über die Zeit. Eine wachsende Lücke deutet auf steigende Kosten hin.",
    chart_category_title: "Umsatz nach Kategorie",
    chart_category_desc:  "Vergleicht den Gesamtumsatz über Produktkategorien im gewählten Zeitraum.",
    table_title:          "Monatliche Aufschlüsselung",
    table_desc:           "Detaillierte monatliche Zahlen für die gewählten Filter.",
    col_month:            "Monat",
    col_revenue:          "Umsatz",
    col_profit:           "Gewinn",
    col_margin:           "Marge",
    col_orders:           "Bestellungen",
    chart_label_revenue:  "Umsatz",
    chart_label_profit:   "Gewinn",
    chart_label_category: "Umsatz nach Kategorie",
  },
};

/* ── Language engine ── */
let currentLang = "en";

function detectLanguage() {
  const saved = localStorage.getItem("preferred-lang");
  if (saved === "en" || saved === "de") return saved;
  const browser = navigator.language || navigator.userLanguage;
  return browser.startsWith("de") ? "de" : "en";
}

function applyLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  localStorage.setItem("preferred-lang", lang);
  document.documentElement.lang = lang;

  /* Re-render charts with translated labels if data is loaded */
  if (state.filtered.length > 0) {
    render();
  }
}


/* ── State ── */
const state = {
  rawData:      [],
  filtered:     [],
  discountRate: 0,
  costIncrease: 0,
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


/* ── Date display in header ── */
function setHeaderDate() {
  const el = document.getElementById("dash-date");
  if (!el) return;
  el.textContent = new Date().toLocaleDateString(
    currentLang === "de" ? "de-DE" : "en-US",
    { weekday: "short", year: "numeric", month: "short", day: "numeric" }
  );
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


/* ── Apply filters ── */
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


/* ── Scenario modifier ── */
function applyScenario(sales, profit) {
  const discountFactor = 1 - (state.discountRate / 100);
  const costFactor     = 1 + (state.costIncrease / 100);
  const adjustedSales  = sales * discountFactor;
  const adjustedProfit = (profit - (sales - adjustedSales)) * (1 / costFactor);
  return { sales: adjustedSales, profit: adjustedProfit };
}


/* ── Aggregate by month ── */
function aggregateByMonth() {
  const months = {};
  state.filtered.forEach(row => {
    const d     = new Date(row["Order Date"]);
    const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString(
      currentLang === "de" ? "de-DE" : "en-US",
      { month: "short", year: "numeric" }
    );
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


/* ── Aggregate by category ── */
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
  const t = translations[currentLang];
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
  const t       = translations[currentLang];
  const labels  = monthlyData.map(m => m.label);
  const revenue = monthlyData.map(m => m.sales);
  const profit  = monthlyData.map(m => m.profit);

  if (chartRevenue) {
    chartRevenue.data.labels                    = labels;
    chartRevenue.data.datasets[0].data          = revenue;
    chartRevenue.data.datasets[0].label         = t.chart_label_revenue;
    chartRevenue.data.datasets[1].data          = profit;
    chartRevenue.data.datasets[1].label         = t.chart_label_profit;
    chartRevenue.options                        = getChartDefaults();
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
          label:           t.chart_label_revenue,
          data:            revenue,
          borderColor:     CHART_COLORS.teal,
          backgroundColor: CHART_COLORS.tealFaint,
          borderWidth:     2,
          fill:            true,
          tension:         0.4,
          pointRadius:     3,
        },
        {
          label:           t.chart_label_profit,
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
  const t       = translations[currentLang];
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
          label:           t.chart_label_category,
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
          borderWidth:  1,
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


/* ── Update table ── */
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


/* ── Main render ── */
function render() {
  const monthlyData = aggregateByMonth();
  const catData     = aggregateByCategory();
  updateKPICards(monthlyData);
  updateRevenueChart(monthlyData);
  updateCategoryChart(catData);
  updateTable(monthlyData);
}


/* ── Event listeners ── */
function initFilters() {
  ["filter-year", "filter-region", "filter-category"].forEach(id => {
    document.getElementById(id).addEventListener("change", applyFilters);
  });
}

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
  const lang = detectLanguage();
  applyLanguage(lang);
  setHeaderDate();
  initFilters();
  initSliders();
  loadData();

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.dataset.lang);
      setHeaderDate();
    });
  });
});