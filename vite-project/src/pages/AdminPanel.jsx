import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";

const AdminPanel = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState(""); // ✅ New field
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
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const imgbbApiKey = "52848fd9eb0f7acc4f4fa3c5cd7ba2de";

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
      setImages([]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/40">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-purple-800">
          Add New Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
        >
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. Stylish Cotton Shirt"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="Add detailed product description..."
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Price (₹/meter)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. 499"
              required
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Size
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. S, M, L"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. Red, Blue"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. T-Shirt, Fabric"
            />
          </div>

          {/* Fit */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Fit
            </label>
            <input
              type="text"
              value={fit}
              onChange={(e) => setFit(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. Slim, Regular"
            />
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Pattern
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. Solid, Printed"
            />
          </div>

          {/* Neck */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Neck
            </label>
            <input
              type="text"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. Round, V-Neck"
            />
          </div>

          {/* Sleeve */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Sleeve
            </label>
            <input
              type="text"
              value={sleeve}
              onChange={(e) => setSleeve(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. Half, Full"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              placeholder="e.g. 10"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
            >
              <option>In Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              Upload Images
            </label>
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
              ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 active:scale-95"
              }`}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
