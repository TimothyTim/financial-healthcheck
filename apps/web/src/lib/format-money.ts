import type { Money } from "@financial-healthcheck/shared";

export function formatMoney(money: Money): string {
  const pounds = money.amount / 100;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pounds);
}
