import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowLeft, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [zoomedOpen, setZoomedOpen] = useState(false);

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

  // Navigation helpers
  const goPrev = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };
  const goNext = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

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
      <div className="flex justify-center items-center h-screen bg-[#f5f5f0] dark:bg-[#0c0c0c]">
        <svg
          className="animate-spin h-12 w-12 text-[#0c0c0c] dark:text-[#f5f5f0]"
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
    <div className="min-h-screen transition-colors duration-500 bg-[#f5f5f0] dark:bg-[#0c0c0c] text-[#0c0c0c] dark:text-[#f5f5f0]">
      <div className="px-6 md:px-20 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 mb-8 text-black dark:text-white hover:opacity-80 text-lg font-semibold transition"
        >
          <ArrowLeft size={24} /> Back to Products
        </button>

        {/* Product Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl p-5 md:p-12 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          {/* Product Image Section */}
          <div className="relative w-full flex flex-col gap-4">
            {/* Main Image */}
            <div
              className="relative w-full h-[380px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl cursor-zoom-in group"
              onClick={() => setZoomedOpen(true)}
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
                  No Image Available
                </div>
              )}
              {/* Zoom hint */}
              <div className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
                <ZoomIn size={18} />
              </div>
              {/* Prev/Next Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      idx === currentImageIndex
                        ? "border-black dark:border-white scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lightbox / Zoom Modal */}
          {zoomedOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setZoomedOpen(false)}
            >
              <button
                className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
                onClick={() => setZoomedOpen(false)}
              >
                <X size={24} />
              </button>
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Product Details Section */}
          <div className="flex flex-col justify-center space-y-5 md:space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">{product.name}</h1>
            <p className="text-base md:text-lg">{product.description}</p>

            {/* Product fields */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><span className="font-semibold">Brand:</span> {product.brand || "N/A"}</p>
              <p><span className="font-semibold">Color:</span> {product.color || "N/A"}</p>
              <p><span className="font-semibold">Pattern:</span> {product.pattern || "N/A"}</p>
              <p><span className="font-semibold">Material:</span> {product.material || "N/A"}</p>
              <p><span className="font-semibold">Occasion:</span> {product.occasion || "N/A"}</p>
              <p><span className="font-semibold">Discount:</span> {product.discount ? `${product.discount}%` : "0%"}</p>
              <p><span className="font-semibold">Availability:</span> {product.availability || "N/A"}</p>
            </div>

            {/* Per-Meter Pricing Table */}
            {product.sizePricing && Object.keys(product.sizePricing).length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold opacity-60 mb-3">Pricing (per meter)</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.sizePricing).map(([length, price]) =>
                    price ? (
                      <div
                        key={length}
                        className="flex justify-between items-center px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-medium"
                      >
                        <span className="opacity-70">{length}</span>
                        <span className="font-bold text-base">₹{price}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-6 mt-4 md:mt-6">
              <button
                onClick={handleBuyNow}
                className="bg-black dark:bg-white text-white dark:text-black py-3 px-6 rounded-lg text-lg font-semibold shadow-lg hover:opacity-80 transition w-full sm:w-auto"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="border border-black dark:border-white text-black dark:text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full sm:flex-1"
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
