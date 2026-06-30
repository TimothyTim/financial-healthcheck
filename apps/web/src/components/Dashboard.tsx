import type { StatementPeriod, StatementWithSummary } from "@financial-healthcheck/shared";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FullPageLoader } from "@/components/ui/spinner";
import { useUser } from "@/contexts/UserProvider";
import { fetchStatements } from "@/lib/api";
import { formatMoney } from "@/lib/format-money";
import { formatOutlookStatement } from "@/lib/format-outlook";
import { formatStatementStatusLabel } from "@/lib/format-statement-status";

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

function statusBadgeVariant(
  status: StatementWithSummary["summary"]["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "breathingRoom":
      return "default";
    case "tight":
    case "atRisk":
      return "secondary";
    case "deficit":
      return "destructive";
    case "needsReview":
      return "outline";
  }
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

  const latest = data?.[0];
  const recentStatements = data?.slice(1) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Your financial health
          </h1>
          <Button onClick={() => navigate("/statement/new")}>
            Add Statement
          </Button>
        </header>

        {isError && (
          <Card className="mb-6">
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

        {latest && (
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Latest — {formatPeriod(latest.period)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Badge variant={statusBadgeVariant(latest.summary.status)}>
                  {formatStatementStatusLabel(latest.summary.status)}
                </Badge>
              </div>
              <p className="mt-4 text-lg font-medium text-foreground">
                {formatOutlookStatement(latest.summary)}
              </p>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Breakdown</CardTitle>
                <CardDescription>{formatPeriod(latest.period)}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Total monthly income
                    </dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {formatMoney(latest.summary.totalIncome)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Total monthly expenses
                    </dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {formatMoney(latest.summary.totalExpenses)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Total monthly repayments
                    </dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {formatMoney(latest.summary.totalDebtRepayments)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Money left</dt>
                    <dd className="text-lg font-semibold text-foreground">
                      {formatMoney(latest.summary.netPosition)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guidance</CardTitle>
                <CardDescription>{formatPeriod(latest.period)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Suggested repayment guidance
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {latest.summary.repaymentGuidance}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Why am I seeing this?
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {latest.summary.whyAmISeeingThis}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {recentStatements.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent statements</CardTitle>
              <CardDescription>Your previous monthly statements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {recentStatements.map((statement) => (
                  <li key={statement.id}>
                    <Link
                      to={`/statement/${statement.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:text-primary"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {formatPeriod(statement.period)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatStatementStatusLabel(statement.summary.status)}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">
                        {formatMoney(statement.summary.netPosition)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
