import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Equipment from "@/pages/equipment";
import Calibrations from "@/pages/calibrations";
import Wells from "@/pages/wells";
import OrificePlates from "@/pages/orifice-plates";
import ChemicalAnalysis from "@/pages/chemical-analysis";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/equipamentos" component={Equipment} />
            <Route path="/calibracoes" component={Calibrations} />
            <Route path="/pocos" component={Wells} />
            <Route path="/placas-orificio" component={OrificePlates} />
            <Route path="/analises-quimicas" component={ChemicalAnalysis} />
            <Route path="/relatorios" component={Reports} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
