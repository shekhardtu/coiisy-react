import { getCurrentUser, getDuration } from "@/lib/utils";
import React, { useCallback } from "react";


interface SessionStartedTimeProps {
  sessionId: string | undefined;
}

const SessionStartedTime = ({
  sessionId
}: SessionStartedTimeProps) => {
  const [duration, setDuration] = React.useState("");

  const updateDuration = useCallback(() => {
    const currentUser = getCurrentUser(sessionId);
    if (currentUser?.createdAt) {
      setDuration(getDuration(currentUser.createdAt).duration);
    }
  }, []); // Add sessionId as a dependency if it's used in getCurrentUser
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runUpdate = () => {
      updateDuration();
      // Schedule the next update in 60 seconds
      timeoutId = setTimeout(runUpdate, 60000);
    };

    // Initial update
    runUpdate();

    // Clean up timeout on component unmount
    return () => clearTimeout(timeoutId);
  }, [updateDuration]);

  return  <div className="text-muted-foreground px-2 p-2 cursor-pointer flex items-center justify-center hover:text-red-600">
  {duration}
</div>
};

export default SessionStartedTime;