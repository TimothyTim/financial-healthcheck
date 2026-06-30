import { useUser } from "@/contexts/UserProvider";

export function HomePage() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Hello, {user.name}
        </h1>
      </main>
    </div>
  );
}
