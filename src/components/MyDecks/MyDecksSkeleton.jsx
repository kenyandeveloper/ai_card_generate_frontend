import {
  Box,
  Container,
  Grid,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";

export default function MyDecksSkeleton({ isMobile }) {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Header Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: {
                xs: isMobile ? "flex-start" : "center",
                sm: "center",
              },
              flexDirection: { xs: isMobile ? "column" : "row", sm: "row" },
              gap: { xs: isMobile ? 1.5 : 0, sm: 0 },
              mb: { xs: 1, sm: 2 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Skeleton
                variant="circular"
                width={isMobile ? 24 : 32}
                height={isMobile ? 24 : 32}
              />
              <Skeleton
                variant="text"
                width={isMobile ? 180 : 220}
                height={isMobile ? 32 : 40}
              />
            </Box>
            <Skeleton
              variant="rectangular"
              width={isMobile ? 150 : 180}
              height={isMobile ? 36 : 40}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
              }}
            />
          </Box>
          <Skeleton variant="text" width="70%" height={24} />
        </Box>

        {/* Filter/Sort Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={6} sm={6} md={3} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={isMobile ? 40 : 56}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Deck Grid Skeleton */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={6} sm={6} md={4} key={i}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: 0,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                    <Skeleton variant="text" width="80%" height={32} />
                  </Box>

                  <Box sx={{ p: 3, flexGrow: 1 }}>
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mb: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={80}
                      height={32}
                      sx={{ borderRadius: 16 }}
                    />
                  </Box>

                  <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                    <Skeleton
                      variant="rectangular"
                      height={40}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
