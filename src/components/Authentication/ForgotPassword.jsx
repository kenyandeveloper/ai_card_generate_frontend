import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";

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

export default function ForgotPassword() {
  const { requestPasswordReset, resetPassword, login } = useUser();
  const navigate = useNavigate();

  // flow
  const [step, setStep] = useState(1);
  const [otpId, setOtpId] = useState(null);
  const [emailLocked, setEmailLocked] = useState("");
  const [devCode, setDevCode] = useState("");

  // ui
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
      const res = await requestPasswordReset(email); // { status, otp_id, dev_code? }
      if (res?.status !== "sent")
        throw new Error("Could not send reset code. Please try again.");
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
      const result = await login(emailLocked, newPassword);
      if (result?.success) {
        navigate("/dashboard");
        return;
      }
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
    <main className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 py-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-background-subtle/80 backdrop-blur border border-border-strong rounded-2xl shadow-xl">
          <div className="p-6 md:p-8">
            <header className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Forgot Password
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                {step === 1
                  ? "Enter your email to receive a reset code."
                  : "Enter the code and your new password."}
              </p>
            </header>

            {/* Alerts */}
            <div aria-live="polite" className="space-y-2 mb-4">
              {errorMsg ? (
                <div
                  role="alert"
                  className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2 text-danger"
                >
                  {errorMsg}
                </div>
              ) : null}
              {successMsg ? (
                <div
                  role="alert"
                  className="rounded-lg border border-success/30 bg-success-soft px-4 py-2 text-success"
                >
                  {successMsg}
                </div>
              ) : null}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <Formik
                initialValues={{ email: "" }}
                validationSchema={Step1Schema}
                onSubmit={async (values, { setSubmitting }) => {
                  await handleSendCode(values.email);
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form noValidate>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-text-primary mb-1"
                      >
                        Email
                      </label>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`w-full rounded-lg bg-surface-elevated border px-3 py-2 outline-none placeholder:text-text-muted
                          ${
                            touched.email && errors.email
                              ? "border-danger/60"
                              : "border-border-muted focus:border-border-muted"
                          }`}
                        placeholder="you@example.com"
                      />
                      {touched.email && errors.email ? (
                        <p className="mt-1 text-xs text-danger">
                          {errors.email}
                        </p>
                      ) : null}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={sending || isSubmitting}
                      className="w-full rounded-lg px-4 py-2 font-medium bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending || isSubmitting ? "Sending..." : "Send code"}
                    </motion.button>

                    <p className="text-center text-sm text-text-secondary mt-3">
                      Remembered your password?{" "}
                      <Link
                        to="/login"
                        className="text-primary hover:underline"
                      >
                        Go to login
                      </Link>
                    </p>
                  </Form>
                )}
              </Formik>
            )}

            {/* STEP 2 */}
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
                  values,
                  handleChange,
                  handleBlur,
                }) => (
                  <Form noValidate>
                    <div className="mb-3">
                      <label
                        htmlFor="email-locked"
                        className="block text-sm font-medium text-text-primary mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="email-locked"
                        type="email"
                        value={emailLocked}
                        disabled
                        className="w-full rounded-lg bg-surface-elevated border border-border-muted px-3 py-2 text-text-secondary"
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="otpCode"
                        className="block text-sm font-medium text-text-primary mb-1"
                      >
                        Reset code
                      </label>
                      <input
                        id="otpCode"
                        name="otpCode"
                        value={values.otpCode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full rounded-lg bg-surface-elevated border px-3 py-2 outline-none placeholder:text-text-muted
                          ${
                            touched.otpCode && errors.otpCode
                              ? "border-danger/60"
                              : "border-border-muted focus:border-border-muted"
                          }`}
                        placeholder="Enter the code"
                      />
                      {touched.otpCode && errors.otpCode ? (
                        <p className="mt-1 text-xs text-danger">
                          {errors.otpCode}
                        </p>
                      ) : null}
                    </div>

                    {import.meta.env.DEV && devCode ? (
                      <div
                        role="note"
                        className="mb-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sky-200"
                      >
                        Dev code:{" "}
                        <strong className="font-semibold">{devCode}</strong>
                      </div>
                    ) : null}

                    <div className="mb-3">
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-text-primary mb-1"
                      >
                        New password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={values.newPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full rounded-lg bg-surface-elevated border px-3 py-2 outline-none placeholder:text-text-muted
                          ${
                            touched.newPassword && errors.newPassword
                              ? "border-danger/60"
                              : "border-border-muted focus:border-border-muted"
                          }`}
                        placeholder="••••••••"
                      />
                      {touched.newPassword && errors.newPassword ? (
                        <p className="mt-1 text-xs text-danger">
                          {errors.newPassword}
                        </p>
                      ) : null}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-text-primary mb-1"
                      >
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full rounded-lg bg-surface-elevated border px-3 py-2 outline-none placeholder:text-text-muted
                          ${
                            touched.confirmPassword && errors.confirmPassword
                              ? "border-danger/60"
                              : "border-border-muted focus:border-border-muted"
                          }`}
                        placeholder="••••••••"
                      />
                      {touched.confirmPassword && errors.confirmPassword ? (
                        <p className="mt-1 text-xs text-danger">
                          {errors.confirmPassword}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="text-sm px-3 py-2 rounded-lg border border-border-muted hover:border-border-muted disabled:opacity-50"
                      >
                        {resending ? "Resending..." : "Resend code"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setOtpId(null);
                          setDevCode("");
                          setSuccessMsg("");
                          setErrorMsg("");
                        }}
                        className="text-sm px-3 py-2 rounded-lg border border-border-muted hover:border-border-muted"
                      >
                        Use a different email
                      </button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={resetting || isSubmitting}
                      className="w-full rounded-lg px-4 py-2 font-medium bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetting || isSubmitting
                        ? "Resetting..."
                        : "Verify & reset"}
                    </motion.button>

                    <p className="text-center text-sm text-text-secondary mt-3">
                      Back to{" "}
                      <Link
                        to="/login"
                        className="text-primary hover:underline"
                      >
                        login
                      </Link>
                    </p>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      </motion.section>
    </main>
  );
}
