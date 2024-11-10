import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2 } from "lucide-react";
import * as React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon,
}: ConfirmModalProps) {
  const [isPending, setIsPending] = React.useState(false);

  async function handleConfirm(e: React.MouseEvent) {
    e.preventDefault();
    try {
      setIsPending(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error in confirmation:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 gap-6">
        <DialogHeader className="flex-row gap-4 items-start">
          {icon || (variant === "destructive" && (
            <div className={cn(
              "rounded-full p-2 shrink-0",
              variant === "destructive"
                ? "bg-red-100/80 dark:bg-red-900/80"
                : "bg-blue-100/80 dark:bg-blue-900/80"
            )}>
              <AlertTriangle
                className={cn(
                  "h-5 w-5",
                  variant === "destructive"
                    ? "text-red-600 dark:text-red-400"
                    : "text-blue-600 dark:text-blue-400"
                )}
              />
            </div>
          ))}
          <div className="flex-1 space-y-2">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-between sm:space-x-4 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 text-base font-medium"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={isPending}
            onClick={handleConfirm}
            className={cn(
              "flex-1 text-base font-medium",
              isPending && "cursor-not-allowed"
            )}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}