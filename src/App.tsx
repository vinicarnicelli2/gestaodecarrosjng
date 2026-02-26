import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Checklist from "./pages/Checklist";
import ChecklistHistory from "./pages/ChecklistHistory";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Maintenances from "./pages/Maintenances";
import OilControl from "./pages/OilControl";
import Reservations from "./pages/Reservations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/checklist" element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
            <Route path="/checklist/historico" element={<ProtectedRoute><ChecklistHistory /></ProtectedRoute>} />
            <Route path="/veiculos" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
            <Route path="/motoristas" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
            <Route path="/manutencoes" element={<ProtectedRoute><Maintenances /></ProtectedRoute>} />
            <Route path="/oleo" element={<ProtectedRoute><OilControl /></ProtectedRoute>} />
            <Route path="/reservas" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
