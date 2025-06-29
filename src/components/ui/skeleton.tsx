
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/5 dark:bg-white/5 backdrop-blur-sm",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
