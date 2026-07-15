export const formatAmount = (value: number): string => {
  return new Intl.NumberFormat("ru", {
    style: "currency",
    currency: "RUB",
  }).format(value / 100);
};
