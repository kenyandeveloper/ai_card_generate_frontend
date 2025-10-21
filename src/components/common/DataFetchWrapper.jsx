import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorAlert } from "./ErrorAlert";

export const DataFetchWrapper = ({
  loading,
  error,
  onRetry,
  children,
  loadingComponent,
  loadingText = "Loading...",
  emptyMessage,
  isEmpty = false,
  renderChildrenOnEmpty = false,
}) => {
  if (loading) {
    return loadingComponent || <LoadingSpinner text={loadingText} />;
  }

  if (error) {
    const message =
      typeof error === "string" ? error : error?.message || "An error occurred";
    return <ErrorAlert message={message} onRetry={onRetry} />;
  }

  if (isEmpty && emptyMessage && !renderChildrenOnEmpty) {
    return <div className="py-8 text-center text-gray-500">{emptyMessage}</div>;
  }

  return children;
};
