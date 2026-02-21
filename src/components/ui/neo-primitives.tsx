import React from "react";
import { cn } from "@/lib/utils";
interface NeoProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const NeoCard = ({ children, className, ...props }: NeoProps) => {
  return (
    <div
      className={cn(
        "bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
}
export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-stone-50",
      ghost: "bg-transparent border-transparent shadow-none hover:bg-black/5 active:bg-black/10",
      outline: "bg-transparent shadow-none border-4 border-black hover:bg-stone-50 active:bg-stone-100"
    };
    return (
      <button
        ref={ref}
        className={cn(
          "px-6 py-3 font-bold text-lg rounded-xl border-4 border-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
NeoButton.displayName = "NeoButton";
export const NeoBadge = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={cn("px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", className)}>
      {children}
    </span>
  );
};