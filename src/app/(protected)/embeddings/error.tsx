"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Embeddings page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
        <p className="mt-4 text-gray-600">{error.message}</p>
        <Button className="mt-4" color="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
