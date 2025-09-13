import React, { useState, useEffect } from "react";
import { auth, provider } from "../firebase.jsx";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Phone } from "lucide-react";

function Login({ theme }) { // <-- receive theme prop ('light' | 'dark')
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();

  // Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg("Login successful!");
      setTimeout(() => navigate("/products"), 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      await signInWithPopup(auth, provider);
      setSuccessMsg("Google login successful!");
      setTimeout(() => navigate("/products"), 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Setup Recaptcha
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      await confirmationResult.confirm(otp);
      setSuccessMsg("Phone login successful!");
      setTimeout(() => navigate("/ProductListing"), 2000);
    } catch (error) {
      setErrorMsg("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic theme classes
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-900" : "bg-gradient-to-br from-purple-100 via-white to-purple-200";
  const cardClass = isDark
    ? "bg-gray-800/60 text-white border-gray-700"
    : "bg-white/10 text-purple-900 border-purple-400";
  const inputClass = isDark
    ? "bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-purple-400"
    : "bg-white/10 text-purple-900 placeholder-purple-400 border-purple-300 focus:ring-purple-400";

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
      <div className={`w-full max-w-md p-8 ${cardClass} backdrop-blur-lg shadow-2xl rounded-2xl space-y-6`}>
        <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-700">
          Welcome Back
        </h2>

        {/* Email Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative">
            <Mail className={`absolute left-3 top-3 ${isDark ? "text-purple-300" : "text-purple-400"}`} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full pl-10 px-4 py-3 rounded-lg border ${inputClass} focus:outline-none`}
            />
          </div>
          <div className="relative">
            <Lock className={`absolute left-3 top-3 ${isDark ? "text-purple-300" : "text-purple-400"}`} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full pl-10 px-4 py-3 rounded-lg border ${inputClass} focus:outline-none`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold rounded-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login with Email"}
          </button>
        </form>

        <div className={`text-center ${isDark ? "text-gray-300" : "text-purple-600"}`}>or</div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-3 border rounded-lg font-medium ${isDark ? "text-white border-gray-600 bg-gray-700 hover:bg-gray-600" : "text-purple-700 border-purple-300 bg-white/10 hover:bg-purple-50"} transition-all`}
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          {loading ? "Please wait..." : "Login with Google"}
        </button>

        {/* Phone Login */}
        <div className="space-y-4">
          <div className="relative">
            <Phone className={`absolute left-3 top-3 ${isDark ? "text-purple-300" : "text-purple-400"}`} />
            <input
              type="tel"
              placeholder="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full pl-10 px-4 py-3 rounded-lg border ${inputClass} focus:outline-none`}
            />
          </div>

          {otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${inputClass} focus:outline-none`}
            />
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full py-3 border rounded-lg font-semibold ${isDark ? "border-gray-600 text-white hover:bg-gray-600" : "border-purple-400 text-purple-600 hover:bg-purple-100"} transition-all`}
            >
              Send OTP
            </button>
          ) : (
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-purple-700 transition-all"
            >
              Verify OTP
            </button>
          )}
        </div>

        <div id="recaptcha-container"></div>

        {successMsg && (
          <p className="mt-4 font-semibold text-center text-green-500">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="mt-4 font-semibold text-center text-red-500">{errorMsg}</p>
        )}

        <p className={`text-center text-sm mt-4 ${isDark ? "text-gray-300" : "text-purple-500"}`}>
          Don't have an account?{" "}
          <a href="/signup" className={`underline ${isDark ? "text-white hover:text-gray-200" : "text-purple-700 hover:text-purple-900"}`}>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
