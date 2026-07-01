export const filterTransactions = (transactions, controls) => {
  const query = controls.query.trim().toLowerCase();
  const filtered = transactions.filter(item => {
    const text = `${item.category} ${item.wallet} ${item.notes} ${item.type}`.toLowerCase();
    return (!query || text.includes(query))
      && (controls.type === "All" || item.type === controls.type)
      && (controls.category === "All" || item.category === controls.category)
      && (controls.wallet === "All" || item.wallet === controls.wallet);
  });
  return sortTransactions(filtered, controls.sort);
};

export const sortTransactions = (items, sort) => [...items].sort((a, b) => {
  if (sort === "amount-desc") return b.amount - a.amount;
  if (sort === "amount-asc") return a.amount - b.amount;
  if (sort === "category") return a.category.localeCompare(b.category);
  return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
});
