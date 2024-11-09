import { formatTimestamp } from '@/lib/utils';
import { Check, CheckCheck, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ChatMessageInterface, OnlineUserInterface } from '../../coEditor/components/Editor.types';
import UserAvatar from '../../coEditor/components/UserAvatar';
import { useOnlineUsers } from '../../coEditor/hooks/useOnlineUsers';
import { CurrentUserInterface } from './chat.types';

const ChatMessage = React.memo(({ message, currentUser, isNewMessage = false, previousMessage }: {
  message: ChatMessageInterface,
  currentUser: CurrentUserInterface,
  isNewMessage?: boolean,
  previousMessage?: ChatMessageInterface
}) => {
  const { users } = useOnlineUsers();
  const [user, setUser] = useState<OnlineUserInterface>();

  useEffect(() => {
    setUser(users.find((user) => user.userId === message.userId));
  }, [message.userId, users]);

  return (
    <div
      className={`flex ${message.userId === currentUser?.userId ? 'justify-end' : 'justify-start'} mb-1`}
    style={{
      animation: isNewMessage ? 'slideUpFade 0.3s ease-out forwards' : undefined,
      willChange: isNewMessage ? 'transform, opacity' : undefined
    }}
  >
      {message.userId !== currentUser?.userId && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 self-center mb-2 mr-2">
            <UserAvatar user={user} />
        </div>
      )}
      <div
        className={`max-w-xs w-auto px-4 py-2 rounded-2xl ${
        message.userId === currentUser?.userId
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
      } ${(!previousMessage || previousMessage.userId !== message.userId) ? 'mt-2.5' : ''}`}
    >
      {(!previousMessage || previousMessage.userId !== message.userId) && (
        <p className="font-semibold text-xs opacity-70 mb-1">{message.fullName}</p>
      )}
      <div className="space-y-1">
        <p className="text-sm break-words">{message.content}</p>
        <div className={`flex items-center text-[10px] opacity-70 gap-1 ${
          message.userId === currentUser?.userId ? 'justify-end' : 'justify-start'
        }`}>
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
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;