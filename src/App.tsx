
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import new pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CoachBoard from "./pages/CoachBoard";
import Calendar from "./pages/Calendar";
import Workout from "./pages/Workout";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Athletes from "./pages/Athletes";
import Subscriptions from "./pages/Subscriptions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Enhanced role-based redirect component
const RoleBasedRedirect = () => {
  const { profile, loading, user, error } = useAuth();
  
  console.log('RoleBasedRedirect - user:', !!user, 'profile:', profile, 'loading:', loading, 'error:', error);
  
  // Show loading while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If no user, redirect to login
  if (!user) {
    console.log('RoleBasedRedirect: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If error or no profile after loading, redirect to login with error handling
  if (error) {
    console.log('RoleBasedRedirect: Error detected, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If no profile but user exists, wait a bit longer or redirect to login
  if (!profile) {
    console.log('RoleBasedRedirect: No profile found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('RoleBasedRedirect: Redirecting based on role:', profile.role);
  
  // Redirect based on role
  if (profile.role === 'coach') {
    return <Navigate to="/coach" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach" 
          element={
            <ProtectedRoute>
              <PageTransition><CoachBoard /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <PageTransition><Calendar /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workout" 
          element={
            <ProtectedRoute>
              <PageTransition><Workout /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <PageTransition><Chat /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <PageTransition><Settings /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/athletes" 
          element={
            <ProtectedRoute>
              <PageTransition><Athletes /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscriptions" 
          element={
            <ProtectedRoute>
              <PageTransition><Subscriptions /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
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
