export const faNumberFormatter = new Intl.NumberFormat("fa-IR");

export const faDecimalFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
});

export const faDateFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
});

export const faDateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
});
