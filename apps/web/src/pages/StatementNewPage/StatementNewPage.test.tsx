import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { StatementDetailPage } from "@/pages/StatementDetailPage";
import { StatementNewPage } from "@/pages/StatementNewPage/StatementNewPage";
import { USER_STORAGE_KEY } from "@/lib/user-storage";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";

function seedUser() {
  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({ id: "user-test", name: "Alex" }),
  );
}

function renderStatementNewPageWithRoutes() {
  return renderWithProviders(
    <Routes>
      <Route path="/statement/new" element={<StatementNewPage />} />
      <Route path="/statement/:id" element={<StatementDetailPage />} />
    </Routes>,
    { routerProps: { initialEntries: ["/statement/new"] } },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

const createdStatementResponse = {
  id: "stmt-new",
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

const sampleStatementResponse = {
  ...createdStatementResponse,
  id: "stmt-sample",
  summary: {
    totalIncome: { amount: 250_000 },
    totalExpenses: { amount: 105_000 },
    totalDebtRepayments: { amount: 20_000 },
    netPosition: { amount: 125_000 },
    status: "breathingRoom",
    repaymentGuidance:
      "You may have room to maintain or modestly increase repayments — confirm amounts with your creditors first.",
    whyAmISeeingThis:
      "Your monthly net position is £1,250.00 (at least £300 left after essentials and debt payments), so we class this as breathing room.",
  },
};

describe("StatementNewPage", () => {
  beforeEach(() => {
    seedUser();
  });

  it("renders payment group headings and submit button", () => {
    renderStatementNewPageWithRoutes();

    expect(
      screen.getByRole("heading", { name: "Add a new financial statement" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Monthly income")).toBeInTheDocument();
    expect(screen.getByText("Monthly essential costs")).toBeInTheDocument();
    expect(
      screen.getByText("Debt and financial commitments"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit statement" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Use sample data" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors when required payment fields are empty", async () => {
    const user = userEvent.setup();
    renderStatementNewPageWithRoutes();

    await user.click(screen.getByRole("button", { name: "Submit statement" }));

    expect(await screen.findAllByText("Label is required")).toHaveLength(3);
    expect(screen.getAllByText("Amount must be greater than zero")).toHaveLength(
      3,
    );
  });

  it("submits the statement and navigates to the detail page", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createdStatementResponse), { status: 201 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createdStatementResponse), { status: 200 }),
      );

    const user = userEvent.setup();
    renderStatementNewPageWithRoutes();

    await user.type(screen.getAllByPlaceholderText("e.g. Salary")[0]!, "Salary");
    await user.type(screen.getAllByPlaceholderText("0.00")[0]!, "2000");
    await user.type(screen.getAllByPlaceholderText("e.g. Salary")[1]!, "Rent");
    await user.type(screen.getAllByPlaceholderText("0.00")[1]!, "800");
    await user.type(screen.getAllByPlaceholderText("e.g. Salary")[2]!, "Card");
    await user.type(screen.getAllByPlaceholderText("0.00")[2]!, "100");

    await user.click(screen.getByRole("button", { name: "Submit statement" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "June 2026" }),
      ).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/statements",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const [, requestInit] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(String(requestInit?.body));

    expect(body).toMatchObject({
      userId: "user-test",
      month: expect.any(Number),
      year: expect.any(Number),
    });
    expect(body.payments).toEqual(
      expect.arrayContaining([
        { type: "income", label: "Salary", amount: { amount: 200_000 } },
        { type: "expense", label: "Rent", amount: { amount: 80_000 } },
        {
          type: "debtRepayment",
          label: "Card",
          amount: { amount: 10_000 },
        },
      ]),
    );
  });

  it("submits sample data when Use sample data is clicked", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleStatementResponse), { status: 201 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleStatementResponse), { status: 200 }),
      );

    const user = userEvent.setup();
    renderStatementNewPageWithRoutes();

    await user.click(screen.getByRole("button", { name: "Use sample data" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "June 2026" }),
      ).toBeInTheDocument();
    });

    const [, requestInit] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(String(requestInit?.body));

    expect(body.userId).toBe("user-test");
    expect(body.payments).toEqual(
      expect.arrayContaining([
        { type: "income", label: "Salary", amount: { amount: 250_000 } },
        { type: "expense", label: "Rent", amount: { amount: 90_000 } },
        { type: "expense", label: "Utilities", amount: { amount: 15_000 } },
        {
          type: "debtRepayment",
          label: "Credit card",
          amount: { amount: 20_000 },
        },
      ]),
    );
  });
});
