import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ShoppingBag, Lock } from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp, setDoc, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import gsap from "gsap";
import axios from "axios";

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
  const [siteSettings, setSiteSettings] = useState(null);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

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

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Charges
  const shippingCharge = 0; // Removed delivery charges as requested
  
  // Dynamic tax rates based on amount
  const getTaxRate = (amount) => {
    if (amount <= 1000) return 0.05; // 5% GST for amount <= 1000
    if (amount <= 5000) return 0.12; // 12% GST for amount 1001-5000
    return 0.18; // 18% GST for amount > 5000
  };

  
  // Fetch Saved Address from Account Profile
  const fetchUserAddress = async (uid) => {
    try {
      const snap = await getDocs(collection(db, "users", uid, "addresses"));
      if (!snap.empty) {
        // Use the first saved address (can be improved to select default later)
        const savedData = snap.docs[0].data();
        setName(savedData.name || "");
        setMobile(savedData.mobile || "");
        setEmail(user?.email || savedData.email || "");
        setAddress(savedData.line1 || "");
        setStreet(savedData.line2 || "");
        setLandmark(savedData.landmark || "");
        setCity(savedData.city || "");
        setState(savedData.state || "");
        setPincode(savedData.zip || "");
        setAddressType(savedData.type || "Home");
      }
    } catch (err) {
      console.error("Failed to fetch address", err);
    }
  };

  // Auth & Settings listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login", { replace: true });
      } else {
        setUser(currentUser);
        if (!email) setEmail(currentUser.email || "");
        if (!name) setName(currentUser.displayName || "");
        fetchUserAddress(currentUser.uid);
        
        // Check identifying first order
        try {
          const ordersRef = collection(db, "orders");
          const q = query(ordersRef, where("userId", "==", currentUser.uid));
          const snap = await getDocs(q);
          setIsFirstOrder(snap.empty);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) setSiteSettings(docSnap.data());
    });

    return () => {
      unsubAuth();
      unsubSettings();
    };
  }, [navigate]);

  // Subtotal & Discounts Calculation
  const itemTotals = cartItems.map((item, idx) => {
    const qty = quantities[idx];
    const lenStr = String(item.selectedLength || "1 m");
    const lenNum = parseFloat(lenStr) || 1;
    const basePrice = Number(item.price || 0);

    const prodDisc = Number(item.discount || 0);
    const globDisc = siteSettings?.globalDiscountEnabled ? Number(siteSettings?.globalDiscountPercent || 0) : 0;
    const maxItemDiscPercent = Math.max(prodDisc, globDisc);

    let unitGrossPrice = basePrice * lenNum;
    if (item.sizePricing && item.sizePricing[lenStr]) {
      unitGrossPrice = Number(item.sizePricing[lenStr]);
    }

    const itemTotalGross = unitGrossPrice * qty;
    const itemDiscount = itemTotalGross * (maxItemDiscPercent / 100);
    const itemTotal = itemTotalGross - itemDiscount;

    return { itemTotal, itemDiscount };
  });

  const subtotal = itemTotals.reduce((sum, it) => sum + it.itemTotal, 0);
  
  // First time user discount
  const ftDiscountPercent = (isFirstOrder && siteSettings?.firstTimeDiscountPercent) ? Number(siteSettings.firstTimeDiscountPercent) : 0;
  const ftDiscountAmount = subtotal * (ftDiscountPercent / 100);
  
  const discountedSubtotal = subtotal - ftDiscountAmount;
  
  const taxRate = getTaxRate(discountedSubtotal);
  const tax = discountedSubtotal * taxRate;
  
  const couponDiscount = appliedCoupon ? (discountedSubtotal * appliedCoupon.percent) / 100 : 0;
  
  const total = discountedSubtotal + tax + shippingCharge - couponDiscount;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;

    const code = couponCode.trim().toUpperCase();

    // 1. Check Firestore coupons first
    try {
      const q = query(collection(db, "coupons"), where("code", "==", code), where("isActive", "==", true));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const coupon = snap.docs[0].data();
        if (coupon.minimumOrderValue > 0 && subtotal < coupon.minimumOrderValue) {
          setCouponError(`Minimum order of ₹${coupon.minimumOrderValue} required for ${code}`);
          return;
        }
        setAppliedCoupon({ code, percent: coupon.discountPercent });
        return;
      }
    } catch (e) {
      console.error("Coupon check failed", e);
    }

    // 2. Fall back to hardcoded built-in coupons
    if (code === "MAR10") {
      if (subtotal < 3999) { setCouponError("Minimum order of ₹3999 required for MAR10"); return; }
      setAppliedCoupon({ code: "MAR10", percent: 10 });
    } else if (code === "MAR15") {
      if (subtotal < 5999) { setCouponError("Minimum order of ₹5999 required for MAR15"); return; }
      setAppliedCoupon({ code: "MAR15", percent: 15 });
    } else if (code === "WELCOME5") {
      setAppliedCoupon({ code: "WELCOME5", percent: 5 });
    } else {
      setCouponError("Invalid or inactive coupon code");
    }
  };

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Initial GSAP animations
    gsap.from(".checkout-container", {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out"
    });

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login to place order.");
      navigate("/login");
      return;
    }

    if (!name || !mobile || !address || !city || !state || !pincode) {
      alert("Please fill all required shipping details.");
      return;
    }

    try {
      setLoading(true);

      const shippingDetails = {
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
      };

      const orderPayload = {
        amount: total,
        currency: "INR",
        userId: user.uid,
        items: cartItems.map((item, idx) => {
          const selectedLengthLabel = String(item.selectedLength || "1 m");
          const selectedLengthMeters = Number.isFinite(Number(item.selectedLengthMeters))
            ? Number(item.selectedLengthMeters)
            : parseFloat(selectedLengthLabel) || 1;

          const selectedUnitPrice = Number.isFinite(Number(item.selectedUnitPrice))
            ? Number(item.selectedUnitPrice)
            : item.sizePricing && item.sizePricing[selectedLengthLabel]
              ? Number(item.sizePricing[selectedLengthLabel])
              : Number(item.price || 0) * selectedLengthMeters;

          const quantity = quantities[idx];

          return {
            name: item.name,
            price: Number(item.price || 0),
            quantity,
            selectedLength: selectedLengthLabel,
            selectedLengthMeters,
            selectedUnitPrice,
            subtotal: selectedUnitPrice * quantity,
          };
        }),
        shippingDetails
      };

      // 3. Save/Update Address in User Profile (Finalize address)
      try {
        const addressRef = collection(db, "users", user.uid, "addresses");
        const existingAddrs = await getDocs(addressRef);
        
        const addrData = {
          name,
          mobile,
          email,
          line1: address,
          line2: street,
          landmark,
          city,
          state,
          zip: pincode,
          type: addressType,
          updatedAt: serverTimestamp()
        };

        if (existingAddrs.empty) {
          await addDoc(addressRef, addrData);
        } else {
          // If address changed or we want to ensure this is the "final" one, 
          // we update the first one or we could add a new one. 
          // Given "be the final one", we'll update the first one found or add if unique.
          // For simplicity and matching user intent, we'll update the primary record.
          const firstDocId = existingAddrs.docs[0].id;
          await setDoc(doc(db, "users", user.uid, "addresses", firstDocId), addrData, { merge: true });
        }
      } catch (addrErr) {
        console.error("Failed to finalize address in profile", addrErr);
        // Don't block order placement if address saving fails
      }

      // 1. Create Order on Backend
      const { data } = await axios.post("/api/payment/create-order", orderPayload);

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: "INR",
        name: "TUS E-commerce",
        description: "Order Payment",
        order_id: data.order_id,
        handler: async function (response) {
          try {
            // 2. Verify Payment on Backend
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              firestore_order_id: data.firestore_order_id,
            };

            const verificationResult = await axios.post("/api/payment/verify-payment", verifyPayload);

            if (verificationResult.data.success) {
              setOrderId(data.firestore_order_id);
              setPaymentSuccess(true);
              
              // Animate success state
              gsap.to(".success-card", {
                scale: 1.1,
                duration: 0.5,
                yoyo: true,
                repeat: 1
              });

              setTimeout(() => {
                navigate("/account"); // Go to My Orders
              }, 4000);
            }
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: mobile,
        },
        notes: {
          address: address,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();
      setLoading(false);
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("❌ Payment Initialization Failed.\n\nPlease ensure:\n1. The backend server is running (cd server && npm start)\n2. You have added your Razorpay keys and serviceAccountKey.json in the server folder.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-12 w-12 text-gray-600 dark:text-gray-300"
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

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md success-card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
          <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
          <p className="text-sm text-gray-500">Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-colors duration-500 text-[#0c0c0c] dark:text-[#f5f5f0] bg-[#f5f5f0] dark:bg-[#0c0c0c] checkout-container`}
    >
      <motion.div
        className="max-w-5xl mx-auto bg-white/50 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl p-8 md:p-12"
      >
        <h2 className="text-4xl font-extrabold text-center mb-10">
          Checkout
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Shipping & Payment */}
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-3 mb-6">
              <MapPin size={22} /> Shipping Details
            </h3>
            <div className="space-y-5">
              {/* Inputs */}
              {[
                { placeholder: "Full Name", value: name, setter: setName },
                { placeholder: "Mobile Number", value: mobile, setter: setMobile },
                { placeholder: "Email Address", value: email, setter: setEmail },
                {
                  placeholder: "Flat/House No., Building, Company, Apartment",
                  value: address,
                  setter: setAddress,
                },
                {
                  placeholder: "Area, Street, Sector, Village",
                  value: street,
                  setter: setStreet,
                },
                {
                  placeholder: "Landmark (Optional)",
                  value: landmark,
                  setter: setLandmark,
                },
              ].map((field, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent p-4 text-lg text-[#0c0c0c] dark:text-[#f5f5f0] focus:ring-2 focus:ring-gray-500 outline-none"
                />
              ))}

              <div className="grid grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Town / City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent p-4 text-lg text-[#0c0c0c] dark:text-[#f5f5f0] focus:ring-2 focus:ring-gray-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent p-4 text-lg text-[#0c0c0c] dark:text-[#f5f5f0] focus:ring-2 focus:ring-gray-500 outline-none"
                />
              </div>

              <input
                type="text"
                placeholder="Pincode / ZIP Code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-transparent p-4 text-lg text-[#0c0c0c] dark:text-[#f5f5f0] focus:ring-2 focus:ring-gray-500 outline-none"
              />

              <div className="flex gap-4 items-center">
                {["Home", "Work", "Other"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-300"
                  >
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
          <div className="bg-transparent rounded-3xl border border-black/10 dark:border-white/10 shadow-xl p-6">
            <h3 className="text-2xl font-semibold flex items-center gap-3 mb-6">
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
                  <p className="text-lg font-medium">
                    {item.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    ₹{item.price}/meter
                  </p>

                  {/* Suit Fabric Length */}
                  <div className="mt-2">
                    <label className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-1 block">
                      Fabric Length: {item.selectedLength || 1} m
                    </label>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-gray-700 dark:text-gray-300 font-medium text-sm">
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
                      className="w-16 rounded-lg border border-gray-300 dark:border-gray-600 text-center text-lg bg-white dark:bg-gray-800 text-[#0c0c0c] dark:text-[#f5f5f0]"
                    />
                  </div>

                  {/* Price Display */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Base: ₹{item.sizePricing && item.sizePricing[item.selectedLength] ? item.sizePricing[item.selectedLength] : (Number(item.price) * parseFloat(item.selectedLength || 1)).toFixed(2)} (x{quantities[idx]})
                  </p>
                </div>
              </div>
            ))}

            {ftDiscountAmount > 0 && (
              <div className="flex justify-between text-lg text-green-600 dark:text-green-400 mb-2 font-bold">
                <span>First-time Discount ({ftDiscountPercent}%)</span>
                <span>-₹{ftDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg text-gray-700 dark:text-gray-300 mb-2">
              <span>Subtotal After Discount</span>
              <span>₹{discountedSubtotal.toFixed(2)}</span>
            </div>
            
              <div className="flex justify-between text-lg text-gray-700 dark:text-gray-300 mb-2">
                <span>Shipping</span>
                <span>₹{shippingCharge}</span>
              </div>
              <div className="flex justify-between text-lg text-gray-700 dark:text-gray-300 mb-2">
                <span>GST ({Math.round(taxRate * 100)}%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-lg text-green-600 dark:text-green-400 mb-2 font-bold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="my-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-sm focus:ring-1 focus:ring-gray-500 outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs mt-1 ml-1">{couponError}</p>}
                <p className="text-xs text-gray-400 mt-2 ml-1">Try: WELCOME5, MAR10 (min ₹3999), MAR15 (min ₹5999)</p>
              </div>

              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm mt-4">
              <Lock size={16} /> Secure Payment Gateway
            </div>

            <motion.button
              onClick={handlePlaceOrder}
              className="w-full mt-8 bg-black text-white py-4 rounded-2xl text-xl font-semibold shadow-lg hover:bg-gray-800"
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
