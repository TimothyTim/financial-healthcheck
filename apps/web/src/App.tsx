import { useUser } from "@/contexts/UserProvider";
import { Dashboard } from "@/components/Dashboard";
import { OnboardingView } from "@/components/OnboardingView";

export function App() {
  const { user } = useUser();

  return user ? <Dashboard /> : <OnboardingView />;
}
