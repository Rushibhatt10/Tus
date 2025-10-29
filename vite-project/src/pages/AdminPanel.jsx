import React, { useEffect, useState, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
// Using a simple name/password check for admin access (Hardik / hardik@1234)
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const AdminPanel = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // States
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Auth states (admin accessed via name + password)
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Product form
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [pattern, setPattern] = useState("");
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [occasion, setOccasion] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [weight, setWeight] = useState("");
  const [stretch, setStretch] = useState("");
  const [availability, setAvailability] = useState("In Stock");
  const [discount, setDiscount] = useState("");
  const [collectionTag, setCollectionTag] = useState("");
  const [images, setImages] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [type, setType] = useState("SHIRT");
  const [isPantAsSuit, setIsPantAsSuit] = useState(false);
  const [isSuitAsPant, setIsSuitAsPant] = useState(false);

  // Correct size pricing based on requirements
  const sizeOptions = {
    "SHIRT": ["1.40 m", "1.60 m", "1.80 m", "2.00 m", "2.20 m", "2.50 m"],
    "SUIT": ["3.25 m", "3.50 m", "3.75 m", "4.00 m", "4.25 m"],
    "PANT": ["1.20 m", "1.30 m", "1.40 m", "1.50 m", "1.60 m"]
  };

  const [sizePricing, setSizePricing] = useState({
    SHIRT: { "1.40 m": "", "1.60 m": "", "1.80 m": "", "2.00 m": "", "2.20 m": "", "2.50 m": "" },
    SUIT: { "3.25": "", "3.50 m": "", "3.75 m": "", "4.00 m": "", "4.25 m": "" },
    PANT: { "1.20 m": "", "1.30 m": "", "1.40 m": "", "1.50 m": "", "1,60 m": "" }
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const imgbbApiKey = "52848fd9eb0f7acc4f4fa3c5cd7ba2de";

  // NOTE: Removed Firebase auth listener. Admin login is handled locally by matching
  // the provided name & password against hardcoded credentials below.

  // Real-time data fetching
  useEffect(() => {
    if (user) {
      // Products
      const productsUnsub = onSnapshot(collection(db, "products"), (snapshot) => {
        setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      // Users
      const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      // Orders
      const ordersUnsub = onSnapshot(collection(db, "orders"), (snapshot) => {
        setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      return () => {
        productsUnsub();
        usersUnsub();
        ordersUnsub();
      };
    }
  }, [user]);

  // Reset toggles when type changes
  useEffect(() => {
    setIsPantAsSuit(false);
    setIsSuitAsPant(false);
  }, [type]);

  // Auth handlers: simple local check
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");
    // Hardcoded credentials
    const ADMIN_NAME = "Hardik";
    const ADMIN_PASSWORD = "hardik@1234";

    if (adminName === ADMIN_NAME && adminPassword === ADMIN_PASSWORD) {
      setUser({ name: ADMIN_NAME, isAdmin: true });
      setToast({ show: true, message: "✅ Login successful!", type: "success" });
      // clear fields
      setAdminName("");
      setAdminPassword("");
    } else {
      setAuthError("Invalid name or password");
      setToast({ show: true, message: "❌ Login failed", type: "error" });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToast({ show: true, message: "Logged out successfully", type: "success" });
  };

  // Image Upload
  const handleImageUpload = async () => {
    setSubmitLoading(true);
    const urls = [];
    for (let i = 0; i < images.length; i++) {
      const formData = new FormData();
      formData.append("image", images[i]);
      try {
        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
          formData
        );
        urls.push(response.data.data.url);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
    setSubmitLoading(false);
    return urls;
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalMaterial = type === "SUIT" ? "PANTS" : material;
    const uploadedUrls = await handleImageUpload();

    await addDoc(collection(db, "products"), {
      name: productName,
      description,
      price,
      brand,
      color,
      fabricType,
      pattern,
      material: finalMaterial,
      careInstructions,
      occasion,
      length,
      width,
      weight,
      stretch,
      availability,
      discount,
      images: uploadedUrls,
      collectionTag,
      type,
      sizePricing: sizePricing[type],
      isPantAsSuit: type === "PANT" ? isPantAsSuit : false,
      isSuitAsPant: type === "SUIT" ? isSuitAsPant : false,
      createdAt: new Date(),
    });

    setToast({ show: true, message: "✅ Product added successfully!", type: "success" });

    // Reset form
    setProductName(""); setDescription(""); setPrice(""); setBrand(""); setColor("");
    setFabricType(""); setPattern(""); setMaterial(""); setCareInstructions(""); setOccasion("");
    setLength(""); setWidth(""); setWeight(""); setStretch(""); setAvailability("In Stock");
    setDiscount(""); setImages([]); setCollectionTag(""); setType("SHIRT");
    setIsPantAsSuit(false);
    setIsSuitAsPant(false);
    setSizePricing({
      SHIRT: { "1.40 m": "", "1.60 m": "", "1.80 m": "", "2.20 m": "" },
      SUIT: { "1.20 m": "", "1.30 m": "", "1.50 m": "", "2.25 m": "", "3.25 m": "" },
      PANT: { "1.20 m": "", "1.40 m": "", "1.60 m": "", "1.80 m": "", "2.0 m": "" }
    });
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteDoc(doc(db, "products", productToDelete.id));
      setToast({ show: true, message: "✅ Product deleted successfully!", type: "success" });
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const toggleAvailability = async (id, current) => {
    const newStatus = current === "In Stock" ? "Out of Stock" : "In Stock";
    await updateDoc(doc(db, "products", id), { availability: newStatus });
    setToast({ show: true, message: "✅ Availability updated!", type: "success" });
  };

  // Analytics calculations
  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const thisMonthOrders = orders.filter(o => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });
    return {
      totalRevenue,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalProducts: products.length,
      thisMonthOrders: thisMonthOrders.length,
      topProducts: products.slice(0, 5)
    };
  }, [orders, users, products]);

  // Group products by collectionTag
  const groupedProducts = useMemo(() => {
    const groups = {};
    products.forEach((p) => {
      const tag = p.collectionTag || "Others";
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(p);
    });
    return groups;
  }, [products]);

  // Show Toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-black" : "bg-white"}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-3xl shadow-2xl p-10 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
        >
          <h2 className={`text-3xl font-extrabold text-center mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Admin Login</h2>
          <p className={`text-center mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Manage your store efficiently</p>
          <form onSubmit={handleLogin} className="space-y-6">
            {authError && (
              <div className="bg-red-500/20 border border-red-500 text-red-600 px-4 py-3 rounded-xl">
                {authError}
              </div>
            )}
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Admin Name"
              className="w-full p-4 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 border-gray-300 bg-white/90 backdrop-blur-sm text-black"
              required
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-4 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 border-gray-300 bg-white/90 backdrop-blur-sm text-black"
              required
            />
            <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition shadow-lg">
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white font-semibold`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-6 border rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 px-6 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 min-h-screen sticky top-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
            <nav className="space-y-2">
              {[
                { id: "dashboard", label: "📊 Dashboard", icon: "📊" },
                { id: "products", label: "👕 Products", icon: "👕" },
                { id: "orders", label: "📦 Orders", icon: "📦" },
                { id: "users", label: "👥 Users", icon: "👥" },
                { id: "listing", label: "🏷️ Collections", icon: "🏷️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition ${
                    activeTab === tab.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={toggleTheme}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 mt-8 flex items-center gap-3"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {theme === "dark" ? " ☀️ Light Mode" : " 🌙 Dark Mode"}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
              >
                🚪 Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <h2 className="text-4xl font-extrabold mb-8">📊 Dashboard</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: `₹${dashboardStats.totalRevenue.toLocaleString()}`, color: "bg-green-500" },
                    { label: "Total Orders", value: dashboardStats.totalOrders, color: "bg-blue-500" },
                    { label: "Total Users", value: dashboardStats.totalUsers, color: "bg-purple-500" },
                    { label: "Total Products", value: dashboardStats.totalProducts, color: "bg-orange-500" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Additional Stats */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-4">📅 This Month Orders</h3>
                  <p className="text-4xl font-bold text-blue-600">{dashboardStats.thisMonthOrders}</p>
                </div>

                {/* Top Products */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold mb-4">🔥 Top Products</h3>
                  <div className="space-y-3">
                    {dashboardStats.topProducts.map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
                        <span className="text-2xl">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{product.type}</p>
                        </div>
                        <p className="font-bold">₹{product.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-8">
                <h2 className="text-4xl font-extrabold mb-6">Manage Products</h2>
                
                {/* Product Form */}
                <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Add New Product</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type Selection */}
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-2">Product Type *</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      >
                        <option value="SHIRT">👔 SHIRT</option>
                        <option value="SUIT">🧥 SUIT</option>
                        <option value="PANT">👖 PANT/TROUSERS</option>
                      </select>
                    </div>

                    {/* Size Pricing Options */}
                    <div className="col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-bold mb-3">📏 Size Pricing Options</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {sizeOptions[type].map(size => (
                          <div key={size} className="flex items-center gap-2">
                            <label className="w-24 text-sm">{size}:</label>
                            <input
                              type="number"
                              placeholder="₹"
                              value={sizePricing[type][size]}
                              onChange={(e) => {
                                const newPricing = { ...sizePricing };
                                newPricing[type][size] = e.target.value;
                                setSizePricing(newPricing);
                              }}
                              className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-800"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pant as Suit Toggle */}
                    {type === "PANT" && (
                      <div className="col-span-2 flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <label className="font-semibold">This Pant is same as Suit:</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPantAsSuit}
                            onChange={(e) => setIsPantAsSuit(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    )}

                    {/* Suit as Pant Toggle */}
                    {type === "SUIT" && (
                      <div className="col-span-2 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <label className="font-semibold">This Suit also shows in PANTS:</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSuitAsPant}
                            onChange={(e) => setIsSuitAsPant(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    )}

                    {/* Form Fields */}
                    <input type="text" placeholder="Product Name *" value={productName} onChange={(e) => setProductName(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    <input type="text" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <input type="number" placeholder="Price (₹) *" value={price} onChange={(e) => setPrice(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 col-span-2" rows={3}></textarea>
                    <input type="text" placeholder="Fabric Type" value={fabricType} onChange={(e) => setFabricType(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <input type="text" placeholder="Pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <input type="text" placeholder="Material" value={material} onChange={(e) => setMaterial(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <input type="text" placeholder="Occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    <input type="number" placeholder="Discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />

                    {/* Collection Tag */}
                    <select value={collectionTag} onChange={(e) => setCollectionTag(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 col-span-2">
                      <option value="">Select Collection</option>
                      <option value="Trending">Trending</option>
                      <option value="The Trends">The Trends</option>
                      <option value="Fab Seasonal Fabric">Fab Seasonal Fabric</option>
                      <option value="Elegant Kurtas">Elegant Kurtas</option>
                      <option value="Supa Suits">Supa Suits</option>
                      <option value="Simp Shirting">Simp Shirting</option>
                    </select>

                    {/* File Upload */}
                    <div className="col-span-2">
                      <input
                        id="imageUpload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="cursor-pointer block w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition border border-gray-300 dark:border-gray-600"
                      >
                        📷 Upload Images
                      </label>
                      <div className="flex gap-4 flex-wrap mt-4">
                        {images.map((file, i) => (
                          <div key={i} className="w-24 h-24 rounded-lg overflow-hidden border">
                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="col-span-2 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      {submitLoading ? "⏳ Uploading..." : "✅ Add Product"}
                    </button>
                  </div>
                </form>

                {/* Products List */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  <h3 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">Products List</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="p-4 text-left">Name</th>
                          <th className="p-4 text-left">Price</th>
                          <th className="p-4 text-left">Status</th>
                          <th className="p-4 text-left">Type</th>
                          <th className="p-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <td className="p-4 font-semibold">{p.name}</td>
                            <td className="p-4">₹{p.price}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${p.availability === "In Stock" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"}`}>
                                {p.availability}
                              </span>
                            </td>
                            <td className="p-4">{p.type}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toggleAvailability(p.id, p.availability)}
                                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold"
                                >
                                  ↻ Toggle
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(p)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-4xl font-extrabold mb-6">📦 Orders Management</h2>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  <h3 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">All Orders</h3>
                  <div className="overflow-x-auto">
                    <div className="p-6 space-y-4">
                      {orders.map((o) => (
                        <div key={o.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-lg">Order #{o.id.substring(0, 12)}...</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {o.createdAt?.toDate?.().toLocaleString() || "N/A"}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                              {o.status || "Pending"}
                            </span>
                          </div>
                          
                          {/* Customer Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <h5 className="font-semibold mb-2">Customer Information</h5>
                              <p className="text-sm">Name: {o.shippingDetails?.name || "N/A"}</p>
                              <p className="text-sm">Email: {o.email || o.shippingDetails?.email || "N/A"}</p>
                              <p className="text-sm">Phone: {o.shippingDetails?.mobile || "N/A"}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold mb-2">Shipping Address</h5>
                              <p className="text-sm">{o.shippingDetails?.address || ""}</p>
                              <p className="text-sm">{o.shippingDetails?.street || ""}</p>
                              <p className="text-sm">
                                {o.shippingDetails?.city}, {o.shippingDetails?.state} - {o.shippingDetails?.pincode}
                              </p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4">
                            <h5 className="font-semibold mb-2">Order Items</h5>
                            <div className="space-y-2">
                              {o.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Length: {item.selectedLength || "Standard"} | Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">₹{(item.subtotal || 0).toFixed(2)}</p>
                                    {item.discount > 0 && (
                                      <p className="text-xs text-green-600">Discount: -₹{item.discount.toFixed(2)}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Subtotal:</span>
                              <span>₹{(o.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {o.volumeDiscount > 0 && (
                              <div className="flex justify-between text-sm mb-2 text-green-600">
                                <span>Volume Discount ({o.volumeDiscountPercent || 0}%):</span>
                                <span>-₹{(o.volumeDiscount || 0).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm mb-2">
                              <span>Shipping:</span>
                              <span>₹{o.shipping || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>GST ({o.taxRate || 0}%):</span>
                              <span>₹{(o.tax || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <span>Total:</span>
                              <span className="text-green-600">₹{(o.total || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <h2 className="text-4xl font-extrabold mb-6">👥 Users Management</h2>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  <h3 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">All Users</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="p-4 text-left">Name</th>
                          <th className="p-4 text-left">Email</th>
                          <th className="p-4 text-left">UID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4">{u.displayName || "No Name"}</td>
                            <td className="p-4">{u.email}</td>
                            <td className="p-4 font-mono text-sm">{u.id.substring(0, 16)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Collections Listing Tab */}
            {activeTab === "listing" && (
              <div className="space-y-6">
                <h2 className="text-4xl font-extrabold mb-6">🏷️ Collections Preview</h2>
                {Object.keys(groupedProducts).map((section) => (
                  <div key={section} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="text-2xl font-bold mb-6">{section}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {groupedProducts[section].map((p) => (
                        <div key={p.id} className="border rounded-xl p-4 bg-white dark:bg-gray-900 hover:shadow-lg transition">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                          )}
                          <h4 className="font-bold">{p.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{p.brand}</p>
                          <p className="font-bold text-lg mt-2">₹{p.price}</p>
                          <p className="text-xs text-gray-500">{p.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
