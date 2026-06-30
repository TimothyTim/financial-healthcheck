import type { Payment, StatementSummary } from "@financial-healthcheck/shared";

const zeroMoney = { amount: 0 };

export function computeSummary(payments: Payment[]): StatementSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalDebtRepayments = 0;

  for (const payment of payments) {
    switch (payment.type) {
      case "income":
        totalIncome += payment.amount.amount;
        break;
      case "expense":
        totalExpenses += payment.amount.amount;
        break;
      case "debtRepayment":
        totalDebtRepayments += payment.amount.amount;
        break;
    }
  }

  const netPosition = totalIncome - totalExpenses - totalDebtRepayments;

  return {
    totalIncome: { amount: totalIncome },
    totalExpenses: { amount: totalExpenses },
    totalDebtRepayments: { amount: totalDebtRepayments },
    netPosition: { amount: netPosition },
  };
}

export { zeroMoney };
