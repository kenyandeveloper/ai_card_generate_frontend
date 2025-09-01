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
    .matches(/^[\w\.-]+@[\w\.-]+\.\w+$/, "Invalid email address")
    .required("Email is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
});

const Signup = () => {
  const { signup } = useUser();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

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
                Create Account
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                }}
              >
                Join Flashlearn and start your learning journey
              </Typography>
            </Box>

            <Formik
              initialValues={{ 
                email: "", 
                username: "", 
                password: "",
                confirmPassword: "" 
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                  const success = await signup(
                    values.email,
                    values.username,
                    values.password
                  );
                  if (success) {
                    navigate("/dashboard");
                  }
                } catch (error) {
                  // Handle specific backend errors
                  if (error.message.includes("Username already exists")) {
                    setErrors({ username: error.message });
                  } else if (error.message.includes("Email already exists")) {
                    setErrors({ email: error.message });
                  } else {
                    setErrors({ general: error.message || "Signup failed" });
                  }
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
                    helperText={touched.email && errors.email}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
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
                    helperText={touched.password && errors.password}
                    sx={{ mb: 2 }}
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

                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>

                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ color: "text.secondary" }}
                  >
                    Already have an account?{" "}
                    <Link
                      component={RouterLink}
                      to="/login"
                      sx={{
                        color: (theme) => theme.palette.secondary.main,
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Sign in here
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

export default Signup;