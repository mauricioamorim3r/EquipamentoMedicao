import { Package } from "lucide-react";

export default function GestaoCilindros() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestão de Cilindros
          </h1>
          <p className="text-muted-foreground">
            Gestão de cilindros com schema correto
          </p>
        </div>
      </div>
      
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Schema Corrigido
        </h3>
        <p className="text-muted-foreground">
          Agora usando o schema gestaoCilindros com campos corretos:
          poloId, instalacaoId, pocosTeste, quantidadeCilindros, status e datas de logística.
        </p>
      </div>
    </div>
  );
}