export const currencies = ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD"];
export const dateFormats = ["mm-dd-yyyy", "dd-mm-yyyy", "yyyy-mm-dd"];
export const numberFormats = ["en-US", "en-IN", "en-GB", "de-DE", "ja-JP"];

export const renderSettings = state => {
  setOptions("#currencyInput", currencies, state.settings.currency);
  setOptions("#dateFormatInput", dateFormats, state.settings.dateFormat);
  setOptions("#numberFormatInput", numberFormats, state.settings.numberFormat);
  document.querySelector("#notificationsInput").checked = Boolean(state.settings.notifications);
  document.body.classList.toggle("light-theme", state.settings.theme === "light");
};

export const collectSettings = state => {
  state.settings.currency = document.querySelector("#currencyInput").value;
  state.settings.dateFormat = document.querySelector("#dateFormatInput").value;
  state.settings.numberFormat = document.querySelector("#numberFormatInput").value;
  state.settings.notifications = document.querySelector("#notificationsInput").checked;
};

export const toggleTheme = state => {
  state.settings.theme = state.settings.theme === "light" ? "dark" : "light";
  renderSettings(state);
};

function setOptions(selector, values, selected) {
  document.querySelector(selector).innerHTML = values.map(value => `<option value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`).join("");
}
