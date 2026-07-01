import { byMonth, groupSum, money, sumByType } from "./utils.js";

let chartInstances = {};
const palette = ["#31d3bd", "#ff7b73", "#f5c451", "#8f8cff", "#3ee197", "#ffc857", "#67a8ff", "#ff9eb7"];

export const renderCharts = state => {
  if (!window.Chart) {
    renderFallbacks(state);
    return;
  }
  Object.values(chartInstances).forEach(chart => chart.destroy());
  chartInstances = {};
  const monthly = byMonth(state.transactions);
  const expenses = monthly.filter(item => item.type === "expense");
  const category = groupSum(expenses, item => item.category);
  const income = sumByType(monthly, "income");
  const expense = sumByType(monthly, "expense");
  const months = lastSixMonths();
  const trend = months.map(key => sumByType(state.transactions.filter(item => item.date.slice(0, 7) === key), "expense"));
  const budgetUsed = state.budgets.monthly ? Math.min(expense, state.budgets.monthly) : expense;
  const budgetLeft = Math.max((state.budgets.monthly || 0) - expense, 0);

  chartInstances.category = makeChart("categoryChart", "pie", {
    labels: Object.keys(category),
    datasets: [{ data: Object.values(category), backgroundColor: palette }]
  });
  chartInstances.incomeExpense = makeChart("incomeExpenseChart", "bar", {
    labels: ["Income", "Expense"],
    datasets: [{ data: [income, expense], backgroundColor: ["#31d3bd", "#ff7b73"], borderRadius: 12 }]
  });
  chartInstances.trend = makeChart("trendChart", "line", {
    labels: months,
    datasets: [{ label: "Spending", data: trend, borderColor: "#f5c451", backgroundColor: "rgba(245,196,81,.18)", fill: true, tension: .38 }]
  });
  chartInstances.budget = makeChart("budgetChart", "doughnut", {
    labels: ["Used", "Remaining"],
    datasets: [{ data: [budgetUsed, budgetLeft], backgroundColor: ["#ff7b73", "#31d3bd"] }]
  });

  document.querySelectorAll(".chart-fallback").forEach(node => node.classList.remove("active"));
  document.querySelectorAll("canvas").forEach(node => node.hidden = false);
};

function makeChart(id, type, data) {
  return new Chart(document.getElementById(id), {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: getTextColor(), boxWidth: 12, font: { family: "Inter, sans-serif" } } },
        tooltip: { callbacks: { label: ctx => `${ctx.label || ctx.dataset.label}: ${ctx.parsed.y ?? ctx.parsed}` } }
      },
      scales: type === "bar" || type === "line" ? {
        x: { ticks: { color: getMutedColor() }, grid: { color: "rgba(255,255,255,.08)" } },
        y: { ticks: { color: getMutedColor() }, grid: { color: "rgba(255,255,255,.08)" } }
      } : undefined
    }
  });
}

function renderFallbacks(state) {
  document.querySelectorAll("canvas").forEach(node => node.hidden = true);
  const monthly = byMonth(state.transactions);
  const expenses = monthly.filter(item => item.type === "expense");
  const category = groupSum(expenses, item => item.category);
  const lines = Object.entries(category).map(([key, value]) => `${key}: ${money(value, state.settings)}`).join("<br>");
  document.querySelector("#categoryFallback").innerHTML = lines || "No category spending yet.";
  document.querySelector("#incomeExpenseFallback").innerHTML = `Income: ${money(sumByType(monthly, "income"), state.settings)}<br>Expense: ${money(sumByType(monthly, "expense"), state.settings)}`;
  document.querySelector("#trendFallback").textContent = "Chart.js is unavailable offline until it has been cached once.";
  document.querySelector("#budgetFallback").textContent = "Budget usage updates in the budget status panel.";
  document.querySelectorAll(".chart-fallback").forEach(node => node.classList.add("active"));
}

function lastSixMonths() {
  const date = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const copy = new Date(date.getFullYear(), date.getMonth() - (5 - index), 1);
    return copy.toISOString().slice(0, 7);
  });
}

function getTextColor() {
  return getComputedStyle(document.body).getPropertyValue("--text").trim();
}

function getMutedColor() {
  return getComputedStyle(document.body).getPropertyValue("--muted").trim();
}
