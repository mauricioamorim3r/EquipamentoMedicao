import { CilindrosTable } from "@/components/cilindro-form";

export default function GestaoCilindros() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">Gestão de Cilindros</h1>

      <div className="grid grid-cols-1 gap-6">
        <CilindrosTable />
      </div>
    </div>
  );
}
