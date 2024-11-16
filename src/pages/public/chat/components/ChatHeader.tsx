import { cn } from "@/lib/utils";
import React, { useContext } from "react";
import { ChatStatus } from "./chat.types";
interface ChatHeaderProps {
  status: ChatStatus["status"]
  tryConnect: ChatStatus["tryConnect"]
  className?: string
}

import CopyWithInput from "@/components/copy/withInput";
import PulseDot from "@/components/pulseDot/pulseDot.componet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/contexts/WebSocketContext";

import { AlertTriangle, Loader2, Share2 } from "lucide-react";

import { wsConfig } from "@/lib/webSocket.config";
import UserAvatars from "../../coEditor/components/UsersAvatar";
import { EditorContext } from "../../coEditor/contexts/Editor.context";
import { useOnlineUsers } from "../../coEditor/hooks/useOnlineUsers";
import { NavActions } from "./NavActions";

const ChatHeader: React.FC<ChatHeaderProps> = ({
  status,
  className,
}) => {

  const editorContext = useContext(EditorContext)
  const { sessionId, tryConnect } = useWebSocket()
  const { activeUsers } = useOnlineUsers({ minutes: wsConfig.onlineTimeoutInMinutes, sessionId })



  if (!editorContext) {
    throw new Error("EditorLayoutContent must be used within EditorProvider")
  }

  const url = window.location.href

  return (
    <header
      className={cn(
        "w-full bg-background will-change-transform",
        "sticky top-0 left-0 right-0 z-50",
        className
      )}
      style={{
        position: '-webkit-sticky', // For iOS support
      }}
    >
      <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex min-h-10 max-w-screen-2xl items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-2 justify-between  ">
            <div className="flex items-center gap-3 ">

              {activeUsers.length > 0 && status === 'connected' ? (
                <UserAvatars users={activeUsers} size="sm" />
              ) : status === 'connected' || status === 'connecting' ? (
                <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center">
                  {/* Progress loader */}
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center cursor-pointer" title="Click to connect to the chat" onClick={() => {
                tryConnect()
              }}>
                <AlertTriangle className="h-4 w-4"  />
              </div>
              }


            </div>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex items-center text-xs bg-background transition-colors border border-border z-40 rounded-sm px-2 py-2 sm:px-1.5 sm:py-1.5 sm:w-auto
                hover:bg-muted cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline-block ml-2">Share</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[300px] z-50"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="p-2">
                    <CopyWithInput url={url} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-1 justify-end">
          </div>
          <div className="flex items-center gap-3  justify-between">

            <div className="flex items-center gap-2">
              <PulseDot status={status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border rounded-sm">
              <NavActions />
            </div>

            {/* Vertical three dots icons, on click show more options */}

          </div>
        </div>
      </div>


    </header>
  )
}

export default ChatHeader
