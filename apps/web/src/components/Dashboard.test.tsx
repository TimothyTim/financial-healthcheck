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
    id: "stmt-1",
    userId: "user-test",
    period: { month: 6, year: 2026 },
    payments: [],
    summary: {
      totalIncome: { amount: 100_000 },
      totalExpenses: { amount: 40_000 },
      totalDebtRepayments: { amount: 10_000 },
      netPosition: { amount: 50_000 },
    },
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
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
      screen.queryByRole("heading", { name: "Dashboard" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Hello, Alex")).not.toBeInTheDocument();
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
      screen.queryByRole("heading", { name: "Dashboard" }),
    ).not.toBeInTheDocument();
  });

  it("shows statement rows from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockStatements), { status: 200 }),
    );

    renderDashboardWithRoutes();

    await waitFor(() => {
      expect(screen.getByText("June 2026")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Hello, Alex")).toBeInTheDocument();
    expect(screen.getByText("£500.00")).toBeInTheDocument();
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
