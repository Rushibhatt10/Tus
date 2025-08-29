import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";

const AdminPanel = () => {
  const [productName, setProductName] = useState("");
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
  const [imageUrls, setImageUrls] = useState([]);
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

    setImageUrls(urls);
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

      alert("Product added successfully!");
      setProductName("");
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
      setImageUrls([]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="min-h-screen pt-22 bg-gradient-to-br from-rose-100 to-red-200 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 duration-300">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-gray-900">
          Admin Panel
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Price (₹)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. 499"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. S, M, L"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. Red, Blue"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. T-Shirt, Jeans"
            />
          </div>

          {/* Fit */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Fit</label>
            <input
              type="text"
              value={fit}
              onChange={(e) => setFit(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. Slim, Regular"
            />
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Pattern</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. Solid, Printed"
            />
          </div>

          {/* Neck */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Neck</label>
            <input
              type="text"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. Round, V-Neck"
            />
          </div>

          {/* Sleeve */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Sleeve</label>
            <input
              type="text"
              value={sleeve}
              onChange={(e) => setSleeve(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. Half, Full"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Discount</label>
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
              placeholder="e.g. 10%"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
            >
              <option>In Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {/* Images Upload */}
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
                file:bg-red-50 file:text-red-600
                hover:file:bg-red-100 cursor-pointer"
            />
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
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
              ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Add Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;