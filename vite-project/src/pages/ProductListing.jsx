import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Search, User, ShoppingBag, Menu, X, Grid3X3, List, Package, RefreshCw } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // your Firebase config

export default function ProductListing() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ price: "all", color: "all", category: "all" });
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const [theme, setTheme] = useState("dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ price: "all", color: "all", category: "all" });
    setSearchTerm("");
    setSortBy("relevance");
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    const searchLower = searchTerm.toLowerCase();

    result = result.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower);

      const matchesPrice =
        filters.price === "all" ||
        (filters.price === "under-1000" && product.price < 1000) ||
        (filters.price === "1000-3000" && product.price >= 1000 && product.price <= 3000) ||
        (filters.price === "above-3000" && product.price > 3000);

      const matchesColor =
        filters.color === "all" || product.colors?.some((c) => c.toLowerCase() === filters.color.toLowerCase());

      const matchesCategory =
        filters.category === "all" || product.category?.toLowerCase() === filters.category.toLowerCase();

      return matchesSearch && matchesPrice && matchesColor && matchesCategory;
    });

    if (sortBy === "price-asc") result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") result.sort((a, b) => (b.price || 0) - (a.price || 0));

    return result;
  }, [products, searchTerm, filters, sortBy]);

  const hasActiveFilters = searchTerm || Object.values(filters).some((f) => f !== "all");

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  const ProductCard = ({ product }) => {
    const imageUrl = product.images?.[0] || "https://via.placeholder.com/150";
    const cardBg = theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
    const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        layout
        className={`border ${cardBg} rounded-2xl shadow-lg flex flex-col items-center justify-between cursor-pointer transition p-4 w-full max-w-xs h-[370px] mx-auto`}
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <div className={`w-full h-44 flex items-center justify-center overflow-hidden rounded-xl mb-3 ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
          <img src={imageUrl} alt={product.name} className="object-cover w-full h-full rounded-xl" />
        </div>
        <div className="w-full flex-1 flex flex-col justify-between">
          <h2 className={`font-semibold text-lg truncate mb-1 ${textColor}`}>{product.name}</h2>
          <p className={`text-sm truncate mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{product.brand}</p>
          <p className="text-purple-600 dark:text-purple-400 font-bold text-xl mt-2">₹{product.price}</p>
        </div>
      </motion.div>
    );
  };

  const FilterBar = ({ filters, onFilterChange, sortBy, onSortChange, viewMode, onViewModeChange, productCount }) => {
    const priceRanges = [
      { label: "All Prices", value: "all" },
      { label: "Under ₹1000", value: "under-1000" },
      { label: "₹1000 - ₹3000", value: "1000-3000" },
      { label: "Above ₹3000", value: "above-3000" },
    ];

    const colors = ["all","Red","Blue","Black","White","Green","Yellow","Grey","Pink","Purple"].map(c => ({ label: c, value: c.toLowerCase() }));
    const categories = ["All","Shirts","Pants","Suits","Kurtas"].map(c => ({ label: c, value: c.toLowerCase() }));
    const sortOptions = [
      { label: "Relevance", value: "relevance" },
      { label: "Price: Low to High", value: "price-asc" },
      { label: "Price: High to Low", value: "price-desc" },
    ];

    const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
    const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
    const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

    return (
      <div className={`${bgColor} border-b ${borderColor} sticky top-[128px] z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select value={filters.price} onChange={(e) => onFilterChange("price", e.target.value)} className={`w-40 ${bgColor} border ${borderColor} rounded px-2 py-1 hover:border-purple-500`}>
                {priceRanges.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
              </select>
              <select value={filters.color} onChange={(e) => onFilterChange("color", e.target.value)} className={`w-32 ${bgColor} border ${borderColor} rounded px-2 py-1 hover:border-purple-500`}>
                {colors.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={filters.category} onChange={(e) => onFilterChange("category", e.target.value)} className={`w-32 ${bgColor} border ${borderColor} rounded px-2 py-1 hover:border-purple-500`}>
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <select value={sortBy} onChange={(e) => onSortChange(e.target.value)} className={`w-48 ${bgColor} border ${borderColor} rounded px-2 py-1 hover:border-purple-500`}>
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className={`flex border ${borderColor} rounded-lg p-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                <button onClick={() => onViewModeChange("grid")} className={`w-10 h-8 flex items-center justify-center ${viewMode==="grid" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-purple-600"} rounded`}><Grid3X3 className="w-4 h-4" /></button>
                <button onClick={() => onViewModeChange("list")} className={`w-10 h-8 flex items-center justify-center ${viewMode==="list" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-purple-600"} rounded`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <div className={`mt-3 text-sm ${textColor}`}>{productCount} products found</div>
        </div>
      </div>
    );
  };

  const ProductGrid = ({ products, viewMode }) => {
    const gridClasses = `grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"} px-2 md:px-0`;

    return (
      <motion.div layout className={gridClasses}>
        <AnimatePresence>
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme==="dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Navbar */}
      <div className={`sticky top-0 z-50 backdrop-blur-md ${theme==="dark" ? "bg-gray-900 border-b border-gray-700" : "bg-white border-b border-gray-200"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div onClick={()=>navigate("/")} className={`text-2xl font-bold cursor-pointer ${theme==="dark" ? "text-purple-400" : "text-purple-600"}`}>NE</div>
          <div className="hidden md:flex flex-1 mx-8">
            <div className="relative w-full">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme==="dark"?"text-gray-500":"text-gray-400"} w-4 h-4`} />
              <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${theme==="dark"?"border-gray-700 bg-gray-800 text-white":"border-gray-200 bg-white text-gray-900"}`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={()=>navigate("/account")} className="p-2 rounded hover:bg-purple-50 dark:hover:bg-gray-800"><User className={`w-5 h-5 ${theme==="dark"?"text-gray-300":"text-gray-700"}`} /></button>
            <button onClick={()=>navigate("/cart")} className="p-2 rounded hover:bg-purple-50 dark:hover:bg-gray-800"><ShoppingBag className={`w-5 h-5 ${theme==="dark"?"text-gray-300":"text-gray-700"}`} /></button>
            <button onClick={toggleTheme} className="p-2 rounded border border-gray-400 hover:scale-110 transition">{theme==="dark"?<Sun className="w-5 h-5 text-yellow-400"/>:<Moon className="w-5 h-5 text-gray-700"/>}</button>
            <button className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-purple-800 dark:text-purple-400 mb-4">SALE</h1>
          <motion.p key={filteredAndSortedProducts.length} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className={`text-xl ${theme==="dark"?"text-gray-300":"text-gray-700"}`}>{filteredAndSortedProducts.length} products</motion.p>
        </motion.div>

        <FilterBar filters={filters} onFilterChange={handleFilterChange} sortBy={sortBy} onSortChange={setSortBy} viewMode={viewMode} onViewModeChange={setViewMode} productCount={filteredAndSortedProducts.length} />

        <div className="mt-10">
          <ProductGrid products={filteredAndSortedProducts} viewMode={viewMode} />
        </div>
      </main>
    </div>
  );
}
