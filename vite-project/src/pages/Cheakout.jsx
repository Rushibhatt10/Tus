import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, MapPin, ShoppingBag } from "lucide-react";
import { auth } from "../firebase"; // ✅ Import Firebase Auth
import { onAuthStateChanged } from "firebase/auth";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login", { replace: true });
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handlePlaceOrder = () => {
    alert("Order placed successfully!");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-12 w-12 text-purple-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 text-gray-900 flex items-center justify-center px-4 py-10">
      <motion.div
        className="max-w-5xl w-full backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl shadow-2xl p-8 md:p-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-extrabold text-center text-purple-800 mb-10">
          Checkout
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Shipping & Payment */}
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-3 text-purple-700 mb-6">
              <MapPin size={22} /> Shipping Details
            </h3>
           <form className="space-y-5">
  {/* Full Name */}
  <input
    type="text"
    placeholder="Full Name"
    className="w-full rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
  />

  {/* Mobile Number */}
  <input
    type="tel"
    placeholder="Mobile Number"
    className="w-full rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
  />

  {/* Pincode */}
  <input
    type="text"
    placeholder="Pincode"
    className="w-full rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
  />

  {/* Flat/House No., Building */}
  <input
    type="text"
    placeholder="Flat/House No., Building, Company, Apartment"
    className="w-full rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
  />

  {/* Area, Street */}
  <input
    type="text"
    placeholder="Area, Street, Sector, Village"
    className="w-full rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
  />

  {/* Landmark */}
  <input
    type="text"
    placeholder="Landmark (Optional)"
    className="w-full rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
  />

  {/* City & State */}
  <div className="grid grid-cols-2 gap-5">
    <input
      type="text"
      placeholder="Town/City"
      className="rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
    />
    <input
      type="text"
      placeholder="State"
      className="rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
    />
  </div>

  {/* Address Type */}
  <div className="flex gap-4 items-center">
    <label className="flex items-center gap-2 text-lg text-gray-700">
      <input type="radio" name="addressType" value="Home" className="w-5 h-5" /> Home
    </label>
    <label className="flex items-center gap-2 text-lg text-gray-700">
      <input type="radio" name="addressType" value="Work" className="w-5 h-5" /> Work
    </label>
    <label className="flex items-center gap-2 text-lg text-gray-700">
      <input type="radio" name="addressType" value="Other" className="w-5 h-5" /> Other
    </label>
  </div>
</form>


            {/* Payment */}
            <h3 className="text-2xl font-semibold flex items-center gap-3 text-purple-700 mt-10 mb-4">
              <CreditCard size={22} /> Payment Method
            </h3>
            <select className="w-full rounded-xl border border-purple-300 bg-white/60 p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none">
              <option>Credit / Debit Card</option>
              <option>UPI</option>
              <option>Cash on Delivery</option>
            </select>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl p-6">
            <h3 className="text-2xl font-semibold flex items-center gap-3 text-purple-800 mb-6">
              <ShoppingBag size={22} /> Order Summary
            </h3>
            <div className="flex items-center gap-5 mb-6">
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="w-24 h-24 rounded-xl object-cover border border-purple-200"
              />
              <div>
                <p className="text-lg font-medium text-purple-800">
                  {product.name}
                </p>
                <p className="text-gray-600 text-md">₹{product.price}/meter</p>
              </div>
            </div>

            <div className="border-t border-purple-200 my-4"></div>
            <div className="flex justify-between text-lg text-gray-700 mb-2">
              <span>Subtotal</span>
              <span>₹{product.price}</span>
            </div>
            <div className="flex justify-between text-lg text-gray-700 mb-2">
              <span>Shipping</span>
              <span>₹50</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-purple-800">
              <span>Total</span>
              <span>₹{parseInt(product.price) + 50}</span>
            </div>

            <motion.button
              onClick={handlePlaceOrder}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-2xl text-xl font-semibold shadow-lg hover:opacity-90"
              whileTap={{ scale: 0.95 }}
            >
              Place Order
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
