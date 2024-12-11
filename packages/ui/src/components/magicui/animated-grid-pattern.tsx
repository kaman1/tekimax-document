import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps {
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  className?: string;
}

export default function AnimatedGridPattern({
  numSquares = 30,
  maxOpacity = 0.1,
  duration = 3,
  repeatDelay = 1,
  className,
}: AnimatedGridPatternProps) {
  const patternRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!patternRef.current) return;
    const squares: HTMLDivElement[] = [];

    // Create squares
    for (let i = 0; i < numSquares; i++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.style.setProperty("--delay", `${Math.random() * duration}s`);
      squares.push(square);
      patternRef.current.appendChild(square);
    }

    return () => {
      squares.forEach((square) => square.remove());
    };
  }, [numSquares, duration]);

  return (
    <motion.div
      ref={patternRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-[1]",
        "[--square-size:40px] [--square-gap:4px]",
        "[&_.square]:absolute [&_.square]:size-[var(--square-size)]",
        "[&_.square]:rounded-lg [&_.square]:bg-white/30",
        "[&_.square]:animate-grid-pattern",
        className
      )}
      style={{
        "--max-opacity": maxOpacity,
        "--duration": `${duration}s`,
        "--repeat-delay": `${repeatDelay}s`,
      } as React.CSSProperties}
    />
  );
}
