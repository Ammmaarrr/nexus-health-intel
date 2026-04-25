import { Skeleton } from "@/components/ui/skeleton";
import { AnalyzingPulse } from "./AnalyzingPulse";

export const SkeletonResults = () => (
  <div className="space-y-5">
    <AnalyzingPulse />

    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="rounded-2xl bg-card border border-border/60 p-6 overflow-hidden relative"
        style={{ animationDelay: `${i * 0.1}s` }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="size-20 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, j) => (
            <Skeleton key={j} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    ))}
  </div>
);