import { describe, expect, it } from "vitest";
import { OnboardingView } from "@/components/OnboardingView";
import { UserProvider, useUser } from "@/contexts/UserProvider";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";

function OnboardingWithSpy() {
  const { user } = useUser();

  return (
    <>
      <OnboardingView />
      <span data-testid="user-name">{user?.name ?? ""}</span>
    </>
  );
}

describe("OnboardingView", () => {
  it("renders the question and name input", () => {
    renderWithProviders(<OnboardingView />);

    expect(screen.getByText("What shall we call you?")).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("disables submit when the name is empty or whitespace", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingView />);

    const continueButton = screen.getByRole("button", { name: "Continue" });
    const nameInput = screen.getByLabelText("Your name");

    await user.type(nameInput, "   ");
    expect(continueButton).toBeDisabled();
  });

  it("calls setUser with the trimmed name on submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingWithSpy />);

    await user.type(screen.getByLabelText("Your name"), "  Alex  ");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Alex");
    });
  });

  it("submits on Enter key", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingWithSpy />);

    const nameInput = screen.getByLabelText("Your name");
    await user.type(nameInput, "Sam{Enter}");

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Sam");
    });
  });
});
