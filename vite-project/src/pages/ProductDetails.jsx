import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const imageRef = useRef(null);

  // Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProduct(docSnap.data());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Auto slideshow
  useEffect(() => {
    if (product?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [product]);

  // Image zoom on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const offset = Math.min(Math.max((window.innerHeight - rect.top) / window.innerHeight, 0), 1);
        imageRef.current.style.transform = `scale(${1 + 0.2 * offset})`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBuyNow = () => {
    navigate("/checkout", { state: { product } });
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    try {
      const cartItemRef = doc(db, "users", user.uid, "cart", id);
      await setDoc(cartItemRef, { ...product, quantity: 1, addedAt: new Date() });
      alert("Added to cart successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <svg className="animate-spin h-12 w-12 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
    );

  if (!product)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg bg-white dark:bg-gray-900">
        Product not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
      <div className="relative z-10 px-6 md:px-20 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 mb-8 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 text-lg font-semibold transition"
        >
          <ArrowLeft size={24} /> Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700 rounded-3xl shadow-2xl p-8 md:p-12 transition-colors duration-500">
          {/* Image Section */}
          <div className="relative w-full h-[380px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            {product.images?.length > 0 ? (
              <img
                ref={imageRef}
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                No Image Available
              </div>
            )}

            {/* Slide Buttons */}
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 dark:bg-gray-700/70 p-2 rounded-full hover:bg-white dark:hover:bg-gray-600 transition"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/70 dark:bg-gray-700/70 p-2 rounded-full hover:bg-white dark:hover:bg-gray-600 transition"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
              </>
            )}

            {/* Dots */}
            {product.images?.length > 1 && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-3">
                {product.images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-4 h-4 rounded-full ${
                      idx === currentImageIndex
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 scale-110"
                        : "bg-white/50 dark:bg-gray-400"
                    } transition`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-extrabold text-purple-800 dark:text-purple-400">{product.name}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
              <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
  <p><span className="font-semibold">Price:</span> ₹{product.price}/meter</p>
  <p><span className="font-semibold">Brand:</span> {product.brand || "N/A"}</p>
  <p><span className="font-semibold">Fabric Type:</span> {product.fabricType || "N/A"}</p>
  <p><span className="font-semibold">Color:</span> {product.color || "N/A"}</p>
  <p><span className="font-semibold">Pattern:</span> {product.pattern || "N/A"}</p>
  <p><span className="font-semibold">Material Composition:</span> {product.material || "N/A"}</p>
  <p><span className="font-semibold">Care Instructions:</span> {product.careInstructions || "N/A"}</p>
  <p><span className="font-semibold">Occasion:</span> {product.occasion || "N/A"}</p>
  <p><span className="font-semibold">Length:</span> {product.length || "N/A"}</p>
  <p><span className="font-semibold">Width:</span> {product.width || "N/A"}</p>
  <p><span className="font-semibold">Weight:</span> {product.weight || "N/A"}</p>
  <p><span className="font-semibold">Stretch:</span> {product.stretch || "N/A"}</p>
  <p><span className="font-semibold">Availability:</span> {product.availability || "N/A"}</p>
  <p><span className="font-semibold">Stock Quantity:</span> {product.stock || 0}</p>
  <p><span className="font-semibold">Discount:</span> {product.discount ? `${product.discount}%` : "0%"}</p>
</div>

            </div>

            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              ₹{product.price}/meter
            </p>

            <div className="flex gap-6 mt-6 flex-wrap">
              <button
  onClick={() => navigate("/checkout", { state: { product } })}
  className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-lg text-lg transition"
>
  Buy Now
</button>


              <button
                onClick={handleAddToCart}
                className="flex-1 border border-purple-500 dark:border-purple-400 text-purple-700 dark:text-purple-300 py-4 px-6 rounded-xl text-lg font-semibold hover:bg-purple-100 dark:hover:bg-purple-700 transition"
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
