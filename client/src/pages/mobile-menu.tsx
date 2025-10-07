import { Link } from "wouter";
import {
  Settings,
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
  Shield,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/hooks/useLanguage";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const getSecondaryMenuItems = (t: (key: string) => string) => [
  {
    category: "Calibrações",
    items: [
      { path: "/execucao-calibracoes", label: t("calibrationExecution"), icon: Settings },
      { path: "/historico-calibracoes", label: t("calibrationHistory"), icon: FileText },
    ],
  },
  {
    category: "Estrutura",
    items: [
      { path: "/campos", label: t("fields"), icon: MapPin },
      { path: "/instalacoes", label: t("installations"), icon: Building },
      { path: "/pontos-medicao", label: t("measurementPoints"), icon: Activity },
    ],
  },
  {
    category: "Equipamentos Específicos",
    items: [
      { path: "/placas-orificio", label: t("orificePlates"), icon: Circle },
      { path: "/trechos-retos", label: t("straightSections"), icon: Ruler },
      { path: "/medidores-primarios", label: t("primaryMeters"), icon: Gauge },
      { path: "/valvulas", label: t("valves"), icon: Gauge },
      { path: "/protecao-lacre", label: t("protectionSealing"), icon: Shield },
      { path: "/gestao-cilindros", label: t("cylinderManagement"), icon: Package },
    ],
  },
  {
    category: "Operações & Testes",
    items: [
      { path: "/pocos", label: t("wells"), icon: Flame },
      { path: "/testes-pocos", label: t("wellTests"), icon: FlaskConical },
    ],
  },
  {
    category: "Análises & Controle",
    items: [
      { path: "/analises-quimicas", label: t("chemicalAnalysis"), icon: FlaskConical },
      { path: "/controle-incertezas", label: t("uncertaintyControl"), icon: AlertCircle },
    ],
  },
  {
    category: "Relatórios & Ajuda",
    items: [
      { path: "/relatorios", label: t("reports"), icon: FileText },
      { path: "/ajuda", label: t("helpCenter"), icon: HelpCircle },
    ],
  },
];

export default function MobileMenu() {
  const { t } = useTranslation();
  const menuSections = getSecondaryMenuItems(t);

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Menu Completo</h1>
        <p className="text-sm text-muted-foreground">
          Acesse todas as funcionalidades do sistema
        </p>
      </div>

      <div className="space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {section.category}
            </h2>
            <Card className="divide-y divide-border">
              {section.items.map(({ path, label, icon: Icon }) => (
                <Link key={path} href={path}>
                  <div className="flex items-center justify-between p-4 hover:bg-accent transition-colors active:bg-accent/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </Card>
          </div>
        ))}
      </div>

      {/* User Profile Section */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-secondary-foreground text-lg font-medium">MA</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Mauricio Amorim</p>
            <p className="text-sm text-muted-foreground">Especialista em Medição</p>
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Configurações</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
