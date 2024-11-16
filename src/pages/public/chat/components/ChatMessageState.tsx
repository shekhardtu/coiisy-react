import { Check, CheckCheck, Clock } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { ChatMessageInterface, CurrentUserInterface } from '../../coEditor/components/Editor.types';
import { useOnlineUsers } from "../../coEditor/hooks/useOnlineUsers";
interface ChatMessageStateProps {
  message: ChatMessageInterface;
  currentUser: CurrentUserInterface;
  className?: string;
}

const ChatMessageState = ({ message, currentUser, className }: ChatMessageStateProps) => {
  const { activeUsers } = useOnlineUsers({ minutes: 10, sessionId: message.sessionId })
  const [showBlue, setShowBlue] = useState(false);

  const isDelivered = useMemo(() => {


    if (!message?.state || activeUsers.length === 0) return false;

    const activeUsersIds = new Set(
      activeUsers
        .filter((user: CurrentUserInterface) => user.userId !== currentUser?.userId)
        .map(user => user.userId)
    );


    if (Array.isArray(message.state) && message.state.length > 0) {

      const deliveredUsersIds = new Set(
        message.state
          .filter((messageState) => messageState.state === 'delivered'
          )
          .map(messageState => messageState.userId)
      );


      // console.log([...activeUsersIds], [...deliveredUsersIds])

      return (
        activeUsersIds.size === deliveredUsersIds.size &&
        [...activeUsersIds].every(userId => deliveredUsersIds.has(userId))
      );
    }

    return false;
  }, [message?.state, currentUser?.userId, activeUsers]);

  useEffect(() => {
    if (isDelivered) {
      const timer = setTimeout(() => setShowBlue(true), 1000);
      return () => clearTimeout(timer);
    }
    setShowBlue(false);
  }, [isDelivered]);

  return (
    <div className={`flex items-center text-[10px] gap-1  ${className}`}>
      {message.userId === currentUser?.userId && (
        <span className="ml-0.5" title={`Message ${message.state}`}>
          {message.state?.find(state => state.state === 'sending') &&
            <span title="Message sending">
              <Clock size={12} />
            </span>
          }
          {!isDelivered &&
            <span title="Message sent">
              <Check size={12} />
            </span>
          }

      {isDelivered && (
            <span title="Message delivered">
              <CheckCheck
                size={12}
                strokeWidth={3}
                className={`transition-colors duration-300 font-bold ${
                  showBlue
                    ? 'text-blue-600 animate-draw-checks'
                    : 'text-gray-600'
                }`}
              />
            </span>
          )}
        </span>
      )}
    </div>
  )
}

export default memo(ChatMessageState)
