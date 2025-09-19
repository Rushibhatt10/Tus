import React, { useEffect, useState, useMemo } from "react";
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
  const [collectionTag, setCollectionTag] = useState(""); 
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("SHIRT"); // New field
  
  // Size pricing options
  const [sizePricing, setSizePricing] = useState({
    "SHIRT": {
      "1.2 Meters": "",
      "1.3 Meters": "",
      "1.5 Meters": "",
      "2.25 Meters": "",
      "3.25 Meters": ""
    },
    "SUIT": {
      "1.49 Meters": "",
      "1.60 Meters": "",
      "1.80 Meters": "",
      "2.25 Meters": "",
      "1.30 Meters": ""
    },
    "PANT": {
      "1.2 Meters": "",
      "1.4 Meters": "",
      "1.6 Meters": "",
      "1.8 Meters": "",
      "2.0 Meters": ""
    }
  });

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

    // If type is SUIT, automatically set material to PANTS
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
      stock,
      images: uploadedUrls,
      collectionTag, 
      type, // save type in Firestore
      sizePricing: sizePricing[type], // Save size pricing options
      createdAt: new Date(),
    });
    alert("✅ Product added!");
    
    // Reset form
    setProductName(""); setDescription(""); setPrice(""); setBrand(""); setColor("");
    setFabricType(""); setPattern(""); setMaterial(""); setCareInstructions(""); setOccasion("");
    setLength(""); setWidth(""); setWeight(""); setStretch(""); setAvailability("In Stock");
    setDiscount(""); setStock(""); setImages([]); setCollectionTag(""); setType("SHIRT");
    // Reset size pricing
    setSizePricing({
      "SHIRT": {
        "1.2 Meters": "",
        "1.3 Meters": "",
        "1.5 Meters": "",
        "2.25 Meters": "",
        "3.25 Meters": ""
      },
      "SUIT": {
        "1.49 Meters": "",
        "1.60 Meters": "",
        "1.80 Meters": "",
        "2.25 Meters": "",
        "1.30 Meters": ""
      },
      "PANT": {
        "1.2 Meters": "",
        "1.4 Meters": "",
        "1.6 Meters": "",
        "1.8 Meters": "",
        "2.0 Meters": ""
      }
    });

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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-6">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-10 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-extrabold text-center mb-6">Admin Login</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full p-4 border rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-400 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              required
            />
            <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 py-10 text-gray-900 dark:text-white">
      <motion.div
        className="max-w-6xl mx-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-8 md:p-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tabs */}
        <div className="flex gap-4 justify-center mb-10">
          {["products", "users", "orders", "listing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                activeTab === tab
                  ? "bg-black text-white"
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
            <h2 className="text-3xl font-extrabold mb-6">
              Manage Products
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              
              {/* TYPE Dropdown */}
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)} 
                className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60 col-span-2"
              >
                <option value="SHIRT">SHIRT</option>
                <option value="SUIT">SUIT</option>
                <option value="PANT">PANT/TROUSERS</option>
              </select>

              {/* Size Pricing Options */}
              <div className="col-span-2 border rounded-xl p-4 bg-white/60 dark:bg-gray-700/60 mb-4">
                <h3 className="font-bold mb-3">Size Pricing Options</h3>
                <div className="grid grid-cols-2 gap-3">
                  {type === "SHIRT" && 
                    Object.keys(sizePricing.SHIRT).map(size => (
                      <div key={size} className="flex items-center gap-2">
                        <label className="w-1/2">{size}:</label>
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={sizePricing.SHIRT[size]} 
                          onChange={(e) => {
                            const newPricing = {...sizePricing};
                            newPricing.SHIRT[size] = e.target.value;
                            setSizePricing(newPricing);
                          }}
                          className="w-1/2 p-2 border rounded"
                        />
                      </div>
                    ))
                  }
                  {type === "SUIT" && 
                    Object.keys(sizePricing.SUIT).map(size => (
                      <div key={size} className="flex items-center gap-2">
                        <label className="w-1/2">{size}:</label>
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={sizePricing.SUIT[size]} 
                          onChange={(e) => {
                            const newPricing = {...sizePricing};
                            newPricing.SUIT[size] = e.target.value;
                            setSizePricing(newPricing);
                          }}
                          className="w-1/2 p-2 border rounded"
                        />
                      </div>
                    ))
                  }
                  {type === "PANT" && 
                    Object.keys(sizePricing.PANT).map(size => (
                      <div key={size} className="flex items-center gap-2">
                        <label className="w-1/2">{size}:</label>
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={sizePricing.PANT[size]} 
                          onChange={(e) => {
                            const newPricing = {...sizePricing};
                            newPricing.PANT[size] = e.target.value;
                            setSizePricing(newPricing);
                          }}
                          className="w-1/2 p-2 border rounded"
                        />
                      </div>
                    ))
                  }
                </div>
              </div>

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

              {/* New dropdown for section */}
              <select value={collectionTag} onChange={(e) => setCollectionTag(e.target.value)} className="rounded-xl border p-4 bg-white/60 dark:bg-gray-700/60 col-span-2">
                <option value="">Select Section</option>
                <option value="Trending">Trending</option>
                <option value="The Trends">The Trends</option>
                <option value="Fab Seasonal Fabric">Fab Seasonal Fabric</option>
                <option value="Elegant Kurtas">Elegant Kurtas</option>
                <option value="Supa Suits">Supa Suits</option>
                <option value="Simp Shirting">Simp Shirting</option>
              </select>

              {/* Hidden file input */}
              <input
                id="imageUpload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Custom Button */}
              <label
                htmlFor="imageUpload"
                className="cursor-pointer col-span-2 bg-black text-white px-4 py-3 rounded-xl text-center font-semibold hover:bg-gray-800 transition"
              >
                + Add Images
              </label>

              {/* Preview selected images */}
              <div className="flex gap-4 flex-wrap col-span-2 mt-2">
                {images.map((file, i) => (
                  <div key={i} className="w-24 h-24 rounded-lg overflow-hidden border">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <button type="submit" className="col-span-2 bg-black text-white py-3 rounded-xl hover:bg-gray-800">
                {loading ? "Uploading..." : "Add Product"}
              </button>
            </form>

            {/* Product Table */}
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Type</th>
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
                    <td className="p-3">{p.collectionTag || "—"}</td>
                    <td className="p-3">{p.type}</td>
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
            <h2 className="text-3xl font-extrabold mb-6">All Users</h2>
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-black text-white">
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
            <h2 className="text-3xl font-extrabold mb-6">All Orders</h2>
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-black text-white">
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

        {/* Listing Tab */}
        {activeTab === "listing" && (
          <>
            <h2 className="text-3xl font-extrabold mb-6">Product Listing</h2>
            {Object.keys(groupedProducts).map((section) => (
              <div key={section} className="mb-10">
                <h3 className="text-2xl font-bold mb-4">{section}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {groupedProducts[section].map((p) => (
                    <div key={p.id} className="border rounded-xl p-4 bg-white/70 dark:bg-gray-700/40">
                      <h4 className="font-bold">{p.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300">₹{p.price}</p>
                      <p className="text-sm">{p.availability}</p>
                      <p className="text-sm font-semibold">{p.type}</p>
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover rounded-lg mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPanel;
