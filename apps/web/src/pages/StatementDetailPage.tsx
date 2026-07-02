import type { StatementPeriod } from "@financial-healthcheck/shared";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FullPageLoader } from "@/components/ui/spinner";
import { fetchStatement } from "@/lib/api";
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

export function StatementDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["statement", id],
    queryFn: () => fetchStatement(id!),
    enabled: !!id,
  });

  if (!id) {
    return null;
  }

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Unknown error"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Retrying…" : "Try again"}
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { summary, period } = data;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {formatPeriod(period)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your monthly financial summary
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to={`/statement/new?statementId=${id}`}>Edit</Link>
          </Button>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">
                  Total monthly income
                </dt>
                <dd className="text-lg font-semibold text-foreground">
                  {formatMoney(summary.totalIncome)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Total monthly expenses
                </dt>
                <dd className="text-lg font-semibold text-foreground">
                  {formatMoney(summary.totalExpenses)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Total monthly repayments
                </dt>
                <dd className="text-lg font-semibold text-foreground">
                  {formatMoney(summary.totalDebtRepayments)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Money left</dt>
                <dd className="text-lg font-semibold text-foreground">
                  {formatMoney(summary.netPosition)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Suggested repayment guidance
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {summary.repaymentGuidance}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Why am I seeing this?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {summary.whyAmISeeingThis}
            </p>
          </section>
        </div>

        <Button asChild className="mt-8" variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </main>
    </div>
  );
}
