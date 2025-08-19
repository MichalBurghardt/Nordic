'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Users, BarChart3, Edit, Trash2, X, Maximize2, Minimize2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, addDays, startOfMonth, endOfMonth, eachWeekOfInterval, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval, addYears, subYears, isToday } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Schedule {
  _id: string;
  employeeId: {
    _id: string;
    employeeId: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  clientId: {
    _id: string;
    name: string;
    nordicClientNumber: string;
  };
  assignmentId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  weeklyHours: number;
  status: 'planned' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'sick-leave' | 'vacation' | 'client-break';
  notes?: string;
  createdBy: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

type ViewType = 'week' | 'month' | 'year';

interface WeeklyStats {
  totalHours: number;
  totalShifts: number;
  employeeCount: number;
  clientCount: number;
}

// Edit Schedule Form Component
const EditScheduleForm: React.FC<{
  schedule: Schedule;
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
}> = ({ schedule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    startTime: schedule.startTime || '',
    endTime: schedule.endTime || '',
    weeklyHours: schedule.weeklyHours || 0,
    status: schedule.status,
    notes: schedule.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...schedule,
      ...formData
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Schedule['status'] }))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="planned">Zaplanowane</option>
          <option value="confirmed">Potwierdzone</option>
          <option value="active">Aktywne</option>
          <option value="completed">Zakończone</option>
          <option value="cancelled">Anulowane</option>
          <option value="sick-leave">Zwolnienie lekarskie</option>
          <option value="vacation">Urlop</option>
          <option value="client-break">Przerwa kliencka</option>
        </select>
      </div>

      {(formData.status === 'planned' || formData.status === 'confirmed' || formData.status === 'active') && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Godzina rozpoczęcia</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Godzina zakończenia</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Godziny tygodniowe</label>
            <input
              type="number"
              min="0"
              max="168"
              value={formData.weeklyHours}
              onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notatki</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Dodatkowe informacje..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Anuluj
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
        >
          Zapisz
        </button>
      </div>
    </form>
  );
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [isCompactView, setIsCompactView] = useState(true); // Nowy stan dla trybu widoku
  
  // Modal states
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState<Schedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Pobierz WSZYSTKIE dane harmonogramów z API - TYLKO RAZ przy mount
  useEffect(() => {
    console.log('🔄 useEffect triggered - fetching ALL schedules...');
    
    const fetchAllSchedules = async () => {
      try {
        // Brak parametru weekStart = pobierz WSZYSTKIE harmonogramy
        const response = await fetch('/api/admin/schedule', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ ALL Schedules fetched successfully:', data.schedules?.length || 0);
          setSchedules(data.schedules || []);
        } else {
          const errorText = await response.text();
          console.error('❌ Error fetching schedules:', response.status, errorText);
          setError(`Błąd pobierania harmonogramów: ${response.status} - wymagane ponowne logowanie`);
        }
      } catch (error) {
        console.error('Network error:', error);
        setError('Błąd sieci podczas pobierania harmonogramów');
      } finally {
        setLoading(false);
      }
    };

    fetchAllSchedules();
  }, []); // Pusta dependency array - wywołaj TYLKO raz

  // Helper functions for date calculations
  const getWeekStart = (date: Date) => startOfWeek(date, { weekStartsOn: 1 });
  const getWeekEnd = (date: Date) => endOfWeek(date, { weekStartsOn: 1 });
  const getMonthStart = (date: Date) => startOfMonth(date);
  const getMonthEnd = (date: Date) => endOfMonth(date);

  // Navigation functions
  const navigatePrevious = () => {
    switch (viewType) {
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(subYears(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewType) {
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Get schedules for specific date
  const getSchedulesForDate = (date: Date): Schedule[] => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startDate);
      return isSameDay(scheduleDate, date);
    });
  };

  // Get day status and styling based on schedule status
  const getDayStatusAndStyle = (date: Date) => {
    const daySchedules = getSchedulesForDate(date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
    
    // If no schedules, return empty for weekends, neutral for weekdays
    if (daySchedules.length === 0) {
      return {
        status: isWeekend ? 'weekend' : 'free',
        borderClass: '',
        bgClass: isWeekend ? 'bg-gray-100' : 'bg-white',
        textClass: 'text-gray-400'
      };
    }
    
    // Check for time-off statuses (sick leave, vacation, client breaks)
    const sickLeave = daySchedules.find(s => s.status === 'sick-leave');
    const vacation = daySchedules.find(s => s.status === 'vacation');
    const clientBreak = daySchedules.find(s => s.status === 'client-break');
    const workingDay = daySchedules.find(s => s.status === 'planned');
    
    // Priority: sick-leave > vacation > client-break > working
    if (sickLeave && !isWeekend) {
      return {
        status: 'sick-leave',
        borderClass: 'border-red-500 border-2',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        description: 'Zwolnienie chorobowe'
      };
    }
    
    if (vacation && !isWeekend) {
      return {
        status: 'vacation',
        borderClass: 'border-yellow-500 border-2',
        bgClass: 'bg-yellow-50',
        textClass: 'text-yellow-700',
        description: 'Urlop'
      };
    }
    
    if (clientBreak && !isWeekend) {
      return {
        status: 'client-break',
        borderClass: 'border-blue-500 border-2',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-700',
        description: 'Przerwa w pracy'
      };
    }
    
    if (workingDay) {
      return {
        status: 'working',
        borderClass: 'border-green-500 border-2',
        bgClass: 'bg-green-50',
        textClass: 'text-green-700',
        description: isWeekend ? 'Weekend roboczy' : 'Dzień roboczy'
      };
    }
    
    // Default fallback
    return {
      status: 'unknown',
      borderClass: '',
      bgClass: isWeekend ? 'bg-gray-100' : 'bg-white',
      textClass: 'text-gray-400'
    };
  };

  // Open day details modal
  const openDayModal = (date: Date) => {
    const daySchedules = getSchedulesForDate(date);
    setSelectedDay(date);
    setSelectedDaySchedules(daySchedules);
    setShowDayModal(true);
  };

  // Delete schedule
  const deleteSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/admin/schedule/${scheduleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Remove from local state
        setSchedules(prev => prev.filter(s => s._id !== scheduleId));
        setSelectedDaySchedules(prev => prev.filter(s => s._id !== scheduleId));
        console.log('✅ Schedule deleted successfully');
      } else {
        console.error('❌ Error deleting schedule:', response.status);
      }
    } catch (error) {
      console.error('❌ Network error deleting schedule:', error);
    }
  };

  // Edit schedule
  const startEditingSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
  };

  // Save edited schedule
  const saveEditedSchedule = async (updatedSchedule: Schedule) => {
    try {
      const response = await fetch(`/api/admin/schedule/${updatedSchedule._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          startTime: updatedSchedule.startTime,
          endTime: updatedSchedule.endTime,
          weeklyHours: updatedSchedule.weeklyHours,
          status: updatedSchedule.status,
          notes: updatedSchedule.notes
        }),
      });

      if (response.ok) {
        // Update local state
        setSchedules(prev => prev.map(s => 
          s._id === updatedSchedule._id ? { ...s, ...updatedSchedule } : s
        ));
        setSelectedDaySchedules(prev => prev.map(s => 
          s._id === updatedSchedule._id ? { ...s, ...updatedSchedule } : s
        ));
        setEditingSchedule(null);
        console.log('✅ Schedule updated successfully');
      } else {
        console.error('❌ Error updating schedule:', response.status);
      }
    } catch (error) {
      console.error('❌ Network error updating schedule:', error);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSchedule(null);
  };

  // Calculate weekly statistics
  const calculateWeeklyStats = (): WeeklyStats => {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = getWeekEnd(currentDate);
    
    const weekSchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startDate);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    });

    const totalHours = weekSchedules.reduce((sum, schedule) => {
      const startTime = schedule.startTime.split(':');
      const endTime = schedule.endTime.split(':');
      const start = parseInt(startTime[0]) + parseInt(startTime[1]) / 60;
      const end = parseInt(endTime[0]) + parseInt(endTime[1]) / 60;
      return sum + (end - start);
    }, 0);

    const employeeIds = new Set(weekSchedules.map(s => s.employeeId._id));
    const clientIds = new Set(weekSchedules.map(s => s.clientId._id));

    return {
      totalHours,
      totalShifts: weekSchedules.length,
      employeeCount: employeeIds.size,
      clientCount: clientIds.size
    };
  };

  // Calculate daily statistics
  const calculateDayStats = (date: Date) => {
    const daySchedules = getSchedulesForDate(date).filter(s => s.status === 'planned');
    
    const employeeCount = new Set(daySchedules.map(s => s.employeeId._id)).size;
    const clientCount = new Set(daySchedules.map(s => s.clientId._id)).size;
    
    const totalHours = daySchedules.reduce((sum, schedule) => {
      const start = new Date(`2000-01-01T${schedule.startTime}`);
      const end = new Date(`2000-01-01T${schedule.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    // Stawki w euro
    const hourlyRateEmployee = 18.50; // EUR za godzinę dla pracownika
    const hourlyRateClient = 32.00; // EUR za godzinę naliczana klientowi
    
    const employeeCost = totalHours * hourlyRateEmployee;
    const clientRevenue = totalHours * hourlyRateClient;
    const profit = clientRevenue - employeeCost;
    
    return {
      employeeCount,
      clientCount,
      totalHours: Number(totalHours.toFixed(1)),
      employeeCost: Number(employeeCost.toFixed(2)),
      clientRevenue: Number(clientRevenue.toFixed(2)),
      profit: Number(profit.toFixed(2))
    };
  };

  // Calculate weekly statistics  
  const calculateWeekStats = (weekDays: Date[]) => {
    const weekSchedules = weekDays.flatMap(day => 
      getSchedulesForDate(day).filter(s => s.status === 'planned')
    );
    
    const employeeCount = new Set(weekSchedules.map(s => s.employeeId._id)).size;
    const clientCount = new Set(weekSchedules.map(s => s.clientId._id)).size;
    
    const totalHours = weekSchedules.reduce((sum, schedule) => {
      const start = new Date(`2000-01-01T${schedule.startTime}`);
      const end = new Date(`2000-01-01T${schedule.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    const hourlyRateEmployee = 18.50;
    const hourlyRateClient = 32.00;
    
    const employeeCost = totalHours * hourlyRateEmployee;
    const clientRevenue = totalHours * hourlyRateClient;
    const profit = clientRevenue - employeeCost;
    
    return {
      employeeCount,
      clientCount,
      totalHours: Number(totalHours.toFixed(1)),
      employeeCost: Number(employeeCost.toFixed(2)),
      clientRevenue: Number(clientRevenue.toFixed(2)),
      profit: Number(profit.toFixed(2))
    };
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: getWeekEnd(currentDate) });
    
    return (
      <div className="space-y-6">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-2">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="text-center">
              <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-700'}`}>
                {format(day, 'EEEE', { locale: pl })}
              </div>
              <div className={`text-2xl font-bold ${isToday(day) ? 'text-blue-600 bg-blue-50 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
              <div className="text-xs text-gray-500">
                {format(day, 'MMM', { locale: pl })}
              </div>
            </div>
          ))}
          
          {/* Weekly Summary Header - 8th column */}
          <div className="text-center">
            <div className="text-sm font-medium text-blue-600">
              KW
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {format(currentDate, 'w')}
            </div>
            <div className="text-xs text-blue-500">
              {format(currentDate, 'yyyy')}
            </div>
          </div>
        </div>

        {/* Week Grid */}
        <div className={`grid grid-cols-8 gap-2 ${isCompactView ? 'min-h-[100px]' : 'min-h-[200px]'}`}>
          {weekDays.map((day) => {
            const daySchedules = getSchedulesForDate(day);
            const dayStyle = getDayStatusAndStyle(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  rounded-lg ${isCompactView ? 'p-1' : 'p-2'} cursor-pointer transition-all duration-200
                  ${dayStyle.borderClass} 
                  ${dayStyle.bgClass}
                  ${isToday(day) ? 'ring-2 ring-blue-300' : ''}
                  hover:shadow-md
                `}
                onClick={() => openDayModal(day)}
              >
                <div className={isCompactView ? "space-y-0.5" : "space-y-1"}>
                  {/* Day header with status */}
                  <div className={`text-center ${isCompactView ? 'text-xs' : 'text-sm'} font-medium ${dayStyle.textClass} ${isCompactView ? 'mb-1' : 'mb-2'}`}>
                    {format(day, 'd')} {format(day, 'MMM', { locale: pl })}
                    {dayStyle.description && !isCompactView && (
                      <div className="text-xs font-normal mt-1">{dayStyle.description}</div>
                    )}
                  </div>
                  
                  {/* Show schedules only for working days or special weekend work */}
                  {daySchedules
                    .filter(schedule => {
                      // For weekends, only show working schedules
                      if (isWeekend) {
                        return schedule.status === 'planned';
                      }
                      // For weekdays, show all relevant schedules
                      return true;
                    })
                    .map((schedule) => (
                      <div
                        key={schedule._id}
                        className={`
                          ${isCompactView ? 'text-xs p-0.5' : 'text-xs p-1'} rounded border-l-2 
                          ${schedule.status === 'planned' ? 'bg-green-100 text-green-800 border-green-500' : ''}
                          ${schedule.status === 'sick-leave' ? 'bg-red-100 text-red-800 border-red-500' : ''}
                          ${schedule.status === 'vacation' ? 'bg-yellow-100 text-yellow-800 border-yellow-500' : ''}
                          ${schedule.status === 'client-break' ? 'bg-blue-100 text-blue-800 border-blue-500' : ''}
                        `}
                      >
                        <div className={`font-medium truncate ${isCompactView ? 'text-xs' : ''}`}>
                          {isCompactView 
                            ? `${schedule.employeeId.userId.firstName.charAt(0)}.${schedule.employeeId.userId.lastName}`
                            : `${schedule.employeeId.userId.firstName} ${schedule.employeeId.userId.lastName}`
                          }
                        </div>
                        {schedule.status === 'planned' && (
                          <>
                            <div className={`opacity-75 ${isCompactView ? 'text-xs' : 'text-xs'}`}>
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            {!isCompactView && (
                              <div className="text-xs opacity-60 truncate">
                                {schedule.clientId.name}
                              </div>
                            )}
                          </>
                        )}
                        {schedule.status !== 'planned' && !isCompactView && (
                          <div className="text-xs opacity-75">
                            {schedule.notes || 'Brak szczegółów'}
                          </div>
                        )}
                      </div>
                    ))}
                  
                  {/* Show empty state for weekends when no special work */}
                  {isWeekend && daySchedules.filter(s => s.status === 'planned').length === 0 && !isCompactView && (
                    <div className="text-xs text-gray-400 italic text-center py-2">
                      Weekend
                    </div>
                  )}
                  
                  {/* Show empty state for weekdays */}
                  {!isWeekend && daySchedules.length === 0 && !isCompactView && (
                    <div className="text-xs text-gray-400 italic text-center py-2">
                      Brak zmian
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Weekly Summary Column - 8th column */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-2">
            <div className="text-center mb-2">
              <div className="text-sm font-medium text-blue-800">KW {format(currentDate, 'w')}</div>
            </div>
            
            <div className="space-y-1">
              {(() => {
                const allWeekSchedules = weekDays.flatMap(day => getSchedulesForDate(day));
                const groupedByClient = allWeekSchedules.reduce((acc, schedule) => {
                  const clientName = schedule.clientId?.name || 'Unbekannt';
                  if (!acc[clientName]) {
                    acc[clientName] = [];
                  }
                  acc[clientName].push(schedule);
                  return acc;
                }, {} as Record<string, typeof allWeekSchedules>);
                
                return Object.entries(groupedByClient).map(([clientName, clientSchedules]) => {
                  const clientHours = clientSchedules.reduce((total, schedule) => {
                    const hours = schedule.weeklyHours || 0;
                    return total + hours;
                  }, 0);
                  
                  const employeeNames = [...new Set(clientSchedules.map(s => 
                    `${s.employeeId?.userId?.firstName || ''} ${s.employeeId?.userId?.lastName || ''}`.trim()
                  ))];
                  
                  return (
                    <div key={clientName} className="text-xs border-b border-blue-200 pb-1 mb-1 last:border-b-0">
                      <div className="font-medium text-blue-800 truncate" title={clientName}>
                        {clientName.length > 15 ? `${clientName.substring(0, 15)}...` : clientName}
                      </div>
                      <div className="text-blue-600">
                        {employeeNames.length} MA, {clientHours}h
                      </div>
                      {employeeNames.length <= 2 && (
                        <div className="text-blue-500 text-xs">
                          {employeeNames.map(name => name.split(' ').map(n => n.charAt(0)).join('')).join(', ')}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Daily Statistics */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Tägliche Statistiken</h3>
          <div className="grid grid-cols-8 gap-2">
            {/* Daily stats for each day */}
            {weekDays.map((day) => {
              const stats = calculateDayStats(day);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`p-3 rounded-lg border ${isWeekend ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                >
                  <div className="text-center mb-2">
                    <div className="font-medium text-sm text-gray-700">
                      {format(day, 'dd.MM')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(day, 'EEE', { locale: pl })}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mitarbeiter:</span>
                      <span className="font-medium">{stats.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kunden:</span>
                      <span className="font-medium">{stats.clientCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stunden:</span>
                      <span className="font-medium">{stats.totalHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Umsatz:</span>
                      <span className="font-medium text-green-700">€{stats.clientRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Kosten:</span>
                      <span className="font-medium text-red-700">€{stats.employeeCost}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-blue-600 font-medium">Gewinn:</span>
                      <span className={`font-bold ${stats.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        €{stats.profit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Weekly Summary - 8th column */}
            {(() => {
              const weekStats = calculateWeekStats(weekDays);
              return (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                  <div className="text-center mb-2">
                    <div className="font-medium text-sm text-blue-800">Woche</div>
                    <div className="text-xs text-blue-600">Gesamt</div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Mitarbeiter:</span>
                      <span className="font-bold text-blue-700">{weekStats.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Kunden:</span>
                      <span className="font-bold text-blue-700">{weekStats.clientCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Stunden:</span>
                      <span className="font-bold text-blue-700">{weekStats.totalHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Umsatz:</span>
                      <span className="font-bold text-green-700">€{weekStats.clientRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Kosten:</span>
                      <span className="font-bold text-red-700">€{weekStats.employeeCost}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-blue-600 font-medium">Gewinn:</span>
                      <span className={`font-bold ${weekStats.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        €{weekStats.profit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = getMonthStart(currentDate);
    const monthEnd = getMonthEnd(currentDate);
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
    
    return (
      <div className="space-y-4">
        {/* Month header */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map(day => (
            <div key={day} className="text-sm font-medium text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="space-y-1">
          {weeks.map((weekStart, weekIndex) => {
            const weekDays = eachDayOfInterval({ 
              start: weekStart, 
              end: addDays(weekStart, 6) 
            });
            
            return (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const daySchedules = getSchedulesForDate(day);
                  const dayStyle = getDayStatusAndStyle(day);
                  const isCurrentMonth = day >= monthStart && day <= monthEnd;
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        ${isCompactView ? 'h-16' : 'h-32'} rounded p-1 cursor-pointer transition-all
                        ${isCurrentMonth ? dayStyle.bgClass : 'bg-gray-50'}
                        ${isCurrentMonth ? dayStyle.borderClass : 'border border-gray-100'}
                        ${isToday(day) ? 'ring-2 ring-blue-300' : ''}
                        hover:shadow-sm
                      `}
                      onClick={() => openDayModal(day)}
                    >
                      <div className={`
                        text-sm font-medium 
                        ${isCurrentMonth ? dayStyle.textClass : 'text-gray-400'}
                        ${isToday(day) ? 'text-blue-600' : ''}
                      `}>
                        {format(day, 'd')}
                        {isCurrentMonth && dayStyle.description && (
                          <div className="text-xs font-normal mt-1 leading-tight">
                            {dayStyle.description}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {/* Filter and display schedules based on day type */}
                        {daySchedules
                          .filter(schedule => {
                            // For weekends, only show working schedules
                            if (isWeekend) {
                              return schedule.status === 'planned';
                            }
                            // For weekdays, show up to 2 schedules
                            return true;
                          })
                          .slice(0, 2)
                          .map((schedule) => (
                            <div
                              key={schedule._id}
                              className={`
                                text-xs p-1 rounded truncate
                                ${schedule.status === 'planned' ? 'bg-green-100 text-green-800' : ''}
                                ${schedule.status === 'sick-leave' ? 'bg-red-100 text-red-800' : ''}
                                ${schedule.status === 'vacation' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${schedule.status === 'client-break' ? 'bg-blue-100 text-blue-800' : ''}
                              `}
                            >
                              {schedule.employeeId.userId.firstName}
                              {schedule.status === 'planned' && (
                                <div className="text-xs opacity-75">
                                  {schedule.startTime}
                                </div>
                              )}
                            </div>
                          ))}
                        
                        {/* Show count of remaining schedules */}
                        {daySchedules.filter(schedule => {
                          if (isWeekend) return schedule.status === 'planned';
                          return true;
                        }).length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{daySchedules.filter(schedule => {
                              if (isWeekend) return schedule.status === 'planned';
                              return true;
                            }).length - 2} więcej
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render year view
  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    
    return (
      <div className="grid grid-cols-3 gap-6">
        {months.map((month) => {
          const monthSchedules = schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.startDate);
            return scheduleDate >= startOfMonth(month) && scheduleDate <= endOfMonth(month);
          });
          
          return (
            <div
              key={month.toISOString()}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setCurrentDate(month);
                setViewType('month');
              }}
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {format(month, 'LLLL yyyy', { locale: pl })}
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {monthSchedules.length} zmian
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {new Set(monthSchedules.map(s => s.employeeId._id)).size} pracowników
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie harmonogramów...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Błąd</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Odśwież stronę
          </button>
        </div>
      </div>
    );
  }

  const weeklyStats = viewType === 'week' ? calculateWeeklyStats() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Harmonogram</h1>
              <p className="text-gray-600 mt-1">
                Zarządzaj harmonogramami pracy
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="mt-4 sm:mt-0 flex space-x-2">
              {(['week', 'month', 'year'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setViewType(view)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewType === view
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {view === 'week' ? 'Tydzień' : view === 'month' ? 'Miesiąc' : 'Rok'}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={navigatePrevious}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                {viewType === 'week' && (
                  `${format(getWeekStart(currentDate), 'd MMM', { locale: pl })} - ${format(getWeekEnd(currentDate), 'd MMM yyyy', { locale: pl })}`
                )}
                {viewType === 'month' && format(currentDate, 'LLLL yyyy', { locale: pl })}
                {viewType === 'year' && format(currentDate, 'yyyy')}
              </h2>
              
              <button
                onClick={navigateNext}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={navigateToday}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dzisiaj
              </button>
              
              <button 
                onClick={() => setIsCompactView(!isCompactView)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                title={isCompactView ? "Rozwiń widok" : "Zwiń widok"}
              >
                {isCompactView ? <Maximize2 className="w-4 h-4 mr-2" /> : <Minimize2 className="w-4 h-4 mr-2" />}
                {isCompactView ? "Rozwiń" : "Zwiń"}
              </button>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Dodaj zmianę
              </button>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Legenda kolorów:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
              <span className="text-gray-700">Dni robocze</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-red-500 bg-red-50 rounded"></div>
              <span className="text-gray-700">Zwolnienia chorobowe</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-50 rounded"></div>
              <span className="text-gray-700">Urlopy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded"></div>
              <span className="text-gray-700">Przerwy w pracy</span>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {viewType === 'week' && renderWeekView()}
          {viewType === 'month' && renderMonthView()}
          {viewType === 'year' && renderYearView()}
        </div>

        {/* Weekly Statistics */}
        {viewType === 'week' && weeklyStats && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 mr-2 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Statystyki tygodnia</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{weeklyStats.totalHours.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Łączne godziny</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{weeklyStats.totalShifts}</div>
                <div className="text-sm text-gray-600">Zmiany</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{weeklyStats.employeeCount}</div>
                <div className="text-sm text-gray-600">Pracownicy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{weeklyStats.clientCount}</div>
                <div className="text-sm text-gray-600">Klienci</div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - usuń w produkcji */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <p>📊 Łącznie harmonogramów: {schedules.length}</p>
          <p>📅 Aktualny widok: {viewType}</p>
          <p>🗓️ Aktualna data: {format(currentDate, 'yyyy-MM-dd')}</p>
        </div>

        {/* Day Details Modal */}
        {showDayModal && selectedDay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(selectedDay, 'EEEE, d MMMM yyyy', { locale: pl })}
                </h2>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {selectedDaySchedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Brak harmonogramów na ten dzień</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDaySchedules.map((schedule) => (
                      <div
                        key={schedule._id}
                        className={`
                          border rounded-lg p-4 
                          ${schedule.status === 'planned' ? 'border-green-200 bg-green-50' : ''}
                          ${schedule.status === 'sick-leave' ? 'border-red-200 bg-red-50' : ''}
                          ${schedule.status === 'vacation' ? 'border-yellow-200 bg-yellow-50' : ''}
                          ${schedule.status === 'client-break' ? 'border-blue-200 bg-blue-50' : ''}
                        `}
                      >
                        {editingSchedule && editingSchedule._id === schedule._id ? (
                          // Edit form
                          <EditScheduleForm 
                            schedule={editingSchedule}
                            onSave={saveEditedSchedule}
                            onCancel={cancelEditing}
                          />
                        ) : (
                          // Display mode
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-gray-900">
                                  {schedule.employeeId.userId.firstName} {schedule.employeeId.userId.lastName}
                                </h3>
                                <span className={`
                                  px-2 py-1 rounded-full text-xs font-medium
                                  ${schedule.status === 'planned' ? 'bg-green-100 text-green-800' : ''}
                                  ${schedule.status === 'sick-leave' ? 'bg-red-100 text-red-800' : ''}
                                  ${schedule.status === 'vacation' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${schedule.status === 'client-break' ? 'bg-blue-100 text-blue-800' : ''}
                                `}>
                                  {schedule.status === 'planned' && 'Praca'}
                                  {schedule.status === 'sick-leave' && 'Zwolnienie chorobowe'}
                                  {schedule.status === 'vacation' && 'Urlop'}
                                  {schedule.status === 'client-break' && 'Przerwa w pracy'}
                                </span>
                              </div>
                              
                              <div className="space-y-2 text-sm text-gray-600">
                                {schedule.status === 'planned' && (
                                  <>
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-4 h-4" />
                                      <span>{schedule.startTime} - {schedule.endTime}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Users className="w-4 h-4" />
                                      <span>{schedule.clientId.name}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Godziny tygodniowe:</span> {schedule.weeklyHours}h
                                    </div>
                                  </>
                                )}
                                
                                {schedule.notes && (
                                  <div>
                                    <span className="font-medium">Notatki:</span> {schedule.notes}
                                  </div>
                                )}
                                
                                <div className="text-xs text-gray-400">
                                  Utworzono: {format(new Date(schedule.createdAt), 'dd.MM.yyyy HH:mm')}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => startEditingSchedule(schedule)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edytuj"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Czy na pewno chcesz usunąć ten harmonogram?')) {
                                    deleteSchedule(schedule._id);
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Usuń"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDayModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Zamknij
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Dodaj nową zmianę
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
