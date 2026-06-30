import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { StatementNewPage } from "@/pages/StatementNewPage/StatementNewPage";
import { USER_STORAGE_KEY } from "@/lib/user-storage";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";

const mockStatements = [
  {
    id: "stmt-latest",
    userId: "user-test",
    period: { month: 6, year: 2026 },
    payments: [],
    summary: {
      totalIncome: { amount: 100_000 },
      totalExpenses: { amount: 40_000 },
      totalDebtRepayments: { amount: 10_000 },
      netPosition: { amount: 50_000 },
      status: "breathingRoom",
      repaymentGuidance: "Keep repayments steady for now.",
      whyAmISeeingThis: "Your monthly net position is healthy.",
    },
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "stmt-older",
    userId: "user-test",
    period: { month: 5, year: 2026 },
    payments: [],
    summary: {
      totalIncome: { amount: 90_000 },
      totalExpenses: { amount: 50_000 },
      totalDebtRepayments: { amount: 10_000 },
      netPosition: { amount: 30_000 },
      status: "tight",
      repaymentGuidance: "Review spending before increasing payments.",
      whyAmISeeingThis: "Your monthly net position is tight.",
    },
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  },
];

function seedUser() {
  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({ id: "user-test", name: "Alex" }),
  );
}

function renderDashboardWithRoutes() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/statement/new" element={<StatementNewPage />} />
    </Routes>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Dashboard", () => {
  beforeEach(() => {
    seedUser();
  });

  it("shows a full-page empty state when there are no statements", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    renderDashboardWithRoutes();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Start financial health check" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("heading", { name: "Your financial health" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "This will help you better understand your financial health and manage your way out of debt.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a full-page loader while statements are loading", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );

    renderDashboardWithRoutes();

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your financial health" }),
    ).not.toBeInTheDocument();
  });

  it("shows the latest statement outlook, breakdown, guidance, and recent list", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockStatements), { status: 200 }),
    );

    renderDashboardWithRoutes();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Your financial health" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: "Add Statement" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Breathing room")).toBeInTheDocument();
    expect(
      screen.getByText("You have £500.00 left after regular outgoings."),
    ).toBeInTheDocument();
    expect(screen.getByText("Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Guidance")).toBeInTheDocument();
    expect(screen.getByText("Keep repayments steady for now.")).toBeInTheDocument();
    expect(screen.getByText("Recent statements")).toBeInTheDocument();
    expect(screen.getByText("May 2026")).toBeInTheDocument();
    expect(screen.getByText("Tight")).toBeInTheDocument();
  });

  it("navigates to the new statement page when the CTA is clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const user = userEvent.setup();
    renderDashboardWithRoutes();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Start financial health check" }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: "Start financial health check" }),
    );

    expect(
      screen.getByRole("heading", { name: "Add a new financial statement" }),
    ).toBeInTheDocument();
  });

  it("navigates to the new statement page from Add Statement", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockStatements), { status: 200 }),
    );

    const user = userEvent.setup();
    renderDashboardWithRoutes();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Add Statement" }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Add Statement" }));

    expect(
      screen.getByRole("heading", { name: "Add a new financial statement" }),
    ).toBeInTheDocument();
  });

  it("shows an error state when the API request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    renderDashboardWithRoutes();

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });
});
