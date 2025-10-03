import { Link, useLocation } from "wouter";
import { useState, useRef, useCallback, useEffect } from "react";
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
  GripVertical
} from "lucide-react";
import { useTranslation } from "@/hooks/useLanguage";

const getMenuItems = (t: (key: string) => string) => [
  { path: "/", label: t("dashboard"), icon: BarChart3 },
  { path: "/equipamentos", label: t("equipments"), icon: Wrench },
  { path: "/calibracoes", label: t("calibrations"), icon: Calendar },
  { path: "/execucao-calibracoes", label: t("calibrationExecution"), icon: Settings },
  { path: "/historico-calibracoes", label: t("calibrationHistory"), icon: FileText },
  { path: "/campos", label: t("fields"), icon: MapPin },
  { path: "/pocos", label: t("wells"), icon: Flame },
  { path: "/instalacoes", label: t("installations"), icon: Building },
  { path: "/pontos-medicao", label: t("measurementPoints"), icon: Activity },
  { path: "/notificacoes", label: t("notifications"), icon: Bell },
  { path: "/placas-orificio", label: t("orificePlates"), icon: Circle },
  { path: "/trechos-retos", label: t("straightSections"), icon: Ruler },
  { path: "/medidores-primarios", label: t("primaryMeters"), icon: Gauge },
  { path: "/protecao-lacre", label: t("protectionSealing"), icon: Shield },
  { path: "/valvulas", label: t("valves"), icon: Gauge },
  { path: "/gestao-cilindros", label: t("cylinderManagement"), icon: Package },
  { path: "/testes-pocos", label: t("wellTests"), icon: FlaskConical },
  { path: "/analises-quimicas", label: t("chemicalAnalysis"), icon: FlaskConical },
  { path: "/controle-incertezas", label: t("uncertaintyControl"), icon: AlertCircle },
  { path: "/relatorios", label: t("reports"), icon: FileText },
  { path: "/ajuda", label: t("helpCenter"), icon: HelpCircle },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem = 256px
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const menuItems = getMenuItems(t);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 400) { // Min 200px, Max 400px
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={sidebarRef}
      className="bg-card border-r border-border p-4 flex flex-col relative"
      style={{ width: `${sidebarWidth}px` }}
      data-testid="sidebar"
    >
      {/* Logo and Title */}
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
          <Flame className="text-primary-foreground text-lg" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground">SGM</h1>
          <p className="text-xs text-muted-foreground">Sistema de Gestão Metrológica</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent" data-testid="navigation">
        {menuItems.map(({ path, label, icon: Icon }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <a
                className={`flex items-center p-3 rounded-lg transition-all ${
                  isActive 
                    ? "sidebar-active" 
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="mr-3 w-5 h-5" />
                <span>{label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-3">
            <span className="text-secondary-foreground text-sm font-medium">MA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Mauricio Amorim</p>
            <p className="text-xs text-muted-foreground truncate">Especialista em Medição</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-foreground" 
            data-testid="user-logout"
            title="Configurações"
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 w-1 bg-transparent hover:bg-border cursor-col-resize h-full group"
        onMouseDown={handleMouseDown}
        title="Redimensionar sidebar"
      >
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
