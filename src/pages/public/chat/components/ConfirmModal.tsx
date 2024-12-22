import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-full p-6 gap-6">
        <AlertDialogHeader className="flex-row gap-4 items-start">
          {icon || (variant === "destructive" && (
            <div className={cn(
              "rounded-full p-2 shrink-0  mt-3",
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
            <AlertDialogTitle className="text-xl font-semibold tracking-tight">
              {title}
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-base leading-relaxed text-muted-foreground">
                {description}
              </AlertDialogDescription>
            )}
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex sm:justify-between sm:space-x-4 border-t pt-4">
          <AlertDialogCancel
            disabled={isPending}
            className="flex-1 text-base font-medium"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              "flex-1 text-base font-medium inline-flex items-center justify-center",
              variant === "destructive"
                ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              isPending && "cursor-not-allowed opacity-50"
            )}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}