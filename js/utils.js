export const todayISO = () => new Date().toISOString().slice(0, 10);

export const timeNow = () => new Date().toTimeString().slice(0, 5);

export const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const money = (value, settings) => {
  const currency = settings.currency || "USD";
  const locale = settings.numberFormat || "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value) || 0);
};

export const formatDate = (iso, settings) => {
  const locale = settings.dateFormat === "dd-mm-yyyy" ? "en-GB" : settings.dateFormat === "yyyy-mm-dd" ? "en-CA" : "en-US";
  return new Intl.DateTimeFormat(locale).format(new Date(`${iso}T00:00:00`));
};

export const monthKey = (date = todayISO()) => date.slice(0, 7);

export const byMonth = (transactions, key = monthKey()) => transactions.filter(item => item.date.slice(0, 7) === key);

export const sumByType = (transactions, type) => transactions.filter(item => item.type === type).reduce((sum, item) => sum + Number(item.amount), 0);

export const groupSum = (items, keyFn) => items.reduce((acc, item) => {
  const key = keyFn(item);
  acc[key] = (acc[key] || 0) + Number(item.amount || 0);
  return acc;
}, {});

export const downloadText = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const clampPercent = value => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

export const qs = selector => document.querySelector(selector);
export const qsa = selector => [...document.querySelectorAll(selector)];
