import {
  Folder,
  Forward,
  MoreHorizontal,
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
import { Link } from "react-router-dom";

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


  return (
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
                <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
