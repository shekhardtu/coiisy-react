

import { memo } from "react";
import ChatPage from "../../chat/Chat.page";


const EditorSidebar = () => {

  return (
    <aside className="min-w-80 border-l border-border bg-background-light h-full justify-between flex flex-col">
      <ChatPage  />
    </aside>
  )
}
export default memo(EditorSidebar)
