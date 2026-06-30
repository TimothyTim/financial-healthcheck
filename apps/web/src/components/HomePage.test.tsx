import { type ReactNode, useEffect } from "react";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/components/HomePage";
import { useUser } from "@/contexts/UserProvider";
import { renderWithProviders, screen, waitFor } from "@/test/test-utils";

function SeedUser({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const { user, setUser } = useUser();

  useEffect(() => {
    if (!user) {
      setUser(name);
    }
  }, [name, setUser, user]);

  if (!user) {
    return null;
  }

  return children;
}

describe("HomePage", () => {
  it("renders a greeting with the user name", async () => {
    renderWithProviders(
      <SeedUser name="Alex">
        <HomePage />
      </SeedUser>,
    );

    await waitFor(() => {
      expect(screen.getByText("Hello, Alex")).toBeInTheDocument();
    });
  });
});
