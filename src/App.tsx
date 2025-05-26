
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Calendar from "./pages/Calendar";
import Athletes from "./pages/Athletes";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CoachRiskBoard from "./pages/CoachRiskBoard";

const queryClient = new QueryClient();

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }
  
  // Role-based default routing
  if (profile.role === 'coach') {
    return <Navigate to="/coach" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/coach" element={<CoachRiskBoard />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/athletes" element={<Athletes />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/" element={<RoleBasedRedirect />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
