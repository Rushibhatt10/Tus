import React, { useState } from "react";
import { auth, provider } from "../firebase.jsx";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Phone } from "lucide-react";

function Login() {
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

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://rr.myraymond.com/cdn/shop/files/Untitled-2.jpg?v=1738845089&width=1500')",
      }}
    >
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl space-y-6 text-white">
        <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-500">
          Welcome Back
        </h2>

        {/* Email Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-red-300" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-red-300" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-300 hover:bg-red-400 text-black font-semibold rounded-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login with Email"}
          </button>
        </form>

        <div className="text-center text-white/70">or</div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-white/30 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-all"
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
            <Phone className="absolute left-3 top-3 text-red-300" />
            <input
              type="tel"
              placeholder="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>

          {otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 border border-red-300 text-red-300 rounded-lg font-semibold hover:bg-white/10 transition-all"
            >
              Send OTP
            </button>
          ) : (
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 bg-red-300 text-black rounded-lg font-semibold hover:bg-red-400 transition-all"
            >
              Verify OTP
            </button>
          )}
        </div>

        <div id="recaptcha-container"></div>

        {successMsg && (
          <p className="mt-4 text-green-400 font-semibold text-center">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="mt-4 text-red-400 font-semibold text-center">{errorMsg}</p>
        )}

        <p className="text-center text-sm text-white/70 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-red-300 underline hover:text-red-400">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
