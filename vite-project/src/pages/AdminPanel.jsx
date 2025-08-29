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
    <div className="min-h-screen bg-red-300 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-900">
          Admin Panel
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block font-semibold mb-2">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block font-semibold mb-2">Price</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. 499 or 499-999"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block font-semibold mb-2">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block font-semibold mb-2">Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. S, M, L, XL"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block font-semibold mb-2">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Red, Blue"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold mb-2">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. T-Shirt, Jeans"
            />
          </div>

          {/* Fit */}
          <div>
            <label className="block font-semibold mb-2">Fit</label>
            <input
              type="text"
              value={fit}
              onChange={(e) => setFit(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Slim, Regular"
            />
          </div>

          {/* Pattern */}
          <div>
            <label className="block font-semibold mb-2">Pattern</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Solid, Printed"
            />
          </div>

          {/* Neck */}
          <div>
            <label className="block font-semibold mb-2">Neck</label>
            <input
              type="text"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Round, V-Neck"
            />
          </div>

          {/* Sleeve */}
          <div>
            <label className="block font-semibold mb-2">Sleeve</label>
            <input
              type="text"
              value={sleeve}
              onChange={(e) => setSleeve(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Half, Full"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block font-semibold mb-2">Discount</label>
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
              placeholder="e.g. 10%"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block font-semibold mb-2">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
            >
              <option>In Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-semibold mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400"
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {/* Images Upload */}
          <div className="col-span-2">
            <label className="block font-semibold mb-2">Upload Images</label>
            <input
              type="file"
              multiple
              onChange={(e) => setImages([...e.target.files])}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="col-span-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-lg transition-all"
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
