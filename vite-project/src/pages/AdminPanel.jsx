import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import axios from "axios";

const AdminPanel = () => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const correctPassword = "Rushi"; // Hardcoded password

  const [activeTab, setActiveTab] = useState("products");

  // States
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

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
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const imgbbApiKey = "52848fd9eb0f7acc4f4fa3c5cd7ba2de";

  // Fetch data
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    setUsers(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };
  const fetchOrders = async () => {
    const querySnapshot = await getDocs(collection(db, "orders"));
    setOrders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchProducts();
      fetchUsers();
      fetchOrders();
    }
  }, [isAuthorized]);

  // Image Upload
  const handleImageUpload = async () => {
    setLoading(true);
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
    setLoading(false);
    return urls;
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uploadedUrls = await handleImageUpload();
    await addDoc(collection(db, "products"), {
      name: productName,
      description,
      price,
      brand,
      color,
      fabricType,
      pattern,
      material,
      careInstructions,
      occasion,
      length,
      width,
      weight,
      stretch,
      availability,
      discount,
      stock,
      images: uploadedUrls,
      createdAt: new Date(),
    });
    alert("✅ Product added!");
    setProductName(""); setDescription(""); setPrice(""); setBrand(""); setColor("");
    setFabricType(""); setPattern(""); setMaterial(""); setCareInstructions(""); setOccasion("");
    setLength(""); setWidth(""); setWeight(""); setStretch(""); setAvailability("In Stock");
    setDiscount(""); setStock(""); setImages([]);
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const toggleAvailability = async (id, current) => {
    const newStatus = current === "In Stock" ? "Out of Stock" : "In Stock";
    await updateDoc(doc(db, "products", id), { availability: newStatus });
    fetchProducts();
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (enteredPassword === correctPassword) setIsAuthorized(true);
    else alert("❌ Incorrect Password!");
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 p-6">
        <div className="w-full max-w-md bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/40">
          <h2 className="text-3xl font-extrabold text-purple-800 text-center mb-6">Admin Login</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full p-4 border rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
              required
            />
            <button type="submit" className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-10 text-gray-900 dark:text-white">
      <motion.div
        className="max-w-6xl mx-auto backdrop-blur-xl bg-white/40 dark:bg-gray-800/50 border border-white/50 dark:border-gray-700 rounded-3xl shadow-2xl p-8 md:p-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tabs */}
        <div className="flex gap-4 justify-center mb-10">
          {["products", "users", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <h2 className="text-3xl font-extrabold text-purple-800 dark:text-purple-400 mb-6">
              Manage Products
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Fabric Type" value={fabricType} onChange={(e) => setFabricType(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Material" value={material} onChange={(e) => setMaterial(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Care Instructions" value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Length" value={length} onChange={(e) => setLength(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Width" value={width} onChange={(e) => setWidth(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="text" placeholder="Stretch" value={stretch} onChange={(e) => setStretch(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="number" placeholder="Discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60" />
              <input type="file" multiple onChange={handleFileChange} className="col-span-2" />
              <button type="submit" className="col-span-2 bg-purple-600 text-white py-3 rounded-xl">
                {loading ? "Uploading..." : "Add Product"}
              </button>
            </form>

            {/* Product Table */}
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t bg-white/70 dark:bg-gray-700/40">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">₹{p.price}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">{p.availability}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => toggleAvailability(p.id, p.availability)} className="px-3 py-1 bg-yellow-500 text-white rounded-lg">Toggle</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            <h2 className="text-3xl font-extrabold text-purple-800 dark:text-purple-400 mb-6">All Users</h2>
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">UID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t bg-white/70 dark:bg-gray-700/40">
                    <td className="p-3">{u.displayName || "No Name"}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            <h2 className="text-3xl font-extrabold text-purple-800 dark:text-purple-400 mb-6">All Orders</h2>
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t bg-white/70 dark:bg-gray-700/40">
                    <td className="p-3">{o.id}</td>
                    <td className="p-3">{o.userName || "Unknown"}</td>
                    <td className="p-3">{o.email}</td>
                    <td className="p-3">{o.phone}</td>
                    <td className="p-3">{o.address}, {o.city}, {o.state} - {o.pincode}</td>
                    <td className="p-3">₹{o.total}</td>
                    <td className="p-3">{o.status || "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPanel;
