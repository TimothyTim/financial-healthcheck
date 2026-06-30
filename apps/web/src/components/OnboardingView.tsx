import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserProvider";

export function OnboardingView() {
  const { setUser } = useUser();
  const [name, setName] = useState("");

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setUser(trimmedName);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <form
        className="flex w-full max-w-sm flex-col gap-6"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl font-semibold text-foreground">
          What shall we call you?
        </h1>
        <Input
          autoFocus
          aria-label="Your name"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" disabled={!canSubmit}>
          Continue
        </Button>
      </form>
    </div>
  );
}
