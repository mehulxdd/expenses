import { groupSum, money, monthKey, sumByType } from "./utils.js";

export const renderReports = state => {
  const currentMonth = monthKey();
  const currentYear = currentMonth.slice(0, 4);
  const monthly = state.transactions.filter(item => item.date.slice(0, 7) === currentMonth);
  const yearly = state.transactions.filter(item => item.date.slice(0, 4) === currentYear);
  const expenses = state.transactions.filter(item => item.type === "expense");
  const income = state.transactions.filter(item => item.type === "income");
  const topCategories = topEntries(groupSum(expenses, item => item.category), state);
  const incomeSources = topEntries(groupSum(income, item => item.category), state);
  const largest = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3).map(item => `${item.category}: ${money(item.amount, state.settings)}`).join("<br>") || "No expenses yet";
  const categorySummary = topEntries(groupSum(state.transactions, item => item.category), state);
  document.querySelector("#reportSummary").innerHTML = [
    ["Monthly Summary", `Income ${money(sumByType(monthly, "income"), state.settings)}<br>Expense ${money(sumByType(monthly, "expense"), state.settings)}<br>Savings ${money(sumByType(monthly, "savings"), state.settings)}`],
    ["Yearly Summary", `Income ${money(sumByType(yearly, "income"), state.settings)}<br>Expense ${money(sumByType(yearly, "expense"), state.settings)}<br>Savings ${money(sumByType(yearly, "savings"), state.settings)}`],
    ["Category Summary", categorySummary],
    ["Top Spending Categories", topCategories],
    ["Largest Expenses", largest],
    ["Income Sources", incomeSources]
  ].map(([title, value]) => `<div class="report-item"><strong>${title}</strong><p>${value}</p></div>`).join("");
};

function topEntries(grouped, state) {
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value]) => `${label}: ${money(value, state.settings)}`)
    .join("<br>") || "No data yet";
}
