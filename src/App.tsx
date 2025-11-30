import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import LoadingScreen from "./components/LoadingScreen";
import AIChat from "./components/AIChat";
import Index from "./pages/Index";
import Brocamp from "./pages/Brocamp";
import Student from "./pages/Student";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import AuthStudent from "./pages/AuthStudent";
import AuthAdmin from "./pages/AuthAdmin";
import VerifyEmail from "./pages/VerifyEmail";
import InitialSetup from "./pages/InitialSetup";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <LanguageProvider>
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      </LanguageProvider>
    );
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AIChat />
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/brocamp" element={<Brocamp />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/student" element={<AuthStudent />} />
          <Route path="/auth/admin" element={<AuthAdmin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/setup" element={<InitialSetup />} />
          <Route 
            path="/student" 
            element={
              <ProtectedRoute>
                <Student />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
