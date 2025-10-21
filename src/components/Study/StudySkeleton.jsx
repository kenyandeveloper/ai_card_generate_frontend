export default function StudySkeleton() {
  return (
  <div className="min-h-screen bg-background">
      {/* Main container */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Title skeleton */}
        <div className="w-72 h-12 bg-surface-highlight rounded animate-pulse mb-8" />

        {/* Stats section skeleton */}
        <div className="bg-surface-elevated rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-highlight rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/5 h-6 bg-surface-highlight rounded animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="w-2/5 h-8 bg-surface-highlight rounded animate-pulse" />
                    {i === 0 && (
                      <div className="w-20 h-8 bg-surface-highlight rounded animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subtitle skeleton */}
        <div className="w-48 h-9 bg-surface-highlight rounded animate-pulse mb-6" />

        {/* Deck grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-elevated rounded-2xl border border-border-muted flex flex-col h-full"
            >
              {/* Card header */}
              <div className="p-6 border-b border-border-muted">
                <div className="w-4/5 h-8 bg-surface-highlight rounded animate-pulse" />
              </div>

              {/* Card body */}
              <div className="p-6 flex-1">
                <div className="w-full h-5 bg-surface-highlight rounded animate-pulse mb-2" />
                <div className="w-11/12 h-5 bg-surface-highlight rounded animate-pulse mb-4" />
                <div className="w-20 h-8 bg-surface-highlight rounded-full animate-pulse" />
              </div>

              {/* Card footer */}
              <div className="p-4 border-t border-border-muted">
                <div className="w-full h-10 bg-surface-highlight rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
