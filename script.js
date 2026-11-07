// ===================================
// AMZ EXPIRY MANAGEMENT
// Frontend JavaScript
// ===================================

// এখানে Apps Script Web App URL বসাবে
const API_URL = "https://script.google.com/macros/s/AKfycbyoUI0Cy2uPK0JHvLyeYxKUBGkkJFQEsIy_roZ73nfZCJtMezV4-8MT5JnWUQ_DGZHb9w/exec";

let allItems = [];

// Load data from Google Apps Script
async function loadData() {
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");

  loading.hidden = false;
  loading.textContent = "Loading expiry data...";
  error.hidden = true;

  try {
    if (API_URL.includes("PASTE_YOUR")) {
      throw new Error("Apps Script Web App URL not configured.");
    }

    const response = await fetch(API_URL + "?action=dashboard");

    if (!response.ok) {
      throw new Error("Server connection failed.");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Unable to load data.");
    }

    allItems = result.items || [];

    updateDashboard(result);
    renderTable();

    loading.hidden = true;

  } catch (err) {
    loading.hidden = true;
    error.textContent = err.message;
    error.hidden = false;
  }
}

// Dashboard counters
function updateDashboard(data) {
  document.getElementById("total").textContent =
    data.total ?? allItems.length;

  document.getElementById("safe").textContent =
    data.safe ?? 0;

  document.getElementById("warning").textContent =
    data.warning ?? 0;

  document.getElementById("urgent").textContent =
    data.urgent ?? 0;

  document.getElementById("overdue").textContent =
    data.overdue ?? 0;
}

// Render product table
function renderTable() {
  const tbody = document.getElementById("tableBody");
  const empty = document.getElementById("empty");

  const search = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const filter = document.getElementById("statusFilter").value;

  tbody.innerHTML = "";

  const filtered = allItems.filter(item => {
    const matchesSearch = String(item.barcode || "")
      .toLowerCase()
      .includes(search);

    const matchesStatus =
      filter === "ALL" || item.status === filter;

    return matchesSearch && matchesStatus;
  });

  empty.hidden = filtered.length > 0;

  filtered.sort((a, b) => Number(a.daysLeft) - Number(b.daysLeft));

  filtered.forEach(item => {
    const tr = document.createElement("tr");

    const values = [
      item.barcode,
      item.expiry,
      item.before + " Days",
      item.removeDate,
      item.daysLeft + " Days"
    ];

    values.forEach(value => {
      const td = document.createElement("td");
      td.textContent = value ?? "";
      tr.appendChild(td);
    });

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");

    badge.className = "status status-" + item.status;
    badge.textContent = item.status;

    statusCell.appendChild(badge);
    tr.appendChild(statusCell);

    tbody.appendChild(tr);
  });
}

// Initial load
document.addEventListener("DOMContentLoaded", loadData);
