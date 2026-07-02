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

function renderStatementNewPageWithRoutes(
  initialEntry = "/statement/new",
) {
  return renderWithProviders(
    <Routes>
      <Route path="/statement/new" element={<StatementNewPage />} />
      <Route path="/statement/:id" element={<StatementDetailPage />} />
    </Routes>,
    { routerProps: { initialEntries: [initialEntry] } },
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

const editStatementResponse = {
  id: "stmt-edit",
  userId: "user-test",
  period: { month: 6, year: 2026 },
  payments: [
    {
      id: "pay-income",
      statementId: "stmt-edit",
      type: "income",
      label: "Salary",
      amount: { amount: 200_000 },
      date: "2026-06-01",
      createdAt: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "pay-expense",
      statementId: "stmt-edit",
      type: "expense",
      label: "Rent",
      amount: { amount: 80_000 },
      date: "2026-06-01",
      createdAt: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "pay-debt",
      statementId: "stmt-edit",
      type: "debtRepayment",
      label: "Credit card",
      amount: { amount: 10_000 },
      date: "2026-06-01",
      createdAt: "2026-06-01T00:00:00.000Z",
    },
  ],
  summary: createdStatementResponse.summary,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
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

  it("loads an existing statement in edit mode and submits a PATCH", async () => {
    const updatedStatementResponse = {
      ...editStatementResponse,
      summary: {
        ...editStatementResponse.summary,
        totalIncome: { amount: 210_000 },
      },
    };

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(editStatementResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(updatedStatementResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(updatedStatementResponse), { status: 200 }),
      );

    const user = userEvent.setup();
    renderStatementNewPageWithRoutes(
      "/statement/new?statementId=stmt-edit",
    );

    expect(
      await screen.findByRole("heading", { name: "Edit financial statement" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Use sample data" }),
    ).not.toBeInTheDocument();

    expect(screen.getByDisplayValue("Salary")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Rent")).toBeInTheDocument();
    expect(screen.getByDisplayValue("800")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Credit card")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();

    const incomeLabel = screen.getByDisplayValue("Salary");
    await user.clear(incomeLabel);
    await user.type(incomeLabel, "Salary plus bonus");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "June 2026" }),
      ).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/statements/stmt-edit",
      expect.objectContaining({
        method: "PATCH",
      }),
    );

    const [, requestInit] = fetchMock.mock.calls[1]!;
    const body = JSON.parse(String(requestInit?.body));

    expect(body).toMatchObject({
      month: 6,
      year: 2026,
    });
    expect(body.payments).toEqual(
      expect.arrayContaining([
        {
          type: "income",
          label: "Salary plus bonus",
          amount: { amount: 200_000 },
        },
      ]),
    );
  });

  describe("edit mode", () => {
    it("shows error state when the statement cannot be loaded", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(null, { status: 404 }),
      );

      renderStatementNewPageWithRoutes(
        "/statement/new?statementId=stmt-missing",
      );

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });

      expect(screen.getByText("Statement not found")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Save changes" }),
      ).not.toBeInTheDocument();
    });

    it("shows duplicate period error when PATCH returns 409", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(JSON.stringify(editStatementResponse), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              error: "Statement already exists for user user-test in 7/2026",
            }),
            { status: 409 },
          ),
        );

      const user = userEvent.setup();
      renderStatementNewPageWithRoutes(
        "/statement/new?statementId=stmt-edit",
      );

      await screen.findByRole("heading", { name: "Edit financial statement" });

      await user.selectOptions(screen.getByLabelText("Month"), "7");
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Statement already exists for user user-test in 7/2026",
        );
      });

      expect(
        screen.getByRole("heading", { name: "Edit financial statement" }),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("shows not found error when PATCH returns 404", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(JSON.stringify(editStatementResponse), { status: 200 }),
        )
        .mockResolvedValueOnce(new Response(null, { status: 404 }));

      const user = userEvent.setup();
      renderStatementNewPageWithRoutes(
        "/statement/new?statementId=stmt-edit",
      );

      await screen.findByRole("heading", { name: "Edit financial statement" });
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Statement not found",
        );
      });

      expect(
        screen.getByRole("heading", { name: "Edit financial statement" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "June 2026" }),
      ).not.toBeInTheDocument();
    });

    it("shows generic error when PATCH fails with an unexpected status", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(JSON.stringify(editStatementResponse), { status: 200 }),
        )
        .mockResolvedValueOnce(new Response(null, { status: 500 }));

      const user = userEvent.setup();
      renderStatementNewPageWithRoutes(
        "/statement/new?statementId=stmt-edit",
      );

      await screen.findByRole("heading", { name: "Edit financial statement" });
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Failed to update statement",
        );
      });

      expect(
        screen.getByRole("heading", { name: "Edit financial statement" }),
      ).toBeInTheDocument();
    });
  });
});
