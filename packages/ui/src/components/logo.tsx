import { cn } from "../utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        className={cn("text-amber-600 dark:text-amber-500", sizes[size])}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          className="fill-current"
        />
        <path
          d="M2 17L12 22L22 17"
          className="fill-current opacity-50"
        />
        <path
          d="M2 12L12 17L22 12"
          className="fill-current opacity-75"
        />
      </svg>
      <span className="font-semibold text-foreground">TekiMax</span>
    </div>
  );
}
