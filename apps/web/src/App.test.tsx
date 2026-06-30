import { describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { USER_STORAGE_KEY } from "@/lib/user-storage";
import { renderWithProviders, screen, waitFor } from "@/test/test-utils";

describe("App", () => {
  it("shows onboarding when user is not set", () => {
    renderWithProviders(<App />);

    expect(screen.getByText("What shall we call you?")).toBeInTheDocument();
  });

  it("shows the dashboard when a user is stored", async () => {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({ id: "user-test", name: "Alex" }),
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    renderWithProviders(<App />);

    expect(screen.queryByText("What shall we call you?")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });
  });
});
