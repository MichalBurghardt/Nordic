'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, Clock } from 'lucide-react';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  readAt?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

interface InternalChatProps {
  isOpen: boolean;
  onClose: () => void;
  pageUrl?: string;
  pageTitle?: string;
}

export default function InternalChat({ isOpen, onClose, pageUrl, pageTitle }: InternalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchMessages();
      // Set default subject if pageTitle is provided
      if (pageTitle) {
        setSubject(`Odnośnie: ${pageTitle}`);
      }
    }
  }, [isOpen, pageTitle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim() || !subject.trim()) {
      setError('Wszystkie pola są wymagane');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const messageData = {
        recipientId: selectedUser._id,
        subject: subject.trim(),
        content: newMessage.trim() + (pageUrl ? `\n\nLink do strony: ${pageUrl}` : ''),
        priority
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        setNewMessage('');
        setSubject(pageTitle ? `Odnośnie: ${pageTitle}` : '');
        setPriority('normal');
        fetchMessages(); // Refresh messages
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Błąd podczas wysyłania wiadomości');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Wewnętrzny Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Users List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Wybierz odbiorcę
              </h4>
            </div>
            <div className="p-2">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    selectedUser?._id === user._id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.role} • {user.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages & Compose */}
          <div className="flex-1 flex flex-col">
            {/* Recent Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Ostatnie wiadomości
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {messages.slice(0, 5).map((message) => (
                    <div key={message._id} className="bg-white p-3 rounded-lg shadow-sm border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm text-gray-900">
                          {message.sender.firstName} {message.sender.lastName}
                          {' → '}
                          {message.recipient.firstName} {message.recipient.lastName}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-700 mb-1">{message.subject}</div>
                      <div className="text-xs text-gray-500 truncate">{message.content}</div>
                      <div className="text-xs text-gray-400 mt-1">{formatDate(message.createdAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compose Form */}
            <div className="border-t border-gray-200 p-4 bg-white">
              {error && (
                <div className="mb-3 p-2 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {/* Recipient Display */}
                {selectedUser && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Do:</span>
                    <span className="font-medium">
                      {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.role})
                    </span>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <input
                    type="text"
                    placeholder="Temat wiadomości"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Priority */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Priorytet:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Niski</option>
                    <option value="normal">Normalny</option>
                    <option value="high">Wysoki</option>
                    <option value="urgent">Pilny</option>
                  </select>
                </div>

                {/* Message Content */}
                <div className="flex space-x-2">
                  <textarea
                    placeholder="Wpisz wiadomość..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    rows={3}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !selectedUser || !newMessage.trim() || !subject.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {pageUrl && (
                  <div className="text-xs text-gray-500">
                    * Link do aktualnej strony zostanie automatycznie dołączony
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
