import { useAuth } from "@/hooks/useAuth";

export function DebugAuth() {
  const { user, isAuthenticated, isLoading, error, getToken } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Token: {getToken() ? '✅ Present' : '❌ Missing'}</div>
        <div>Loading: {isLoading ? '🔄 Yes' : '✅ No'}</div>
        <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
        <div>User: {user ? `✅ ${user.firstName || user.phone}` : '❌ None'}</div>
        {error && <div>Error: {error.message}</div>}
      </div>
    </div>
  );
} 