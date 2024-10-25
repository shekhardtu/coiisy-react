
import { local } from "@/lib/utils";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

import ChatPage from "../../chat/Chat.page";


// interface SessionIdentifierInterface {
//   guestIdentifier: CurrentUserInterface;
//   sessionId: string;
// }

const EditorSidebar = () => {


  const { sessionId } = useParams();


  const handleSendMessage = useCallback((message: string) => {

    const { guestIdentifier } = local("json", "key").get(`sessionIdentifier-${sessionId}`) || {}



    const guestIdentifierUpdatedWithNewMessage =  {
      ...guestIdentifier,
      messages: [...guestIdentifier.messages, {
        userId: guestIdentifier?.userId,
        userName: guestIdentifier?.userName,
        content: message,
        createdAt: new Date().toISOString(),
      }],
    }
    local("json", "key").set(`sessionIdentifier-${sessionId}`, {guestIdentifier: guestIdentifierUpdatedWithNewMessage, sessionId})

  }, [])

  return (
    <aside className="min-w-80 border-l border-border bg-background-light h-full justify-between flex flex-col">
      <ChatPage onSendMessage={handleSendMessage} />
    </aside>
  )
}

  export default EditorSidebar
