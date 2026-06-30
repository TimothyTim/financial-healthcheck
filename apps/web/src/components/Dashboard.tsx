import type { StatementPeriod } from "@financial-healthcheck/shared";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FullPageLoader } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/contexts/UserProvider";
import { fetchStatements } from "@/lib/api";
import { formatMoney } from "@/lib/format-money";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatPeriod(period: StatementPeriod): string {
  return `${monthNames[period.month - 1]} ${period.year}`;
}

export function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["statements", user?.id],
    queryFn: () => fetchStatements(user!.id),
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (data && data.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <Button onClick={() => navigate("/statement/new")}>
          Start financial health check
        </Button>
        <p className="mt-4 max-w-md text-center text-sm text-muted-foreground">
          This will help you better understand your financial health and manage
          your way out of debt.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hello, {user.name}
          </p>
        </header>

        {isError && (
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Unknown error"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Retrying…" : "Try again"}
              </Button>
            </CardContent>
          </Card>
        )}

        {data && data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Statements</CardTitle>
              <CardDescription>
                Your monthly financial statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Net position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell>{formatPeriod(statement.period)}</TableCell>
                      <TableCell>
                        {formatMoney(statement.summary.netPosition)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
