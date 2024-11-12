import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Copy, Edit, Heart, Trash } from "lucide-react";
import { memo } from "react";
import { ChatMessageInterface } from "../../coEditor/components/Editor.types";

import { useMessageWebSocket } from "@/contexts/MessageWebSocket.context";

interface ChatMessageActionsProps {

  message: ChatMessageInterface;

  isOwnMessage: boolean;
  isOpen: boolean;
  onClose: () => void;

}

export function ChatMessageActions({
  message,
  isOwnMessage,
  onClose,

}: ChatMessageActionsProps) {


  const { toast } = useToast();
  const { deleteMessage } = useMessageWebSocket();


  const handleAction = (action: string) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(message.content);
        toast({
          title: 'Copied to clipboard',
          description: 'The message has been copied to your clipboard',
          duration: 600
        });
        break;
      case 'delete':
        deleteMessage(message.messageId);
        break;
    }

    onClose()
  }



  return (
      <PopoverContent
          className="w-auto shadow-lg transition-all duration-200 p-2
          data-[state=open]:animate-in data-[state=closed]:animate-out"
          side={isOwnMessage ? 'left' : 'right'}

          sideOffset={8}
          alignOffset={-30}

    >
        <div className="flex flex-col">
          {isOwnMessage && (
            <Button
              variant="ghost"
              className="flex items-center gap-2 w-full justify-start hover:bg-gray-100/80
                transition-colors duration-200 focus:ring-0 focus-visible:ring-2 ring-0 selection:ring-0
                outline-none border-none"
              onClick={() => handleAction('edit')}
            >
              <Edit size={16} className="text-gray-500" />
              <span>Edit</span>
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-full justify-start hover:bg-gray-100/80
              transition-colors duration-200 focus:ring-0 focus-visible:ring-2"
            onClick={() => handleAction('favorite')}
          >
            <Heart size={16} className="text-gray-500" />
            <span>Favorite</span>
          </Button>
          {isOwnMessage && (
            <Button
              variant="ghost"
              className="flex items-center gap-2 w-full justify-start hover:bg-red-50
                text-red-600 transition-colors duration-200 focus:ring-0 focus-visible:ring-2"
              onClick={() => handleAction('delete')}
            >
              <Trash size={16} />
              <span>Delete</span>
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-full justify-start hover:bg-gray-100/80
              transition-colors duration-200 focus:ring-0 focus-visible:ring-2"
            onClick={() => handleAction('copy')}
          >
            <Copy size={16} className="text-gray-500" />
            <span>Copy</span>
          </Button>
        </div>
        <div
          className="absolute w-2 h-2 rotate-45 bg-white"
          style={{
            [isOwnMessage ? 'right' : 'left']: '-4px',
            top: 'calc(50% - 4px)',
          }}
        />
      </PopoverContent>

  );
}

export default memo(ChatMessageActions);

