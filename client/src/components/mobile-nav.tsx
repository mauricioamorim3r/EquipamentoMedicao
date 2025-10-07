import { Link, useLocation } from "wouter";
import {
  Home,
  Wrench,
  Calendar,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import { useTranslation } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
}

export default function MobileNav() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { path: "/", label: t("dashboard"), icon: Home },
    { path: "/equipamentos", label: t("equipments"), icon: Wrench },
    { path: "/calibracoes", label: t("calibrations"), icon: Calendar },
    { path: "/notificacoes", label: t("notifications"), icon: Bell },
    { path: "/menu", label: "Menu", icon: MoreHorizontal },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location === path || (path === "/menu" && !navItems.slice(0, 4).some(item => location === item.path));

          return (
            <Link
              key={path}
              href={path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
