import { downloadText } from "./utils.js";

export const exportCsv = state => {
  const header = ["id", "amount", "type", "category", "date", "time", "wallet", "notes"];
  const rows = state.transactions.map(item => header.map(key => csvCell(item[key] || "")).join(","));
  downloadText("expensetracker-transactions.csv", [header.join(","), ...rows].join("\n"), "text/csv");
};

export const exportJson = state => {
  downloadText("expensetracker-transactions.json", JSON.stringify(state.transactions, null, 2), "application/json");
};

export const exportBackup = state => {
  downloadText(`expensetracker-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), "application/json");
};

export const importBackup = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    try { resolve(JSON.parse(reader.result)); } catch (error) { reject(error); }
  };
  reader.onerror = reject;
  reader.readAsText(file);
});

const csvCell = value => `"${String(value).replaceAll('"', '""')}"`;
