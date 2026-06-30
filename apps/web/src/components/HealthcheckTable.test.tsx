import { describe, expect, it } from "vitest";
import { HealthcheckTable } from "@/components/HealthcheckTable";
import { render, screen } from "@/test/test-utils";

describe("HealthcheckTable", () => {
  it("renders category rows with scores", () => {
    render(
      <HealthcheckTable
        overallScore={72}
        categories={{
          savings: 80,
          debt: 65,
          budget: 70,
          investments: 73,
        }}
      />,
    );

    expect(screen.getByText("Category Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Savings")).toBeInTheDocument();
    expect(screen.getByText("Debt")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("Investments")).toBeInTheDocument();
    expect(screen.getAllByText("80").length).toBeGreaterThan(0);
    expect(screen.getAllByText("72").length).toBeGreaterThan(0);
  });
});
