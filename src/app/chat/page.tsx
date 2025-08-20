'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatEnhancements } from '@/hooks/useChatEnhancements';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
}

interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  messageType: 'text' | 'file';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersByRole {
  admin: User[];
  hr: User[];
  employee: User[];
}

interface RoleInfo {
  value: string;
  label: string;
  count: number;
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersByRole, setUsersByRole] = useState<UsersByRole>({ admin: [], hr: [], employee: [] });
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationWith, setConversationWith] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced chat functionality
  const { 
    unreadCount, 
    loadChatState,
    requestNotificationPermission
  } = useChatEnhancements({
    currentUserId: currentUser?._id,
    conversationWith,
    messages,
    setMessages
  });

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setUsersByRole(data.usersByRole);
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async (withUser?: string) => {
    try {
      const url = withUser 
        ? `/api/messages?conversationWith=${withUser}`
        : '/api/messages';
        
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.reverse()); // Reverse for chronological order
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipient: selectedUser,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        scrollToBottom();
      } else {
        const error = await response.json();
        alert(error.error || 'Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle role change
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setSelectedUser('');
    setConversationWith('');
    setMessages([]);
  };

  // Handle user change
  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    setConversationWith(userId);
  };

  // Fetch users on start and restore chat state
  useEffect(() => {
    fetchUsers();
    
    // Restore last conversation after users are loaded
    const savedConversation = loadChatState();
    if (savedConversation) {
      // Wait a bit for users to load, then restore conversation
      setTimeout(() => {
        setSelectedUser(savedConversation);
        setConversationWith(savedConversation);
        // Find the role of the saved user to set selectedRole
        const user = users.find(u => u._id === savedConversation);
        if (user) {
          setSelectedRole(user.role);
        }
      }, 500);
    }
  }, [fetchUsers, loadChatState, users]);

  // Fetch messages when conversation partner changes
  useEffect(() => {
    if (conversationWith) {
      fetchMessages(conversationWith);
    }
  }, [conversationWith, fetchMessages]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    messages.forEach(message => {
      if (!message.isRead && message.recipient._id === currentUser?._id && message.sender._id === conversationWith) {
        markAsRead(message._id);
      }
    });
  }, [messages, currentUser, conversationWith, markAsRead]);

  const getCurrentUsersList = () => {
    if (!selectedRole) return [];
    if (selectedRole === 'all') return users;
    return usersByRole[selectedRole as keyof UsersByRole] || [];
  };

  const getSelectedUserName = () => {
    if (!selectedUser) return '';
    const user = users.find(u => u._id === selectedUser);
    return user ? `${user.firstName} ${user.lastName}` : '';
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">Company Chat</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={requestNotificationPermission}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            🔔 Enable Notifications
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Recipient selection panel */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Select Recipient</h2>
          
          {/* Role selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select role</option>
              <option value="all">All users</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label} ({role.count})
                </option>
              ))}
            </select>
          </div>

          {/* User selection */}
          {selectedRole && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select user</option>
                {getCurrentUsersList().map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {selectedUser ? `Conversation with ${getSelectedUserName()}` : 'Select a user'}
            </h3>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {!selectedUser ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a user to start a conversation
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No messages
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === currentUser._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === currentUser._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="text-sm font-semibold mb-1">
                        {message.sender._id === currentUser._id 
                          ? 'You' 
                          : `${message.sender.firstName} ${message.sender.lastName}`
                        }
                      </div>
                      <div>{message.content}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {new Date(message.createdAt).toLocaleString()}
                        {message.sender._id === currentUser._id && (
                          <span className="ml-2">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message input */}
          {selectedUser && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
