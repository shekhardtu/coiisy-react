import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Check, Copy } from "lucide-react";
import { useRef, useState } from 'react';

import React from "react";

export default function CopyWithInput({ url = window.location.href, className }: { url?: string, className?: string }) {
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  const showToast = (message: string) => {
    toast({
      title: message,
      description:"Copied to clipboard",
    })
  }


  const copyToClipboard = async (e: React.MouseEvent) => {


    // Prevent immediate propagation
    e.stopPropagation()

    try {
      await navigator?.clipboard?.writeText(url)
      inputRef.current?.select()
      setCopied(true)
      showToast("Share link to invite others")

    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const onClickSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    inputRef.current?.select()
  }



  return (
    <div className={cn("group flex items-center gap-2 text-xs bg-white transition-colors ", className)}>
      <div className="flex-1 border-b border-dashed bg-background px-3 py-2 w-60 shrink-0 text-inherit">
        <div className="w-full overflow-hidden text-inherit">
          <input
            onClick={(e) => {
              e.stopPropagation()
              onClickSelectAll(e)
              copyToClipboard(e)

            }}
            ref={inputRef}
            readOnly
            value={url}
            className="w-full truncate block text-xs bg-transparent border-none focus:outline-none"
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="flex gap-1.5 text-xs h-7 opacity-50 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-sm border border-border"
        onClick={copyToClipboard}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </Button>
    </div>
  )
}