import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// 🗣️ ConvAI imports
import {
  ConvAIProvider,
  ConversationWidget,
} from "@/convai-modules/providers/ConvAIProvider";
import { carDealershipTools } from "@/convai-modules/clientTools.carDealership";
import { useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import CarDetail from "./pages/CarDetail";
import Comparison from "./pages/Comparison";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

// Wrapper component to access react-router navigation inside ConvAI tools
const ConvAIWrapper = () => {
  const navigate = useNavigate();
  const domainTools = carDealershipTools({ navigate });

  return (
    <ConvAIProvider domainTools={domainTools}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/car/:id" element={<CarDetail />} />
        <Route path="/compare" element={<Comparison />} />
        <Route path="/admin/*" element={<Admin />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Floating mic widget */}
      <ConversationWidget />
    </ConvAIProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ConvAIWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
