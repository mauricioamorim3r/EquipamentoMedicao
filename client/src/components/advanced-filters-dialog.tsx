import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Filter } from "lucide-react";

interface AdvancedFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  children: ReactNode;
}

export default function AdvancedFiltersDialog({
  open,
  onOpenChange,
  hasActiveFilters,
  onClearFilters,
  children
}: AdvancedFiltersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
          {hasActiveFilters && (
            <Badge className="ml-2 bg-primary text-white px-1.5 py-0.5 text-xs">
              ✓
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
          <DialogDescription>
            Configure filtros adicionais para refinar sua busca
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
          >
            Limpar Filtros
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Aplicar Filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
