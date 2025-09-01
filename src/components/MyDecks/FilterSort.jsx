"use client";

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const FilterSort = ({
  subjects,
  categories,
  filter,
  setFilter,
  sortBy,
  setSortBy,
  isMobile: propIsMobile,
}) => {
  const theme = useTheme();
  const systemIsMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : systemIsMobile;
  const isVerySmall = useMediaQuery("(max-width:360px)");

  const difficultyLevels = [1, 2, 3, 4, 5];

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        <Grid item xs={6} sm={6} md={2}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel
              style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
            >
              Subject
            </InputLabel>
            <Select
              value={filter.subject}
              onChange={(e) =>
                setFilter({ ...filter, subject: e.target.value })
              }
              label="Subject"
              style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
            >
              <MenuItem
                value=""
                style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
              >
                All
              </MenuItem>
              {subjects.map((subject) => (
                <MenuItem
                  key={subject}
                  value={subject}
                  style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
                >
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={6} md={2}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel
              style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
            >
              Category
            </InputLabel>
            <Select
              value={filter.category}
              onChange={(e) =>
                setFilter({ ...filter, category: e.target.value })
              }
              label="Category"
              style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
            >
              <MenuItem
                value=""
                style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
              >
                All
              </MenuItem>
              {categories.map((category) => (
                <MenuItem
                  key={category}
                  value={category}
                  style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
                >
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={6} md={2}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel
              style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
            >
              Difficulty
            </InputLabel>
            <Select
              value={filter.difficulty}
              onChange={(e) =>
                setFilter({ ...filter, difficulty: e.target.value })
              }
              label="Difficulty"
              style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
            >
              <MenuItem
                value=""
                style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
              >
                All
              </MenuItem>
              {difficultyLevels.map((level) => (
                <MenuItem
                  key={level}
                  value={level}
                  style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
                >
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={6} md={2}>
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel
              style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
            >
              Sort By
            </InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
            >
              <MenuItem
                value="title"
                style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
              >
                Title
              </MenuItem>
              <MenuItem
                value="lastStudied"
                style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
              >
                Last Studied
              </MenuItem>
              <MenuItem
                value="difficulty"
                style={{ fontSize: isMobile ? "0.8125rem" : undefined }}
              >
                Difficulty
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
          <TextField
            label="Search"
            variant="outlined"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            fullWidth
            size={isMobile ? "small" : "medium"}
            InputLabelProps={{
              style: { fontSize: isMobile ? "0.8125rem" : undefined },
            }}
            InputProps={{
              style: { fontSize: isMobile ? "0.8125rem" : undefined },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterSort;
