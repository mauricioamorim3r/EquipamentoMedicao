import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import type { EquipmentWithCalibration } from "@/types";
import type { CalendarioCalibracao } from "@shared/schema";

interface CalibrationCalendarProps {
  equipamentos: EquipmentWithCalibration[];
  calendarios?: CalendarioCalibracao[];
  onDateClick?: (date: Date, calibrations?: CalendarioCalibracao[]) => void;
}

export default function CalibrationCalendar({ equipamentos, calendarios = [], onDateClick }: CalibrationCalendarProps) {
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

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getEquipmentsForDate = (date: Date) => {
    return equipamentos.filter(eq => {
      if (!eq.dataProximaCalibracão) return false;
      const calibrationDate = new Date(eq.dataProximaCalibracão);
      return isSameDate(calibrationDate, date);
    });
  };

  const getCalendariosForDate = (date: Date) => {
    return calendarios.filter(cal => {
      if (!cal.previsaoCalibracao) return false;
      const previsaoDate = new Date(cal.previsaoCalibracao);
      return isSameDate(previsaoDate, date);
    });
  };

  const getDateStatus = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const equipmentsOnDate = getEquipmentsForDate(date);
    const calendariosOnDate = getCalendariosForDate(date);

    const totalItems = equipmentsOnDate.length + calendariosOnDate.length;

    if (totalItems === 0) return null;

    // Calcular dias até a data
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    const daysUntil = Math.floor((dateCopy.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Determine the most critical status for this date
    const hasExpired = equipmentsOnDate.some(eq => {
      if (!eq.diasParaVencer && eq.diasParaVencer !== 0) return false;
      return eq.diasParaVencer <= 0;
    }) || daysUntil < 0;

    const hasCritical = equipmentsOnDate.some(eq => {
      if (!eq.diasParaVencer && eq.diasParaVencer !== 0) return false;
      return eq.diasParaVencer > 0 && eq.diasParaVencer <= 7;
    }) || (daysUntil >= 0 && daysUntil <= 7);

    const hasAlert = equipmentsOnDate.some(eq => {
      if (!eq.diasParaVencer && eq.diasParaVencer !== 0) return false;
      return eq.diasParaVencer > 7 && eq.diasParaVencer <= 30;
    }) || (daysUntil > 7 && daysUntil <= 30);

    // Priorizar status mais crítico
    if (hasExpired) {
      return {
        status: 'vencido',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        count: totalItems,
        icon: AlertTriangle
      };
    }
    if (hasCritical) {
      return {
        status: 'crítico',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        count: totalItems,
        icon: AlertTriangle
      };
    }
    if (hasAlert) {
      return {
        status: 'alerta',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        count: totalItems,
        icon: Clock
      };
    }
    return {
      status: 'ok',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      count: totalItems,
      icon: CheckCircle
    };
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDate(date, today);
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-muted-foreground">Vencido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-muted-foreground">Crítico (≤ 7 dias)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-muted-foreground">Alerta (8-30 dias)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-muted-foreground">OK (&gt; 30 dias)</span>
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
              const calendariosOnDate = getCalendariosForDate(date);
              const allItems = [...equipmentsOnDate, ...calendariosOnDate];

              return (
                <div
                  key={index}
                  className={`
                    relative p-2 min-h-28 border rounded-lg transition-all cursor-pointer flex flex-col
                    ${isCurrentMonth(date) ? 'bg-background' : 'bg-muted/30'}
                    ${isToday(date) ? 'ring-2 ring-primary shadow-md' : ''}
                    ${dateStatus ? `${dateStatus.borderColor} ${dateStatus.bgColor}` : 'border-border'}
                    hover:shadow-lg hover:scale-105
                  `}
                  data-testid={`calendar-day-${date.getDate()}`}
                  title={allItems.length > 0
                    ? `${allItems.length} calibração(ões) - ${dateStatus?.status.toUpperCase()}\n${
                        equipmentsOnDate.map(eq => `• ${eq.tag}`).join('\n')
                      }${
                        calendariosOnDate.length > 0 ? '\n' + calendariosOnDate.map(cal => `• ${cal.tagPontoMedicao}`).join('\n') : ''
                      }`
                    : undefined
                  }
                  onClick={() => onDateClick?.(date, calendariosOnDate)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isCurrentMonth(date) ? 'text-foreground' : 'text-muted-foreground'
                    } ${isToday(date) ? 'text-primary font-bold' : ''}`}>
                      {date.getDate()}
                    </span>
                    {dateStatus && (
                      <div className="flex items-center gap-1">
                        <dateStatus.icon className={`w-3 h-3 ${dateStatus.textColor}`} />
                        <div className={`w-2 h-2 rounded-full ${dateStatus.color} animate-pulse`}></div>
                      </div>
                    )}
                  </div>

                  {/* Show all items line by line with scroll */}
                  {allItems.length > 0 && (
                    <div className="flex-1 overflow-y-auto space-y-1 max-h-32 custom-scrollbar">
                      {/* Show equipment calibrations */}
                      {equipmentsOnDate.map((eq) => (
                        <div
                          key={eq.id}
                          className={`text-xs px-1.5 py-0.5 rounded font-medium truncate shadow-sm
                            ${eq.diasParaVencer !== undefined && eq.diasParaVencer <= 0
                              ? 'bg-red-600 text-white'
                              : eq.diasParaVencer !== undefined && eq.diasParaVencer <= 7
                              ? 'bg-orange-600 text-white'
                              : eq.diasParaVencer !== undefined && eq.diasParaVencer <= 30
                              ? 'bg-yellow-600 text-white'
                              : 'bg-primary text-white'
                            }`}
                        >
                          {eq.tag}
                        </div>
                      ))}

                      {/* Show scheduled calibrations */}
                      {calendariosOnDate.map((cal) => (
                        <div
                          key={cal.id}
                          className={`text-xs px-1.5 py-0.5 rounded font-medium truncate shadow-sm border
                            ${cal.status === 'concluido'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : cal.status === 'em_andamento'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : cal.status === 'agendado'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                        >
                          <Calendar className="w-2.5 h-2.5 inline mr-0.5" />
                          {cal.tagPontoMedicao}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
