import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
// Removed framer-motion
import { ArrowLeft } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Auto slideshow
  useEffect(() => {
    if (product?.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-12 w-12 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        Product not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 text-gray-900 relative overflow-hidden">
      <div className="relative z-10 px-6 md:px-20 py-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 mb-8 text-purple-600 hover:text-purple-800 text-lg font-semibold"
        >
          <ArrowLeft size={24} /> Back to Products
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 backdrop-blur-xl bg-white/50 border border-white/40 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="relative w-full h-[380px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                No Image Available
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-3">
                {product.images.map((_, index) => (
                  <span
                    key={index}
                    className={`w-4 h-4 rounded-full ${
                      index === currentImageIndex
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 scale-110"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-extrabold text-purple-800">{product.name}</h1>
            <p className="text-lg text-gray-700">{product.description}</p>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <p>
                <span className="font-semibold">Brand:</span> {product.brand}
              </p>
              <p>
                <span className="font-semibold">Category:</span> {product.category}
              </p>
              <p>
                <span className="font-semibold">Size:</span> {product.size || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Stock:</span> {product.stock}
              </p>
            </div>
            <p className="text-3xl font-bold text-pink-600">₹{product.price}</p>
            <div className="flex gap-6 mt-6">
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 px-6 rounded-xl text-lg font-semibold">
                Buy Now
              </button>
              <button className="flex-1 border border-purple-500 text-purple-700 py-4 px-6 rounded-xl text-lg font-semibold hover:bg-purple-100">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
