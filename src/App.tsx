import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

// Import pages
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
import Subscription from "./pages/Subscription";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
        
        {/* Protected Routes wrapped in AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/coach" element={<PageTransition><CoachBoard /></PageTransition>} />
            <Route path="/calendar" element={<PageTransition><Calendar /></PageTransition>} />
            <Route path="/workout" element={<PageTransition><Workout /></PageTransition>} />
            <Route path="/chat" element={<PageTransition><Chat /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="/athletes" element={<PageTransition><Athletes /></PageTransition>} />
            <Route path="/subscriptions" element={<PageTransition><Subscriptions /></PageTransition>} />
            <Route path="/subscription" element={<PageTransition><Subscription /></PageTransition>} />
          </Route>
        </Route>
        
        <Route path="/" element={<Navigate to="/home" replace />} />
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
