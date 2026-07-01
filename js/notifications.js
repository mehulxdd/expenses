import { byMonth, sumByType } from "./utils.js";

export const requestNotifications = async state => {
  if (!("Notification" in window) || !state.settings.notifications) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
};

export const checkNotifications = async state => {
  if (!state.settings.notifications || !("Notification" in window) || Notification.permission !== "granted") return;
  const spent = sumByType(byMonth(state.transactions), "expense");
  if (state.budgets.monthly && spent >= state.budgets.monthly) {
    new Notification("Monthly budget exceeded", { body: "Your spending has reached the monthly budget limit." });
  } else if (state.budgets.monthly && spent >= state.budgets.monthly * .8) {
    new Notification("Budget warning", { body: "You have used 80% of the monthly budget." });
  }
  const hasBillDue = state.transactions.some(item => item.category === "Bills" && item.type === "expense" && item.date >= new Date().toISOString().slice(0, 10));
  if (hasBillDue) new Notification("Bills due", { body: "A bill transaction is scheduled or due today." });
  const savings = sumByType(state.transactions, "savings");
  if (state.budgets.monthly && savings >= state.budgets.monthly * .25) {
    new Notification("Savings goal achieved", { body: "Savings reached at least 25% of your monthly budget." });
  }
};

export const toast = message => {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.querySelector("#toastRegion").append(node);
  setTimeout(() => node.remove(), 3600);
};
