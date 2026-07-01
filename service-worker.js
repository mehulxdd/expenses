const CACHE_NAME = "expensetracker-pro-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/dashboard.css",
  "./css/forms.css",
  "./css/animations.css",
  "./css/mobile.css",
  "./css/themes.css",
  "./js/app.js",
  "./js/storage.js",
  "./js/dashboard.js",
  "./js/transactions.js",
  "./js/charts.js",
  "./js/budget.js",
  "./js/categories.js",
  "./js/export.js",
  "./js/search.js",
  "./js/settings.js",
  "./js/notifications.js",
  "./js/utils.js",
  "./data/sample-data.json",
  "./icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
