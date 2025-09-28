import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { WalletProvider } from "./contexts/WalletContext";
import { SilentLoanCircleProvider } from "./contexts/SilentLoanCircleContext";
import { logger } from "./utils/logger";
import Landing from "./pages/Landing";
import CreateCircle from "./pages/CreateCircle";
import Dashboard from "./pages/Dashboard";
import ContributionFlow from "./pages/ContributionFlow";
import ContributeToCircle from "./pages/ContributeToCircle";
import ManageCircle from "./pages/ManageCircle";
import JoinCircle from "./pages/JoinCircle";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <SilentLoanCircleProvider logger={logger}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/create" element={<CreateCircle />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/contribute" element={<ContributionFlow />} />
                        <Route path="/contribute/:circleId" element={<ContributeToCircle />} />
                        <Route path="/manage/:circleId" element={<ManageCircle />} />
                        <Route path="/join/:circleId" element={<JoinCircle />} />
                        <Route path="/history" element={<History />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </SilentLoanCircleProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
