import {
  Folder,
  Forward,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash2
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
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SessionDataInterface } from "../../coEditor/components/Editor.types";
import useEditorContext from "../../coEditor/hooks/useEditor.contexthook";
import { ChannelModal } from "./ChannelModal";

// Add interface definitions for better type safety
interface Channel {
  name: string | undefined;
  url: string;
  icon: LucideIcon;
  session: SessionDataInterface;
}

interface ChatSidebarNavChannelsProps {
  sessionId: string;
  onNewChannel: (channelId: string) => void;
}

export function ChatSidebarNavChannels({
  sessionId,
  onNewChannel,
}: ChatSidebarNavChannelsProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { switchSession } = useWebSocket();
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const navigate = useNavigate();
  const { getChatSessionSidebarObject } = useEditorContext();

  // Move useEffect logic to a separate function for better readability
  const updateChannelList = useCallback(() => {
    const chatSessionsArray = getChatSessionSidebarObject()
      .filter((channel): channel is Channel => channel.name !== undefined);
    setChannelList(chatSessionsArray);
  }, [getChatSessionSidebarObject]);

  useEffect(() => {
    updateChannelList();
  }, [getChatSessionSidebarObject, updateChannelList]);

  const handleDeleteSession = (toDeleteSessionId: string) => {
    const updatedSessions = channelList
      .map(item => item.name)
      .filter(session => session !== toDeleteSessionId);

    local("json", toDeleteSessionId).remove("sessionIdentifier");


    if (sessionId !== toDeleteSessionId) {
      navigate(updatedSessions[0] as string);
      switchSession(updatedSessions[0] as string);
    }

    if(sessionId == toDeleteSessionId){
      navigate(updatedSessions[0] as string);
      switchSession(updatedSessions[0] as string);
    }

    updateChannelList();

    if (updatedSessions.length > 0) {
      switchSession(updatedSessions[0] as string);
    } else {
      setShowChannelModal(true);
    }
  };

  const handleNewChannel = () => {
    setShowChannelModal(true);
  };

  const handleChannelCreated = (channelId: string) => {
    setShowChannelModal(false);
    onNewChannel(channelId);
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden text-sidebar-foreground/70" key={sessionId+channelList.length}>
        <SidebarGroupLabel>Anonymous Channels</SidebarGroupLabel>
        <SidebarMenu>
          {channelList.map((item) => (
            <SidebarMenuItem key={item.name} className="flex justify-center items-center">
              <SidebarMenuButton asChild className="h-7">
                <Link
                  className="text-sidebar-foreground/70"
                  to={item.url}
                  onClick={() => {
                    switchSession(item?.url)
                    setOpenMobile(false)
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
              onClick={handleNewChannel}
            >
              <Plus className="text-sidebar-foreground/70" />
              <span>New Channel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <ChannelModal
        isOpen={showChannelModal}
        onClose={() => setShowChannelModal(false)}
        onSubmit={handleChannelCreated}
      />
    </>
  )
}
