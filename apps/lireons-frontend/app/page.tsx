import dynamic from "next/dynamic";
import HomeHero from "@/components/sections/HomeHero";

const CardItems = dynamic(() => import("@/components/sections/CardsItem"));
const InfoBox = dynamic(() => import("@/components/sections/InfoBox"));
const MobileSection = dynamic(() => import("@/components/sections/mobileapp"));
const KeyFeatures = dynamic(() => import("@/components/sections/KeyFeatures"));
const InfiniteCards = dynamic(() => import("@/components/sections/infinite-cards"));
const Team = dynamic(() => import("@/components/sections/team"));
const FAQSection = dynamic(() => import("@/components/sections/FAQ"));

export default function Home() {
  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <HomeHero />

      <div className="w-full flex flex-col gap-2 md:gap-8 bg-white dark:bg-slate-950 transition-colors duration-300">
        <CardItems />
        <InfoBox />
        <MobileSection />

        <div className="flex flex-col gap-0">
          <KeyFeatures />
          <InfiniteCards />
          <Team />
          <FAQSection />
        </div>
      </div>
    </div>
  );
}