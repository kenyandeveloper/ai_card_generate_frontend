"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  isMobile: propIsMobile,
}) => {
  const theme = useTheme();
  const systemIsMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : systemIsMobile;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "auto" },
          maxWidth: { xs: "100%", sm: 500 },
          m: isMobile ? 0 : 2,
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          py: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 3 },
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3 } }}>
        <DialogContentText
          sx={{
            fontSize: { xs: "0.9rem", sm: "1rem" },
            lineHeight: 1.5,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          color="primary"
          size={isMobile ? "small" : "medium"}
          sx={{
            minWidth: { xs: 70, sm: 80 },
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          size={isMobile ? "small" : "medium"}
          sx={{
            minWidth: { xs: 70, sm: 80 },
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
