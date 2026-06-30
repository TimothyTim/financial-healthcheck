import { describe, expect, it } from "vitest";
import { App } from "@/App";
import { renderWithProviders, screen } from "@/test/test-utils";

describe("App", () => {
  it("shows onboarding when user is not set", () => {
    renderWithProviders(<App />);

    expect(screen.getByText("What shall we call you?")).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
  });
});
