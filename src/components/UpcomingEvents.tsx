'use client';

import { Clock, Calendar, AlertCircle } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  type: 'meeting' | 'task' | 'reminder';
}

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Filter events for upcoming dates
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare === 0) {
        return a.time.localeCompare(b.time);
      }
      return dateCompare;
    })
    .slice(0, 5); // Show only next 5 events

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
      case 'task':
        return <Clock className="w-4 h-4" />;
      case 'reminder':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'text-nordic-primary bg-nordic-primary/10';
      case 'task':
        return 'text-nordic-dark bg-nordic-light dark:text-nordic-light dark:bg-nordic-dark/30';
      case 'reminder':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      default:
        return 'text-nordic-primary bg-nordic-primary/10';
    }
  };

  const formatEventDate = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    const eventDateStr = eventDate.toDateString();

    if (eventDateStr === todayStr) {
      return 'Heute';
    } else if (eventDateStr === tomorrowStr) {
      return 'Morgen';
    } else {
      return eventDate.toLocaleDateString('de-DE', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getTimeUntilEvent = (dateStr: string, timeStr: string) => {
    const eventDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diffMs = eventDateTime.getTime() - now.getTime();
    
    if (diffMs < 0) return null; // Event has passed
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours < 1) {
      return `in ${diffMins}min`;
    } else if (diffHours < 24) {
      return `in ${diffHours}h ${diffMins}min`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `in ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-nordic-light/30 dark:border-nordic-dark/30">
      <div className="p-4 border-b border-nordic-light/30 dark:border-nordic-dark/30">
        <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">
          Nächste Termine
        </h3>
      </div>

      <div className="p-4">
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const timeUntil = getTimeUntilEvent(event.date, event.time);
              
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-nordic-light/20 dark:bg-nordic-dark/20">
                  <div className={`p-2 rounded-full ${getEventTypeColor(event.type)}`}>
                    {getEventTypeIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-nordic-dark dark:text-nordic-light truncate">
                      {event.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatEventDate(event.date)} • {event.time}
                      </span>
                      {timeUntil && (
                        <span className="text-xs bg-nordic-primary/10 text-nordic-primary px-2 py-0.5 rounded-full">
                          {timeUntil}
                        </span>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keine bevorstehenden Termine
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
