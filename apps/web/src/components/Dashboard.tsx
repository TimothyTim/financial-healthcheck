import type { StatementPeriod } from "@financial-healthcheck/shared";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["statements", user?.id],
    queryFn: () => fetchStatements(user!.id),
    enabled: !!user,
  });

  if (!user) {
    return null;
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

        {isLoading && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading statements…
            </CardContent>
          </Card>
        )}

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

        {data && data.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No statements yet
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
