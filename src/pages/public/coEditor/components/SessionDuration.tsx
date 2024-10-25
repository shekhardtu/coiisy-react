// src/components/SessionDuration.tsx
import { differenceInSeconds, format } from "date-fns";
import React, { useEffect, useState } from "react";


interface SessionDurationProps {
  startTime?: string;
}


const SessionDuration: React.FC<SessionDurationProps> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState("00:00");


    useEffect(() => {
      const start = startTime || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      const updateElapsed = () => {
        const duration = differenceInSeconds(new Date(), new Date(start));
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };

      updateElapsed(); // Initial update
      const intervalId = setInterval(updateElapsed, 1000);

      // Cleanup function
      return () => clearInterval(intervalId);
    }, [startTime]);

  return <div className="text-muted-foreground text-xs">
    Session Active:
    <div className="text-primary min-w-12 inline-block px-1">{elapsed}</div>
  </div>;
};

export default SessionDuration;
