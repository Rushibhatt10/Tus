import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar/navbar";
import { Trash2 } from "lucide-react";
import { auth, db } from "../firebase"; // ✅ Your Firebase setup
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchCart(currentUser.uid);
      } else {
        setUser(null);
        setCartItems([]);
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
    return cartItems.reduce((total, item) => total + (item.price || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <p className="text-gray-600 text-lg">Loading your cart...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-gray-700 mb-4"
          >
            Please log in to view your cart
          </motion.h2>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-gray-700 mb-4"
          >
            Your Cart is Empty
          </motion.h2>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-purple-800 mb-4">
            Your Cart
          </h1>
          <p className="text-xl text-gray-700">{cartItems.length} items</p>
        </motion.div>

        {/* Cart Items */}
        <div className="space-y-6">
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.images && item.images.length > 0
                      ? item.images[0]
                      : "https://via.placeholder.com/100"
                  }
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">
                    {item.name}
                  </h2>
                  <p className="text-gray-500">{item.brand}</p>
                  <p className="text-purple-600 font-bold text-lg">
                    ₹{item.price}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={22} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center">
          <p className="text-xl font-bold text-gray-800">
            Total: ₹{getTotal()}
          </p>
          <button
            onClick={() => alert("Proceeding to Checkout...")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            Checkout
          </button>
        </div>
      </main>
    </div>
  );
}
