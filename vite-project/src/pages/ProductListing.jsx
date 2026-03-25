import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sun, Moon, Search, User, ShoppingBag, X, Tag, Shield, Truck } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { ThemeContext } from "../context/ThemeContext";

const SUB_CATEGORY_BY_TYPE = {
  SHIRT: [
    "Linen (Solids)",
    "Linen (Stripes & Checks)",
    "Linen (Printed)",
    "Cotton",
    "Linen Silk",
    "Cotton Linen",
  ],
  SUIT: [
    "Cotton Stretch",
    "Polyviscos Blend",
    "Wool Blend",
    "100% Linen",
    "100% Wool",
  ],
};

export default function ProductListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all");
  const [showNewArrivals, setShowNewArrivals] = useState(searchParams.get("newArrivals") === "true");
  const [wholesaleDismissed, setWholesaleDismissed] = useState(
    () => localStorage.getItem("wholesale_dismissed") === "true"
  );
  
  const [filters, setFilters] = useState({ isGifting: false, subCategory: "all" });
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const viewMode = "grid";
  const { theme, toggleTheme } = useContext(ThemeContext);

  const dismissWholesale = () => {
    localStorage.setItem("wholesale_dismissed", "true");
    setWholesaleDismissed(true);
  };

  // Update selected type / newArrivals when URL changes
  useEffect(() => {
    const type = searchParams.get("type") || "all";
    setSelectedType(type);
    setShowNewArrivals(searchParams.get("newArrivals") === "true");
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productData);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const doesProductMatchType = (product, typeKey) => {
    if (typeKey === "all") return true;
    if (typeKey === "SHIRT") return product.type === "SHIRT";
    if (typeKey === "SUIT") {
      return product.type === "SUIT" || (product.type === "PANT" && product.isPantAsSuit);
    }
    if (typeKey === "PANT") {
      return product.type === "PANT" || (product.type === "SUIT" && product.isSuitAsPant);
    }
    return false;
  };

  const getTypeForSubCategory = (subCategory) => {
    if (SUB_CATEGORY_BY_TYPE.SHIRT.includes(subCategory)) return "SHIRT";
    if (SUB_CATEGORY_BY_TYPE.SUIT.includes(subCategory)) return "SUIT";
    return null;
  };

  const baseFilteredPool = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower);

      // New Arrivals mode overrides type filter
      if (showNewArrivals) return matchesSearch && !!product.isNewArrival;

      const matchesGifting = !filters.isGifting || product.isGifting === true;

      return matchesSearch && matchesGifting;
    });
  }, [products, searchTerm, filters.isGifting, showNewArrivals]);

  // Filtering + Sorting
  const filteredAndSortedProducts = useMemo(() => {
    const result = baseFilteredPool.filter((product) => {
      const matchesType = doesProductMatchType(product, selectedType);
      const matchesSubCategory =
        filters.subCategory === "all" ||
        (product.subCategory || "").trim() === filters.subCategory;
      return matchesType && matchesSubCategory;
    });

    return result;
  }, [baseFilteredPool, filters.subCategory, selectedType]);

  const filterStats = useMemo(() => {
    return {
      all: baseFilteredPool.length,
      SHIRT: baseFilteredPool.filter((p) => doesProductMatchType(p, "SHIRT")).length,
      SUIT: baseFilteredPool.filter((p) => doesProductMatchType(p, "SUIT")).length,
      PANT: baseFilteredPool.filter((p) => doesProductMatchType(p, "PANT")).length,
      gifting: baseFilteredPool.filter((p) => p.isGifting).length,
    };
  }, [baseFilteredPool]);

  // Group products by TYPE (Pant-as-Suit logic included)
  const groupedProductsByType = useMemo(() => {
    return filteredAndSortedProducts.reduce((acc, product) => {
      let type = product.type || "SHIRT"; // Default to SHIRT if type missing

      // 🔹 Treat Pant marked as Suit as SUIT
      if (product.type === "PANT" && product.isPantAsSuit) {
        type = "SUIT";
      }

      if (!acc[type]) acc[type] = [];
      acc[type].push(product);
      
      // 🔹 If SUIT is marked as Pant, also show it in PANT section
      if (product.type === "SUIT" && product.isSuitAsPant) {
        if (!acc["PANT"]) acc["PANT"] = [];
        acc["PANT"].push(product);
      }
      
      return acc;
    }, {});
  }, [filteredAndSortedProducts]);

  const categoryCards = [
    { id: "all", label: "All Categories", detail: "Complete collection" },
    { id: "SHIRT", label: "SHIRT", detail: "Refined shirting fabrics" },
    { id: "SUIT", label: "SUIT", detail: "Structured suiting range" },
    { id: "PANT", label: "PANT", detail: "Trouser-ready materials" },
  ];
  const getSubCategoryCount = (typeKey, subCategory) => {
    const pool = baseFilteredPool.filter((product) => doesProductMatchType(product, typeKey));
    if (subCategory === "all") return pool.length;
    return pool.filter((product) => (product.subCategory || "").trim() === subCategory).length;
  };

  const activeFilterCount =
    (selectedType !== "all" ? 1 : 0) +
    (filters.subCategory !== "all" ? 1 : 0) +
    (filters.isGifting ? 1 : 0);

  // renderProductCard
  const renderProductCard = (product) => {
    const imageUrl =
      product.images?.[0] || "https://via.placeholder.com/150";
    const cardBg =
      theme === "dark" ? "bg-black border-gray-700" : "bg-white border-gray-200";
    const textColor = theme === "dark" ? "text-white" : "text-black";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.02 }}
        className={`border ${cardBg} rounded-2xl shadow-lg flex flex-col cursor-pointer transition p-4 w-full`}
        onClick={() =>
          navigate(`/products/${product.id}`, { state: { product } })
        }
      >
        <div
          className={`w-full h-52 sm:h-44 flex items-center justify-center overflow-hidden rounded-xl mb-3 relative ${
            theme === "dark" ? "bg-black" : "bg-gray-50"
          }`}
        >
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="object-cover w-full h-full rounded-xl"
          />
          {product.subCategory && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                const derivedType = getTypeForSubCategory(product.subCategory || "");
                if (derivedType) {
                  setSelectedType(derivedType);
                } else if (product.type) {
                  setSelectedType(product.type);
                }
                setFilters((prev) => ({ ...prev, subCategory: product.subCategory || "all" }));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-black dark:text-white shadow-lg border border-black/5 dark:border-white/10 hover:scale-105 transition-transform cursor-pointer z-10"
            >
              ◎ {product.subCategory}
            </div>
          )}
        </div>
        <div className="w-full flex-1 flex flex-col justify-between">
          <h2 className={`font-semibold text-base sm:text-lg truncate mb-1 ${textColor}`}>
            {product.name}
          </h2>
          <p
            className={`text-sm truncate mb-1 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {product.brand} · {product.fabricType}
          </p>
          {/* Price from sizePricing */}
          {product.price ? (
            <p className={`font-bold text-lg mt-2 ${textColor}`}>
              ₹{product.price} <span className="text-xs opacity-60 font-normal tracking-wide">/ meter</span>
            </p>
          ) : product.sizePricing && Object.values(product.sizePricing).some(p => p) ? (
            <p className={`font-bold text-lg mt-2 ${textColor}`}>
              from ₹{Math.min(...Object.values(product.sizePricing).filter(p => !!p).map(Number))}
            </p>
          ) : null}

          {/* 🔹 Show Pant-as-Suit Badge */}
          {product.type === "PANT" && product.isPantAsSuit && (
            <span className={`self-start border text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full mt-3 font-medium transition-colors animate-pulse ${theme === "dark" ? "border-white/30 text-white/90 bg-white/5" : "border-black/30 text-black/90 bg-black/5"}`}>
              Pant as Suit
            </span>
          )}
          
          {/* 🔹 Show Suit-as-Pant Badge */}
          {product.type === "SUIT" && product.isSuitAsPant && (
            <span className={`self-start border text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full mt-3 font-medium transition-colors animate-pulse ${theme === "dark" ? "border-white/30 text-white/90 bg-white/5" : "border-black/30 text-black/90 bg-black/5"}`}>
              Suit as Pant
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  // renderProductGrid
  const renderProductGrid = (products, viewMode) => {
    const gridClasses = `grid gap-6 ${
      viewMode === "grid"
        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        : "grid-cols-1"
    } px-2 md:px-0`;

    return (
      <div className={gridClasses}>
        {products.map((product) => (
          <React.Fragment key={product.id}>
            {renderProductCard(product)}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === "dark" ? "bg-[#0c0c0c] text-[#f5f5f0]" : "bg-[#f5f5f0] text-[#0c0c0c]"
      }`}
    >
      {/* Navbar */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-md ${
          theme === "dark"
            ? "bg-[#0c0c0c]/80 border-b border-white/10"
            : "bg-[#f5f5f0]/80 border-b border-black/10"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div
            onClick={() => navigate("/")}
            className={`text-2xl font-bold font-serif cursor-pointer ${
              theme === "dark" ? "text-[#f5f5f0]" : "text-[#0c0c0c]"
            }`}
          >
            NE
          </div>
          <div className="hidden md:flex flex-1 mx-8">
            <div className="relative w-full">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                } w-4 h-4`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none ${
                  theme === "dark"
                    ? "border-white/20 bg-[#121212] text-white"
                    : "border-black/20 bg-white text-black"
                }`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/account")}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <User
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              />
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShoppingBag
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded border border-gray-400 hover:scale-110 transition"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
          <div className={`p-6 rounded-3xl border ${theme === "dark" ? "bg-[#141414]/50 border-white/10 backdrop-blur-md" : "bg-white/50 border-black/10 backdrop-blur-md shadow-sm"}`}>
            <div className="flex justify-between items-center mb-6 border-b border-current pb-4 opacity-80">
              <h3 className="text-xl font-bold font-serif uppercase tracking-widest">Filters</h3>
              <span className="text-xs tracking-widest underline cursor-pointer" onClick={() => {
                setFilters({ isGifting: false, subCategory: "all" });
                setSelectedType("all");
                setSearchTerm("");
                setShowNewArrivals(false);
              }}>CLEAR ALL</span>
            </div>
            
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold uppercase text-xs tracking-[0.2em] opacity-60">Category</h4>
                <span className={`text-[10px] px-2 py-1 rounded-full border ${
                  theme === "dark" ? "border-white/20 bg-white/5" : "border-black/15 bg-black/[0.03]"
                }`}>
                  {activeFilterCount} active
                </span>
              </div>
              <div className="space-y-2.5">
                {categoryCards.map((card) => {
                  const isActive = selectedType === card.id;
                  const count = filterStats[card.id] ?? 0;
                  return (
                    <button
                      key={card.id}
                      onClick={() => {
                        setSelectedType(card.id);
                        setFilters((prev) => ({ ...prev, subCategory: "all" }));
                      }}
                      className={`w-full text-left rounded-2xl border px-3.5 py-3 transition-all duration-300 ${
                        isActive
                          ? theme === "dark"
                            ? "border-white/60 bg-white/10 shadow-[0_8px_30px_rgba(255,255,255,0.06)]"
                            : "border-black/40 bg-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                          : theme === "dark"
                            ? "border-white/10 hover:border-white/30 hover:bg-white/5"
                            : "border-black/10 hover:border-black/25 hover:bg-black/[0.02]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold tracking-wide">{card.label}</p>
                          <p className="text-[11px] opacity-60 mt-1">{card.detail}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          theme === "dark" ? "bg-white/10" : "bg-black/[0.06]"
                        }`}>
                          {count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-7 space-y-5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold uppercase text-xs tracking-[0.2em] opacity-60">Sub Category</h4>
                <span className={`text-[10px] px-2 py-1 rounded-full border ${
                  theme === "dark" ? "border-white/20 bg-white/5" : "border-black/15 bg-black/[0.03]"
                }`}>
                  Fixed taxonomy
                </span>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === "SHIRT" ? null : "SHIRT")}
                  className="lg:hidden w-full flex items-center justify-between text-[11px] uppercase tracking-[0.18em] opacity-60 font-semibold"
                >
                  <span>SHIRTS</span>
                  <span className="text-sm">{expandedMobileCategory === "SHIRT" ? "−" : "+"}</span>
                </button>
                <p className="hidden lg:block text-[11px] uppercase tracking-[0.18em] opacity-60 font-semibold">SHIRTS</p>
                <div className={`flex-wrap gap-2 ${expandedMobileCategory === "SHIRT" ? "flex" : "hidden lg:flex"}`}>
                  <button
                    onClick={() => {
                      setSelectedType("SHIRT");
                      handleFilterChange("subCategory", "all");
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedType === "SHIRT" && filters.subCategory === "all"
                        ? theme === "dark"
                          ? "border-white/50 bg-white/10 text-white"
                          : "border-black/40 bg-black text-white"
                        : theme === "dark"
                          ? "border-white/15 hover:border-white/35 hover:bg-white/5"
                          : "border-black/15 hover:border-black/30 hover:bg-black/[0.04]"
                    }`}
                  >
                    <span>All</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${theme === "dark" ? "bg-white/10" : "bg-black/[0.08]"}`}>
                      {getSubCategoryCount("SHIRT", "all")}
                    </span>
                  </button>
                  {SUB_CATEGORY_BY_TYPE.SHIRT.map((option) => {
                    const isActive = selectedType === "SHIRT" && filters.subCategory === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedType("SHIRT");
                          handleFilterChange("subCategory", option);
                        }}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          isActive
                            ? theme === "dark"
                              ? "border-white/50 bg-white/10 text-white"
                              : "border-black/40 bg-black text-white"
                            : theme === "dark"
                              ? "border-white/15 hover:border-white/35 hover:bg-white/5"
                              : "border-black/15 hover:border-black/30 hover:bg-black/[0.04]"
                        }`}
                      >
                        <span className="truncate max-w-[170px]">{option}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${theme === "dark" ? "bg-white/10" : "bg-black/[0.08]"}`}>
                          {getSubCategoryCount("SHIRT", option)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === "SUIT" ? null : "SUIT")}
                  className="lg:hidden w-full flex items-center justify-between text-[11px] uppercase tracking-[0.18em] opacity-60 font-semibold"
                >
                  <span>SUITS</span>
                  <span className="text-sm">{expandedMobileCategory === "SUIT" ? "−" : "+"}</span>
                </button>
                <p className="hidden lg:block text-[11px] uppercase tracking-[0.18em] opacity-60 font-semibold">SUITS</p>
                <div className={`flex-wrap gap-2 ${expandedMobileCategory === "SUIT" ? "flex" : "hidden lg:flex"}`}>
                  <button
                    onClick={() => {
                      setSelectedType("SUIT");
                      handleFilterChange("subCategory", "all");
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedType === "SUIT" && filters.subCategory === "all"
                        ? theme === "dark"
                          ? "border-white/50 bg-white/10 text-white"
                          : "border-black/40 bg-black text-white"
                        : theme === "dark"
                          ? "border-white/15 hover:border-white/35 hover:bg-white/5"
                          : "border-black/15 hover:border-black/30 hover:bg-black/[0.04]"
                    }`}
                  >
                    <span>All</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${theme === "dark" ? "bg-white/10" : "bg-black/[0.08]"}`}>
                      {getSubCategoryCount("SUIT", "all")}
                    </span>
                  </button>
                  {SUB_CATEGORY_BY_TYPE.SUIT.map((option) => {
                    const isActive = selectedType === "SUIT" && filters.subCategory === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedType("SUIT");
                          handleFilterChange("subCategory", option);
                        }}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          isActive
                            ? theme === "dark"
                              ? "border-white/50 bg-white/10 text-white"
                              : "border-black/40 bg-black text-white"
                            : theme === "dark"
                              ? "border-white/15 hover:border-white/35 hover:bg-white/5"
                              : "border-black/15 hover:border-black/30 hover:bg-black/[0.04]"
                        }`}
                      >
                        <span className="truncate max-w-[170px]">{option}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${theme === "dark" ? "bg-white/10" : "bg-black/[0.08]"}`}>
                          {getSubCategoryCount("SUIT", option)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors ${
              filters.isGifting
                ? theme === "dark"
                  ? "border-yellow-300/50 bg-yellow-300/10"
                  : "border-yellow-500/40 bg-yellow-100/60"
                : theme === "dark"
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-black/10 bg-black/[0.02]"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold uppercase tracking-wide text-yellow-600 dark:text-yellow-300">🎁 Gifting Items</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  theme === "dark" ? "bg-black/40" : "bg-white/70"
                }`}>
                  {filterStats.gifting}
                </span>
              </div>
              <button
                onClick={() => handleFilterChange("isGifting", !filters.isGifting)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 border transition ${
                  filters.isGifting
                    ? "bg-yellow-500 text-white border-yellow-500"
                    : theme === "dark"
                      ? "bg-transparent border-white/20 hover:border-white/40"
                      : "bg-white border-black/20 hover:border-black/35"
                }`}
              >
                <span className="text-sm font-semibold">{filters.isGifting ? "Showing Gifting Collection" : "Show Only Gifting Collection"}</span>
                <span className="text-xs font-bold uppercase tracking-wider">{filters.isGifting ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 w-full overflow-hidden">
          
          {/* Dismissible Wholesale Banner */}
          {!wholesaleDismissed && (
            <motion.div
              key="wholesale-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative w-full mb-8 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden ${
                theme === "dark" ? "bg-white text-black" : "bg-[#0c0c0c] text-white"
              }`}
            >
              {/* Close button */}
              <button
                onClick={dismissWholesale}
                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  theme === "dark" ? "bg-black/10 hover:bg-black/20 text-black" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                aria-label="Dismiss wholesale banner"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pr-10">
                <div className="max-w-lg">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-60 mb-2">Exclusive B2B Program</p>
                  <h3 className="text-xl sm:text-2xl font-serif uppercase tracking-widest font-bold mb-2">Wholesale & Bulk Orders</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    Looking to elevate your inventory? Order in bulk quantities directly through our administration for exclusively tailored pricing that fulfills your enterprise needs.
                  </p>
                  <p className={`text-xs mt-3 opacity-60 italic ${
                    theme === "dark" ? "text-gray-700" : "text-gray-300"
                  }`}>
                    *For custom sizes, contact us on WhatsApp
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col xl:flex-row gap-3 shrink-0">
                  <a
                    href="https://wa.me/9265083688"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                  <a
                    href="tel:9265083688"
                    className={`flex items-center justify-center gap-2 border px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest transition-colors shadow-sm ${
                      theme === "dark"
                        ? "border-black/30 text-black hover:bg-black hover:text-white"
                        : "border-white/30 text-white hover:bg-white hover:text-black"
                    }`}
                  >
                    Call Admin
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment & Offers Info Strip */}
          <div className={`w-full mb-8 rounded-2xl border overflow-hidden ${
            theme === "dark" ? "bg-[#141414]/60 border-white/10" : "bg-white/80 border-black/10 shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-current/10">
              {/* Payment Methods */}
              <div className="flex items-center gap-2.5 sm:gap-3 px-4 py-3 sm:px-5 sm:py-4 flex-1">
                <Shield className="shrink-0 text-blue-500 w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50 mb-0.5">Secured Payments</p>
                  <p className="text-[11px] sm:text-sm font-semibold">UPI · Cards · Wallets </p>
                </div>
              </div>
              {/* COD */}
              <div className="flex items-center gap-2.5 sm:gap-3 px-4 py-3 sm:px-5 sm:py-4 flex-1">
                <Truck className="shrink-0 text-green-500 w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50 mb-0.5">Delivery availability</p>
                  <p className="text-[11px] sm:text-sm font-semibold">Free all over INDIA</p>
                </div>
              </div>
              {/* Offers */}
              <div className="flex items-start gap-2.5 sm:gap-3 px-4 py-3 sm:px-5 sm:py-4 flex-1">
                <Tag className="shrink-0 mt-0.5 text-amber-500 w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Promo Codes</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[{code:"MAR10",label:"10% off ₹3999+"},{code:"MAR15",label:"15% off ₹5999+"},{code:"WELCOME5",label:"5% off always"}].map(o=>(
                      <span key={o.code} className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold border ${
                        theme==="dark"?"bg-amber-900/30 border-amber-700/50 text-amber-300":"bg-amber-50 border-amber-200 text-amber-700"
                      }`}>
                        <span className="font-mono tracking-wider">{o.code}</span>
                        <span className="opacity-70 font-normal">· {o.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1
            className={`text-3xl sm:text-4xl md:text-6xl font-extrabold mb-3 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            {showNewArrivals ? "New Arrivals" : "Our Collection"}
          </h1>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-base sm:text-xl ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {filteredAndSortedProducts.length} products
          </motion.p>
        </motion.div>

        {/* Grouped by Type */}
        {Object.entries(groupedProductsByType).map(([type, items]) => (
          <section key={type} className="mb-16">
            <h2
              className={`text-3xl font-bold mb-6 capitalize ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              {type}
            </h2>
            {renderProductGrid(items, viewMode)}
          </section>
        ))}
              </div>
      </main>
    </div>
  );
}
