import { byMonth, clampPercent, money, sumByType } from "./utils.js";

export const renderBudgetForm = state => {
  document.querySelector("#monthlyBudgetInput").value = state.budgets.monthly || 0;
  const fields = document.querySelector("#categoryBudgetFields");
  fields.innerHTML = state.categories.expense.map(category => `
    <label>${category}<input data-budget-category="${category}" type="number" min="0" step="1" value="${state.budgets.categories[category] || 0}"></label>
  `).join("");
};

export const renderBudgetStatus = state => {
  const monthly = byMonth(state.transactions).filter(item => item.type === "expense");
  const total = sumByType(monthly, "expense");
  const rows = [{ label: "Monthly Budget", spent: total, limit: state.budgets.monthly || 0 }]
    .concat(state.categories.expense.map(label => ({
      label,
      spent: monthly.filter(item => item.category === label).reduce((sum, item) => sum + item.amount, 0),
      limit: state.budgets.categories[label] || 0
    })).filter(item => item.limit > 0));
  document.querySelector("#budgetStatus").innerHTML = rows.map(item => {
    const used = item.limit ? clampPercent((item.spent / item.limit) * 100) : 0;
    const level = used >= 100 ? "danger" : used >= 80 ? "warning" : "";
    return `<div class="budget-item ${level}">
      <strong>${item.label}</strong>
      <p>${money(item.spent, state.settings)} of ${money(item.limit, state.settings)}</p>
      <div class="progress"><span style="width:${used}%"></span></div>
    </div>`;
  }).join("");
};

export const collectBudgets = state => {
  state.budgets.monthly = Number(document.querySelector("#monthlyBudgetInput").value || 0);
  state.budgets.categories = {};
  document.querySelectorAll("[data-budget-category]").forEach(input => {
    state.budgets.categories[input.dataset.budgetCategory] = Number(input.value || 0);
  });
};
