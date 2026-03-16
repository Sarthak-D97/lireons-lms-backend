"use client";

import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Cover } from "@/components/ui/cover";
import JoinUsButton from "@/components/sections/JoinUsButton";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

export default function HomeHero() {
  return (
    <>
      <LampContainer className="min-h-screen pt-78 md:pt-48 lg:pt-82 bg-white dark:bg-slate-950 transition-colors duration-300">
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="bg-linear-to-br pt-46 sm:pt-32 md:pt-40 lg:pt-52 from-slate-600 to-slate-900 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-center text-3xl font-medium tracking-tight text-transparent sm:text-5xl md:text-7xl"
        >
          <span className="font-(--font-merienda) text-cyan-700 dark:text-white hover:text-cyan-600 dark:hover:text-yellow-100 transition-colors">
            Lireons
          </span>
          <br />
          Your Academy, Your Brand
          <br />
          Build to <Cover>Scale</Cover>
        </motion.h1>

        <div className="mt-8 h-24 w-full px-4 md:h-32 md:px-0">
          <JoinUsButton className="h-full w-full flex items-center justify-center cursor-pointer">
            <TextHoverEffect text="Join Us" />
          </JoinUsButton>
        </div>
      </LampContainer>

      <div className="relative z-10 w-full overflow-hidden md:h-[150vh] lg:h-500 bg-white dark:bg-slate-950 -mt-80 sm:-mt-32 md:-mt-40 transition-colors duration-300">
        <MacbookScroll
          title={
            <span className="text-3xl sm:text-5xl text-neutral-900 dark:text-white transition-colors">
              Academy by <span className="font-(--font-merienda) text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-yellow-100 transition-colors">Lireons</span>
            </span>
          }
          src="/site.png"
          showGradient={false}
        />
      </div>
    </>
  );
}
