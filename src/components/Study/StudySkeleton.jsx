// src/components/Study/StudySkeleton.jsx
import {
  Skeleton,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

export default function StudySkeleton() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width={300} height={48} sx={{ mb: 4 }} />

        <Box sx={{ mb: 4, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
          <Grid container spacing={3}>
            {[...Array(3)].map((_, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={24}
                      sx={{ mb: 0.5 }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Skeleton variant="text" width="40%" height={32} />
                      {i === 0 && (
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={32}
                          sx={{ borderRadius: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Skeleton variant="text" width={200} height={36} sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                    <Skeleton variant="text" width="80%" height={32} />
                  </Box>
                  <Box sx={{ p: 3 }}>
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
