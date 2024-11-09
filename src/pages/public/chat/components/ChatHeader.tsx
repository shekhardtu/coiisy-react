import { cn } from '@/lib/utils';
import React from 'react';
import { ChatStatus } from './chat.types';
interface ChatHeaderProps {
  status: ChatStatus['status'];
  tryConnect: ChatStatus['tryConnect'];
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ status, tryConnect, className }) => (
  <div className={cn("flex-none bg-background z-30 h-auto", className)}>
    <div className="px-3 sm:px-4 py-2 border-b border-border flex items-center justify-between">
      <span className="text-sm font-medium">Chat</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' :
          status === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {status === 'connected' ? 'Connected' :
              status === 'connecting' ? 'Connecting...' :
                'Disconnected'}
          </span>
          {status === 'disconnected' && (
            <button
              onClick={tryConnect}
              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>
    </div>

    {status === 'disconnected' && (
      <div className="p-2 bg-yellow-500/10 border-b border-yellow-500/20">
        <p className="text-xs text-center text-yellow-600">
          Connection lost. Messages won't be delivered until reconnected.
        </p>
      </div>
    )}
  </div>
);

export default ChatHeader;