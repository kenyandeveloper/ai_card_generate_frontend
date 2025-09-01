import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { X } from "lucide-react";

const StudyHeader = ({ deck, handleExitStudy }) => {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}
        >
          {deck?.title || "Study Session"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Master your knowledge through active recall
        </Typography>
      </Box>
      <Tooltip title="Exit Study Session">
        <IconButton
          onClick={handleExitStudy}
          sx={{
            bgcolor: "error.main",
            color: "white",
            "&:hover": {
              bgcolor: "error.dark",
            },
          }}
        >
          <X size={20} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default StudyHeader;