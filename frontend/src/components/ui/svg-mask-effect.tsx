"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const MaskContainer = ({
  children,
  revealText,
  size = 10,
  revealSize = 600,
  className,
}: {
  children?: string | React.ReactNode;
  revealText?: string | React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<any>({ x: null, y: null });
  const containerRef = useRef<any>(null);

  const updateMousePosition = (e: any) => {
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    containerRef.current.addEventListener("mousemove", updateMousePosition);
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener(
          "mousemove",
          updateMousePosition
        );
      }
    };
  }, []);

  const maskSize = isHovered ? revealSize : size;

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative h-screen w-full bg-[#0f0f0f]", className)} // dark base bg
    >
      <motion.div
  className="absolute flex h-full w-full items-center justify-center 
             bg-[#FFF3B3] text-6xl 
             [mask-image:url(/mask.svg)] [mask-repeat:no-repeat] [mask-size:40px]"
  animate={{
    maskPosition: `${mousePosition.x - maskSize / 2}px ${
      mousePosition.y - maskSize / 2
    }px`,
    maskSize: `${maskSize}px`,
  }}
  transition={{
    maskSize: { duration: 0.3, ease: "easeInOut" },
    maskPosition: { duration: 0.15, ease: "linear" },
  }}
>
  {/* ⚠️ Remove this overlay to prevent muddy look */}
  {/* <div className="absolute inset-0 z-0 h-full w-full bg-black/40" /> */}

  <div
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    className="relative z-20 mx-auto max-w-4xl text-center text-4xl font-bold text-white"
  >
    {children}
  </div>
</motion.div>


      <div className="flex h-full w-full items-center justify-center">
        {revealText}
      </div>
    </motion.div>
  );
};
