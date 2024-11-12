import { formatTimestamp } from '@/lib/utils';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { ChatMessageInterface } from '../../coEditor/components/Editor.types';
import { CurrentUserInterface } from './chat.types';

interface ChatMessageStateProps {
  message: ChatMessageInterface;
  currentUser: CurrentUserInterface;
  className?: string;
}

const ChatMessageState = ({ message, currentUser, className }: ChatMessageStateProps) => {
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
          {message.state === 'delivered' && (
            <span title="Message delivered">
              <CheckCheck size={12} />
            </span>
          )}
        </span>
      )}
    </div>
  )
}

export default ChatMessageState