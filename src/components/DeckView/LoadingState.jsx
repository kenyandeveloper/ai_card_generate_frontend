import { Skeleton, Box, Grid, useMediaQuery } from "@mui/material";

const LoadingState = () => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <Box sx={{ width: "100%" }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <Skeleton variant="text" width={80} height={24} />
        <Skeleton variant="text" width={16} height={24} />
        <Skeleton variant="text" width={100} height={24} />
      </Box>

      {/* Deck Title & Add Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Skeleton
            variant="text"
            width={isMobile ? 180 : 240}
            height={isMobile ? 32 : 42}
          />
          <Skeleton
            variant="text"
            width={isMobile ? 120 : 180}
            height={20}
            sx={{ mt: 1 }}
          />
        </Box>
        <Skeleton
          variant="rectangular"
          width={isMobile ? 100 : 130}
          height={isMobile ? 36 : 40}
          sx={{ borderRadius: 2 }}
        />
      </Box>

      {/* Flashcard Grid */}
      <Grid container spacing={2}>
        {[...Array(9)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                px: 2,
                py: 2,
                minHeight: 140,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Question label */}
              <Skeleton variant="text" width={60} height={20} sx={{ mb: 1 }} />

              {/* Question text */}
              <Skeleton variant="text" width="90%" height={24} />
              <Skeleton variant="text" width="70%" height={24} sx={{ mb: 2 }} />

              {/* Actions - bottom left */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="circular" width={20} height={20} />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Study Button */}
      <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
        <Skeleton
          variant="rectangular"
          width={isMobile ? 150 : 180}
          height={isMobile ? 40 : 48}
          sx={{ borderRadius: 2 }}
        />
      </Box>
    </Box>
  );
};

export default LoadingState;
