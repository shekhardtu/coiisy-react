import { cn } from "@/lib/utils";
import { OnlineUserInterface } from "@/pages/public/coEditor/components/Editor.types";
import { memo } from "react";

interface PulseDotProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
  currentUser?: OnlineUserInterface
}

const PulseDot = ({ status, currentUser }: PulseDotProps) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
      "border border-gray-200 dark:border-gray-700",
      "bg-white dark:bg-gray-800",
      "shadow-sm hover:shadow transition-all duration-200",
      "cursor-default"
    )}>
      <div className="relative flex items-center justify-center w-3 h-3">
        {/* Outer animated ring */}
        {(status === 'connected' || status === 'connecting') && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              status === 'connected' ? 'bg-green-500/30 animate-ping' :
              'bg-yellow-500/30 animate-ping'
            )}
            style={{
              animationDuration: status === 'connecting' ? '1s' : '3s'
            }}
          />
        )}

        {/* Inner solid dot */}
        <span
          title={status}
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            status === 'connected' ? 'bg-green-500' :
            status === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          )}
        />
      </div>

      {currentUser?.fullName && (
        <span className={cn(
          "text-xs font-medium capitalize",
          "text-gray-700 dark:text-gray-300",
          "select-none"
        )}>
          {currentUser.fullName}
        </span>
      )}
    </div>
  );
}

export default memo(PulseDot);
