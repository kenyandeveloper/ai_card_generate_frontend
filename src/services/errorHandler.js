export class ApiError extends Error {
  constructor(message, status, originalError) {
    super(message);
    this.status = status;
    this.originalError = originalError;
  }
}

export const handleApiError = (error) => {
  if (!error) {
    return {
      status: 0,
      message: "Unknown error",
      error,
    };
  }

  if (error.response) {
    const { status, data } = error.response;
    const message =
      data?.message || data?.error || data?.detail || "An error occurred";
    return {
      status,
      message,
      isApiError: true,
      error,
    };
  }

  if (error.request) {
    return {
      status: 0,
      message: "Network error. Please check your connection.",
      isNetworkError: true,
      error,
    };
  }

  return {
    status: 0,
    message: error.message || "An unexpected error occurred",
    isClientError: true,
    error,
  };
};

export const getErrorMessage = (error) => handleApiError(error).message;
