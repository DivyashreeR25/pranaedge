import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TrialErrorProvider } from "@/contexts/TrialErrorContext";
import { ChatBot } from "@/components/ChatBot";
import { useTrialErrorHandler } from "@/hooks/use-trial-error-handler";
import { TrialExpiredDialog } from "@/components/TrialExpiredDialog";
import HomePage from "./pages/HomePage";
import YogaPage from "./pages/YogaPage";
import MeditationPage from "./pages/MeditationPage";
import SleepTrackerPage from "./pages/SleepTrackerPage";
import DietTrackerPage from "./pages/DietTrackerPage";
import HealthStatusPage from "./pages/HealthStatusPage";
import NutritionGuidePage from "./pages/NutritionGuidePage";
import VedicPhilosophyPage from "./pages/VedicPhilosophyPage";
import LiveClassPage from "./pages/LiveClassPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/yoga" element={<ProtectedRoute><YogaPage /></ProtectedRoute>} />
        <Route path="/meditation" element={<ProtectedRoute><MeditationPage /></ProtectedRoute>} />
        <Route path="/sleep" element={<ProtectedRoute><SleepTrackerPage /></ProtectedRoute>} />
        <Route path="/diet" element={<ProtectedRoute><DietTrackerPage /></ProtectedRoute>} />
        <Route path="/health" element={<ProtectedRoute><HealthStatusPage /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><NutritionGuidePage /></ProtectedRoute>} />
        <Route path="/vedic" element={<ProtectedRoute><VedicPhilosophyPage /></ProtectedRoute>} />
        <Route path="/live-class" element={<ProtectedRoute><LiveClassPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatBot />
    </BrowserRouter>
  );
};

const TrialErrorHandler = () => {
  const { 
    showTrialExpiredDialog, 
    setShowTrialExpiredDialog, 
    trialErrorData,
    onClose
  } = useTrialErrorHandler();

  return (
    <>
      <AppContent />
      
      {/* Trial Expired Dialog */}
      {trialErrorData && (
        <TrialExpiredDialog
          open={showTrialExpiredDialog}
          onOpenChange={setShowTrialExpiredDialog}
          errorMessage={trialErrorData.message}
          paymentUrl={trialErrorData.paymentUrl}
          onClose={onClose}
        />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <TrialErrorProvider>
          <TrialErrorHandler />
        </TrialErrorProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
