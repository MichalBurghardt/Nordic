interface ChatStatusProps {
  isOnline: boolean;
  lastSeen?: string;
  isTyping?: boolean;
}

export default function ChatStatus({ isOnline, lastSeen, isTyping }: ChatStatusProps) {
  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span>
        {isTyping ? (
          <span className="text-blue-600 font-medium">typing...</span>
        ) : isOnline ? (
          'online'
        ) : lastSeen ? (
          `last seen ${formatLastSeen(lastSeen)}`
        ) : (
          'offline'
        )}
      </span>
    </div>
  );
}
