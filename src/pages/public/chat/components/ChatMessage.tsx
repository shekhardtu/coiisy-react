import { formatTimestamp } from '@/lib/utils';
import React from 'react';
import { ServerChatMessageInterface } from '../../coEditor/components/Editor.types';
import { CurrentUserInterface } from './chat.types';

const ChatMessage = React.memo(({ message, currentUser, isNewMessage = false, previousMessage }: {
  message: ServerChatMessageInterface,
  currentUser: CurrentUserInterface,
  isNewMessage?: boolean,
  previousMessage?: ServerChatMessageInterface
}) => (
  <div
    className={`flex ${message.userId === currentUser?.userId ? 'justify-end' : 'justify-start'}`}
    style={{
      opacity: isNewMessage ? 0.1 : 1,
      animation: isNewMessage ? 'slideUpFade 0.2s ease-out forwards' : undefined,
      willChange: isNewMessage ? 'transform, opacity' : undefined
    }}
  >
    <div
      className={`max-w-xs w-auto px-4 py-2 mx-6 rounded-lg min-w-24 ${
        message.userId === currentUser?.userId
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-200 text-gray-800 border border-gray-200'
      }`}
    >
      {(!previousMessage || previousMessage.userId !== message.userId) && (
        <p className="font-semibold text-xs opacity-70">{message.fullName}</p>
      )}
      <p className="text-sm break-words">{message.content}</p>
      <p className="text-[10px] text-right mt-1 opacity-70">
        {formatTimestamp(message.createdAt)}
      </p>
    </div>
  </div>
));

export default ChatMessage;