export const types = ["income", "expense", "savings"];

export const renderCategoryControls = state => {
  setOptions("#typeInput", types, false);
  setOptions("#newCategoryType", types, false);
  updateCategoryOptions(state);
  setOptions("#walletInput", state.wallets, false);
  setOptions("#filterWallet", ["All", ...state.wallets], false);
  setOptions("#filterType", ["All", ...types], false);
  setOptions("#filterCategory", ["All", ...new Set(Object.values(state.categories).flat())], false);
};

export const updateCategoryOptions = state => {
  const type = document.querySelector("#typeInput").value || "expense";
  setOptions("#categoryInput", state.categories[type] || [], false);
};

export const renderTaxonomy = state => {
  const groups = [
    ["Income", state.categories.income],
    ["Expense", state.categories.expense],
    ["Savings", state.categories.savings],
    ["Wallets", state.wallets]
  ];
  document.querySelector("#taxonomyLists").innerHTML = groups.map(([label, values]) => `
    <div class="taxonomy-item"><strong>${label}</strong><p>${values.join(", ")}</p></div>
  `).join("");
};

export const addCategory = (state, type, name) => {
  const clean = name.trim();
  if (!clean || state.categories[type].includes(clean)) return false;
  state.categories[type].push(clean);
  return true;
};

export const addWallet = (state, name) => {
  const clean = name.trim();
  if (!clean || state.wallets.includes(clean)) return false;
  state.wallets.push(clean);
  return true;
};

function setOptions(selector, values, keep = true) {
  const node = document.querySelector(selector);
  const current = node.value;
  node.innerHTML = values.map(value => `<option value="${value}">${value[0].toUpperCase()}${value.slice(1)}</option>`).join("");
  if (keep && values.includes(current)) node.value = current;
}
