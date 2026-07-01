# ExpenseTracker Pro

ExpenseTracker Pro is a local-first personal finance app built with HTML5, CSS3, vanilla ES modules, Chart.js, LocalStorage, and PWA support.

## Run

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 8787
```

The app stores all data in the browser through LocalStorage. Use **Export Backup** before clearing browser data.

## Features

- Dashboard metrics for balance, income, expenses, savings, budgets, monthly spending, and today's spending
- Add, edit, delete, duplicate, search, filter, and sort transactions
- Multiple wallets and custom income/expense categories
- Monthly and category budgets with warning and danger states
- Monthly, yearly, category, largest-expense, and income-source reports
- CSV, JSON, backup export, backup import, and restore previous backup
- Dark/light theme, currency, date format, number format, and notification settings
- Offline PWA files with service worker caching

## Privacy

No server is used. Data remains in the current browser profile unless exported by the user.
