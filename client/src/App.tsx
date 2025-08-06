import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { DebugAuth } from "@/components/debug-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import PhoneLogin from "@/pages/phone-login";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Checkout from "@/pages/checkout";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";

function Router() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/login" component={PhoneLogin} />
      <Route path="/products" component={Products} />
      <Route path="/products/:category" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      
      {/* Conditional routes based on authentication */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/checkout" component={Checkout} />
          {isAdmin && <Route path="/admin" component={Admin} />}
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <DebugAuth />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
