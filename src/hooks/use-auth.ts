import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

const TOKEN_KEY = "auth_token";

export function useAuth() {
  // Start with null and load from localStorage in an effect.
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  // This effect runs once on mount to load the token from localStorage.
  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem(TOKEN_KEY));
    }
    setIsTokenLoaded(true);
  }, []);

  // This effect syncs the `token` state back to localStorage whenever it changes.
  useEffect(() => {
    // Ensure this only runs on the client and after the initial token load
    if (isTokenLoaded && typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, [token, isTokenLoaded]);

  const user = useQuery(
    api.users.currentUser,
    // Skip query until we have loaded the token from localStorage
    isTokenLoaded ? (token ? { token } : { token: undefined }) : "skip",
  );
  const login = useMutation(api.users.login);
  const logoutMutation = useMutation(api.users.logout);

  const isAuthenticated = !!user;
  // We are loading if we haven't checked localStorage yet, or if the user query is running.
  const isLoading = !isTokenLoaded || user === undefined;

  const signIn = async (args: { identifier: string; password: string }) => {
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