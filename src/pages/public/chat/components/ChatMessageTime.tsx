
import { formatTimestamp } from '@/lib/utils';
import { memo } from 'react';
import { ChatMessageInterface, CurrentUserInterface } from '../../coEditor/components/Editor.types';
interface ChatMessageTimeProps {
  message: ChatMessageInterface;
  currentUser: CurrentUserInterface;
  className?: string;
}

const ChatMessageTime = ({ message, currentUser, className }: ChatMessageTimeProps) => {


  return (
    <div className={`flex items-center text-[10px] gap-1  ${
      message.userId === currentUser?.userId ? 'justify-end' : 'justify-start'
    } ${className}`}>
      {formatTimestamp(message.createdAt)}

    </div>
  )
}

export default memo(ChatMessageTime)
