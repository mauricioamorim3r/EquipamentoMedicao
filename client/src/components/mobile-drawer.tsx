import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  BarChart3,
  Settings,
  Wrench,
  Calendar,
  Tag,
  Flame,
  Circle,
  FlaskConical,
  FileText,
  Gauge,
  AlertCircle,
  MapPin,
  Ruler,
  Package,
  Building,
  Activity,
  Bell,
  Shield,
  HelpCircle,
  X,
} from "lucide-react";
import { useTranslation } from "@/hooks/useLanguage";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getMenuItems = (t: (key: string) => string) => [
  { path: "/", label: t("dashboard"), icon: BarChart3, category: "main" },
  { path: "/equipamentos", label: t("equipments"), icon: Wrench, category: "main" },
  { path: "/calibracoes", label: t("calibrations"), icon: Calendar, category: "main" },
  { path: "/execucao-calibracoes", label: t("calibrationExecution"), icon: Settings, category: "calibration" },
  { path: "/historico-calibracoes", label: t("calibrationHistory"), icon: FileText, category: "calibration" },
  { path: "/campos", label: t("fields"), icon: MapPin, category: "structure" },
  { path: "/instalacoes", label: t("installations"), icon: Building, category: "structure" },
  { path: "/pontos-medicao", label: t("measurementPoints"), icon: Activity, category: "structure" },
  { path: "/pocos", label: t("wells"), icon: Flame, category: "operations" },
  { path: "/testes-pocos", label: t("wellTests"), icon: FlaskConical, category: "operations" },
  { path: "/placas-orificio", label: t("orificePlates"), icon: Circle, category: "equipment" },
  { path: "/trechos-retos", label: t("straightSections"), icon: Ruler, category: "equipment" },
  { path: "/medidores-primarios", label: t("primaryMeters"), icon: Gauge, category: "equipment" },
  { path: "/valvulas", label: t("valves"), icon: Gauge, category: "equipment" },
  { path: "/protecao-lacre", label: t("protectionSealing"), icon: Shield, category: "equipment" },
  { path: "/gestao-cilindros", label: t("cylinderManagement"), icon: Package, category: "equipment" },
  { path: "/analises-quimicas", label: t("chemicalAnalysis"), icon: FlaskConical, category: "analysis" },
  { path: "/controle-incertezas", label: t("uncertaintyControl"), icon: AlertCircle, category: "analysis" },
  { path: "/notificacoes", label: t("notifications"), icon: Bell, category: "main" },
  { path: "/relatorios", label: t("reports"), icon: FileText, category: "reports" },
  { path: "/ajuda", label: t("helpCenter"), icon: HelpCircle, category: "help" },
];

const categoryLabels: Record<string, string> = {
  main: "Principal",
  calibration: "Calibrações",
  structure: "Estrutura",
  operations: "Operações",
  equipment: "Equipamentos",
  analysis: "Análises",
  reports: "Relatórios",
  help: "Ajuda",
};

export default function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const menuItems = getMenuItems(t);

  // Group items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <SheetHeader className="p-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Flame className="text-primary-foreground w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold">SGM</SheetTitle>
                <p className="text-xs text-muted-foreground">Sistema de Gestão Metrológica</p>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="px-3 py-4">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryLabels[category] || category}
                </h3>
                <nav className="space-y-1">
                  {items.map(({ path, label, icon: Icon }) => {
                    const isActive = location === path;
                    return (
                      <Link
                        key={path}
                        href={path}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </Link>
                    );
                  })}
                </nav>
                {category !== "help" && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-secondary-foreground text-sm font-medium">MA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Mauricio Amorim</p>
              <p className="text-xs text-muted-foreground truncate">Especialista em Medição</p>
            </div>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
