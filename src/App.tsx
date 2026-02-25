import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Checklist from "./pages/Checklist";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Maintenances from "./pages/Maintenances";
import OilControl from "./pages/OilControl";
import Reservations from "./pages/Reservations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/veiculos" element={<Vehicles />} />
          <Route path="/motoristas" element={<Drivers />} />
          <Route path="/manutencoes" element={<Maintenances />} />
          <Route path="/oleo" element={<OilControl />} />
          <Route path="/reservas" element={<Reservations />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
