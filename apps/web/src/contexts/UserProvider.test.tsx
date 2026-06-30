import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserProvider, useUser } from "@/contexts/UserProvider";

describe("UserProvider", () => {
  it("defaults user to null", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    expect(result.current.user).toBeNull();
  });

  it("setUser stores the name in memory", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    act(() => {
      result.current.setUser("Alex");
    });

    expect(result.current.user).toEqual({ name: "Alex" });
  });

  it("clearUser resets user to null", () => {
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
  });

  it("throws when useUser is used outside UserProvider", () => {
    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within a UserProvider",
    );
  });
});
