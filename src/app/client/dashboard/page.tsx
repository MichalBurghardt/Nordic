'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';

interface Schedule {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  client: {
    _id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  date: string;
  description?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

export default function ClientDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [error, setError] = useState('');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const response = await fetch(`/api/client/schedule?weekStart=${weekStartStr}`);
      
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const previousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const getSchedulesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Woche vom {format(weekStart, 'dd.MM.yyyy', { locale: de })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={previousWeek}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ← Vorherige Woche
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {format(weekStart, 'dd.MM.yyyy', { locale: de })} - {format(addDays(weekStart, 6), 'dd.MM.yyyy', { locale: de })}
          </h2>
          
          <button
            onClick={nextWeek}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Nächste Woche →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Header Row */}
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
              const day = addDays(weekStart, dayIndex);
              return (
                <div key={dayIndex} className="bg-gray-50 p-4 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {format(day, 'EEEE', { locale: de })}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {format(day, 'dd', { locale: de })}
                  </div>
                </div>
              );
            })}

            {/* Schedule Rows */}
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
              const day = addDays(weekStart, dayIndex);
              const daySchedules = getSchedulesForDay(day);

              return (
                <div key={`schedules-${dayIndex}`} className="bg-white p-4 min-h-[200px]">
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule._id}
                        className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {schedule.employee.firstName} {schedule.employee.lastName}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                            {schedule.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-1">
                          {format(new Date(`2000-01-01T${schedule.startTime}`), 'HH:mm')} - {format(new Date(`2000-01-01T${schedule.endTime}`), 'HH:mm')}
                        </div>
                        
                        {schedule.description && (
                          <div className="text-sm text-gray-500">
                            {schedule.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Diese Woche</h3>
            <div className="text-3xl font-bold text-blue-600">{schedules.length}</div>
            <div className="text-sm text-gray-500">Termine gesamt</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bestätigt</h3>
            <div className="text-3xl font-bold text-green-600">
              {schedules.filter(s => s.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-500">Termine bestätigt</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geplant</h3>
            <div className="text-3xl font-bold text-yellow-600">
              {schedules.filter(s => s.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-500">Termine geplant</div>
          </div>
        </div>
      </div>
    </div>
  );
}
