"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gradient-start/30 via-transparent to-gradient-end/20 pointer-events-none" />

      <Card className="relative max-w-md w-full border-border-subtle shadow-garden-md">
        <CardHeader>
          <CardTitle className="text-text-emphasis font-serif">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-text-secondary">
            An unexpected error occurred while loading your questions. You can try
            again or return home.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-primary font-mono bg-bg-muted p-3 rounded-garden-sm border border-border-subtle">
            {error.message}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            onClick={reset}
            variant="default"
            className="bg-interactive-primary hover:bg-interactive-hover text-interactive-primary-foreground"
          >
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-border-default text-text-primary hover:bg-muted"
          >
            Go home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
