import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
      <div className={`fixed inset-0 ${colorConfig.overlay} backdrop-blur-sm`} />
      <DialogContent
        className={`
          mx-auto
          w-[90%] sm:w-[425px]
          p-0
          overflow-hidden
          ${colorConfig.glassEffect}
          shadow-lg
          rounded-2xl
          gap-0
        `}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        closeButton={false}
      >
        <div className={`px-4 py-6 sm:p-8 ${colorConfig.background}`}>
          <DialogHeader>
            <DialogTitle className="sr-only">
              Join Session - {sessionName}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Enter your display name to join the collaborative session
            </DialogDescription>
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <Users className={`w-7 h-7 sm:w-10 sm:h-10 ${colorConfig.textColor}`} />
              </div>

              <div className="text-center">
                <h2
                  className={`text-lg  sm:text-2xl font-bold mb-2 ${colorConfig.textColor} group cursor-pointer`}
                  onClick={copyToClipboard}
                >
                  {sessionName}
                  <Copy className="ml-2 h-4 w-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
                <div className={`text-sm ${colorConfig.textColor} opacity-80 flex items-center justify-center gap-2`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorConfig.textColor} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${colorConfig.textColor}`}></span>
                  </span>
                  {onlineCount} online • {totalCount} members
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-4 py-5 sm:p-6 bg-white/95 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4 w-full flex flex-col items-center">

              <label
                htmlFor="name"
                className={`block mb-2 text-sm font-medium ${colorConfig.textColor}`}
              >
                Your Display Name
              </label>
              <div className="flex flex-col gap-3 w-full">
                <Input
                  id="name"
                  placeholder="Enter your name..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`
                    w-full
                    h-11
                    px-4
                    text-base
                    ${colorConfig.textColor}
                    bg-white/90
                    border
                    rounded-lg
                    focus:ring-2
                    focus:ring-${colorConfig.background.split('-')[1]}-200
                    focus:border-transparent
                  `}
                  autoFocus
                  required
                />
                <Button
                  type="submit"
                  className={`
                    w-full
                    h-11
                    ${colorConfig.background}
                    hover:opacity-90
                    transition-all
                    text-base
                    font-medium
                    rounded-lg
                    ${colorConfig.buttonTextColor}
                  `}
                  disabled={!fullName.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                      Joining...
                    </span>
                  ) : (
                    "Join Session"
                  )}
                </Button>
              </div>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}