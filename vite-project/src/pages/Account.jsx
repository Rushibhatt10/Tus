import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import {
  LogOut,
  User,
  Mail,
  ShoppingCart,
  MapPin,
  Package,
  ArrowLeft, // ✅ Import for Back button
} from "lucide-react";

export default function Account() {
  const [user, setUser] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch user and addresses
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAddresses(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAddresses = async (uid) => {
    const addressRef = collection(db, "users", uid, "addresses");
    const snapshot = await getDocs(addressRef);
    setAddresses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleAddAddress = async () => {
    if (!address.trim()) return;
    const uid = user.uid;
    const addressRef = collection(db, "users", uid, "addresses");
    await addDoc(addressRef, { address });
    setAddress("");
    setShowAddressForm(false);
    fetchAddresses(uid);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-purple-200">
        <div className="bg-white/10 backdrop-blur-lg border border-purple-400 rounded-2xl shadow-xl p-8 w-full max-w-md text-purple-900">
          <h1 className="text-3xl font-extrabold text-center mb-4">
            Your Account
          </h1>
          <p className="text-purple-600 text-center mb-6">
            Login or create a new account to continue
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold rounded-xl shadow transition-all hover:scale-105"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="w-full px-4 py-3 bg-white border border-purple-400 text-purple-700 font-semibold rounded-xl shadow hover:bg-purple-50 transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 via-white to-purple-200 py-10">
      <div className="w-full max-w-2xl px-6">
        {/* ✅ Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 mb-8 text-purple-600 hover:text-purple-800 text-lg font-semibold"
        >
          <ArrowLeft size={24} /> Back to Products
        </button>

        {/* Account Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-purple-400 rounded-2xl shadow-2xl p-8 text-purple-900">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-purple-100 rounded-full p-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border border-purple-300"
                />
              ) : (
                <User className="w-12 h-12 text-purple-500" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user.displayName || "User"}
              </h1>
              <p className="flex items-center text-purple-600">
                <Mail className="w-4 h-4 mr-1" /> {user.email}
              </p>
            </div>
          </div>

          {/* Cart Button */}
          <div className="w-full flex items-center justify-center gap-4 px-4 py-3">
            <button
              onClick={() => navigate("/cart")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold rounded-xl shadow transition hover:scale-105"
            >
              <ShoppingCart /> Cart
            </button>
          </div>

          {/* Profile Options */}
          <div className="space-y-3">
            {/* Manage Addresses */}
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="w-full flex justify-between items-center px-4 py-3 bg-white/20 border border-purple-200 rounded-xl hover:bg-purple-50 transition"
            >
              <span className="flex items-center gap-2">
                <MapPin /> Manage Addresses
              </span>
            </button>

            {/* Address Form */}
            {showAddressForm && (
              <div className="p-4 bg-white rounded-xl mt-2 space-y-3">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddAddress}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                >
                  Save Address
                </button>

                {/* Display Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h3 className="font-semibold text-purple-700">Saved Addresses:</h3>
                    {addresses.map((addr) => (
                      <p key={addr.id} className="bg-purple-50 p-2 rounded-lg border">
                        {addr.address}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order History */}
            <button className="w-full flex justify-between items-center px-4 py-3 bg-white/20 border border-purple-200 rounded-xl hover:bg-purple-50 transition">
              <span className="flex items-center gap-2">
                <Package /> Order History
              </span>
            </button>
          </div>

          {/* Logout */}
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow transition"
            >
              <LogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
