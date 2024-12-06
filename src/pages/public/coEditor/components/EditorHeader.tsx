import CopyWithInput from "@/components/copy/withInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  useWebSocket
} from "@/contexts/WebSocketContext";
import { cn, getUnitsToMinutes } from "@/lib/utils";
import { WS_MESSAGE_TYPES } from "@/lib/webSocket.config";
import { Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { OnlineUserInterface, ServerUserDisconnectedInterface, ServerUserJoinedSessionInterface } from "./Editor.types";
import ThemeSelector from "./ThemeSelector";
import UserAvatars from "./UsersAvatar";

interface EditorHeaderProps {
  onThemeChange: (theme: "light" | "dark") => void
  theme: "light" | "dark"
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  onThemeChange,
  theme,
}) => {
  const [users, setUsers] = useState<OnlineUserInterface[]>([])
  const { subscribe, status } = useWebSocket()
  const url = window.location.href
  const minutes = 30;

  useEffect(() => {
    if (status === "disconnected") {
      setUsers([])
    }
  }, [status])

  useEffect(() => {
    const unsubscribeUserJoined = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_JOINED_SESSION,
      (data: ServerUserJoinedSessionInterface) => {
        const users: OnlineUserInterface[] = data.guests
          .map((user) => ({
            initials: user.fullName?.slice(0, 2),
            fullName: user.fullName,
            isOnline: user.isOnline,
            userId: user.userId,
            isShow: user.isOnline || (new Date().getTime() - new Date(user.lastSeenAt).getTime() <= getUnitsToMinutes(minutes)),
            connectedAt: user.connectedAt,
            lastSeenAt: user.lastSeenAt,
          }))
          .sort((a) => (a.isOnline ? -1 : 1))

        setUsers((prevUsers) => {
          const filteredUsers = prevUsers.filter(
            (u) => !users.some((newUser) => newUser.userId === u.userId)
          )
          return [...filteredUsers, ...users]
        })
      }
    )

    const unsubscribeUserLeft = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_DISCONNECTED,
      (data: ServerUserDisconnectedInterface) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.userId == data.userId
              ? { ...u, lastSeenAt: data.lastSeenAt, isOnline: false }
              : u
          )
        )
      }
    )

    return () => {
      unsubscribeUserJoined()
      unsubscribeUserLeft()
    }
  }, [])

  return (
    <div className="w-full relative z-50">
      <div
        className={cn(
          "w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out border-b border-border/40",
        )}
      >
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2 justify-between w-full flex-1">
            <div className="flex items-center gap-3">
              <img src="/heela.svg" alt="heela" className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              {users.length > 0 && <UserAvatars users={users} size="default" />}
            </div>
          </div>
          <Separator orientation="vertical" className="h-2/3 mx-6" />
          <div className="flex items-center gap-3 min-w-80 justify-between">
            <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className=" sm:w-auto">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline-block ml-2">Share</span>
                </Button>
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
            <div className="flex items-center gap-2">
              <ThemeSelector
                onThemeChange={onThemeChange}
                theme={theme}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorHeader
