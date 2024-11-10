import { cn } from "@/lib/utils";

interface PulseDotProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
}

const PulseDot = ({ status }: PulseDotProps) => {
  return (
    <div className="relative flex items-center justify-center w-4 h-4">
      {/* Outer animated ring */}
      {(status === 'connected' || status === 'connecting') && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full",
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
          "relative inline-flex rounded-full h-2.5 w-2.5",
          status === 'connected' ? 'bg-green-500' :
          status === 'connecting' ? 'bg-yellow-500' :
          'bg-red-500'
        )}
      />
    </div>
  );
}

export default PulseDot;