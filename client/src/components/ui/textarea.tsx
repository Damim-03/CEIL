import * as React from "react";
import { cn } from "../../lib/utils/utils"; // أو المسار الذي تستعمله لـ cn

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
