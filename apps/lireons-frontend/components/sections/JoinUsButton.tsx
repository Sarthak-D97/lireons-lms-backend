"use client";

import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";

type JoinUsButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export default function JoinUsButton({ className, children }: JoinUsButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleJoinUs = () => {
    if (status === "authenticated") {
      const queryParams = new URLSearchParams({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        orgType: "Registered User",
        phone: "Active",
      }).toString();

      router.push(`/onboarding?${queryParams}`);
      return;
    }

    router.push("/signup");
  };

  return (
    <button type="button" onClick={handleJoinUs} className={className}>
      {children}
    </button>
  );
}
