import { useParams } from "react-router-dom";

export function StatementDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-foreground">Statement</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Statement ID: {id}
        </p>
      </main>
    </div>
  );
}
