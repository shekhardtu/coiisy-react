import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { cn } from "@/lib/utils";
import { WS_CLIENT_MESSAGE_TYPES } from "@/lib/webSocket.config";
import {
  FileText,
  Link,
  Moon,
  MoreHorizontal,
  Settings2,
  Sun,
  Trash2,
  UserPlus
} from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEditorContext from "../../coEditor/hooks/useEditor.contexthook";
import { useOnlineUsers } from "../../coEditor/hooks/useOnlineUsers";
import { ConfirmModal } from "./ConfirmModal";

// Add this type definition before the data array
type MenuItem = {
  isShow?: boolean
  label: string;
  icon: React.ComponentType;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  premium?: boolean;
  className?: string;
  rightElement?: React.ReactNode;
};

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const { theme, handleThemeChange } = useEditorContext();
  const { status, disconnect, tryConnect, sendMessage } = useWebSocket();
  const navigate = useNavigate()
  const { sessionId } = useParams()

  const { isUserAdmin, autoJoin } = useOnlineUsers()

  const handleClearSession = React.useCallback(async () => {
    if (status === "connected") {
      disconnect();
    }
    navigate(`/clear/${sessionId}`);
  }, [status, disconnect, navigate, sessionId]);


  const [connectionLabel, setConnectionLabel] = React.useState("Disconnect Session");

  const handleDisconnectSession = React.useCallback(() => {
    if (status === "connected") {
      disconnect();

    } else if (status === "disconnected") {
      tryConnect();

    }
  }, [status, disconnect]);

  React.useEffect(() => {
    if (status === "connected") {
      setConnectionLabel("Disconnect Session");
    } else if (status === "disconnected") {
      setConnectionLabel("Reconnect Session");
    }
  }, [status]);

  const [autoJoinEnabled, setAutoJoinEnabled] = React.useState(autoJoin);

  React.useEffect(() => {
    setAutoJoinEnabled(autoJoin);
  }, [autoJoin]);

  const handleAutoJoin = (checked: boolean) => {
    setAutoJoinEnabled(checked);
    sendMessage({
      type: WS_CLIENT_MESSAGE_TYPES.CLIENT_USER_HANDLE_AUTO_JOIN,
      sessionId: sessionId!,
      autoJoin: checked,
    });
  }

  const AutoJoinSwitch = () => {
    return (
      <Switch
        checked={autoJoinEnabled}
        onCheckedChange={(checked) => {
          setAutoJoinEnabled(checked);
          handleAutoJoin(checked);
        }}
        property="autoJoinEnabled"
        className={cn(
          "ml-auto scale-75",
          autoJoinEnabled ? "bg-yellow-500 data-[state=checked]:bg-yellow-500" : "bg-gray-600"
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    );
  }



  const data: MenuItem[][] = [
    [
      {
        isShow: true,
        label: "Custom Chat Url",
        icon: Settings2,
        onClick: () => console.log("Customize"),
        premium: true,
        className: " cursor-not-allowed hover:bg-amber-50 dark:hover:bg-amber-950/30",
      },
      {
        label: "Secure Chat",
        icon: FileText,
        onClick: () => console.log("Wiki"),
        premium: true,
        className: "cursor-not-allowed hover:bg-amber-50 dark:hover:bg-amber-950/30",
      },

    ],
    [
      {
        isShow: isUserAdmin,
        label: "Auto Join",
        icon: UserPlus,
        onClick: (e) => e.stopPropagation(),
        className: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
        rightElement: <AutoJoinSwitch />,
      },
      {
        label: connectionLabel,
        icon: Link,
        onClick: handleDisconnectSession,
      },
      {
        label: "Clear Session",
        icon: Trash2,
        onClick: () => setShowDeleteConfirm(true),
        className: "text-red-600 hover:text-red-600 focus:text-red-600",
      },
    ],
    [
      {
        label: theme === 'light' ? 'Dark Mode' : 'Light Mode',
        icon: theme === 'light' ? Moon : Sun,
        onClick: () => handleThemeChange(theme === 'light' ? 'dark' : 'light'),
      },
    ],
  ];

  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-[state=open]:bg-accent"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="max-w-48 overflow-hidden rounded-lg p-1.5"
            align="end"
          >
            <div className="flex flex-col ">
              {data.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {groupIndex > 0 && <Separator className="my-1" />}
                  <div className="flex flex-col gap-1">
                    {group.map((item, itemIndex) => (
                      (item.isShow === undefined || item.isShow === true) && (
                        <Button
                          key={itemIndex}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2 px-1.5 py-1 text-sm relative group",
                          item.premium ? "hover:bg-amber-50 dark:hover:bg-amber-950/30" : "",
                          item.className
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.premium) {
                            console.log('Premium feature');
                            return;
                          }
                          item.onClick?.(e);
                          setIsOpen(false);
                        }}
                      >
                        {React.createElement(item.icon, {
                          className: cn(
                            "h-4 w-4",
                            item.premium ? "text-amber-500 dark:text-amber-400" : ""
                          )
                        } as React.SVGProps<SVGSVGElement>)}
                        <span>
                          {item.label}
                        </span>
                        {item.rightElement}
                        {item.premium && (
                          <span className="ml-auto px-1.5 py-0 text-[9px] font-medium bg-amber-500  text-black dark:text-amber-400 rounded-full">
                            PRO
                          </span>
                        )}
                      </Button>
                      )
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleClearSession}
        title="Clear Session?"
        description="This action is irreversible. You can't restore it later."
        confirmText="Clear Session"
        variant="destructive"
      />
    </>
  );
}
