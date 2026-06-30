import { Route, Routes } from "react-router-dom";
import { useUser } from "@/contexts/UserProvider";
import { Dashboard } from "@/components/Dashboard";
import { OnboardingView } from "@/components/OnboardingView";
import { StatementDetailPage } from "@/pages/StatementDetailPage";
import { StatementNewPage } from "@/pages/StatementNewPage/StatementNewPage";

export function App() {
  const { user } = useUser();

  if (!user) {
    return <OnboardingView />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/statement/new" element={<StatementNewPage />} />
      <Route path="/statement/:id" element={<StatementDetailPage />} />
    </Routes>
  );
}
