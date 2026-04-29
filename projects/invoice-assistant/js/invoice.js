/* ============================================================
   invoice.js — Upload logic, API call, results display
   AI Invoice Assistant — sediqi.dev
   ============================================================ */

/* ── Backend URL ── */
/* During local development: Flask runs on port 5001 */
/* After deployment: change this to https://sediqi.dev/api/invoice */
const BACKEND_URL = "https://sediqi.dev/api/invoice/extract";

/* ── Element references ── */
const uploadZone   = document.getElementById("upload-zone");
const fileInput    = document.getElementById("file-input");
const extractBtn   = document.getElementById("extract-btn");
const btnText      = document.getElementById("btn-text");
const statusEl     = document.getElementById("inv-status");
const emptyState   = document.getElementById("inv-empty");
const loadingState = document.getElementById("inv-loading");
const resultsState = document.getElementById("inv-results");
const cardsEl      = document.getElementById("inv-cards");
const tableBody    = document.getElementById("inv-table-body");
const tableWrap    = document.getElementById("inv-table-wrap");

/* ── Currently selected file ── */
let selectedFile = null;

/* ============================================================
   STATE MANAGEMENT
   Three states: empty / loading / results
   Only one is visible at a time
   ============================================================ */
function showEmpty() {
  emptyState.style.display   = "flex";
  loadingState.style.display = "none";
  resultsState.style.display = "none";
}

function showLoading() {
  emptyState.style.display   = "none";
  loadingState.style.display = "flex";
  resultsState.style.display = "none";
}

function showResults() {
  emptyState.style.display   = "none";
  loadingState.style.display = "none";
  resultsState.style.display = "flex";
}

/* ============================================================
   FILE SELECTION
   Handles both click-to-select and drag-and-drop
   ============================================================ */
function handleFileSelect(file) {
  if (!file) return;

  /* Check it is a PDF */
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    setStatus("Only PDF files are accepted.", true);
    return;
  }

  /* Check size — 5MB max */
  if (file.size > 5 * 1024 * 1024) {
    setStatus("File too large. Maximum size is 5MB.", true);
    return;
  }

  /* File is valid */
  selectedFile = file;
  uploadZone.classList.add("has-file");

  /* Update the upload zone text to show the filename */
  uploadZone.querySelector(".inv-upload-text").textContent = file.name;
  uploadZone.querySelector(".inv-upload-sub").textContent =
    (file.size / 1024).toFixed(1) + " KB";

  /* Enable the button */
  extractBtn.disabled = false;
  btnText.textContent = "Extract Invoice Data";
  setStatus("");
}

/* Click to select */
fileInput.addEventListener("change", () => {
  handleFileSelect(fileInput.files[0]);
});

/* Drag over — visual feedback */
uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("dragover");
});

/* Drag leave — remove visual feedback */
uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("dragover");
});

/* Drop — handle the file */
uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("dragover");
  handleFileSelect(e.dataTransfer.files[0]);
});

/* ============================================================
   STATUS HELPER
   Shows a message below the button
   isError = true makes it red
   ============================================================ */
function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = "inv-status" + (isError ? " error" : "");
}

/* ============================================================
   CURRENCY FORMATTER
   Formats a number as currency with the extracted currency symbol
   ============================================================ */
function formatCurrency(value, currency) {
  if (value === null || value === undefined) return "—";
  const symbol = currency || "";
  return symbol + " " + Number(value).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ============================================================
   RENDER RESULTS
   Takes the JSON from Claude and builds the UI
   ============================================================ */
function renderResults(data) {
  const currency = data.currency || "";

  /* ── Summary cards ── */
  const cardDefs = [
    { label: "Vendor",         value: data.vendor_name    || "—",                          accent: false },
    { label: "Invoice No.",    value: data.invoice_number  || "—",                          accent: false },
    { label: "Invoice Date",   value: data.invoice_date    || "—",                          accent: false },
    { label: "Due Date",       value: data.due_date        || "—",                          accent: false },
    { label: "Subtotal",       value: formatCurrency(data.subtotal,    currency),            accent: false },
    { label: "Tax",            value: formatCurrency(data.tax_amount,  currency),            accent: false },
    { label: "Total Due",      value: formatCurrency(data.total_amount, currency),           accent: true  },
  ];

  cardsEl.innerHTML = "";
  cardDefs.forEach(({ label, value, accent }) => {
    const card = document.createElement("div");
    card.className = "inv-card";
    card.innerHTML = `
      <p class="inv-card-label">${label}</p>
      <p class="inv-card-value ${accent ? "accent" : ""}">${value}</p>
    `;
    cardsEl.appendChild(card);
  });

  /* ── Line items table ── */
  const items = data.line_items || [];

  if (items.length === 0) {
    tableWrap.style.display = "none";
  } else {
    tableWrap.style.display = "block";
    tableBody.innerHTML = "";

    items.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.description || "—"}</td>
        <td class="num">${item.quantity !== null ? item.quantity : "—"}</td>
        <td class="num">${formatCurrency(item.unit_price, currency)}</td>
        <td class="num">${formatCurrency(item.total, currency)}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  showResults();
}

/* ============================================================
   EXTRACT — main action
   Called when the user clicks the Extract button
   ============================================================ */
extractBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  /* Disable button during processing */
  extractBtn.disabled = true;
  btnText.textContent = "Extracting...";
  setStatus("Sending to Claude API...");
  showLoading();

  /* Build FormData — this is how files are sent over HTTP */
  const formData = new FormData();
  formData.append("pdf", selectedFile);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      /* Backend returned an error */
      setStatus(data.error || "Something went wrong.", true);
      showEmpty();
    } else {
      /* Success — render the extracted data */
      setStatus("");
      renderResults(data);
    }

  } catch (err) {
    /* Network error — backend not reachable */
    setStatus("Cannot reach backend. Is Flask running?", true);
    showEmpty();
  }

  /* Re-enable button */
  extractBtn.disabled = false;
  btnText.textContent = "Extract Again";
});

/* ── Initial state ── */
showEmpty();