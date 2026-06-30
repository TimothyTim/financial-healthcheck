import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_STORAGE_KEY } from "@/lib/user-storage";
import { UserProvider, useUser } from "@/contexts/UserProvider";

describe("UserProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "generated-user-id"),
    });
  });

  it("defaults user to null when localStorage is empty", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    expect(result.current.user).toBeNull();
  });

  it("loads user from localStorage on mount", () => {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({ id: "stored-id", name: "Alex" }),
    );

    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    expect(result.current.user).toEqual({ id: "stored-id", name: "Alex" });
  });

  it("setUser stores id and name in state and localStorage", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.setUser("Alex");
    });

    expect(result.current.user).toEqual({
      id: "generated-user-id",
      name: "Alex",
    });
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBe(
      JSON.stringify({ id: "generated-user-id", name: "Alex" }),
    );
  });

  it("clearUser resets user to null and removes localStorage entry", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.setUser("Alex");
    });

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });

  it("throws when useUser is used outside UserProvider", () => {
    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within a UserProvider",
    );
  });
});
