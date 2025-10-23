const basePulseClass =
  "animate-pulse bg-surface-highlight/80 dark:bg-surface-highlight/60";

export const LoadingSkeleton = ({
  width = "100%",
  height = 40,
  count = 1,
  className = "",
  itemClassName = "",
  roundedClassName = "rounded-lg",
}) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${basePulseClass} ${roundedClassName} ${itemClassName}`}
          style={{ width, height }}
        />
      ))}
    </div>
  );
};

export const DeckCardSkeleton = ({
  count = 6,
  wrapperClassName = "",
  cardClassName = "",
}) => {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8 ${wrapperClassName}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`flex h-full flex-col rounded-2xl border border-border-muted bg-surface-elevated shadow-lg ${cardClassName}`}
        >
          <div className="border-b border-border-muted p-6">
            <div className={`${basePulseClass} h-8 w-4/5 rounded-lg`} />
          </div>
          <div className="flex-1 space-y-4 p-6">
            <div className={`${basePulseClass} h-5 w-full rounded-lg`} />
            <div className={`${basePulseClass} h-5 w-11/12 rounded-lg`} />
            <div className={`${basePulseClass} h-8 w-20 rounded-full`} />
          </div>
          <div className="border-t border-border-muted p-4">
            <div className={`${basePulseClass} h-10 w-full rounded-lg`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableRowSkeleton = ({ columns = 4, rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} aria-hidden="true" className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-2">
              <div className={`${basePulseClass} h-6 w-full rounded-md`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
