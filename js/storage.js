import { todayISO, timeNow, uid } from "./utils.js";

const KEY = "expensetracker-pro-state";
const BACKUP_KEY = "expensetracker-pro-previous-backup";

export const defaults = {
  categories: {
    income: ["Salary", "Freelance", "Investment", "Gift"],
    expense: ["Food", "Shopping", "Transport", "Bills", "Health", "Entertainment", "Education", "Travel", "Miscellaneous"],
    savings: ["Investment", "Emergency Fund", "Retirement"]
  },
  wallets: ["Cash", "Bank", "UPI", "Credit Card"],
  settings: {
    currency: "USD",
    theme: "dark",
    dateFormat: "mm-dd-yyyy",
    numberFormat: "en-US",
    notifications: false
  },
  budgets: {
    monthly: 3000,
    categories: { Food: 700, Bills: 600, Transport: 300, Entertainment: 350, Shopping: 500 }
  },
  transactions: [
    tx(4800, "income", "Salary", "Bank", "Monthly salary", -29),
    tx(620, "expense", "Food", "UPI", "Groceries and dinner", -23),
    tx(180, "expense", "Transport", "Cash", "Metro card", -19),
    tx(900, "savings", "Investment", "Bank", "Index fund transfer", -17),
    tx(260, "expense", "Entertainment", "Credit Card", "Movie night", -10),
    tx(750, "income", "Freelance", "UPI", "Design consultation", -7),
    tx(510, "expense", "Bills", "Bank", "Electricity and internet", -3)
  ]
};

function tx(amount, type, category, wallet, notes, dayOffset) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return {
    id: uid(),
    amount,
    type,
    category,
    date: date.toISOString().slice(0, 10),
    time: timeNow(),
    wallet,
    notes,
    receipt: ""
  };
}

export const loadState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved ? mergeDefaults(saved) : structuredClone(defaults);
  } catch {
    return structuredClone(defaults);
  }
};

export const saveState = state => {
  localStorage.setItem(BACKUP_KEY, JSON.stringify(loadState()));
  localStorage.setItem(KEY, JSON.stringify(state));
};

export const restorePrevious = () => {
  const backup = localStorage.getItem(BACKUP_KEY);
  if (!backup) return null;
  localStorage.setItem(KEY, backup);
  return loadState();
};

export const replaceState = state => {
  const next = mergeDefaults(state);
  saveState(next);
  return next;
};

export const createTransaction = data => ({
  id: data.id || uid(),
  amount: Math.abs(Number(data.amount || 0)),
  type: data.type || "expense",
  category: data.category || "Miscellaneous",
  date: data.date || todayISO(),
  time: data.time || timeNow(),
  wallet: data.wallet || "Cash",
  notes: data.notes || "",
  receipt: data.receipt || ""
});

const mergeDefaults = saved => ({
  ...structuredClone(defaults),
  ...saved,
  categories: { ...defaults.categories, ...(saved.categories || {}) },
  budgets: { ...defaults.budgets, ...(saved.budgets || {}), categories: { ...defaults.budgets.categories, ...((saved.budgets || {}).categories || {}) } },
  settings: { ...defaults.settings, ...(saved.settings || {}) },
  transactions: (saved.transactions || []).map(createTransaction)
});
