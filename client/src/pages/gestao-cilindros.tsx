import { CilindrosTable } from "@/components/cilindro-form";

export default function GestaoCilindros() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Gestão de Cilindros</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <CilindrosTable />
      </div>
    </div>
  );
}
