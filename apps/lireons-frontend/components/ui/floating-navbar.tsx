"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";
import { JSX } from "react";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();

  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      const direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          // 1. Container: 
          // - Light: White background + Gray border
          // - Dark: Slate-950 background + White/10 border
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-gray-200 dark:border-white/10 rounded-full bg-white dark:bg-slate-950 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-5000 pr-2 pl-8 py-2 items-center justify-center space-x-4 transition-colors duration-300",
          className
        )}
      >
        {navItems.map((navItem, idx: number) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              // 2. Links:
              // - Light: Neutral-600 -> Neutral-900 (Hover)
              // - Dark: Neutral-50 -> Neutral-300 (Hover)
              "relative items-center flex space-x-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-50 dark:hover:text-neutral-300 transition-colors"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
        <button className="border text-sm font-medium relative border-neutral-200 dark:border-white/20 text-neutral-900 dark:text-white px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <span>Login</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};