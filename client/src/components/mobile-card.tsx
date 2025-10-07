import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCardField {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

interface MobileCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  fields: MobileCardField[];
  onClick?: () => void;
  actions?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  badge,
  fields,
  onClick,
  actions,
  icon: Icon,
  className,
}: MobileCardProps) {
  return (
    <Card
      className={cn(
        'transition-all active:scale-[0.98]',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge && (
              <Badge
                variant={badge.variant || 'default'}
                className={badge.className}
              >
                {badge.label}
              </Badge>
            )}
            {onClick && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-2">
              {field.icon && (
                <field.icon className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">{field.label}</span>
            </div>
            <div className={cn('text-sm font-medium', field.className)}>
              {field.value}
            </div>
          </div>
        ))}

        {actions && (
          <div className="pt-2 flex gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente específico para lista de equipamentos mobile
interface EquipmentMobileCardProps {
  tag: string;
  numeroSerie: string;
  tipo: string;
  status: 'ok' | 'proximo' | 'alerta' | 'critico' | 'vencido';
  proximaCalibracao?: string;
  localizacao?: string;
  onClick?: () => void;
}

export function EquipmentMobileCard({
  tag,
  numeroSerie,
  tipo,
  status,
  proximaCalibracao,
  localizacao,
  onClick,
}: EquipmentMobileCardProps) {
  const statusConfig = {
    ok: { label: 'OK', variant: 'default' as const, className: 'bg-green-500' },
    proximo: { label: 'Próximo', variant: 'default' as const, className: 'bg-blue-500' },
    alerta: { label: 'Alerta', variant: 'default' as const, className: 'bg-yellow-500' },
    critico: { label: 'Crítico', variant: 'destructive' as const, className: '' },
    vencido: { label: 'Vencido', variant: 'secondary' as const, className: '' },
  };

  const statusInfo = statusConfig[status] || statusConfig.vencido;

  return (
    <MobileCard
      title={tag}
      subtitle={numeroSerie}
      badge={{
        label: statusInfo.label,
        variant: statusInfo.variant,
        className: statusInfo.className,
      }}
      fields={[
        { label: 'Tipo', value: tipo },
        ...(proximaCalibracao
          ? [{ label: 'Próxima Calibração', value: proximaCalibracao }]
          : []),
        ...(localizacao ? [{ label: 'Localização', value: localizacao }] : []),
      ]}
      onClick={onClick}
    />
  );
}
