import React, { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginMutation: ReturnType<typeof useLogin>;
  registerMutation: ReturnType<typeof useRegister>;
  logoutMutation: ReturnType<typeof useLogout>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["user"], userData);
    },
  });
}

function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      username: string;
      password: string;
      name?: string;
      email?: string;
    }) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });
}

function useLogout() {
  const queryClient = useQueryClient();
  const [, setUser] = useState<User | null>(null);

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear user state
      queryClient.setQueryData(["user"], null);
      // Clear all queries when logging out
      queryClient.clear();
    },
    onSettled: () => {
      // Always reset user state regardless of success/failure
      setUser(null);
    },
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/user", {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Clear user state if not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear user state on error
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Update user state when mutations succeed
  useEffect(() => {
    if (loginMutation.data) {
      setUser(loginMutation.data);
    }
    if (registerMutation.data) {
      setUser(registerMutation.data);
    }
  }, [loginMutation.data, registerMutation.data]);

  // Clear user state when logout mutation succeeds
  useEffect(() => {
    if (logoutMutation.isSuccess) {
      setUser(null);
    }
  }, [logoutMutation.isSuccess]);

  const value = {
    user,
    isLoading,
    loginMutation,
    registerMutation,
    logoutMutation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
