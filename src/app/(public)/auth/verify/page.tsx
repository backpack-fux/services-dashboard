"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@nextui-org/spinner";

import pylon from "@/libs/pylon-sdk";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams?.get("token");

      if (!token) {
        router.replace("/auth");

        return;
      }

      try {
        const isTokenExchanged = await pylon.exchangeMagicLinkToken(token);

        if (!isTokenExchanged) {
          throw new Error("Token exchange failed");
        }

        // Wait a short moment to ensure the cookie is set
        await new Promise((resolve) => setTimeout(resolve, 500));

        // If successful, redirect to home
        router.replace("/");
      } catch (error) {
        console.error("Token verification failed:", error);
        setError("Failed to verify your login link. Please try again.");
        setTimeout(() => {
          router.replace("/auth");
        }, 3000);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      {error ? (
        <div className="text-danger text-center">
          <p>{error}</p>
          <p className="text-sm text-foreground/60 mt-2">Redirecting you back to login...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Spinner color="primary" size="lg" />
          <p className="text-foreground/60">Verifying your login...</p>
        </div>
      )}
    </div>
  );
}
