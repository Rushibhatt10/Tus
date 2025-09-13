import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, MapPin, ShoppingBag, Lock } from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Cart items (single product or full cart)
  const cartItems =
    location.state?.cartItems ||
    (location.state?.product ? [location.state.product] : []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState(cartItems.map(() => 1));

  // Shipping Form States
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState("Home");

  // Charges
  const shippingCharge = 50;
  const taxRate = 0.05; // 5% GST

  // Auth listener
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

  // Subtotal & Discounts Calculation
  const itemTotals = cartItems.map((item, idx) => {
    const qty = quantities[idx];
    const price = Number(item.price || 0);
    let itemTotal = price * qty;
    let itemDiscount = 0;

    // Extra 10% discount if quantity > 10
    if (qty > 10) {
      itemDiscount = itemTotal * 0.1;
      itemTotal -= itemDiscount;
    }

    return { itemTotal, itemDiscount };
  });

  const subtotal = itemTotals.reduce((sum, it) => sum + it.itemTotal, 0);
  const discountTotal = itemTotals.reduce((sum, it) => sum + it.itemDiscount, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax + shippingCharge;

  // Place Order -> Firestore
  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login to place order.");
      navigate("/login");
      return;
    }

    try {
      const orderData = {
        userId: user.uid,
        items: cartItems.map((item, idx) => ({
          id: item.id || null,
          name: item.name,
          price: item.price,
          quantity: quantities[idx],
          subtotal: itemTotals[idx].itemTotal,
          discount: itemTotals[idx].itemDiscount,
        })),
        subtotal,
        discountTotal,
        tax,
        shipping: shippingCharge,
        total,
        createdAt: serverTimestamp(),
        shippingDetails: {
          name,
          mobile,
          email,
          address,
          street,
          landmark,
          city,
          state,
          pincode,
          addressType,
        },
      };

      await addDoc(collection(db, "orders"), orderData);

      alert("✅ Order placed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("❌ Failed to place order. Try again.");
    }
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No products to checkout.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-10 text-gray-900 dark:text-white">
      <motion.div
        className="max-w-5xl mx-auto backdrop-blur-xl bg-white/40 dark:bg-gray-800/50 border border-white/50 dark:border-gray-700 rounded-3xl shadow-2xl p-8 md:p-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-extrabold text-center text-purple-800 dark:text-purple-400 mb-10">
          Checkout
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Shipping & Payment */}
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-3 text-purple-700 mb-6">
              <MapPin size={22} /> Shipping Details
            </h3>
            <div className="space-y-5">
              {/* Name & Contact */}
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {/* Address Lines */}
              <input
                type="text"
                placeholder="Flat/House No., Building, Company, Apartment"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="text"
                placeholder="Area, Street, Sector, Village"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {/* Location */}
              <div className="grid grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Town / City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                  p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                  p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Pincode / ZIP Code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="rounded-xl border border-purple-300 bg-white/60 dark:bg-gray-700/60 
                  p-4 text-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              {/* Address Type */}
              <div className="flex gap-4 items-center">
                {["Home", "Work", "Other"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="addressType"
                      value={type}
                      checked={addressType === type}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="w-5 h-5"
                    />{" "}
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl border border-white/60 dark:border-gray-700 shadow-xl p-6">
            <h3 className="text-2xl font-semibold flex items-center gap-3 text-purple-800 dark:text-purple-400 mb-6">
              <ShoppingBag size={22} /> Order Summary
            </h3>

            {cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 mb-6">
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover border border-purple-200 dark:border-gray-600"
                />
                <div className="flex-1">
                  <p className="text-lg font-medium text-purple-800 dark:text-purple-400">
                    {item.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    ₹{item.price}/meter
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-gray-700 dark:text-gray-300 font-medium">
                      Qty:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantities[idx]}
                      onChange={(e) => {
                        const newQty = [...quantities];
                        newQty[idx] = Number(e.target.value);
                        setQuantities(newQty);
                      }}
                      className="w-16 rounded-lg border border-purple-300 text-center text-lg dark:border-gray-600"
                    />
                  </div>

                  {/* Discount Badge */}
                  {quantities[idx] > 10 && (
                    <div className="inline-block mt-2 px-2 py-1 text-sm font-semibold text-green-700 bg-green-200 rounded-full">
                      10% discount applied
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Extra discount line */}
            {discountTotal > 0 && (
              <div className="text-green-600 dark:text-green-400 mb-2 font-medium">
                Extra 10% discount above 10 Meter purchase: -₹{discountTotal.toFixed(2)}
              </div>
            )}

            <div className="border-t border-purple-200 dark:border-gray-600 my-4"></div>

            <div className="flex justify-between text-lg text-gray-700 dark:text-gray-300 mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg text-gray-700 dark:text-gray-300 mb-2">
              <span>Shipping</span>
              <span>₹{shippingCharge}</span>
            </div>
            <div className="flex justify-between text-lg text-gray-700 dark:text-gray-300 mb-2">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-purple-800 dark:text-purple-400">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm mt-4">
              <Lock size={16} /> Secure Payment Gateway
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
