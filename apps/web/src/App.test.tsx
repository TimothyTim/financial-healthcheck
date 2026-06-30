import { describe, expect, it } from "vitest";
import { App } from "@/App";
import { renderWithProviders } from "@/test/test-utils";

describe("App", () => {
  it("renders an empty shell", () => {
    const { container } = renderWithProviders(<App />);

    expect(container.querySelector("main")).toBeInTheDocument();
    expect(container.querySelector("main")?.childElementCount).toBe(0);
  });
});
