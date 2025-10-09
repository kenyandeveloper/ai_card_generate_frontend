import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

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

  const handleSignup = async (values) => {
    setErrorMsg("");
    setSubmitting(true);
    try {
      await signup(values.email, values.username, values.password);

      const res = await requestOtp(values.email);
      if (res?.status !== "sent") {
        throw new Error("Failed to send verification code. Please try again.");
      }

      setOtpId(res.otp_id ?? null);
      setDevCode(res.dev_code ?? "");
      setOtpEmail(values.email);
      setOtpCode("");
      setOtpOpen(true);
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

      const res = await verifyOtp(otpEmail, otpId, otpCode.trim());
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
    <main className="min-h-screen flex flex-col justify-center py-8 px-4 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700"
      >
        <div className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              Create Account
            </h1>
            <p className="text-gray-400">
              Join Flashlearn and start your learning journey
            </p>
          </div>

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
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
                    {errorMsg}
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
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
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {touched.username && errors.username && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
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
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting || isFormikSubmitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {submitting || isFormikSubmitting
                    ? "Processing..."
                    : "Create Account"}
                </motion.button>

                <p className="text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </motion.div>

      {/* OTP Modal */}
      {otpOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              Email Verification
            </h2>
            <p className="text-gray-400 mb-4">
              We sent a 6-digit code to{" "}
              <strong className="text-gray-300">{otpEmail}</strong>.
            </p>

            {import.meta.env.DEV && devCode && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500 rounded-lg text-blue-400 text-sm">
                Dev code: <strong>{devCode}</strong>
              </div>
            )}

            {otpErrorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                {otpErrorMsg}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="otpCode"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Enter OTP
              </label>
              <input
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend code"}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOtpOpen(false)}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={otpSubmitting}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {otpSubmitting ? "Verifying..." : "Verify"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
};

export default Signup;
