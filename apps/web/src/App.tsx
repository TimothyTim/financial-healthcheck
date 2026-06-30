import { useQuery } from "@tanstack/react-query";
import { HealthcheckTable } from "@/components/HealthcheckTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchHealthcheck } from "@/lib/api";

export function App() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["healthcheck"],
    queryFn: fetchHealthcheck,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Financial Healthcheck
            </h1>
            <p className="text-sm text-muted-foreground">
              Understand your financial wellness at a glance
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {isLoading && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading your healthcheck…
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
              <Button onClick={() => refetch()}>Try again</Button>
            </CardContent>
          </Card>
        )}

        {data && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Score</CardTitle>
                <CardDescription>
                  Last updated{" "}
                  {new Date(data.createdAt).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">{data.score}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  out of 100
                </p>
              </CardContent>
            </Card>

            <HealthcheckTable
              categories={data.categories}
              overallScore={data.score}
            />
          </div>
        )}
      </main>
    </div>
  );
}
