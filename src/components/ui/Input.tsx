import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value !== "");
    };

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border-2 bg-background/50 backdrop-blur-sm px-4 py-3 text-sm transition-all",
            "placeholder:text-transparent",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-destructive focus:ring-destructive/20 focus:border-destructive",
            className,
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {label && (
          <motion.label
            initial={false}
            animate={{
              top: isFocused || hasValue || props.value ? "0.5rem" : "50%",
              fontSize:
                isFocused || hasValue || props.value ? "0.75rem" : "0.875rem",
              y: isFocused || hasValue || props.value ? 0 : "-50%",
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute left-4 pointer-events-none transition-colors",
              isFocused ? "text-primary" : "text-muted-foreground",
              error && "text-destructive",
            )}
          >
            {label}
          </motion.label>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
