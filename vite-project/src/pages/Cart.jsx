import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { auth, db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

export default function Cart() {
  const { theme } = useContext(ThemeContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchCart(currentUser.uid);
      } else {
        setUser(null);
        setCartItems([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCart = async (uid) => {
    try {
      const cartRef = collection(db, "users", uid, "cart");
      const snapshot = await getDocs(cartRef);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "cart", id));
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + Number(item.price || 0), 0);
  };

  const formatCurrency = (num) => num.toLocaleString("en-IN");

  // ✅ THEME HANDLING
  const mode = theme || "light";
  const isDark = mode === "dark";

  const bgClass = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardClass = isDark
    ? "bg-neutral-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const buttonClass = isDark
    ? "px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition"
    : "px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition";
  const textSecondaryClass = isDark ? "text-gray-400" : "text-gray-500";

  const handleCheckout = () => {
    navigate("/checkout", { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
        <p className="text-lg">{isDark ? "Loading..." : "Loading your cart..."}</p>
      </div>
    );
  }

  if (!user || cartItems.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgClass} px-4`}>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-3xl font-bold mb-4 text-center ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          {user ? "Your Cart is Empty" : "Please log in to view your cart"}
        </motion.h2>
        <p className={`mb-6 text-center ${textSecondaryClass}`}>
          {user ? "Add items to your cart to see them here." : "Log in to start shopping!"}
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} px-4 py-12`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Your Cart
        </h1>
        <p className={`text-lg ${textSecondaryClass}`}>{cartItems.length} item(s)</p>
      </motion.div>

      {/* Cart Items as BOX PREVIEW */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cartItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl shadow-lg border flex flex-col ${cardClass}`}
          >
            <img
              src={item.images?.[0] || "https://via.placeholder.com/200"}
              alt={item.name}
              className="w-full h-40 rounded-lg object-cover mb-4"
            />
            <h2 className="font-semibold text-lg">{item.name}</h2>
            <p className={`text-sm mb-2 ${textSecondaryClass}`}>
              {item.brand || "Brand N/A"}
            </p>
            <p className="font-bold text-lg mb-4">
              ₹{formatCurrency(Number(item.price || 0))}
            </p>
            <button
              onClick={() => removeFromCart(item.id)}
              className="mt-auto text-red-500 hover:text-red-700 font-bold"
            >
              Remove
            </button>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <div
        className={`max-w-5xl mx-auto mt-10 p-6 rounded-2xl shadow-lg flex justify-between items-center border ${
          isDark ? "bg-neutral-900 border-gray-800 text-white" : "bg-white border-gray-200"
        }`}
      >
        <p className="text-xl font-bold">
          Total: ₹{formatCurrency(getTotal())} + TAXES
        </p>
        <button onClick={handleCheckout} className={buttonClass}>
          Checkout
        </button>
      </div>
    </div>
  );
}
