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
} from "@mui/material";
import { motion } from "framer-motion";
import ThemeToggle from "../ThemeComponents/ThemeToggle";

const Step1Schema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const Step2Schema = Yup.object({
  otpCode: Yup.string().required("OTP code is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Password confirmation is required"),
});

const ForgotPassword = () => {
  const { requestPasswordReset, resetPassword, login } = useUser();
  const navigate = useNavigate();

  // flow state
  const [step, setStep] = useState(1); // 1=email, 2=otp+new password
  const [otpId, setOtpId] = useState(null);
  const [emailLocked, setEmailLocked] = useState("");
  const [devCode, setDevCode] = useState("");

  // UI state
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendCode = async (email) => {
    setErrorMsg("");
    setSuccessMsg("");
    setSending(true);
    try {
      const res = await requestPasswordReset(email); // { status: "sent", otp_id, dev_code? }
      if (res?.status !== "sent") {
        throw new Error("Could not send reset code. Please try again.");
      }
      setOtpId(res.otp_id ?? null);
      setDevCode(res.dev_code ?? "");
      setEmailLocked(email);
      setStep(2);
      setSuccessMsg("If that email exists, we’ve sent a reset code.");
    } catch (err) {
      setErrorMsg(err?.message || "Could not send reset code.");
    } finally {
      setSending(false);
    }
  };

  const handleReset = async ({ otpCode, newPassword }) => {
    setErrorMsg("");
    setSuccessMsg("");
    setResetting(true);
    try {
      await resetPassword(emailLocked, otpId, otpCode.trim(), newPassword);

      // Try to auto-login after a successful password reset
      const result = await login(emailLocked, newPassword);
      if (result?.success) {
        navigate("/dashboard");
        return;
      }

      // If the account is unverified and login requires verification, push user to login
      setSuccessMsg("Password updated. Please sign in.");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err?.message || "Failed to reset password.");
    } finally {
      setResetting(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setResending(true);
    try {
      const res = await requestPasswordReset(emailLocked);
      if (res?.status === "sent") {
        setOtpId(res.otp_id ?? null);
        setDevCode(res.dev_code ?? "");
        setSuccessMsg("A new code has been sent.");
      } else {
        setErrorMsg("Failed to resend code. Please try again.");
      }
    } catch (err) {
      setErrorMsg(err?.message || "Failed to resend code.");
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
                Forgot Password
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {step === 1
                  ? "Enter your email to receive a reset code."
                  : "Enter the code and your new password."}
              </Typography>
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}
            {successMsg && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMsg}
              </Alert>
            )}

            {/* STEP 1: email */}
            {step === 1 && (
              <Formik
                initialValues={{ email: "" }}
                validationSchema={Step1Schema}
                onSubmit={async (values, { setSubmitting }) => {
                  await handleSendCode(values.email);
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
                      sx={{ mb: 3 }}
                    />

                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      fullWidth
                      size="large"
                      variant="contained"
                      type="submit"
                      disabled={sending || isSubmitting}
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
                      {sending || isSubmitting ? "Sending..." : "Send code"}
                    </Button>

                    <Typography
                      variant="body2"
                      align="center"
                      sx={{ color: "text.secondary" }}
                    >
                      Remembered your password?{" "}
                      <Link
                        component={RouterLink}
                        to="/login"
                        sx={{
                          color: (theme) => theme.palette.secondary.main,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Go to login
                      </Link>
                    </Typography>
                  </Form>
                )}
              </Formik>
            )}

            {/* STEP 2: otp + new password */}
            {step === 2 && (
              <Formik
                initialValues={{
                  otpCode: "",
                  newPassword: "",
                  confirmPassword: "",
                }}
                validationSchema={Step2Schema}
                onSubmit={async (values, { setSubmitting }) => {
                  await handleReset(values);
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
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      value={emailLocked}
                      disabled
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      id="otpCode"
                      name="otpCode"
                      label="Reset code"
                      value={values.otpCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.otpCode && Boolean(errors.otpCode)}
                      helperText={touched.otpCode && errors.otpCode}
                      sx={{ mb: 2 }}
                    />

                    {import.meta.env.DEV && devCode ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Dev code: <strong>{devCode}</strong>
                      </Alert>
                    ) : null}

                    <TextField
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      label="New password"
                      type="password"
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.newPassword && Boolean(errors.newPassword)}
                      helperText={touched.newPassword && errors.newPassword}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm password"
                      type="password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.confirmPassword &&
                        Boolean(errors.confirmPassword)
                      }
                      helperText={
                        touched.confirmPassword && errors.confirmPassword
                      }
                      sx={{ mb: 3 }}
                    />

                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <Button
                        variant="text"
                        onClick={handleResend}
                        disabled={resending}
                      >
                        {resending ? "Resending..." : "Resend code"}
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => {
                          // back to step 1 (change email)
                          setStep(1);
                          setOtpId(null);
                          setDevCode("");
                          setSuccessMsg("");
                          setErrorMsg("");
                        }}
                      >
                        Use a different email
                      </Button>
                    </Box>

                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      fullWidth
                      size="large"
                      variant="contained"
                      type="submit"
                      disabled={resetting || isSubmitting}
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
                      {resetting || isSubmitting
                        ? "Resetting..."
                        : "Verify & reset"}
                    </Button>

                    <Typography
                      variant="body2"
                      align="center"
                      sx={{ color: "text.secondary" }}
                    >
                      Back to{" "}
                      <Link
                        component={RouterLink}
                        to="/login"
                        sx={{
                          color: (theme) => theme.palette.secondary.main,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        login
                      </Link>
                    </Typography>
                  </Form>
                )}
              </Formik>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ForgotPassword;
