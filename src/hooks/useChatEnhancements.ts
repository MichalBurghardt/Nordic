// Chat Enhancement Hook - Real-time polling and notifications
import { useState, useEffect, useCallback, useRef } from 'react';

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

interface UseChatEnhancementsProps {
  currentUserId: string | undefined;
  conversationWith: string;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
}

export function useChatEnhancements({
  currentUserId,
  conversationWith,
  messages,
  setMessages
}: UseChatEnhancementsProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Show browser notification
  const showNotification = useCallback((message: Message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`Nowa wiadomość od ${message.sender.firstName} ${message.sender.lastName}`, {
        body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        icon: '/favicon.ico',
        tag: `chat-${message.sender._id}` // Prevent multiple notifications from same user
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  // Fetch new messages with polling
  const fetchNewMessages = useCallback(async () => {
    if (!currentUserId || !conversationWith || isPolling) return;

    try {
      setIsPolling(true);
      const url = `/api/messages?conversationWith=${conversationWith}&since=${lastMessageIdRef.current || ''}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages.reverse();
        
        if (newMessages.length > 0) {
          // Update messages
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m._id));
            const reallyNewMessages = newMessages.filter((m: Message) => !existingIds.has(m._id));
            
            if (reallyNewMessages.length > 0) {
              // Show notification for new messages from others
              reallyNewMessages.forEach((msg: Message) => {
                if (msg.sender._id !== currentUserId) {
                  showNotification(msg);
                }
              });
              
              // Update last message ID
              lastMessageIdRef.current = newMessages[newMessages.length - 1]._id;
              
              return [...prev, ...reallyNewMessages];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
    } finally {
      setIsPolling(false);
    }
  }, [currentUserId, conversationWith, isPolling, setMessages, showNotification]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Count unread messages
  const countUnreadMessages = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const response = await fetch('/api/messages/unread-count', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [currentUserId]);

  // Save chat state to localStorage
  const saveChatState = useCallback(() => {
    if (conversationWith) {
      localStorage.setItem('nordic-chat-state', JSON.stringify({
        conversationWith,
        timestamp: Date.now()
      }));
    }
  }, [conversationWith]);

  // Load chat state from localStorage
  const loadChatState = useCallback(() => {
    try {
      const saved = localStorage.getItem('nordic-chat-state');
      if (saved) {
        const state = JSON.parse(saved);
        // Return state if it's less than 1 hour old
        if (Date.now() - state.timestamp < 3600000) {
          return state.conversationWith;
        }
      }
    } catch (error) {
      console.error('Error loading chat state:', error);
    }
    return null;
  }, []);

  // Start polling when conversation is active
  useEffect(() => {
    if (conversationWith && currentUserId) {
      // Initial fetch
      if (messages.length > 0) {
        lastMessageIdRef.current = messages[messages.length - 1]._id;
      }

      // Start polling every 3 seconds
      pollingIntervalRef.current = setInterval(fetchNewMessages, 3000);

      // Save state
      saveChatState();

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [conversationWith, currentUserId, fetchNewMessages, saveChatState, messages]);

  // Update unread count periodically
  useEffect(() => {
    if (currentUserId) {
      countUnreadMessages();
      const interval = setInterval(countUnreadMessages, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [currentUserId, countUnreadMessages]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    unreadCount,
    loadChatState,
    requestNotificationPermission
  };
}
