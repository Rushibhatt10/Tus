import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import axios from "axios";

const AdminPanel = () => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const correctPassword = "admin123"; // Change this securely later

  const [activeTab, setActiveTab] = useState("products"); // "products" or "users"

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState("");
  const [fit, setFit] = useState("");
  const [pattern, setPattern] = useState("");
  const [neck, setNeck] = useState("");
  const [sleeve, setSleeve] = useState("");
  const [discount, setDiscount] = useState("");
  const [availability, setAvailability] = useState("In Stock");
  const [sortBy, setSortBy] = useState("Newest");
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [occasion, setOccasion] = useState("");
  const [gender, setGender] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);

  const imgbbApiKey = "52848fd9eb0f7acc4f4fa3c5cd7ba2de";

  // ✅ Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

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
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uploadedUrls = await handleImageUpload();

    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        description,
        price,
        brand,
        size,
        color,
        category,
        fit,
        pattern,
        neck,
        sleeve,
        discount,
        availability,
        sortBy,
        material,
        careInstructions,
        occasion,
        gender,
        stock,
        images: uploadedUrls,
        createdAt: new Date(),
      });

      alert("✅ Product added successfully!");
      setProductName("");
      setDescription("");
      setPrice("");
      setBrand("");
      setSize("");
      setColor("");
      setCategory("");
      setFit("");
      setPattern("");
      setNeck("");
      setSleeve("");
      setDiscount("");
      setAvailability("In Stock");
      setSortBy("Newest");
      setMaterial("");
      setCareInstructions("");
      setOccasion("");
      setGender("");
      setStock("");
      setImages([]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // ✅ Handle password login
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (enteredPassword === correctPassword) {
      setIsAuthorized(true);
    } else {
      alert("❌ Incorrect Password!");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 p-6">
        <div className="w-full max-w-md bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/40">
          <h2 className="text-3xl font-extrabold text-purple-800 text-center mb-6">
            Admin Login
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Enter Admin Password
              </label>
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 p-6">
      <div className="w-full max-w-7xl bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/40">
        {/* ✅ Tab Buttons */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${
              activeTab === "products"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                : "bg-white text-purple-700 border border-purple-300 hover:bg-purple-50"
            }`}
            onClick={() => setActiveTab("products")}
          >
            Add Product
          </button>
          <button
            className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${
              activeTab === "users"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                : "bg-white text-purple-700 border border-purple-300 hover:bg-purple-50"
            }`}
            onClick={() => setActiveTab("users")}
          >
            View Users
          </button>
        </div>

        {/* ✅ Conditional Rendering */}
        {activeTab === "products" ? (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
          >
            <InputField label="Product Name" value={productName} onChange={setProductName} required />
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
                placeholder="Add detailed product description..."
                required
              />
            </div>
            <InputField label="Price (₹/meter)" type="number" value={price} onChange={setPrice} required />
            <InputField label="Brand" value={brand} onChange={setBrand} />
            <InputField label="Size" value={size} onChange={setSize} placeholder="e.g. S, M, L" />
            <InputField label="Color" value={color} onChange={setColor} />
            <InputField label="Category" value={category} onChange={setCategory} />
            <InputField label="Fit" value={fit} onChange={setFit} />
            <InputField label="Pattern" value={pattern} onChange={setPattern} />
            <InputField label="Neck" value={neck} onChange={setNeck} />
            <InputField label="Sleeve" value={sleeve} onChange={setSleeve} />
            <InputField label="Discount (%)" type="number" value={discount} onChange={setDiscount} />
            <InputField label="Material" value={material} onChange={setMaterial} />
            <InputField label="Care Instructions" value={careInstructions} onChange={setCareInstructions} />
            <InputField label="Occasion" value={occasion} onChange={setOccasion} />
            <InputField label="Gender" value={gender} onChange={setGender} />
            <InputField label="Stock Quantity" type="number" value={stock} onChange={setStock} />
            <SelectField label="Availability" value={availability} onChange={setAvailability} options={["In Stock", "Out of Stock"]} />
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Upload Images</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-600
                  hover:file:bg-purple-100 cursor-pointer"
              />
              {images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className={`col-span-1 md:col-span-2 py-4 rounded-xl text-lg font-bold text-white transition-all duration-200 transform
                ${loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 active:scale-95"
                }`}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Add Product"}
            </button>
          </form>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-purple-800 mb-6">All Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-lg">
                <thead>
                  <tr className="bg-purple-100 text-purple-800">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">UID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-purple-50">
                      <td className="py-3 px-4">{user.displayName || "No Name"}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Reusable Input Component
const InputField = ({ label, type = "text", value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
      placeholder={placeholder || ""}
      required={required}
    />
  </div>
);

// ✅ Reusable Select Component
const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
    >
      {options.map((option, idx) => (
        <option key={idx}>{option}</option>
      ))}
    </select>
  </div>
);

export default AdminPanel;
