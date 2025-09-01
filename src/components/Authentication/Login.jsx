"use client";

import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ThemeToggle from "../ThemeComponents/ThemeToggle";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 0 1px rgba(0, 0, 0, 0.5)"
                : "0 0 0 1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                }}
              >
                Sign in to continue learning
              </Typography>
            </Box>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                  const success = await login(values.email, values.password);
                  if (success) {
                    navigate("/dashboard");
                  }
                } catch (error) {
                  setErrors({ general: error.message || "Login failed" });
                }
                setSubmitting(false);
              }}
            >
              {({
                isSubmitting,
                errors,
                touched,
                handleChange,
                handleBlur,
                values,
              }) => (
                <Form>
                  {errors.general && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.general}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && values.email === "" ? errors.email : ""}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && values.password === "" ? errors.password : ""}
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    fullWidth
                    size="large"
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{
                      bgcolor: (theme) => theme.palette.primary.main,
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? "white"
                          : "text.primary",
                      "&:hover": {
                        bgcolor: (theme) => theme.palette.primary.light,
                      },
                      mb: 2,
                    }}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>

                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ color: "text.secondary" }}
                  >
                    Don't have an account?{" "}
                    <Link
                      component={RouterLink}
                      to="/signup"
                      sx={{
                        color: theme => theme.palette.secondary.main,
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Sign up here
                    </Link>
                  </Typography>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Login;