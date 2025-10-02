import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { LanguageProvider } from "@/hooks/useLanguage";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Equipment = lazy(() => import("@/pages/equipment"));
const Calibrations = lazy(() => import("@/pages/calibrations"));
const Wells = lazy(() => import("@/pages/wells"));
const OrificePlates = lazy(() => import("@/pages/orifice-plates"));
const ChemicalAnalysis = lazy(() => import("@/pages/chemical-analysis"));
const Reports = lazy(() => import("@/pages/reports"));
const Valves = lazy(() => import("@/pages/valves"));
const UncertaintyControl = lazy(() => import("@/pages/uncertainty-control"));
const Campos = lazy(() => import("@/pages/campos"));
const CalibrationCalendar = lazy(() => import("@/pages/calibration-calendar"));
const ExecutionCalibrations = lazy(() => import("@/pages/execution-calibrations"));
const CalibrationHistory = lazy(() => import("@/pages/calibration-history"));
const TrechosRetos = lazy(() => import("@/pages/trechos-retos"));
const GestaoCilindros = lazy(() => import("@/pages/gestao-cilindros"));
const Installations = lazy(() => import("@/pages/installations"));
const MeasurementPoints = lazy(() => import("@/pages/measurement-points"));
const MedidoresPrimarios = lazy(() => import("@/pages/medidores-primarios"));
const ProtecaoLacre = lazy(() => import("@/pages/protecao-lacre"));
const NotificationSettings = lazy(() => import("@/pages/notification-settings"));
const Notifications = lazy(() => import("@/pages/notifications"));
const TestesPocos = lazy(() => import("@/pages/testes-pocos"));
const DashboardCompleto = lazy(() => import("@/pages/dashboard-completo"));
const Help = lazy(() => import("@/pages/help"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-screen">
        <Header />
        <main className="flex-1 h-full overflow-x-auto overflow-y-hidden bg-background px-4 md:px-6 py-4">
          <Suspense fallback={<LoadingFallback />}>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard-completo" component={DashboardCompleto} />
              <Route path="/equipamentos" component={Equipment} />
              <Route path="/calibracoes" component={Calibrations} />
              <Route path="/execucao-calibracoes" component={ExecutionCalibrations} />
              <Route path="/historico-calibracoes" component={CalibrationHistory} />
              <Route path="/campos" component={Campos} />
              <Route path="/pocos" component={Wells} />
              <Route path="/placas-orificio" component={OrificePlates} />
              <Route path="/trechos-retos" component={TrechosRetos} />
              <Route path="/medidores-primarios" component={MedidoresPrimarios} />
              <Route path="/protecao-lacre" component={ProtecaoLacre} />
              <Route path="/valvulas" component={Valves} />
              <Route path="/gestao-cilindros" component={GestaoCilindros} />
              <Route path="/instalacoes" component={Installations} />
              <Route path="/pontos-medicao" component={MeasurementPoints} />
              <Route path="/testes-pocos" component={TestesPocos} />
              <Route path="/notificacoes" component={Notifications} />
              <Route path="/configuracoes-notificacoes" component={NotificationSettings} />
              <Route path="/analises-quimicas" component={ChemicalAnalysis} />
              <Route path="/controle-incertezas" component={UncertaintyControl} />
              <Route path="/relatorios" component={Reports} />
              <Route path="/ajuda" component={Help} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
