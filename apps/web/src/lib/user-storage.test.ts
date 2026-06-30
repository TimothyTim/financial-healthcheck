import { describe, expect, it, beforeEach } from "vitest";
import {
  USER_STORAGE_KEY,
  clearStoredUser,
  loadUser,
  saveUser,
} from "@/lib/user-storage";

describe("user storage", () => {
  beforeEach(() => {
    clearStoredUser();
  });

  it("returns null when no user is stored", () => {
    expect(loadUser()).toBeNull();
  });

  it("saves and loads a user", () => {
    const user = { id: "user-1", name: "Alex" };
    saveUser(user);

    expect(loadUser()).toEqual(user);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBe(JSON.stringify(user));
  });

  it("returns null for invalid stored data", () => {
    localStorage.setItem(USER_STORAGE_KEY, '{"name":"Alex"}');

    expect(loadUser()).toBeNull();
  });

  it("clears stored user data", () => {
    saveUser({ id: "user-1", name: "Alex" });
    clearStoredUser();

    expect(loadUser()).toBeNull();
  });
});
