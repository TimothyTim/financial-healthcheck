import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { renderWithProviders, screen, waitFor } from "@/test/test-utils";

const mockHealthcheck = {
  id: "hc-test",
  score: 72,
  categories: {
    savings: 80,
    debt: 65,
    budget: 70,
    investments: 73,
  },
  createdAt: "2026-06-30T12:00:00.000Z",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders healthcheck data from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockHealthcheck), { status: 200 }),
    );

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByText("Your Score")).toBeInTheDocument();
    });

    expect(screen.getAllByText("72").length).toBeGreaterThan(0);
    expect(screen.getByText("Category Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Savings")).toBeInTheDocument();
  });

  it("shows an error state when the API request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });
});
