import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Settings, 
  Wrench, 
  Calendar, 
  Tag, 
  Flame, 
  Circle, 
  FlaskConical, 
  FileText 
} from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/equipamentos", label: "Equipamentos", icon: Wrench },
  { path: "/calibracoes", label: "Calibrações", icon: Calendar },
  { path: "/certificados", label: "Certificados", icon: Tag },
  { path: "/pocos", label: "Poços", icon: Flame },
  { path: "/placas-orificio", label: "Placas de Orifício", icon: Circle },
  { path: "/analises-quimicas", label: "Análises Químicas", icon: FlaskConical },
  { path: "/relatorios", label: "Relatórios", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border p-4 flex flex-col" data-testid="sidebar">
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
      <nav className="flex-1 space-y-2" data-testid="navigation">
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
            <span className="text-secondary-foreground text-sm font-medium">JS</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">João Silva</p>
            <p className="text-xs text-muted-foreground">Metrologia</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground" data-testid="user-logout">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
