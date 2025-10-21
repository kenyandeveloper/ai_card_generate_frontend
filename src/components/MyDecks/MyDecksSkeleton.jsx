import { DeckCardSkeleton } from "../common/LoadingSkeleton";

export default function MyDecksSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main container */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-pulse rounded-full bg-surface-highlight sm:h-8 sm:w-8" />
              <div className="h-8 w-48 animate-pulse rounded bg-surface-highlight sm:h-10 sm:w-56" />
            </div>
            <div className="h-10 w-40 animate-pulse rounded-lg bg-surface-highlight sm:h-11 sm:w-48" />
          </div>
          <div className="h-6 w-2/3 animate-pulse rounded bg-surface-highlight" />
        </div>

        {/* Filter/Sort Skeleton */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded bg-surface-highlight"
              />
            ))}
          </div>
        </div>

        {/* Deck Grid Skeleton */}
        <DeckCardSkeleton count={6} />
      </div>
    </div>
  );
}
