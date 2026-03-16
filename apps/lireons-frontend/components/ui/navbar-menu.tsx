"use client";
import React from "react";
import { motion } from "motion/react"; 
import Link from "next/link";
import Image from "next/image";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.p
        transition={{ duration: 0.3 }}
        // Text: Neutral-600 (Light) | Slate-300 (Dark)
        // Hover: Cyan-600 (Light) | Cyan-400 (Dark)
        className="cursor-pointer text-neutral-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 text-base font-medium transition-colors"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%+1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                // Dropdown Bg: White (Light) | Slate-900 (Dark)
                // Border: Gray-200 (Light) | Slate-700 (Dark)
                className="bg-white dark:bg-slate-900 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xl transition-colors"
              >
                <motion.div
                  layout
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      // Navbar Bg: White (Light) | Slate-950 (Dark)
      // Border: Gray-200 (Light) | Slate-700 (Dark)
      className="relative rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-md dark:shadow-xl flex justify-center space-x-4 px-8 py-6 transition-colors"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex flex-row space-x-2 group">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl w-[140px] object-cover"
      />
      <div>
        {/* Title: Neutral-900 (Light) | Slate-200 (Dark) */}
        <h4 className="text-xl font-bold mb-1 text-neutral-900 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {title}
        </h4>
        {/* Desc: Neutral-500 (Light) | Slate-400 (Dark) */}
        <p className="text-neutral-500 dark:text-slate-400 text-sm max-w-40 leading-relaxed transition-colors">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, ...rest }: React.ComponentProps<typeof Link>) => {
  return (
    <Link
      {...rest}
      // Link: Neutral-600 (Light) | Slate-300 (Dark)
      className="text-neutral-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors block text-base my-1"
    >
      {children}
    </Link>
  );
};