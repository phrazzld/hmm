import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="relative min-h-[calc(100vh-80px)]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gradient-start/30 via-transparent to-gradient-end/20 pointer-events-none" />

      <div className="relative container mx-auto px-6 py-12 max-w-[780px]">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48 bg-muted" />
              <Skeleton className="h-4 w-64 bg-muted" />
            </div>
            {/* Search bar skeleton */}
            <Skeleton className="h-12 w-full bg-muted" />
          </div>

          {/* List skeleton */}
          <div className="mt-12 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border-subtle">
                <CardHeader>
                  <Skeleton className="h-5 w-full bg-muted" />
                  <Skeleton className="h-5 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-24 mt-2 bg-muted" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
