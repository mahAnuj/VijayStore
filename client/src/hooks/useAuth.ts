import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: response, isLoading } = useQuery<{user: User}>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const user = response?.user;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };
}