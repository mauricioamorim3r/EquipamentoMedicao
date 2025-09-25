import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { EquipmentWithCalibration } from "@/types";

interface CalibrationCalendarProps {
  equipamentos: EquipmentWithCalibration[];
}

export default function CalibrationCalendar({ equipamentos }: CalibrationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getCurrentMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Start from Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const dates = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const getEquipmentsForDate = (date: Date) => {
    return equipamentos.filter(eq => {
      if (!eq.dataProximaCalibracão) return false;
      const calibrationDate = new Date(eq.dataProximaCalibracão);
      return (
        calibrationDate.getDate() === date.getDate() &&
        calibrationDate.getMonth() === date.getMonth() &&
        calibrationDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDateStatus = (date: Date) => {
    const today = new Date();
    const equipmentsOnDate = getEquipmentsForDate(date);
    
    if (equipmentsOnDate.length === 0) return null;
    
    // Determine the most critical status for this date
    const hasExpired = equipmentsOnDate.some(eq => {
      if (!eq.diasParaVencer && eq.diasParaVencer !== 0) return false;
      return eq.diasParaVencer <= 0;
    });
    
    const hasCritical = equipmentsOnDate.some(eq => {
      if (!eq.diasParaVencer && eq.diasParaVencer !== 0) return false;
      return eq.diasParaVencer > 0 && eq.diasParaVencer <= 7;
    });
    
    const hasAlert = equipmentsOnDate.some(eq => {
      if (!eq.diasParaVencer && eq.diasParaVencer !== 0) return false;
      return eq.diasParaVencer > 7 && eq.diasParaVencer <= 30;
    });

    if (hasExpired) return { status: 'expired', color: 'bg-red-500', count: equipmentsOnDate.length };
    if (hasCritical) return { status: 'critical', color: 'bg-orange-500', count: equipmentsOnDate.length };
    if (hasAlert) return { status: 'alert', color: 'bg-yellow-500', count: equipmentsOnDate.length };
    return { status: 'ok', color: 'bg-green-500', count: equipmentsOnDate.length };
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const dates = getCurrentMonthDates();

  return (
    <div className="space-y-4" data-testid="calibration-calendar">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('prev')}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentDate(new Date())}
            data-testid="button-today"
          >
            Hoje
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {/* Week Day Headers */}
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {dates.map((date, index) => {
              const dateStatus = getDateStatus(date);
              const equipmentsOnDate = getEquipmentsForDate(date);
              
              return (
                <div
                  key={index}
                  className={`
                    relative p-2 h-20 border border-border rounded-lg transition-colors cursor-pointer
                    ${isCurrentMonth(date) ? 'bg-background' : 'bg-muted/30'}
                    ${isToday(date) ? 'ring-2 ring-primary' : ''}
                    hover:bg-accent
                  `}
                  data-testid={`calendar-day-${date.getDate()}`}
                  title={equipmentsOnDate.length > 0 
                    ? `${equipmentsOnDate.length} calibração(ões): ${equipmentsOnDate.map(eq => eq.tag).join(', ')}`
                    : undefined
                  }
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm ${
                      isCurrentMonth(date) ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {date.getDate()}
                    </span>
                    {dateStatus && (
                      <div className={`w-2 h-2 rounded-full ${dateStatus.color}`}></div>
                    )}
                  </div>
                  
                  {equipmentsOnDate.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {equipmentsOnDate.slice(0, 2).map((eq) => (
                        <div
                          key={eq.id}
                          className="text-xs p-1 rounded text-white truncate"
                          style={{ backgroundColor: 'var(--primary)' }}
                        >
                          {eq.tag}
                        </div>
                      ))}
                      {equipmentsOnDate.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{equipmentsOnDate.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Legenda:</h4>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Vencido</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Crítico (≤7 dias)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Alerta (8-30 dias)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>OK ({'>'}30 dias)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
