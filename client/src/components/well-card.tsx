import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, TestTube, Trash2, MapPin, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CadastroPoço, TestePoco } from "@shared/schema";

interface WellCardProps {
  well: CadastroPoço;
  onEdit: (well: CadastroPoço) => void;
  onBtpTest: (well: CadastroPoço) => void;
}

export default function WellCard({ well, onEdit, onBtpTest }: WellCardProps) {
  // Fetch tests for this specific well
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: [`/api/pocos/${well.id}/testes`],
    queryFn: () => api.getWellTests(well.id),
    enabled: !!well.id,
  });

  const getWellStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return { text: 'Ativo', className: 'bg-green-100 text-green-800' };
      case 'inativo':
        return { text: 'Inativo', className: 'bg-gray-100 text-gray-800' };
      case 'suspenso':
        return { text: 'Suspenso', className: 'bg-yellow-100 text-yellow-800' };
      case 'abandonado':
        return { text: 'Abandonado', className: 'bg-red-100 text-red-800' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getBtpStatus = (tests?: TestePoco[]) => {
    if (!tests || tests.length === 0) {
      return {
        status: 'sem_teste',
        daysSinceTest: -1,
        daysOverdue: -1,
        lastTestDate: null,
        badge: { text: 'Sem teste', className: 'bg-gray-100 text-gray-800' },
        message: 'Nenhum teste registrado'
      };
    }

    // Get most recent test
    const latestTest = tests.sort((a, b) => 
      new Date(b.dataTeste).getTime() - new Date(a.dataTeste).getTime()
    )[0];

    const today = new Date();
    const testDate = new Date(latestTest.dataTeste);
    const daysSinceTest = differenceInDays(today, testDate);
    const frequencyDays = well.frequenciaTesteDias || 90;
    const daysOverdue = daysSinceTest - frequencyDays;

    if (daysOverdue <= 0) {
      return {
        status: 'em_dia',
        daysSinceTest,
        daysOverdue,
        lastTestDate: latestTest.dataTeste,
        badge: { text: 'Em dia', className: 'bg-green-100 text-green-800' },
        message: `${daysSinceTest} dias desde último teste`
      };
    } else if (daysOverdue <= 7) {
      return {
        status: 'proximo',
        daysSinceTest,
        daysOverdue,
        lastTestDate: latestTest.dataTeste,
        badge: { text: 'Próximo ao prazo', className: 'bg-yellow-100 text-yellow-800' },
        message: `${daysSinceTest} dias desde último teste`
      };
    } else {
      return {
        status: 'vencido',
        daysSinceTest,
        daysOverdue,
        lastTestDate: latestTest.dataTeste,
        badge: { text: 'Vencido', className: 'bg-red-100 text-red-800' },
        message: `${daysSinceTest} dias desde último teste`
      };
    }
  };

  const statusBadge = getWellStatusBadge(well.status);
  const btpStatus = getBtpStatus(tests);
  const btpBadge = btpStatus.badge;

  return (
    <div
      className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
      data-testid={`well-card-${well.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h3 className="font-semibold text-lg font-mono">{well.codigo}</h3>
            <Badge className={statusBadge.className}>
              {statusBadge.text}
            </Badge>
            <Badge className={btpBadge.className}>
              BTP: {testsLoading ? 'Carregando...' : btpBadge.text}
            </Badge>
            {tests && tests.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {tests.length} teste{tests.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">{well.nome}</p>
              <p>Tipo: {well.tipo || 'N/A'}</p>
              <p>Código ANP: {well.codigoAnp}</p>
            </div>
            <div>
              <p className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                Polo: {well.poloId} | Instalação: {well.instalacaoId}
              </p>
              <p>Frequência teste: {well.frequenciaTesteDias || 90} dias</p>
            </div>
            <div>
              <p className={`flex items-center ${btpStatus.status === 'vencido' ? 'text-red-600 font-medium' : ''}`}>
                <Calendar className="w-3 h-3 mr-1" />
                BTP: {testsLoading ? 'Carregando...' : btpStatus.message}
              </p>
              {btpStatus.status === 'vencido' && (
                <p className="text-red-600 text-xs font-medium">
                  Vencido há {btpStatus.daysOverdue} dias
                </p>
              )}
              {btpStatus.lastTestDate && (
                <p className="text-xs text-muted-foreground">
                  Último teste: {format(new Date(btpStatus.lastTestDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            data-testid={`button-view-${well.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(well)}
            data-testid={`button-edit-${well.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBtpTest(well)}
            data-testid={`button-btp-${well.id}`}
          >
            <TestTube className="w-4 h-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-testid={`button-delete-${well.id}`}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}