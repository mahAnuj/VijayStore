import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";

// Token storage utilities
const TOKEN_KEY = 'auth_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// Custom API request with JWT token
async function apiRequestWithAuth(method: string, url: string, data?: unknown): Promise<Response> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  // State to track if we have a token (for reactive query enabling)
  const [hasToken, setHasToken] = useState<boolean>(false);
  
  // Check for token on mount and when localStorage changes
  useEffect(() => {
    const checkToken = () => {
      const token = getStoredToken();
      setHasToken(!!token);
    };
    
    // Check on mount
    checkToken();
    
    // Listen for storage changes (in case token is set/removed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        checkToken();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Get user info using JWT token
  const { data: response, isLoading, error } = useQuery<{user: User}>({
    queryKey: ["/api/auth"],
    queryFn: async () => {
      const res = await apiRequestWithAuth('GET', '/api/auth');
      return await res.json();
    },
    retry: false,
    enabled: hasToken, // Use reactive state instead of static check
  });

  const user = response?.user;

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest('POST', '/api/auth', { 
        action: 'send-otp', 
        phoneNumber: phone 
      });
      return await res.json();
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otpCode }: { phone: string; otpCode: string }) => {
      const res = await apiRequest('POST', '/api/auth', { 
        action: 'verify-otp', 
        phoneNumber: phone, 
        otp: otpCode 
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        setStoredToken(data.token);
        // Update the token state to enable the query
        setHasToken(true);
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
      }
      
      return data;
    },
  });

  // Logout function
  const logout = () => {
    removeStoredToken();
    setHasToken(false); // Update state to disable the query
    queryClient.clear(); // Clear all cached data
    window.location.reload(); // Refresh page
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    error,
    sendOtpMutation,
    verifyOtpMutation,
    logout,
    getToken: getStoredToken,
  };
} 