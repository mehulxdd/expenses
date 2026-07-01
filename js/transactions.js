import { createTransaction } from "./storage.js";
import { formatDate, money, todayISO, timeNow } from "./utils.js";

export const resetTransactionForm = () => {
  document.querySelector("#transactionId").value = "";
  document.querySelector("#amountInput").value = "";
  document.querySelector("#notesInput").value = "";
  document.querySelector("#dateInput").value = todayISO();
  document.querySelector("#timeInput").value = timeNow();
  document.querySelector("#receiptInput").value = "";
};

export const collectTransactionForm = async () => {
  const receipt = document.querySelector("#receiptInput").files[0];
  return createTransaction({
    id: document.querySelector("#transactionId").value,
    amount: document.querySelector("#amountInput").value,
    type: document.querySelector("#typeInput").value,
    category: document.querySelector("#categoryInput").value,
    wallet: document.querySelector("#walletInput").value,
    date: document.querySelector("#dateInput").value,
    time: document.querySelector("#timeInput").value,
    notes: document.querySelector("#notesInput").value,
    receipt: receipt ? await toDataUrl(receipt) : ""
  });
};

export const renderTransactions = (state, transactions) => {
  document.querySelector("#transactionCount").textContent = `${transactions.length} shown`;
  document.querySelector("#transactionList").innerHTML = transactions.length ? transactions.map(item => `
    <article class="transaction-row">
      <div class="transaction-main">
        <strong>${item.category} <span class="amount-${item.type}">${money(item.amount, state.settings)}</span></strong>
        <span>${formatDate(item.date, state.settings)} ${item.time} | ${item.wallet} | ${item.notes || "No notes"}</span>
      </div>
      <span class="muted">${item.type}</span>
      <div class="row-actions">
        <button data-action="edit" data-id="${item.id}" title="Edit">Edit</button>
        <button data-action="duplicate" data-id="${item.id}" title="Duplicate">Copy</button>
        <button data-action="delete" data-id="${item.id}" title="Delete">Del</button>
      </div>
    </article>
  `).join("") : `<p class="muted">No transactions match the current filters.</p>`;
};

export const fillTransactionForm = item => {
  document.querySelector("#transactionId").value = item.id;
  document.querySelector("#typeInput").value = item.type;
  document.querySelector("#typeInput").dispatchEvent(new Event("change"));
  document.querySelector("#categoryInput").value = item.category;
  document.querySelector("#walletInput").value = item.wallet;
  document.querySelector("#amountInput").value = item.amount;
  document.querySelector("#dateInput").value = item.date;
  document.querySelector("#timeInput").value = item.time;
  document.querySelector("#notesInput").value = item.notes || "";
};

const toDataUrl = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});
