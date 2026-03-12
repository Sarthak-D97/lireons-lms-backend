"use client";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ThreeDCardProps {
    title: string;
    description: string;
    image: string;
}

export default function ThreeDCard({ title, description, image }: ThreeDCardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleJoinUs = (e: React.MouseEvent<any>) => {
        e.stopPropagation();

        if (status === "authenticated") {
            const queryParams = new URLSearchParams({
                name: session?.user?.name || "",
                email: session?.user?.email || "",
                orgType: "Registered User",
                phone: "Active"
            }).toString();

            router.push(`/registered-info?${queryParams}`);
        } else {
            router.push("/signup");
        }
    };

    return (
        <CardContainer className="inter-var">
            <CardBody 
                className="
                    relative group/card w-auto sm:w-105 h-auto rounded-xl p-6 border-2
                    bg-white dark:bg-slate-900 
                    border-gray-200 dark:border-purple-500/20 
                    hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-500/30
                    transition-colors duration-300
                "
            >
                <CardItem
                    translateZ="50"
                    // Title: Neutral-800 (Light) | Purple-300 (Dark)
                    className="text-xl font-bold text-neutral-800 dark:text-purple-300 transition-colors"
                >
                    {title}
                </CardItem>
                <CardItem
                    as="p"
                    translateZ="60"
                    // Desc: Neutral-600 (Light) | Slate-300 (Dark)
                    className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-slate-300 transition-colors"
                >
                    {description}
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-4">
                    <Image
                        src={image}
                        height="1000"
                        width="1000"
                        className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                        alt={title}
                    />
                </CardItem>
                <div className="flex justify-between items-center mt-14">
                    <CardItem
                        translateZ={20}
                        as="button"
                        onClick={() => router.push("/features")}
                        // Link: Neutral-700 -> Purple (Light) | Slate-200 -> Purple (Dark)
                        className="px-4 py-2 rounded-xl text-xs font-normal text-neutral-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                    >
                        Know More →
                    </CardItem>

                    <CardItem
                        translateZ={20}
                        as="button"
                        onClick={handleJoinUs}
                        // Button: Neutral-900 (Light) | Purple-500 (Dark)
                        className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-purple-500 text-white text-xs font-bold hover:bg-neutral-800 dark:hover:bg-purple-600 transition-colors"
                    >
                        Join Us
                    </CardItem>
                </div>
            </CardBody>
        </CardContainer>
    );
}