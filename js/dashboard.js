import { byMonth, clampPercent, money, monthKey, sumByType } from "./utils.js";

export const getStats = state => {
  const monthly = byMonth(state.transactions);
  const income = sumByType(state.transactions, "income");
  const expenses = sumByType(state.transactions, "expense");
  const savings = sumByType(state.transactions, "savings");
  const monthlyExpense = sumByType(monthly, "expense");
  const todayExpense = state.transactions.filter(item => item.date === new Date().toISOString().slice(0, 10) && item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  return {
    balance: income - expenses - savings,
    income,
    expenses,
    savings,
    remaining: (state.budgets.monthly || 0) - monthlyExpense,
    monthlyExpense,
    todayExpense
  };
};

export const renderDashboard = state => {
  const stats = getStats(state);
  const cards = [
    ["Total Balance", stats.balance, "Net available after expenses and savings", "--accent"],
    ["Total Income", stats.income, `All income through ${monthKey()}`, "--success"],
    ["Total Expenses", stats.expenses, "All recorded expenses", "--accent-2"],
    ["Total Savings", stats.savings, "Savings transfers recorded", "--accent"],
    ["Budget Remaining", stats.remaining, "Current monthly budget", "--accent-3"],
    ["Monthly Spending", stats.monthlyExpense, "Expense this month", "--accent-4"],
    ["Today", stats.todayExpense, "Today's spending", "--warning"]
  ];
  const grid = document.querySelector("#metricGrid");
  grid.innerHTML = cards.map(([label, value, hint, accent]) => `
    <article class="metric-card" style="--card-accent: var(${accent})">
      <span>${label}</span>
      <strong>${money(value, state.settings)}</strong>
      <small>${hint}</small>
    </article>`).join("");
  const percent = state.budgets.monthly ? clampPercent((stats.savings / state.budgets.monthly) * 100) : 0;
  document.querySelector("#navSavings").textContent = `${Math.round(percent)}%`;
  document.querySelector("#navSavingsBar").style.width = `${percent}%`;
};
