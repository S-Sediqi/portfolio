/* ============================================================
   invoice.js — Upload logic, API call, results display
   Includes self-contained i18n system (EN/DE)
   Language choice shared with main portfolio via localStorage
   ============================================================ */

/* ── Backend URL ── */
const BACKEND_URL = "https://sediqi.dev/api/invoice/extract";

/* ── Translations ── */
const translations = {
  en: {
    back_link:     "← Portfolio",
    header_title:  "AI Invoice Assistant",
    page_label:    "AI + Automation",
    page_title:    "Invoice Extractor",
    page_desc:     "Upload a PDF invoice and let AI extract the key fields instantly — vendor, amounts, dates, and line items. Powered by Claude API.",
    upload_text:   "Drag & drop a PDF invoice here",
    upload_sub:    "or click to select a file",
    upload_limit:  "PDF only · Max 5MB · Up to 3 pages",
    upload_coming: "DOCX & image support coming soon",
    btn_select:    "Select a file first",
    btn_ready:     "Extract Invoice Data",
    btn_loading:   "Extracting...",
    btn_again:     "Extract Again",
    how_label:     "How it works",
    step_1:        "Upload a PDF invoice",
    step_2:        "Backend extracts text with pdfplumber",
    step_3:        "Claude API reads and structures the data",
    step_4:        "Results appear instantly on the right",
    empty_title:   "No invoice analysed yet",
    empty_sub:     "Upload a PDF on the left and click Extract to see the results here.",
    loading_text:  "Analysing invoice...",
    loading_sub:   "Claude is reading your document",
    table_title:   "Line Items",
    col_desc:      "Description",
    col_qty:       "Qty",
    col_unit:      "Unit Price",
    col_total:     "Total",
    footer_copy:   "© 2026 Samim Sediqi",
    footer_built:  "Built with Python · Flask · Claude API · pdfplumber",
    card_vendor:   "Vendor",
    card_invoice:  "Invoice No.",
    card_date:     "Invoice Date",
    card_due:      "Due Date",
    card_subtotal: "Subtotal",
    card_tax:      "Tax",
    card_total:    "Total Due",
    err_pdf_only:  "Only PDF files are accepted.",
    err_too_large: "File too large. Maximum size is 5MB.",
    err_sending:   "Sending to Claude API...",
    err_backend:   "Cannot reach backend. Is Flask running?",
  },
  de: {
    back_link:     "← Portfolio",
    header_title:  "KI-Rechnungsassistent",
    page_label:    "KI + Automatisierung",
    page_title:    "Rechnungsextraktor",
    page_desc:     "Laden Sie eine PDF-Rechnung hoch und lassen Sie die KI sofort die wichtigsten Felder extrahieren — Lieferant, Beträge, Daten und Positionen. Powered by Claude API.",
    upload_text:   "PDF-Rechnung hier ablegen",
    upload_sub:    "oder Datei auswählen",
    upload_limit:  "Nur PDF · Max. 5 MB · Bis zu 3 Seiten",
    upload_coming: "DOCX- und Bildunterstützung folgt bald",
    btn_select:    "Zuerst eine Datei auswählen",
    btn_ready:     "Rechnungsdaten extrahieren",
    btn_loading:   "Wird extrahiert...",
    btn_again:     "Erneut extrahieren",
    how_label:     "So funktioniert es",
    step_1:        "PDF-Rechnung hochladen",
    step_2:        "Backend extrahiert Text mit pdfplumber",
    step_3:        "Claude API liest und strukturiert die Daten",
    step_4:        "Ergebnisse erscheinen sofort rechts",
    empty_title:   "Noch keine Rechnung analysiert",
    empty_sub:     "Laden Sie links eine PDF-Datei hoch und klicken Sie auf Extrahieren.",
    loading_text:  "Rechnung wird analysiert...",
    loading_sub:   "Claude liest Ihr Dokument",
    table_title:   "Positionen",
    col_desc:      "Beschreibung",
    col_qty:       "Menge",
    col_unit:      "Einzelpreis",
    col_total:     "Gesamt",
    footer_copy:   "© 2026 Samim Sediqi",
    footer_built:  "Entwickelt mit Python · Flask · Claude API · pdfplumber",
    card_vendor:   "Lieferant",
    card_invoice:  "Rechnungsnr.",
    card_date:     "Rechnungsdatum",
    card_due:      "Fälligkeitsdatum",
    card_subtotal: "Zwischensumme",
    card_tax:      "MwSt.",
    card_total:    "Gesamtbetrag",
    err_pdf_only:  "Nur PDF-Dateien werden akzeptiert.",
    err_too_large: "Datei zu groß. Maximale Größe: 5 MB.",
    err_sending:   "Wird an Claude API gesendet...",
    err_backend:   "Backend nicht erreichbar.",
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

  /* Update button text to match current state */
  if (selectedFile) {
    btnText.textContent = translations[lang].btn_ready;
  } else {
    btnText.textContent = translations[lang].btn_select;
  }
}

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

/* ── State management ── */
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

/* ── File selection ── */
function handleFileSelect(file) {
  if (!file) return;
  const t = translations[currentLang];

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    setStatus(t.err_pdf_only, true);
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setStatus(t.err_too_large, true);
    return;
  }

  selectedFile = file;
  uploadZone.classList.add("has-file");
  uploadZone.querySelector(".inv-upload-text").textContent = file.name;
  uploadZone.querySelector(".inv-upload-sub").textContent =
    (file.size / 1024).toFixed(1) + " KB";

  extractBtn.disabled = false;
  btnText.textContent = t.btn_ready;
  setStatus("");
}

fileInput.addEventListener("change", () => {
  handleFileSelect(fileInput.files[0]);
});

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("dragover");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("dragover");
});

uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("dragover");
  handleFileSelect(e.dataTransfer.files[0]);
});

/* ── Status helper ── */
function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = "inv-status" + (isError ? " error" : "");
}

/* ── Currency formatter ── */
function formatCurrency(value, currency) {
  if (value === null || value === undefined) return "—";
  const symbol = currency || "";
  return symbol + " " + Number(value).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ── Render results ── */
function renderResults(data) {
  const currency = data.currency || "";
  const t = translations[currentLang];

  const cardDefs = [
    { label: t.card_vendor,   value: data.vendor_name    || "—", accent: false },
    { label: t.card_invoice,  value: data.invoice_number || "—", accent: false },
    { label: t.card_date,     value: data.invoice_date   || "—", accent: false },
    { label: t.card_due,      value: data.due_date       || "—", accent: false },
    { label: t.card_subtotal, value: formatCurrency(data.subtotal,     currency), accent: false },
    { label: t.card_tax,      value: formatCurrency(data.tax_amount,   currency), accent: false },
    { label: t.card_total,    value: formatCurrency(data.total_amount, currency), accent: true  },
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

/* ── Extract button ── */
extractBtn.addEventListener("click", async () => {
  if (!selectedFile) return;
  const t = translations[currentLang];

  extractBtn.disabled = true;
  btnText.textContent = t.btn_loading;
  setStatus(t.err_sending);
  showLoading();

  const formData = new FormData();
  formData.append("pdf", selectedFile);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Something went wrong.", true);
      showEmpty();
    } else {
      setStatus("");
      renderResults(data);
    }

  } catch (err) {
    setStatus(t.err_backend, true);
    showEmpty();
  }

  extractBtn.disabled = false;
  btnText.textContent = t.btn_again;
});

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  const lang = detectLanguage();
  applyLanguage(lang);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });

  showEmpty();
});