import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Clock, FlaskConical, Wrench, TestTube } from "lucide-react";
import { api } from "@/lib/api";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  type: 'calibracao' | 'teste_poco' | 'analise_quimica' | 'calendario';
  status: string;
  priority: 'low' | 'medium' | 'high';
}

export default function CalendarioDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/dashboard/calendar-events", currentDate.getMonth() + 1, currentDate.getFullYear()],
    queryFn: () => api.get(`/api/dashboard/calendar-events?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`),
  });

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

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event: CalendarEvent) => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'calibracao':
        return {
          color: 'bg-blue-500',
          lightColor: 'bg-blue-100 text-blue-800',
          icon: Wrench,
          label: 'Calibração'
        };
      case 'teste_poco':
        return {
          color: 'bg-red-500',
          lightColor: 'bg-red-100 text-red-800',
          icon: TestTube,
          label: 'Teste de Poço'
        };
      case 'analise_quimica':
        return {
          color: 'bg-green-500',
          lightColor: 'bg-green-100 text-green-800',
          icon: FlaskConical,
          label: 'Análise Química'
        };
      case 'calendario':
        return {
          color: 'bg-orange-500',
          lightColor: 'bg-orange-100 text-orange-800',
          icon: Calendar,
          label: 'Calendário'
        };
      default:
        return {
          color: 'bg-gray-500',
          lightColor: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: 'Evento'
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const dates = getCurrentMonthDates();
  const today = new Date();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendário de Atividades
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm font-medium min-w-[120px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar dates */}
              {dates.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === today.toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border rounded-lg transition-colors cursor-pointer
                      ${isCurrentMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground'}
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      hover:bg-muted/50
                    `}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                      {date.getDate()}
                    </div>
                    
                    {/* Events for this date */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, eventIndex) => {
                        const config = getEventTypeConfig(event.type);
                        return (
                          <div
                            key={eventIndex}
                            className={`
                              text-xs p-1 rounded text-white truncate
                              ${config.color} ${getPriorityColor(event.priority)}
                            `}
                            title={`${event.title} - ${event.description || ''}`}
                          >
                            <div className="flex items-center gap-1">
                              <config.icon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Show count if there are more events */}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Legenda</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'calibracao', label: 'Calibrações' },
                  { type: 'teste_poco', label: 'Testes de Poços' },
                  { type: 'analise_quimica', label: 'Análises Químicas' },
                  { type: 'calendario', label: 'Calendário' }
                ].map(({ type, label }) => {
                  const config = getEventTypeConfig(type);
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${config.color}`}></div>
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Priority Legend */}
              <div className="mt-3 pt-3 border-t">
                <h5 className="text-xs font-medium mb-2 text-muted-foreground">Prioridade</h5>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded"></div>
                    <span className="text-muted-foreground">Alta</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                    <span className="text-muted-foreground">Média</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    <span className="text-muted-foreground">Baixa</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}