import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

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
  const [otpPhase, setOtpPhase] = useState(false);
  const [otpId, setOtpId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handlePasswordStep = async (email, password) => {
    setErrorMsg("");
    const result = await login(email, password);
    if (result?.success) {
      navigate("/dashboard");
      return;
    }

    const otpRes = await requestOtp(email);
    if (otpRes?.status === "sent") {
      setOtpId(otpRes.otp_id ?? null);
      setDevCode(otpRes.dev_code ?? "");
      setOtpPhase(true);
      return;
    }
    if (otpRes?.status === "skipped") {
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

  const handleOtpStep = async (email) => {
    if (!otpId) throw new Error("Missing OTP session. Please resend the code.");
    if (!otpCode.trim()) throw new Error("Please enter the OTP code.");
    const res = await verifyOtp(email, otpId, otpCode.trim());
    if (res?.success) {
      navigate("/dashboard");
      return;
    }
    throw new Error("OTP verification failed. Please try again.");
  };

  return (
    <main className="min-h-screen flex flex-col justify-center py-8 px-4 max-w-xl mx-auto text-text-secondary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-surface-elevated rounded-2xl shadow-xl border border-border-muted"
      >
        <div className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-text-muted">
              {otpPhase
                ? "Verify your email to continue"
                : "Sign in to continue learning"}
            </p>
          </div>

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
                  <div className="mb-4 p-4 bg-danger-soft border border-danger rounded-lg text-danger">
                    {errorMsg}
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={otpPhase}
                    className="w-full px-4 py-3 bg-surface-muted border border-border-muted rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-danger">{errors.email}</p>
                  )}
                </div>

                {!otpPhase && (
                  <div className="mb-6">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-text-secondary mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 bg-surface-muted border border-border-muted rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="mt-1 text-sm text-danger">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}

                {otpPhase && (
                  <>
                    <div className="mb-4">
                      <label
                        htmlFor="otpCode"
                        className="block text-sm font-medium text-text-secondary mb-2"
                      >
                        Enter OTP
                      </label>
                      <input
                        id="otpCode"
                        name="otpCode"
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-muted border border-border-muted rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    {devCode && (
                      <div className="mb-4 p-3 bg-primary-soft border border-primary rounded-lg text-primary text-sm">
                        Dev code: <strong>{devCode}</strong>
                      </div>
                    )}

                    <div className="flex gap-3 mb-4">
                      <button
                        type="button"
                        onClick={async () => {
                          setErrorMsg("");
                          setResending(true);
                          try {
                            const res = await requestOtp(values.email);
                            if (res?.status === "sent") {
                              setOtpId(res.otp_id ?? null);
                              setDevCode(res.dev_code ?? "");
                            } else if (res?.status === "skipped") {
                              setOtpPhase(false);
                            } else {
                              setErrorMsg(
                                "Failed to resend code. Please try again."
                              );
                            }
                          } catch (e) {
                            setErrorMsg(e?.message || "Failed to resend code.");
                          } finally {
                            setResending(false);
                          }
                        }}
                        className="text-sm text-primary hover:text-primary-emphasis"
                      >
                        {resending ? "Resending..." : "Resend code"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOtpPhase(false);
                          setOtpId(null);
                          setOtpCode("");
                          setDevCode("");
                          setErrorMsg("");
                        }}
                        className="text-sm text-primary hover:text-primary-emphasis"
                      >
                        Use a different email
                      </button>
                    </div>
                  </>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting || isFormikSubmitting || resending}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-emphasis text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-sm"
                >
                  {submitting || isFormikSubmitting
                    ? otpPhase
                      ? "Verifying OTP..."
                      : "Signing in..."
                    : otpPhase
                    ? "Verify OTP"
                    : "Sign in"}
                </motion.button>

                <div className="text-center text-sm text-text-muted space-y-1">
                  <p>
                    Don&rsquo;t have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-primary hover:text-primary-emphasis hover:underline"
                    >
                      Sign up here
                    </Link>
                  </p>
                  <p>
                    <Link
                      to="/forgot-password"
                      className="text-primary hover:text-primary-emphasis hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </motion.div>
    </main>
  );
};

export default Login;
