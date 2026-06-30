import { useUser } from "@/contexts/UserProvider";
import { HomePage } from "@/components/HomePage";
import { OnboardingView } from "@/components/OnboardingView";

export function App() {
  const { user } = useUser();

  return user ? <HomePage /> : <OnboardingView />;
}
