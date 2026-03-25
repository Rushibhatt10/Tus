import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { ArrowLeft, ChevronLeft, ChevronRight, X, ZoomIn, Info } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [zoomedOpen, setZoomedOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);
  const [selectedLength, setSelectedLength] = useState(null);
  const [customLength, setCustomLength] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

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

  // Keep pricing settings (global discount etc.) in sync
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  // Navigation helpers
  const goPrev = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };
  const goNext = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const getSelectedLengthMeta = () => {
    if (isCustomMode) {
      const meters = parseFloat(customLength);
      if (!Number.isFinite(meters) || meters <= 0) return null;
      return { label: `${meters} m`, meters };
    }

    if (selectedLength) {
      const meters = parseFloat(selectedLength);
      if (!Number.isFinite(meters) || meters <= 0) return null;
      return { label: selectedLength, meters };
    }

    return null;
  };

  const buildSelectedProduct = () => {
    const selected = getSelectedLengthMeta();
    if (!selected) return null;

    const sizePrice = product?.sizePricing?.[selected.label];
    const selectedUnitPrice = Number.isFinite(Number(sizePrice))
      ? Number(sizePrice)
      : Number(product?.price || 0) * selected.meters;

    return {
      ...product,
      selectedLength: selected.label,
      selectedLengthMeters: selected.meters,
      selectedUnitPrice,
    };
  };

  // ✅ Buy now
  const handleBuyNow = () => {
    const selectedProduct = buildSelectedProduct();
    if (!selectedProduct) {
      alert("Please select a fabric length first.");
      return;
    }
    navigate("/checkout", { state: { product: selectedProduct } });
  };

  // ✅ Add to cart
  const handleAddToCart = async () => {
    const selectedProduct = buildSelectedProduct();
    if (!selectedProduct) {
      alert("Please select a fabric length first.");
      return;
    }
    if (!user) {
      alert("Please login to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      const safeLengthKey = (selectedProduct.selectedLength || "default")
        .replace(/\s+/g, "")
        .replace(/[^0-9.a-zA-Z_-]/g, "");
      const cartItemRef = doc(db, "users", user.uid, "cart", `${id}_${safeLengthKey}`);
      await setDoc(cartItemRef, {
        ...selectedProduct,
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

            {/* Dynamic Pricing Logic */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold opacity-60 text-gray-500">Base Price</p>
                  <p className="text-xl font-medium">₹{product.price} <span className="text-sm">/ meter</span></p>
                </div>
                {product.discount > 0 && (
                  <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {product.discount}% OFF
                  </div>
                )}
                {siteSettings?.globalDiscountEnabled && siteSettings.globalDiscountPercent > 0 && !product.discount && (
                  <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {siteSettings.globalDiscountPercent}% GLOBAL OFF
                  </div>
                )}
              </div>

              {/* Length Selection */}
              <div className="space-y-3">
                <p className="font-semibold">Select Fabric Length</p>
                
                {product.availableLengths && Object.keys(product.availableLengths).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(product.availableLengths).map(([len, inStock]) => {
                      const pVal = (product.sizePricing && product.sizePricing[len]) ? Number(product.sizePricing[len]) : Math.round(Number(product.price) * parseFloat(len));
                      return (
                      <button
                        key={len}
                        disabled={!inStock}
                        onClick={() => {
                          setIsCustomMode(false);
                          setSelectedLength(len);
                          setCustomLength("");
                        }}
                        className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition ${
                          !inStock
                            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                            : !isCustomMode && selectedLength === len
                              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md transform scale-105"
                              : "bg-transparent border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white"
                        }`}
                      >
                        <span className="font-semibold text-sm sm:text-base">{len}</span>
                        {inStock ? (
                          <span className="text-sm font-bold mt-1 opacity-80">₹{pVal}</span>
                        ) : (
                          <span className="text-xs opacity-60 mt-1">Out of Stock</span>
                        )}
                      </button>
                    )})}
                  </div>
                )}

                {product.allowCustomLength !== false && (
                  <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="radio"
                        checked={isCustomMode}
                        onChange={() => {
                          setIsCustomMode(true);
                          setSelectedLength(null);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold text-sm">Enter Custom Length (m)</span>
                    </label>
                    {isCustomMode && (
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="20"
                          value={customLength}
                          onChange={(e) => setCustomLength(e.target.value)}
                          placeholder="e.g. 2.5"
                          className="w-full sm:w-1/2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                        <span className="text-sm font-medium opacity-70">meters</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Real-time Calculation */}
              {((!isCustomMode && selectedLength) || (isCustomMode && customLength && parseFloat(customLength) > 0)) && (
                <div className="mt-6 p-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="opacity-80 text-sm">Selected Length:</span>
                    <span className="font-semibold">{isCustomMode ? parseFloat(customLength) : parseFloat(selectedLength)} m</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="opacity-80 text-sm">Price per meter:</span>
                    <span className="font-semibold">₹{product.price}</span>
                  </div>
                  
                  {(() => {
                    const basePrice = Number(product.price);
                    const prodDiscount = Number(product.discount || 0);
                    const globDiscount = siteSettings?.globalDiscountEnabled ? Number(siteSettings?.globalDiscountPercent || 0) : 0;
                    const discountPercent = Math.max(prodDiscount, globDiscount);
                    
                    const len = isCustomMode ? parseFloat(customLength) : parseFloat(selectedLength);
                    const originalTotal = basePrice * len;
                    const finalTotal = originalTotal * (1 - discountPercent / 100);

                    return (
                      <>
                        <div className="border-t border-white/20 dark:border-black/20 pt-4 flex justify-between items-end">
                          <span className="uppercase tracking-widest text-xs font-bold opacity-80">Final Total</span>
                          <div className="text-right">
                            {discountPercent > 0 && (
                              <p className="text-sm line-through opacity-60 mb-1">₹{originalTotal.toFixed(2)}</p>
                            )}
                            <p className="text-3xl font-extrabold flex items-center gap-2">
                              ₹{finalTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
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

        {/* Material Required / Size Chart Note */}
        <div className="mt-12 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-black/10 dark:border-white/10 shadow-xl overflow-hidden relative">
          {/* Subtle background decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            <div className="flex-shrink-0">
               <div className="inline-flex items-center justify-center p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-lg">
                <Info size={24} />
              </div>
            </div>

            <div className="flex-grow">
              <h2 className="text-xl md:text-2xl font-bold mb-6 tracking-tight">Material Required / Size Chart</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Shirt Section */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg opacity-90 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-black dark:bg-white rounded-full inline-block"></span>
                    For stitching a Shirt:
                  </h3>
                  <ul className="space-y-3 pl-3">
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-black dark:text-white whitespace-nowrap min-w-[90px]">1.4 Meters</span>
                      <span className="text-sm md:text-base opacity-70">— for half sleeve shirts of sizes S, M, L & XL</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-black dark:text-white whitespace-nowrap min-w-[90px]">1.6 Meters</span>
                      <span className="text-sm md:text-base opacity-70">— for full sleeve shirts of sizes S, M, L & XL</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-black dark:text-white whitespace-nowrap min-w-[90px]">1.8 Meters</span>
                      <span className="text-sm md:text-base opacity-70">— for full sleeve shirts of sizes XXL & above</span>
                    </li>
                  </ul>
                </div>

                {/* Kurta Section */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg opacity-90 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-black dark:bg-white rounded-full inline-block"></span>
                    For stitching a Kurta:
                  </h3>
                  <ul className="space-y-3 pl-3">
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-black dark:text-white whitespace-nowrap min-w-[90px]">2.25 Meters</span>
                      <span className="text-sm md:text-base opacity-70">— for a knee length Kurta</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="font-bold text-black dark:text-white whitespace-nowrap min-w-[90px]">4.0 Meters</span>
                      <span className="text-sm md:text-base opacity-70">— for a knee length Kurta and Pyjama</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest font-bold opacity-40">Note</span>
                <p className="text-sm italic opacity-60">Fabric cuts of various sizes subject to change.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
