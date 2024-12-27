import {
  Folder,
  Forward,
  MoreHorizontal,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { local } from "@/lib/utils";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChannelModal } from "./ChannelModal";

interface SessionData {
  sessionId: string;
  url: string;
  // add other session properties as needed
}

export function ChatSidebarNavChannels({
  projects,
  sessionId,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
  sessionId: string
}) {
  const { isMobile } = useSidebar()
const { switchSession } = useWebSocket()
const [showNewChannelModal, setShowNewChannelModal] = useState(false);
const navigate = useNavigate();
  const handleDeleteSession = (sessionUrl: string) => {
    // Remove from localStorage
    const savedSessions = local("json", "sessionIdentifier").getAll();


    const updatedSessions = savedSessions
      .map(item => Object.values(item)[0])
      .filter((session: SessionData) => {
        return session.sessionId !== sessionUrl;
      });

    local("json", sessionUrl).remove("sessionIdentifier");
    // navigate to the first session

    navigate(updatedSessions[0].sessionId);
    switchSession(updatedSessions[0].url)



    // If there are remaining sessions, switch to the first one
    // Otherwise, show the new channel modal
    if (updatedSessions.length > 0) {
      switchSession(updatedSessions[0].url);
    } else {
      setShowNewChannelModal(true);
    }
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden text-sidebar-foreground/70" key={sessionId+projects.length}>
        <SidebarGroupLabel>Anonymous Channels</SidebarGroupLabel>
        <SidebarMenu>
          {projects.map((item) => (
            <SidebarMenuItem key={item.name} className="flex justify-center items-center">
              <SidebarMenuButton asChild className="h-7">
                <Link
                  className="text-sidebar-foreground/70"
                  to={item.url}
                  onClick={() => {
                    switchSession(item?.url)
                  }}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild className="h-7 mr-2 p-2">
                  <SidebarMenuAction showOnHover >
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg p-1"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5">
                    <Forward className="h-4 w-4 text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-2 py-1.5 text-destructive"
                    onClick={() => handleDeleteSession(item.url)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Channel</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              onClick={() => setShowNewChannelModal(true)}
            >
              <Plus className="text-sidebar-foreground/70" />
              <span>New Channel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <ChannelModal
        isOpen={showNewChannelModal}
        onClose={() => {
          // Only allow closing the modal if there are existing sessions
          if (projects.length > 0) {
            setShowNewChannelModal(false);
          }
        }}
        onJoin={() => {}}
        sessionName=""
        sessionUrl={window.location.href}
        onlineCount={0}
        totalCount={0}
      />
    </>
  )
}
