import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { StatementDetailPage } from "@/pages/StatementDetailPage";
import { USER_STORAGE_KEY } from "@/lib/user-storage";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";

const mockStatement = {
  id: "stmt-1",
  userId: "user-test",
  period: { month: 6, year: 2026 },
  payments: [],
  summary: {
    totalIncome: { amount: 200_000 },
    totalExpenses: { amount: 80_000 },
    totalDebtRepayments: { amount: 10_000 },
    netPosition: { amount: 110_000 },
    status: "breathingRoom",
    repaymentGuidance:
      "You may have room to maintain or modestly increase repayments — confirm amounts with your creditors first.",
    whyAmISeeingThis:
      "Your monthly net position is £1,100.00 (at least £300 left after essentials and debt payments), so we class this as breathing room.",
  },
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

function seedUser() {
  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({ id: "user-test", name: "Alex" }),
  );
}

function renderStatementDetailPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/statement/:id" element={<StatementDetailPage />} />
    </Routes>,
    { routerProps: { initialEntries: ["/statement/stmt-1"] } },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("StatementDetailPage", () => {
  beforeEach(() => {
    seedUser();
  });

  it("fetches and renders the statement summary", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockStatement), { status: 200 }),
    );

    renderStatementDetailPage();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "June 2026" }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("£2,000.00")).toBeInTheDocument();
    expect(screen.getByText("£800.00")).toBeInTheDocument();
    expect(screen.getByText("£100.00")).toBeInTheDocument();
    expect(screen.getByText("£1,100.00")).toBeInTheDocument();
    expect(screen.getByText("Suggested repayment guidance")).toBeInTheDocument();
    expect(screen.getByText(mockStatement.summary.repaymentGuidance)).toBeInTheDocument();
    expect(screen.getByText("Why am I seeing this?")).toBeInTheDocument();
    expect(screen.getByText(mockStatement.summary.whyAmISeeingThis)).toBeInTheDocument();
  });

  it("navigates back to the homepage", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockStatement), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    const user = userEvent.setup();
    renderStatementDetailPage();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Back to home" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: "Back to home" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Start financial health check" }),
      ).toBeInTheDocument();
    });
  });

  it("shows an error state when the statement cannot be loaded", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 }),
    );

    renderStatementDetailPage();

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(screen.getByText("Statement not found")).toBeInTheDocument();
  });
});
