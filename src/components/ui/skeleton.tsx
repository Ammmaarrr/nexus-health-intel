import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // Use the project-wide shimmer style so all loading placeholders feel consistent.
  return <div className={cn("shimmer rounded-md", className)} {...props} />;
}

export { Skeleton };
