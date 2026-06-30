import type { User } from "@financial-healthcheck/shared";

export const USER_STORAGE_KEY = "financial-healthcheck:user";

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    value.id.length > 0 &&
    value.name.length > 0
  );
}

export function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
}
