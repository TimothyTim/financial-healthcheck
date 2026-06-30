import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactElement, type ReactNode } from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult {
  return render(ui, {
    wrapper: Providers,
    ...options,
  });
}

export { renderWithProviders, userEvent };
export * from "@testing-library/react";
