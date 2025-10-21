import { CircularProgress, Box } from "@mui/material";

const sizeMap = {
  small: 24,
  medium: 40,
  large: 60,
};

export const LoadingSpinner = ({
  size = "medium",
  text = "",
  fullScreen = false,
  className = "",
}) => {
  return (
    <Box
      className={`flex flex-col items-center justify-center ${className}`}
      sx={{
        minHeight: fullScreen ? "100vh" : "200px",
        gap: 2,
      }}
    >
      <CircularProgress size={sizeMap[size] ?? sizeMap.medium} />
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{text}</p>
      )}
    </Box>
  );
};

export const InlineSpinner = ({ size = 16, className = "" }) => {
  return <CircularProgress size={size} className={`inline-block ${className}`} />;
};
