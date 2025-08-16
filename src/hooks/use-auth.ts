import { api } from "@/convex/_generated/api";
import { useMutation, useQuery, useAction } from "convex/react";
import { useEffect, useState } from "react";

const TOKEN_KEY = "auth_token";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const user = useQuery(api.users.currentUser, token ? { token } : { token: undefined });
  const login = useAction(api.users.login);
  const logoutMutation = useMutation(api.users.logout);

  const isAuthenticated = !!user;
  const isLoading = user === undefined;

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const signIn = async (args: { email: string; password: string }) => {
    const newToken = await login(args);
    setToken(newToken);
    return newToken;
  };

  const signOut = () => {
    if (token) {
      logoutMutation({ token });
    }
    setToken(null);
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
    token,
    setToken,
  };
}