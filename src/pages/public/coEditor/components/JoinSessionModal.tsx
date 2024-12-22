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
import { useViewport } from "@/hooks/useViewport.hook";
import { cn, sanitizeChannelId } from "@/lib/utils";
import { ArrowLeft, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { generateUsername } from "unique-username-generator";
import { ConfirmModal } from "../../chat/components/ConfirmModal";
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { keyboardVisible, isKeyboardSupported, isMobile } = useViewport();

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

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
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

  const generateRandomUsername = () => {
    const username = generateUsername('-', 2);
    setFullName(username);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <div className={`fixed inset-0 ${colorConfig.overlay} backdrop-blur-sm`} />
      <DialogContent
        className={cn(
          `w-full max-w-lg ${colorConfig.glassEffect} shadow-lg`,
          "p-0",
          "fixed left-1/2 -translate-x-1/2",
          isMobile ?
            cn(
              "bottom-0 rounded-t-2xl",
              "h-fit max-h-[85vh]",
              keyboardVisible && [
                "bottom-0",
                "h-auto",
                "overflow-y-auto"
              ]
            ) :
            "bottom-8 rounded-2xl h-fit",
          keyboardVisible && !isKeyboardSupported && "mb-[env(keyboard-inset-height,0)]",
          "transition-[transform,height] duration-300",
          "overscroll-contain touch-none z-50"
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        closeButton={false}
      >
        <div className={`px-6 py-4 flex flex-col justify-between ${colorConfig.background}`}>
          <DialogHeader>
            <DialogTitle className="sr-only">
              Join Session - {sessionName}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Enter your display name to join the collaborative session
            </DialogDescription>
            <div className="flex flex-col">
              <div className="text-start">
                <div
                  className={`text-base sm:text-2xl mb-1 ${colorConfig.textColor} group cursor-pointer`}
                  onClick={copyToClipboard}
                >
                  Joining <span className="font-bold">#{sessionName}</span>
                  <Copy className="ml-2 h-4 w-4 inline-block opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className={`text-sm ${colorConfig.textColor} opacity-80 flex`}>
                  {onlineCount} online • {totalCount} members
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className={cn(
          "px-4 py-5",
          "bg-white/95 backdrop-blur-md"
        )}>
          <form onSubmit={handleSubmit} className="space-y-1 w-full flex flex-col justify-start">
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${colorConfig.textColor}`}
              >
                Your Display Name
              </label>
            <div className="flex flex-col gap-3 w-full">

              <div className="flex gap-3 w-full sm:flex-row flex-col">
            <div className="relative flex-grow flex-1">
                    <span className={`
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-lg
                      font-medium
                      ${colorConfig.textColor}
                      opacity-70
                    `}>
                      @
                    </span>
                <Input
                  id="name"
                  placeholder="Enter your name..."
                  value={fullName}
                  onChange={(e) => {
                    setFullName(sanitizeChannelId(e.target.value));
                  }}
                  className={`
                    w-full
                    h-11
                    px-4
                    pl-10
                    pr-[100px]
                    text-base
                    ${colorConfig.textColor}
                    bg-white/90
                    border
                    !text-lg
                    rounded-lg
                    focus:ring-2
                    focus:ring-${colorConfig.background.split('-')[1]}-200
                    focus:border-transparent
                  `}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomUsername}
                  className={`
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    px-3
                    py-1
                    text-sm
                    font-medium
                    rounded-md
                    ${colorConfig.background}
                    hover:opacity-90
                    transition-all
                    ${colorConfig.buttonTextColor}
                  `}
                >
                  Generate
                </button>
                </div>
                <div className="flex-shrink-0">
                <Button
                  type="submit"
                  className={cn(
                    `w-full h-11 ${colorConfig.background} hover:opacity-90 transition-all`,
                    `text-base font-medium rounded-lg ${colorConfig.buttonTextColor}`,
                    "sm:w-auto"
                  )}
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
                </div>
            </div>


          </form>

          {
            !isMobile && (
              <div className={cn(
                "text-sm text-gray-500 mt-6 flex items-center justify-start gap-1 group",
                "sm:relative sm:mt-6 fixed top-4 left-4 z-50"
              )}>
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <Link
              to="/"
              onClick={handleBackClick}
              className="flex items-center hover:text-gray-700 transition-colors"
            >
              Back to home
            </Link>
            </div>
            )
          }

          <ConfirmModal
            variant="destructive"
            isOpen={showConfirmDialog}

            onClose={() => setShowConfirmDialog(false)}
            description="Going back to home will end your current session. This action cannot be undone."
            title="Are you sure you want to leave?"
            onConfirm={async () => {
              setShowConfirmDialog(false);
              window.location.href = '/';
            }}

          />
        </div>
      </DialogContent>
    </Dialog>
  );
}