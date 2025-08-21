'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import MiniCalendar from './MiniCalendar';
import UpcomingEvents from './UpcomingEvents';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder';
  description?: string;
}

export default function AdminRightPanel() {
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      type: 'meeting',
      description: 'Wöchentliches Team Meeting'
    },
    {
      id: '2',
      title: 'Kunde Beratung',
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      type: 'meeting',
      description: 'Beratung mit neuem Kunden'
    },
    {
      id: '3',
      title: 'Projekt Review',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: '16:00',
      type: 'task',
      description: 'Review des Nordic Projekts'
    }
  ]);
  
  // Mock data - replace with real data later
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'Maria Schmidt',
      message: 'Neuer Kunde für Projekt Hamburg',
      timestamp: new Date(Date.now() - 300000) // 5 min ago
    },
    {
      id: '2',
      user: 'Thomas Weber',
      message: 'Meeting um 14:00 verschoben',
      timestamp: new Date(Date.now() - 900000) // 15 min ago
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'Sie',
      message: newMessage,
      timestamp: new Date()
    };

    setMessages([message, ...messages]);
    setNewMessage('');
  };

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setEvents([...events, newEvent]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-800 border-l border-nordic-light/30 dark:border-nordic-dark/30 shadow-lg flex flex-col">
      
      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-nordic-light/30 dark:border-nordic-dark/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-nordic-primary" />
              <h2 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">Team Chat</h2>
            </div>
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="p-1 rounded-lg hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50 transition-colors"
            >
              {isChatExpanded ? (
                <ChevronUp className="w-4 h-4 text-nordic-primary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-nordic-primary" />
              )}
            </button>
          </div>
        </div>

        {isChatExpanded && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="bg-nordic-light/30 dark:bg-nordic-dark/30 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-nordic-dark dark:text-nordic-light">
                      {message.user}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{message.message}</p>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-nordic-light/30 dark:border-nordic-dark/30">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
                <button
                  type="submit"
                  className="p-2 bg-nordic-primary text-white rounded-lg hover:bg-nordic-dark transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Calendar Section */}
      <div className="border-t border-nordic-light/30 dark:border-nordic-dark/30">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-4">Kalender</h2>
          <MiniCalendar 
            events={events}
            onAddEvent={handleAddEvent}
          />
        </div>
        
        <div className="border-t border-nordic-light/30 dark:border-nordic-dark/30 p-4">
          <UpcomingEvents events={events} />
        </div>
      </div>
    </div>
  );
}
