import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useViewport } from "@/hooks/useViewport.hook";
import { cn, sanitizeChannelId } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface ChannelModalProps {
  isOpen: boolean;
  onJoin: (fullName: string) => void;
  sessionName: string | undefined;
  sessionUrl: string;
  onlineCount: number;
  totalCount: number;
  onClose: () => void;
}

export function ChannelModal({
  isOpen,
  onClose
}: ChannelModalProps) {
  const navigate = useNavigate();



  const [colorConfig, setColorConfig] = useState(colorConfigs[0]);
  const [channelId, setChannelId] = useState("");

  const { keyboardVisible, isKeyboardSupported, isMobile } = useViewport();

  useEffect(() => {
    if (isOpen) {
      const randomConfig = colorConfigs[Math.floor(Math.random() * colorConfigs.length)];
      setColorConfig(randomConfig);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (channelId.length < 4) return;
    if (channelId.length >= 4) {
      try {
        navigate(`/${channelId}`);
      } finally {
        onClose();
      }
    }


  };

  if (!isOpen) return null;



  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <div className={`fixed inset-0 ${colorConfig.overlay} backdrop-blur-sm`} />
      <DialogContent
        className={cn(
          `w-full max-w-lg ${colorConfig.glassEffect} shadow-lg p-0`,

          "fixed left-1/2 -translate-x-1/2",

          isMobile ?
            cn(
              "top-1/2 -translate-y-1/2",
              "rounded-2xl",
              keyboardVisible && [
                "top-0 translate-y-0",
                "h-auto max-h-[100dvh]",
                "overflow-y-auto"
              ]
            ) :
            cn(
              "bottom-8",
              "rounded-2xl"
            ),

          "transition-all duration-300",
          keyboardVisible && !isKeyboardSupported && "mb-[env(keyboard-inset-height,0)]",
          "z-50"
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        closeButton={false}
      >

        <button
          onClick={onClose}
          className={`
            absolute
            right-4
            top-4
            p-2
            rounded-full
            hover:bg-black/5
            transition-colors
            z-10
            ${colorConfig.textColor}
          `}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
        <div className={`px-4 py-6 sm:p-8 ${colorConfig.background}`}>
          <DialogHeader>
            <DialogTitle className={`text-2xl font-bold text-center mb-2 ${colorConfig.textColor}`}>
              Join or Create a Channel
            </DialogTitle>
            <p className={`text-center text-sm ${colorConfig.textColor} opacity-90`}>
              Start collaborating instantly - no sign up required
            </p>
          </DialogHeader>
        </div>

        <div className={cn(
          "px-4 py-5 sm:p-6 bg-white/95 backdrop-blur-md",
          keyboardVisible && !isKeyboardSupported && "pb-14"
        )}>
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className={`text-sm font-medium ${colorConfig.textColor}`}
                >
                  Enter an existing channel ID or create a new one
                </label>

                <div className="flex gap-2 flex-row items-center">
                  <div className="relative flex-grow">
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
                      #
                    </span>
                    <Input
                      id="name"
                      placeholder="channel-id"
                      value={channelId}
                      onChange={(e) => {
                        const sanitizedValue = sanitizeChannelId(e.target.value);
                        setChannelId(sanitizedValue);
                      }}
                      className={`
                        w-full
                        !text-lg
                        h-14
                        pl-8
                        ${channelId ? 'pr-10' : 'pr-4'}
                        ${colorConfig.textColor}
                        bg-white/90
                        border
                        rounded-lg
                        focus:ring-2
                        focus:ring-${colorConfig.background.split('-')[1]}-200
                        focus:border-transparent
                        transition-all
                      `}
                      autoFocus
                      pattern="[a-z0-9-]+"
                      maxLength={50}
                    />
                    {channelId && (
                      <button
                        type="button"
                        onClick={() => setChannelId('')}
                        className={`
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          p-2
                          rounded-full
                          bg-gray-100
                          hover:bg-gray-200
                          hover:opacity-100
                          opacity-50
                          transition-colors
                          ${colorConfig.textColor}
                        `}
                        aria-label="Clear input"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">

                    {
                      channelId.length <= 0 && (
                        <span className="
                          px-2
                          py-1
                          text-sm
                          font-medium
                          text-gray-500
                          bg-white
                          z-10
                        ">or</span>
                      )
                    }
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={channelId.length < 4}
                    className={`
                      whitespace-nowrap
                      h-14
                      px-6
                      text-lg
                      ${colorConfig.background}
                      hover:opacity-90
                      transition-all
                      rounded-lg
                      font-bold
                      ${colorConfig.buttonTextColor}
                      ${channelId.length >= 4 && "bg-green-500 hover:bg-green-600 hover:text-white text-white font-bold"}
                    `}
                  >
                    {
                      channelId.length <= 0 ? "Create New" : "Let's Go"
                   }
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className={`text-sm font-medium mb-2 ${colorConfig.textColor}`}>
                  You are in safe hands:
                </h3>
                <ul className="space-y-0.5 text-sm ">
                  <li className="flex items-start text-gray-500">
                    <span className="mr-2">•</span>
                    No registration, email, or phone number required
                  </li>
                  <li className="flex items-start text-gray-500">
                    <span className="mr-2">•</span>
                    Completely free and anonymous
                  </li>
                  <li className="flex items-start text-gray-500">
                    <span className="mr-2">•</span>
                    Channels are automatically removed after 15 days of inactivity
                  </li>
                </ul>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}