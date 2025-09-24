"use client";

import { useState, useEffect } from "react";
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
  const { user, login, requestOtp, verifyOtp } = useUser();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpPhase, setOtpPhase] = useState(false); // false = password step, true = OTP step
  const [otpId, setOtpId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState(""); // optional (dev only)

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClickShowPassword = () => setShowPassword((s) => !s);

  // If already logged in, bounce to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Step 1: password login
  const handlePasswordStep = async (email, password) => {
    setErrorMsg("");
    const result = await login(email, password);
    if (result?.success) {
      navigate("/dashboard");
      return;
    }
    // Email not verified → request verification OTP
    const otpRes = await requestOtp(email);
    // { status: "sent" | "skipped", otp_id, dev_code? }
    if (otpRes?.status === "sent") {
      setOtpId(otpRes.otp_id ?? null);
      setDevCode(otpRes.dev_code ?? "");
      setOtpPhase(true);
      return;
    }
    if (otpRes?.status === "skipped") {
      // Already verified (edge case) — try login again to get token
      const retry = await login(email, password);
      if (retry?.success) {
        navigate("/dashboard");
        return;
      }
      throw new Error(
        "Verification step skipped unexpectedly. Please try again."
      );
    }
    throw new Error("Failed to request verification code. Please try again.");
  };

  // Step 2: OTP verify
  const handleOtpStep = async (email) => {
    if (!otpId) throw new Error("Missing OTP session. Please resend the code.");
    if (!otpCode.trim()) throw new Error("Please enter the OTP code.");
    const res = await verifyOtp(email, otpId, otpCode.trim()); // stores token & loads user
    if (res?.success) {
      navigate("/dashboard");
      return;
    }
    throw new Error("OTP verification failed. Please try again.");
  };

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
                sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {otpPhase
                  ? "Verify your email to continue"
                  : "Sign in to continue learning"}
              </Typography>
            </Box>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={async (
                values,
                { setSubmitting: setFormikSubmitting }
              ) => {
                setSubmitting(true);
                setFormikSubmitting(true);
                setErrorMsg("");
                try {
                  if (!otpPhase) {
                    await handlePasswordStep(values.email, values.password);
                  } else {
                    await handleOtpStep(values.email);
                  }
                } catch (err) {
                  setErrorMsg(
                    err?.message || "Something went wrong. Please try again."
                  );
                } finally {
                  setSubmitting(false);
                  setFormikSubmitting(false);
                }
              }}
            >
              {({
                isSubmitting: isFormikSubmitting,
                errors,
                touched,
                handleChange,
                handleBlur,
                values,
              }) => (
                <Form>
                  {errorMsg && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errorMsg}
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
                    disabled={otpPhase} // lock email during OTP phase
                  />

                  {!otpPhase && (
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
                      sx={{ mb: 3 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}

                  {otpPhase && (
                    <>
                      <TextField
                        fullWidth
                        id="otpCode"
                        name="otpCode"
                        label="Enter OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      {devCode ? (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          Dev code: <strong>{devCode}</strong>
                        </Alert>
                      ) : null}

                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Button
                          variant="text"
                          onClick={async () => {
                            // Resend OTP
                            setErrorMsg("");
                            setResending(true);
                            try {
                              const res = await requestOtp(values.email);
                              if (res?.status === "sent") {
                                setOtpId(res.otp_id ?? null);
                                setDevCode(res.dev_code ?? "");
                              } else if (res?.status === "skipped") {
                                // If somehow already verified now, try to finalize login
                                setOtpPhase(false);
                              } else {
                                setErrorMsg(
                                  "Failed to resend code. Please try again."
                                );
                              }
                            } catch (e) {
                              setErrorMsg(
                                e?.message || "Failed to resend code."
                              );
                            } finally {
                              setResending(false);
                            }
                          }}
                        >
                          {resending ? "Resending..." : "Resend code"}
                        </Button>

                        <Button
                          variant="text"
                          onClick={() => {
                            // Go back to password step, allow editing email/password again
                            setOtpPhase(false);
                            setOtpId(null);
                            setOtpCode("");
                            setDevCode("");
                            setErrorMsg("");
                          }}
                        >
                          Use a different email
                        </Button>
                      </Box>
                    </>
                  )}

                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    fullWidth
                    size="large"
                    variant="contained"
                    type="submit"
                    disabled={submitting || isFormikSubmitting || resending}
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
                    {submitting || isFormikSubmitting
                      ? otpPhase
                        ? "Verifying OTP..."
                        : "Signing in..."
                      : otpPhase
                      ? "Verify OTP"
                      : "Sign in"}
                  </Button>

                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ color: "text.secondary" }}
                  >
                    Don&apos;t have an account?{" "}
                    <Link
                      component={RouterLink}
                      to="/signup"
                      sx={{
                        color: (theme) => theme.palette.secondary.main,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Sign up here
                    </Link>
                    <br />
                    <Link
                      component={RouterLink}
                      to="/forgot-password"
                      sx={{
                        color: (theme) => theme.palette.secondary.main,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Forgot your password?
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
