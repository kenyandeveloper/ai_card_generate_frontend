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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Password confirmation is required"),
});

const Signup = () => {
  const { signup, requestOtp, verifyOtp } = useUser();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpId, setOtpId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [devCode, setDevCode] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otpErrorMsg, setOtpErrorMsg] = useState("");

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((s) => !s);

  const handleSignup = async (values) => {
    setErrorMsg("");
    setSubmitting(true);
    try {
      // 1) Create account (backend does NOT auto-verify)
      await signup(values.email, values.username, values.password);

      // 2) Request OTP for email verification
      const res = await requestOtp(values.email); // { status: "sent", otp_id, dev_code? } or { status: "skipped" }
      if (res?.status !== "sent") {
        // Unlikely just after signup; but handle gracefully
        throw new Error("Failed to send verification code. Please try again.");
      }

      setOtpId(res.otp_id ?? null);
      setDevCode(res.dev_code ?? "");
      setOtpEmail(values.email);
      setOtpCode("");
      setOtpOpen(true); // open modal and lock form
    } catch (err) {
      setErrorMsg(err?.message || "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpErrorMsg("");
    setOtpSubmitting(true);
    try {
      if (!otpId)
        throw new Error(
          "Missing verification session. Please resend the code."
        );
      if (!otpCode.trim()) throw new Error("Please enter the OTP code.");

      const res = await verifyOtp(otpEmail, otpId, otpCode.trim()); // stores token & loads user
      if (res?.success) {
        setOtpOpen(false);
        navigate("/dashboard");
        return;
      }
      throw new Error("Verification failed.");
    } catch (err) {
      setOtpErrorMsg(err?.message || "Verification failed. Please try again.");
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setOtpErrorMsg("");
    setResending(true);
    try {
      const res = await requestOtp(otpEmail);
      if (res?.status === "sent") {
        setOtpId(res.otp_id ?? null);
        setDevCode(res.dev_code ?? "");
      } else if (res?.status === "skipped") {
        // If server says already verified (edge), allow closing and continue
        setOtpOpen(false);
        navigate("/dashboard");
      } else {
        setOtpErrorMsg("Failed to resend code. Please try again.");
      }
    } catch (err) {
      setOtpErrorMsg(err?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
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
                Create Account
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                Join Flashlearn and start your learning journey
              </Typography>
            </Box>

            <Formik
              initialValues={{
                email: "",
                username: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={validationSchema}
              onSubmit={async (
                values,
                { setSubmitting: setFormikSubmitting }
              ) => {
                await handleSignup(values);
                setFormikSubmitting(false);
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
                    disabled={otpOpen} // lock while verifying
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
                    disabled={otpOpen}
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
                    disabled={otpOpen}
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
                    error={
                      touched.confirmPassword && Boolean(errors.confirmPassword)
                    }
                    helperText={
                      touched.confirmPassword && errors.confirmPassword
                    }
                    sx={{ mb: 3 }}
                    disabled={otpOpen}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
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
                    disabled={submitting || isFormikSubmitting || otpOpen}
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
                      ? "Processing..."
                      : "Create Account"}
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
                        "&:hover": { textDecoration: "underline" },
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

      {/* OTP Dialog (non-dismissable via backdrop/Esc) */}
      <Dialog
        open={otpOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          setOtpOpen(false);
        }}
        disableEscapeKeyDown
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Email verification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            We sent a 6-digit code to <strong>{otpEmail}</strong>.
          </Typography>

          {/* Show dev code only in development */}
          {import.meta.env.DEV && devCode ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Dev code: <strong>{devCode}</strong>
            </Alert>
          ) : null}

          {otpErrorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {otpErrorMsg}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            margin="dense"
            id="otpCode"
            name="otpCode"
            label="Enter OTP"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Button
              variant="text"
              onClick={handleResendCode}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend code"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // Explicit cancel; account remains unverified (user can try later)
              setOtpOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleVerifyOtp}
            disabled={otpSubmitting}
          >
            {otpSubmitting ? "Verifying..." : "Verify"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Signup;
