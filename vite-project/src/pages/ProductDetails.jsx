import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);

  // ✅ Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
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

  // ✅ Auto slideshow
  useEffect(() => {
    if (product?.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [product]);

  // ✅ Buy now
  const handleBuyNow = () => {
    navigate("/checkout", { state: { product } });
  };

  // ✅ Add to cart
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      const cartItemRef = doc(db, "users", user.uid, "cart", id);
      await setDoc(cartItemRef, {
        ...product,
        quantity: 1,
        addedAt: new Date(),
      });
      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-black">
        <svg
          className="animate-spin h-12 w-12 text-black dark:text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
      <div className="px-6 md:px-20 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 mb-8 text-black dark:text-white hover:opacity-80 text-lg font-semibold transition"
        >
          <ArrowLeft size={24} /> Back to Products
        </button>

        {/* Product Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border border-black dark:border-white rounded-3xl shadow-2xl p-8 md:p-12 bg-white dark:bg-black">
          {/* Product Image Section */}
          <div className="relative w-full h-[380px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
                No Image Available
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <span
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentImageIndex
                        ? "bg-black dark:bg-white"
                        : "bg-gray-400 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-extrabold">{product.name}</h1>
            <p className="text-lg">{product.description}</p>

            {/* Product fields */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><span className="font-semibold">Price:</span> ₹{product.price}/meter</p>
              <p><span className="font-semibold">Brand:</span> {product.brand || "N/A"}</p>
              <p><span className="font-semibold">Size:</span> {product.size || "N/A"}</p>
              <p><span className="font-semibold">Color:</span> {product.color || "N/A"}</p>
              <p><span className="font-semibold">Category:</span> {product.category || "N/A"}</p>
              <p><span className="font-semibold">Fit:</span> {product.fit || "N/A"}</p>
              <p><span className="font-semibold">Pattern:</span> {product.pattern || "N/A"}</p>
              <p><span className="font-semibold">Neck:</span> {product.neck || "N/A"}</p>
              <p><span className="font-semibold">Sleeve:</span> {product.sleeve || "N/A"}</p>
              <p><span className="font-semibold">Discount:</span> {product.discount ? `${product.discount}%` : "0%"}</p>
              <p><span className="font-semibold">Material:</span> {product.material || "N/A"}</p>
              <p><span className="font-semibold">Care:</span> {product.careInstructions || "N/A"}</p>
              <p><span className="font-semibold">Occasion:</span> {product.occasion || "N/A"}</p>
              <p><span className="font-semibold">Gender:</span> {product.gender || "N/A"}</p>
              <p><span className="font-semibold">Stock:</span> {product.stock || 0}</p>
              <p><span className="font-semibold">Availability:</span> {product.availability || "N/A"}</p>
            </div>

            {/* Price */}
            <p className="text-3xl font-bold">₹{product.price}/meter</p>

            {/* Buttons */}
            <div className="flex gap-6 mt-6">
              <button
                onClick={handleBuyNow}
                className="bg-black dark:bg-white text-white dark:text-black py-3 px-6 rounded-lg text-lg font-semibold shadow-lg hover:opacity-80 transition"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 border border-black dark:border-white text-black dark:text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
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
