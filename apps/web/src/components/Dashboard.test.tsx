import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "@/components/Dashboard";
import { USER_STORAGE_KEY } from "@/lib/user-storage";
import { renderWithProviders, screen, waitFor } from "@/test/test-utils";

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Dashboard", () => {
  beforeEach(() => {
    seedUser();
  });

  it("renders the dashboard heading and greeting", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    renderWithProviders(<Dashboard />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Hello, Alex")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("No statements yet")).toBeInTheDocument();
    });
  });

  it("shows statement rows from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockStatements), { status: 200 }),
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("June 2026")).toBeInTheDocument();
    });

    expect(screen.getByText("£500.00")).toBeInTheDocument();
  });

  it("shows an empty state when the API returns no statements", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("No statements yet")).toBeInTheDocument();
    });
  });

  it("shows an error state when the API request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });
});
