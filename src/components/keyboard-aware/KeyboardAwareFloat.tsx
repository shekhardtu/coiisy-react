import { cn } from '@/lib/utils';
import React from 'react';

interface KeyboardAwareFloatProps {
  keyboardVisible: boolean;
  keyboardHeight: number;
  className?: string;
  children: React.ReactNode;
}

const KeyboardAwareFloat: React.FC<KeyboardAwareFloatProps> = ({
  keyboardVisible,
  keyboardHeight,
  className,
  children
}) => {
  return (
    <div
      className={cn(
        "fixed z-50 left-0 right-0 bg-background  will-change-transform",
        className
      )}
      style={{
        top: keyboardVisible
          ? `calc(${keyboardHeight}px - 6dvh)`
          : '0dvh',
        transition: 'top 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        perspective: '1000',
        WebkitPerspective: '1000'
      }}
    >
      <div className="transition-opacity duration-200 ease-in-out">
        {children}
      </div>
    </div>
  );
};

export default KeyboardAwareFloat;