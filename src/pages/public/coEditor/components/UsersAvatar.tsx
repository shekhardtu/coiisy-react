import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { User } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OnlineUserInterface } from './Editor.types';

interface UserAvatarsProps {
  users: OnlineUserInterface[];
  size?: 'sm' | 'default';
}

// Constants
const TOOLTIP_DURATION = 3000;

const AVATAR_SIZE_CLASSES = {
  sm: {
    container: "w-6 h-6",
    initials: "text-xs",
    icon: "w-3 h-3",
    status: "w-2 h-2 border",
    spacing: "-space-x-0.5"
  },
  default: {
    container: "w-8 h-8",
    initials: "text-sm",
    icon: "w-4 h-4",
    status: "w-2.5 h-2.5 border-2",
    spacing: "-space-x-0.25"
  }
} as const;

// Utility functions
const formatDate = (date: Date | string | number): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

const formatDateToISO = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  }).format(dateObj);
};

// Main component
const UserAvatars: React.FC<UserAvatarsProps> = ({ users, size = 'default' }) => {
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sizeClass = AVATAR_SIZE_CLASSES[size];

  const clearTooltipTimeout = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipClick = useCallback((userId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    clearTooltipTimeout();

    setOpenTooltipId(currentId => {
      const willBeOpen = currentId !== userId;

      if (willBeOpen) {
        tooltipTimeoutRef.current = setTimeout(() => {
          setOpenTooltipId(null);
        }, TOOLTIP_DURATION);
        return userId;
      }

      return null;
    });
  }, [clearTooltipTimeout]);

  // Cleanup effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isTooltipClick = (event.target as Element)?.closest('[role="tooltip"]');
      if (!isTooltipClick) {
        clearTooltipTimeout();
        setOpenTooltipId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      clearTooltipTimeout();
    };
  }, [clearTooltipTimeout]);

  // Avatar component
  const UserAvatar = useCallback(({ user }: { user: OnlineUserInterface }) => (
    <TooltipProvider key={user.userId}>
      <Tooltip delayDuration={0} open={openTooltipId === user.userId}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 cursor-pointer ring-2 ring-background",
              sizeClass.container,
              user.isOnline ? "bg-green-100 dark:bg-green-900/50" : "bg-muted",
            )}
            onClick={(e) => handleTooltipClick(user.userId, e)}
          >
            {user.initials ? (
              <span className={cn("font-medium", sizeClass.initials)}>
                {user.initials}
              </span>
            ) : (
              <User className={sizeClass.icon} />
            )}
            <span
              className={cn(
                "absolute bottom-0 right-0 rounded-full border-background",
                sizeClass.status,
                user.isOnline ? "bg-green-500" : "bg-muted-foreground"
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="bg-popover p-3 shadow-lg rounded-lg border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{user.fullName}</span>
              <span
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full",
                  user.isOnline
                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {user.isOnline ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div
              className="text-sm text-muted-foreground"
              title={user.isOnline ? formatDateToISO(user.connectedAt) : formatDateToISO(user.lastSeenAt)}
            >
              {user.isOnline ? (
                <p>Connected {formatDate(user.connectedAt)}</p>
              ) : (
                <p>Last seen {formatDate(user.lastSeenAt)}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ), [sizeClass, openTooltipId, handleTooltipClick]);

  return (
    <div className={cn("flex items-center", sizeClass.spacing)}>
      {users.map((user) => user.isShow && <UserAvatar key={user.userId} user={user} />)}
    </div>
  );
};

export default UserAvatars;
