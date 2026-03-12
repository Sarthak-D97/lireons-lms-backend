"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string | React.ReactNode;
    description: string | React.ReactNode;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const linearGradients = [
    "linear-gradient(to bottom right, #06b6d4, #0ea5e9)",
    "linear-gradient(to bottom right, #6366f1, #a855f7)",
    "linear-gradient(to bottom right, #0ea5e9, #22d3ee)",
    "linear-gradient(to bottom right, #10b981, #059669)",
  ];

  const backgroundGradient = linearGradients[activeCard % linearGradients.length];

  return (
    <motion.div
      className="relative flex h-[30rem] justify-center space-x-10 overflow-y-auto rounded-md p-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      ref={ref}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={index} className="my-20">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                // FIXED: Changed text-slate-100 to text-neutral-800 dark:text-slate-100
                className="text-3xl font-bold text-neutral-800 dark:text-slate-100"
              >
                {item.title}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                // FIXED: Changed text-slate-400 to text-neutral-600 dark:text-slate-400
                className="text-lg mt-10 max-w-sm text-neutral-600 dark:text-slate-400 leading-relaxed"
              >
                {item.description}
              </motion.div>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        // Note: The backgroundGradient here adds that thin colored border effect
        style={{ background: backgroundGradient }}
        className={cn(
          "sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md bg-white lg:block p-1",
          contentClassName,
        )}
      >
        {/* FIXED: 
            1. Changed bg-slate-950/80 to bg-white dark:bg-slate-950
            2. Changed rounded-[4px] to rounded-[inherit] so it matches the parent's rounded-2xl
        */}
        <div className="h-full w-full rounded-[inherit] bg-white dark:bg-slate-950 overflow-hidden">
          {content[activeCard].content ?? null}
        </div>
      </div>
    </motion.div>
  );
};