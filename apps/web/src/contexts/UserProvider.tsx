import type { User } from "@financial-healthcheck/shared";
import {
  clearStoredUser,
  loadUser,
  saveUser,
} from "@/lib/user-storage";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface UserContextValue {
  user: User | null;
  setUser: (name: string) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<User | null>(() => loadUser());

  const setUser = useCallback((name: string) => {
    const nextUser: User = {
      id: crypto.randomUUID(),
      name,
    };

    saveUser(nextUser);
    setUserState(nextUser);
  }, []);

  const clearUser = useCallback(() => {
    clearStoredUser();
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, clearUser }),
    [user, setUser, clearUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
