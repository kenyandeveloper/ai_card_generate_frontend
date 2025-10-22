let notificationCallback = null;

export const setNotificationCallback = (callback) => {
  notificationCallback = callback;
};

export const showNotification = (message, severity = "info") => {
  if (notificationCallback) {
    notificationCallback({ text: message, severity });
  } else {
    console.warn("Notification callback not set. Message:", message);
  }
};

export const showError = (message) => showNotification(message, "error");
export const showSuccess = (message) => showNotification(message, "success");
export const showInfo = (message) => showNotification(message, "info");
export const showWarning = (message) => showNotification(message, "warning");
