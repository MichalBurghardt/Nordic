'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  type: 'meeting' | 'task' | 'reminder';
}

interface MiniCalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

export default function MiniCalendar({ events, onAddEvent }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    description: '',
    type: 'meeting' as CalendarEvent['type']
  });

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const daysInCalendar = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    daysInCalendar.push(date);
  }

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowAddEvent(true);
    setNewEvent({
      ...newEvent,
      title: '',
      time: '',
      description: ''
    });
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newEvent.title || !newEvent.time) return;

    const event: Omit<CalendarEvent, 'id'> = {
      title: newEvent.title,
      date: selectedDate.toISOString().split('T')[0],
      time: newEvent.time,
      description: newEvent.description,
      type: newEvent.type
    };

    onAddEvent(event);
    setShowAddEvent(false);
    setNewEvent({ title: '', time: '', description: '', type: 'meeting' });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-nordic-light/30 dark:border-nordic-dark/30">
      {/* Calendar Header */}
      <div className="p-4 border-b border-nordic-light/30 dark:border-nordic-dark/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-nordic-primary" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-nordic-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {daysInCalendar.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  h-8 text-xs rounded flex items-center justify-center relative transition-colors
                  ${isTodayDate 
                    ? 'bg-nordic-primary text-white font-semibold' 
                    : isCurrentMonthDay
                      ? 'text-nordic-dark dark:text-nordic-light hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50'
                      : 'text-gray-400 dark:text-gray-500'
                  }
                `}
              >
                <span>{date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-nordic-primary rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">
                Ereignis hinzufügen
              </h3>
              <button
                onClick={() => setShowAddEvent(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                  Datum
                </label>
                <input
                  type="text"
                  value={selectedDate.toLocaleDateString('de-DE')}
                  disabled
                  className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg bg-gray-50 dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                  Titel
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
                  placeholder="Ereignistitel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                  Zeit
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                  Typ
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
                  className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Aufgabe</option>
                  <option value="reminder">Erinnerung</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                  Beschreibung (optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
                  rows={2}
                  placeholder="Zusätzliche Details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 px-4 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg text-nordic-dark dark:text-nordic-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-nordic-primary text-white rounded-lg hover:bg-nordic-dark transition-colors"
                >
                  Hinzufügen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
