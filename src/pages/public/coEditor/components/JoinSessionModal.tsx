import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users } from "lucide-react";
import { useEffect, useState } from "react";



const colorConfigs = [
  {
    background: 'bg-pink-100',
    overlay: 'bg-pink-50/90',
    textColor: 'text-pink-950',
    buttonTextColor: 'text-pink-950',
    glassEffect: 'backdrop-blur-md bg-white/30 border border-pink-100/20'
  },
  {
    background: 'bg-violet-100',
    overlay: 'bg-violet-50/90',
    textColor: 'text-violet-950',
    buttonTextColor: 'text-violet-950',
    glassEffect: 'backdrop-blur-md bg-white/30 border border-violet-100/20'
  },
  {
    background: 'bg-sky-100',
    overlay: 'bg-sky-50/90',
    textColor: 'text-sky-950',
    buttonTextColor: 'text-sky-950',
    glassEffect: 'backdrop-blur-md bg-white/30 border border-sky-100/20'
  },
  {
    background: 'bg-teal-100',
    overlay: 'bg-teal-50/90',
    textColor: 'text-teal-950',
    buttonTextColor: 'text-teal-950',
    glassEffect: 'backdrop-blur-md bg-white/30 border border-teal-100/20'
  },
  {
    background: 'bg-amber-100',
    overlay: 'bg-amber-50/90',
    textColor: 'text-amber-950',
    buttonTextColor: 'text-amber-950',
    glassEffect: 'backdrop-blur-md bg-white/30 border border-amber-100/20'
  },
  {
    background: 'bg-indigo-100',
    overlay: 'bg-indigo-50/90',
    textColor: 'text-indigo-950',
    buttonTextColor: 'text-indigo-950',
    glassEffect: 'backdrop-blur-md bg-white/30 border border-indigo-100/20'
  },
  {
    background: 'bg-emerald-100',
    overlay: 'bg-emerald-50/90',
    textColor: 'text-emerald-950',
    buttonTextColor: 'text-emerald-950',
    glassEffect: 'backdrop-blur-md bg-white/30 border border-emerald-100/20'
  },
  {
    background: 'bg-fuchsia-100',
    overlay: 'bg-fuchsia-50/90',
    textColor: 'text-fuchsia-950',
    buttonTextColor: 'text-fuchsia-950',
    glassEffect: 'backdrop-blur-md bg-white/30 border border-fuchsia-100/20'
  }
];

interface JoinSessionModalProps {
  isOpen: boolean;
  onJoin: (fullName: string) => void;
  sessionName: string | undefined;
  sessionUrl: string;
  onlineCount: number;
  totalCount: number;
}

export function JoinSessionModal({
  isOpen,
  onJoin,
  sessionName,
  sessionUrl,
  onlineCount,
  totalCount,
}: JoinSessionModalProps) {
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colorConfig, setColorConfig] = useState(colorConfigs[0]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const randomConfig = colorConfigs[Math.floor(Math.random() * colorConfigs.length)];
      setColorConfig(randomConfig);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    try {
      await onJoin(fullName.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      toast({
        title: "Copied!",
        description: "Session URL copied to clipboard",
        duration: 2000,
      });
    } catch (err: unknown) {
      toast({
        title: "Failed to copy",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <div className={`fixed inset-0 bg-white/50 ${colorConfig.overlay} backdrop-blur-sm transition-colors duration-300 ease-in-out`} />
      <DialogContent
        className={`sm:max-w-[425px] p-0 overflow-hidden ${colorConfig.glassEffect} transition-all duration-300 gap-0`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        closeButton={false}
      >
        <div className={`p-6 ${colorConfig.background} transition-colors duration-300`}>
          <DialogHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className={`w-8 h-8 ${colorConfig.textColor}`} />
              </div>

              <div className="text-center space-y-1.5">
                <h2 className={`text-2xl font-semibold tracking-tight ${colorConfig.textColor} uppercase`}  onClick={copyToClipboard}>
                  {sessionName}
                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
                <p className={`text-sm ${colorConfig.textColor} opacity-80`}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorConfig.textColor} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${colorConfig.textColor}`}></span>
                    </span>
                    {onlineCount} online • {totalCount} members
                  </span>
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-background/95 backdrop-blur-md">


          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className={`text-sm font-medium ${colorConfig.textColor} `}>
                Your Display Name
              </label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`
                  h-11
                  ${colorConfig.textColor}
                  bg-white/90
                  border-2
                  border-${colorConfig.background.split('-')[1]}-200
                  hover:border-${colorConfig.background.split('-')[1]}-300
                  shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15)]
                  focus:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.15)]
                  focus:bg-white
                  focus:outline-none
                  focus:ring-0
                  placeholder:text-gray-400
                  transition-all
                  duration-200
                  ease-out
                  rounded-md
                  focus-visible:ring-offset-0
                  focus-visible:ring-${colorConfig.background.split('-')[1]}-200
                `}
                autoComplete="name"
                required
                minLength={2}
                maxLength={50}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className={`w-full h-11 ${colorConfig.background} hover:opacity-90 transition-opacity ${colorConfig.buttonTextColor}`}
              disabled={!fullName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <span className="animate-pulse">Joining...</span>
              ) : (
                "Join Session"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}