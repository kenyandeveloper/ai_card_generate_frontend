const LoadingState = () => {
  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-6 w-20 animate-pulse rounded bg-surface-highlight"></div>
        <div className="h-6 w-4 animate-pulse rounded bg-surface-highlight"></div>
        <div className="h-6 w-24 animate-pulse rounded bg-surface-highlight"></div>
      </div>

      {/* Deck Title & Add Button */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex-1">
          <div className="h-10 w-48 animate-pulse rounded bg-surface-highlight md:h-12 md:w-60"></div>
          <div className="mt-2 h-5 w-32 animate-pulse rounded bg-surface-highlight md:w-44"></div>
        </div>
        <div className="h-10 w-24 animate-pulse rounded-xl bg-surface-highlight md:h-12 md:w-32"></div>
      </div>

      {/* Flashcard Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-elevated rounded-xl px-4 py-4 min-h-[140px] flex flex-col justify-between"
          >
            {/* Question label */}
            <div className="h-5 w-16 animate-pulse rounded bg-surface-highlight mb-2"></div>

            {/* Question text */}
            <div className="h-6 w-11/12 animate-pulse rounded bg-surface-highlight mb-1"></div>
            <div className="h-6 w-8/12 animate-pulse rounded bg-surface-highlight mb-4"></div>

            {/* Actions - bottom left */}
            <div className="flex gap-2">
              <div className="h-5 w-5 animate-pulse rounded-full bg-surface-highlight"></div>
              <div className="h-5 w-5 animate-pulse rounded-full bg-surface-highlight"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Study Button */}
      <div className="mt-8 flex justify-center md:mt-12">
        <div className="h-12 w-36 animate-pulse rounded-xl bg-surface-highlight md:h-14 md:w-44"></div>
      </div>
    </div>
  );
};

export default LoadingState;
