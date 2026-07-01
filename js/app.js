import { renderBudgetForm, renderBudgetStatus, collectBudgets } from "./budget.js";
import { addCategory, addWallet, renderCategoryControls, renderTaxonomy, updateCategoryOptions } from "./categories.js";
import { renderCharts } from "./charts.js";
import { renderDashboard } from "./dashboard.js";
import { exportBackup, exportCsv, exportJson, importBackup } from "./export.js";
import { checkNotifications, requestNotifications, toast } from "./notifications.js";
import { renderReports } from "./reports.js";
import { filterTransactions } from "./search.js";
import { collectSettings, renderSettings, toggleTheme } from "./settings.js";
import { createTransaction, loadState, replaceState, restorePrevious, saveState } from "./storage.js";
import { collectTransactionForm, fillTransactionForm, renderTransactions, resetTransactionForm } from "./transactions.js";
import { qsa, todayISO } from "./utils.js";

let state = loadState();
let deferredInstallPrompt = null;

const controls = {
  query: "",
  type: "All",
  category: "All",
  wallet: "All",
  sort: "date-desc"
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  document.querySelector("#todayLabel").textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date());
  document.querySelector("#dateInput").value = todayISO();
  document.querySelector("#timeInput").value = new Date().toTimeString().slice(0, 5);
  document.querySelector("#sortSelect").innerHTML = [
    ["date-desc", "Newest"],
    ["amount-desc", "Amount High"],
    ["amount-asc", "Amount Low"],
    ["category", "Category"]
  ].map(([value, label]) => `<option value="${value}">${label}</option>`).join("");

  bindEvents();
  registerPwa();
  refresh();
}

function bindEvents() {
  qsa("[data-view]").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
  document.querySelector("#fab").addEventListener("click", () => {
    showView("dashboard");
    document.querySelector("#amountInput").focus();
  });
  document.querySelector("#typeInput").addEventListener("change", () => updateCategoryOptions(state));
  document.querySelector("#themeToggle").addEventListener("click", () => {
    toggleTheme(state);
    persist("Theme updated");
  });
  document.querySelector("#resetFormBtn").addEventListener("click", resetTransactionForm);
  document.querySelector("#transactionForm").addEventListener("submit", saveTransaction);
  document.querySelector("#transactionList").addEventListener("click", handleTransactionAction);
  document.querySelector("#budgetForm").addEventListener("submit", event => {
    event.preventDefault();
    collectBudgets(state);
    persist("Budgets saved");
  });
  document.querySelector("#settingsForm").addEventListener("submit", async event => {
    event.preventDefault();
    collectSettings(state);
    await requestNotifications(state);
    persist("Settings saved");
  });
  document.querySelector("#categoryForm").addEventListener("submit", event => {
    event.preventDefault();
    const ok = addCategory(state, document.querySelector("#newCategoryType").value, document.querySelector("#newCategoryName").value);
    document.querySelector("#newCategoryName").value = "";
    persist(ok ? "Category added" : "Category already exists");
  });
  document.querySelector("#walletForm").addEventListener("submit", event => {
    event.preventDefault();
    const ok = addWallet(state, document.querySelector("#newWalletName").value);
    document.querySelector("#newWalletName").value = "";
    persist(ok ? "Wallet added" : "Wallet already exists");
  });
  document.querySelector("#exportCsvBtn").addEventListener("click", () => exportCsv(state));
  document.querySelector("#exportJsonBtn").addEventListener("click", () => exportJson(state));
  document.querySelector("#backupBtn").addEventListener("click", () => exportBackup(state));
  document.querySelector("#restorePreviousBtn").addEventListener("click", () => {
    const restored = restorePrevious();
    if (restored) {
      state = restored;
      refresh();
      toast("Previous backup restored");
    } else {
      toast("No previous backup found");
    }
  });
  document.querySelector("#importBackupInput").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      state = replaceState(await importBackup(file));
      refresh();
      toast("Backup imported");
    } catch {
      toast("Backup import failed");
    }
    event.target.value = "";
  });
  ["globalSearch", "filterType", "filterCategory", "filterWallet", "sortSelect"].forEach(id => {
    document.querySelector(`#${id}`).addEventListener("input", updateFilters);
  });
  document.querySelector("#clearFiltersBtn").addEventListener("click", clearFilters);
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      document.querySelector("#globalSearch").focus();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
      event.preventDefault();
      showView("dashboard");
      document.querySelector("#amountInput").focus();
    }
  });
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.querySelector("#installBtn").classList.remove("hidden");
  });
  document.querySelector("#installBtn").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.querySelector("#installBtn").classList.add("hidden");
  });
}

async function saveTransaction(event) {
  event.preventDefault();
  const item = await collectTransactionForm();
  if (!item.amount || item.amount <= 0) {
    toast("Amount must be greater than zero");
    return;
  }
  const index = state.transactions.findIndex(row => row.id === item.id);
  if (index >= 0) state.transactions[index] = item;
  else state.transactions.unshift(item);
  resetTransactionForm();
  persist(index >= 0 ? "Transaction updated" : "Transaction added");
  await checkNotifications(state);
}

function handleTransactionAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = state.transactions.find(row => row.id === button.dataset.id);
  if (!item) return;
  if (button.dataset.action === "edit") {
    showView("dashboard");
    fillTransactionForm(item);
    document.querySelector("#amountInput").focus();
  }
  if (button.dataset.action === "duplicate") {
    state.transactions.unshift(createTransaction({ ...item, id: "", date: todayISO() }));
    persist("Transaction duplicated");
  }
  if (button.dataset.action === "delete") {
    state.transactions = state.transactions.filter(row => row.id !== item.id);
    persist("Transaction deleted");
  }
}

function updateFilters() {
  controls.query = document.querySelector("#globalSearch").value;
  controls.type = document.querySelector("#filterType").value;
  controls.category = document.querySelector("#filterCategory").value;
  controls.wallet = document.querySelector("#filterWallet").value;
  controls.sort = document.querySelector("#sortSelect").value;
  renderTransactions(state, filterTransactions(state.transactions, controls));
}

function clearFilters() {
  document.querySelector("#globalSearch").value = "";
  document.querySelector("#filterType").value = "All";
  document.querySelector("#filterCategory").value = "All";
  document.querySelector("#filterWallet").value = "All";
  document.querySelector("#sortSelect").value = "date-desc";
  updateFilters();
}

function showView(view) {
  qsa("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  qsa("[data-view-panel]").forEach(panel => panel.classList.toggle("view-active", panel.dataset.viewPanel === view));
  document.querySelector("h1").textContent = view[0].toUpperCase() + view.slice(1);
}

function persist(message) {
  saveState(state);
  refresh();
  toast(message);
}

function refresh() {
  renderSettings(state);
  renderCategoryControls(state);
  renderTaxonomy(state);
  renderDashboard(state);
  renderBudgetForm(state);
  renderBudgetStatus(state);
  renderReports(state);
  renderCharts(state);
  updateFilters();
}

function registerPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}
