import { cn } from "@/lib/utils";
import React, { memo, useMemo, useRef } from "react";
import { ChatStatus } from "./chat.types";

interface ChatHeaderProps {
  status: ChatStatus["status"]
  tryConnect: ChatStatus["tryConnect"]
  activeUsers: OnlineUserInterface[]
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

import { useViewport } from "@/contexts/Viewport.context";
import { useOutletContext, useParams } from "react-router-dom";
import { OnlineUserInterface } from "../../coEditor/components/Editor.types";
import UserAvatars from "../../coEditor/components/UsersAvatar";
import { NavActions } from "./NavActions";

const ChatHeader: React.FC<ChatHeaderProps> = ({
  status,
  activeUsers,
}) => {


  const { sidebarTrigger } = useOutletContext() as { sidebarTrigger: React.ReactNode };
  const { keyboardVisible, isKeyboardSupported } = useViewport()
  const { tryConnect } = useWebSocket()
  const urlRef = useRef(window.location.href)
  const { sessionId } = useParams()

  const renderUserStatus = useMemo(() => {
    if (activeUsers.length > 0 && status === 'connected' && sessionId) {
      return <UserAvatars users={activeUsers} size="sm"  />
    }

    if (status === 'connected' || status === 'connecting') {
      return (
        <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )
    }

    return (
      <div
        className="h-6 w-6 bg-muted rounded-full flex items-center justify-center cursor-pointer"
        title="Click to connect to the chat"
        onClick={tryConnect}
      >
        <AlertTriangle className="h-4 w-4" />
      </div>
    )
  }, [activeUsers, status, sessionId, tryConnect])

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50",
        "w-full bg-background will-change-transform",
        "flex-none border-b border-border",
        keyboardVisible && !isKeyboardSupported && "mb-[env(keyboard-inset-height,0)] fixed"
      )}
      style={{ position: '-webkit-sticky' }}
    >
      <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex min-h-10 items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 -ml-2">
                {sidebarTrigger}
            </div>

            <div className="flex items-center gap-3">
              {renderUserStatus}
            </div>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <ShareButton url={urlRef.current} />
          </div>

          <div className="flex items-center gap-2">
            <PulseDot status={status} />
            <div className="border border-border rounded-sm">
              <NavActions />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

const ShareButton = ({ url }: { url: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <div className="flex items-center text-xs bg-background transition-colors border border-border z-40 rounded-sm px-2 py-2 sm:px-1.5 sm:py-1.5 sm:w-auto hover:bg-muted cursor-pointer">
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
)

export default memo(ChatHeader)
