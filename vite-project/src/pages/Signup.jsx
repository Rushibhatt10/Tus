import React, { useState } from "react";
import { auth, db, provider } from "../firebase.jsx";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Phone, ShieldCheck } from "lucide-react";

function Signup() {
  const [name, setName] = useState("");
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

  // Email Signup
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        method: "email",
      });

      setSuccessMsg("Signup successful!");
      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", result.user.uid), {
        name: result.user.displayName || name,
        email: result.user.email,
        method: "google",
      });

      setSuccessMsg("Google signup successful!");
      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Setup Recaptcha
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", { size: "invisible" }, auth);
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
      const result = await confirmationResult.confirm(otp);
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        phone,
        method: "phone",
      });

      setSuccessMsg("Phone verified!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setErrorMsg("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-purple-200">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border border-purple-400 shadow-2xl rounded-2xl space-y-6 text-purple-900">
        <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-700">
          Create Your Account
        </h2>

        {/* Email Signup */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-3 text-purple-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 px-4 py-3 rounded-lg border border-purple-300 bg-white/10 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-purple-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 px-4 py-3 rounded-lg border border-purple-300 bg-white/10 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-purple-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 px-4 py-3 rounded-lg border border-purple-300 bg-white/10 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold rounded-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up with Email"}
          </button>
        </form>

        <div className="text-center text-purple-600">or</div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-purple-300 rounded-lg font-medium text-purple-700 bg-white/10 hover:bg-purple-50 transition-all"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          {loading ? "Please wait..." : "Sign up with Google"}
        </button>

        {/* Phone Signup */}
        <div className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-purple-400" />
            <input
              type="tel"
              placeholder="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-lg border border-purple-300 bg-white/10 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-purple-300 bg-white/10 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 border border-purple-400 text-purple-600 rounded-lg font-semibold hover:bg-purple-100 transition-all"
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

        {successMsg && <p className="mt-4 text-green-600 font-semibold text-center">{successMsg}</p>}
        {errorMsg && <p className="mt-4 text-red-600 font-semibold text-center">{errorMsg}</p>}

        <p className="text-center text-sm text-purple-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-purple-700 underline hover:text-purple-900">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
