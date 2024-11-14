
import { formatTimestamp } from '@/lib/utils';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { memo, useMemo } from 'react';
import { ChatMessageInterface, CurrentUserInterface } from '../../coEditor/components/Editor.types';
import { useOnlineUsers } from "../../coEditor/hooks/useOnlineUsers";
interface ChatMessageStateProps {
  message: ChatMessageInterface;
  currentUser: CurrentUserInterface;
  className?: string;
}

const ChatMessageState = ({ message, currentUser, className }: ChatMessageStateProps) => {
  const { activeUsers } = useOnlineUsers({ minutes: 10, sessionId: message.sessionId }   )

  const isDelivered = useMemo(() => Array.isArray(message.state)
    ? message.state.filter((state: string | { state: string }) =>
        typeof state === 'string' ? state === 'delivered' : state?.state === 'delivered'
      ).length === activeUsers.length - 1
      : message.state === 'delivered', [message.state, activeUsers])

  return (
    <div className={`flex items-center text-[10px] gap-1 ${
      message.userId === currentUser?.userId ? 'justify-end' : 'justify-start'
    } ${className}`}>
      {formatTimestamp(message.createdAt)}
      {message.userId === currentUser?.userId && (
        <span className="ml-0.5" title={`Message ${message.state}`}>
          {message.state === 'sending' &&
            <span title="Message sending">
              <Clock size={12} />
            </span>
          }
          {message.state === 'sent' &&
            <span title="Message sent">
              <Check size={12} />
            </span>
          }

          {isDelivered && (
            <span title="Message delivered">
              <CheckCheck size={12} />
            </span>
          )}
        </span>
      )}
    </div>
  )
}

export default memo(ChatMessageState)
