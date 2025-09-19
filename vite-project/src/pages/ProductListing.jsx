import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { ThemeContext } from "../context/ThemeContext";

export default function ProductListing() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    price: "all",
    color: "all",
    category: "all",
    fabricType: "all",
    occasion: "all",
    material: "all",
    availability: "all",
    discount: "all",
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Filtering + Sorting
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
        filters.color === "all" || product.color?.toLowerCase() === filters.color;

      const matchesCategory =
        filters.category === "all" || product.category?.toLowerCase() === filters.category;

      const matchesFabric =
        filters.fabricType === "all" || product.fabricType?.toLowerCase() === filters.fabricType;

      const matchesOccasion =
        filters.occasion === "all" || product.occasion?.toLowerCase() === filters.occasion;

      const matchesMaterial =
        filters.material === "all" || product.material?.toLowerCase() === filters.material;

      const matchesAvailability =
        filters.availability === "all" ||
        product.availability?.toLowerCase() === filters.availability.toLowerCase();

      const matchesDiscount =
        filters.discount === "all" ||
        (filters.discount === "discounted" && parseInt(product.discount) > 0) ||
        (filters.discount === "fullprice" &&
          (!product.discount || parseInt(product.discount) === 0));

      return (
        matchesSearch &&
        matchesPrice &&
        matchesColor &&
        matchesCategory &&
        matchesFabric &&
        matchesOccasion &&
        matchesMaterial &&
        matchesAvailability &&
        matchesDiscount
      );
    });

    if (sortBy === "price-asc") result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") result.sort((a, b) => (b.price || 0) - (a.price || 0));

    return result;
  }, [products, searchTerm, filters, sortBy]);

  // Group products by TYPE (SHIRT, SUIT, PANTS)
  const groupedProductsByType = useMemo(() => {
    return filteredAndSortedProducts.reduce((acc, product) => {
      const type = product.type || "SHIRT"; // Default to SHIRT if type missing
      if (!acc[type]) acc[type] = [];
      acc[type].push(product);
      return acc;
    }, {});
  }, [filteredAndSortedProducts]);

  // ProductCard
  const ProductCard = ({ product }) => {
    const imageUrl = product.images?.[0] || "https://via.placeholder.com/150";
    const cardBg = theme === "dark" ? "bg-black border-gray-700" : "bg-white border-gray-200";
    const textColor = theme === "dark" ? "text-white" : "text-black";

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        layout
        className={`border ${cardBg} rounded-2xl shadow-lg flex flex-col items-center justify-between cursor-pointer transition p-4 w-full max-w-xs h-[380px] mx-auto`}
        onClick={() => navigate(`/products/${product.id}`, { state: { product } })}
      >
        <div
          className={`w-full h-44 flex items-center justify-center overflow-hidden rounded-xl mb-3 ${
            theme === "dark" ? "bg-black" : "bg-gray-50"
          }`}
        >
          <img src={imageUrl} alt={product.name} className="object-cover w-full h-full rounded-xl" />
        </div>
        <div className="w-full flex-1 flex flex-col justify-between">
          <h2 className={`font-semibold text-lg truncate mb-1 ${textColor}`}>{product.name}</h2>
          <p className={`text-sm truncate mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {product.brand} · {product.fabricType}
          </p>
          <p className={`font-bold text-xl mt-2 ${textColor}`}>₹{product.price}</p>
        </div>
      </motion.div>
    );
  };

  // ProductGrid
  const ProductGrid = ({ products, viewMode }) => {
    const gridClasses = `grid gap-6 ${
      viewMode === "grid"
        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        : "grid-cols-1"
    } px-2 md:px-0`;

    return (
      <motion.div layout className={gridClasses}>
        <AnimatePresence>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Navbar */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-md ${
          theme === "dark" ? "bg-black border-b border-gray-700" : "bg-white border-b border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div
            onClick={() => navigate("/")}
            className={`text-2xl font-bold cursor-pointer ${theme === "dark" ? "text-white" : "text-black"}`}
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 ${
                  theme === "dark" ? "border-gray-700 bg-black text-white" : "border-gray-300 bg-white text-black"
                }`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate("/account")} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <User className={`w-5 h-5 ${theme === "dark" ? "text-white" : "text-black"}`} />
            </button>
            <button onClick={() => navigate("/cart")} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <ShoppingBag className={`w-5 h-5 ${theme === "dark" ? "text-white" : "text-black"}`} />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded border border-gray-400 hover:scale-110 transition">
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
            <button className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Our Collection
          </h1>
          <motion.p key={filteredAndSortedProducts.length} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`text-xl ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {filteredAndSortedProducts.length} products
          </motion.p>
        </motion.div>

        {/* Grouped by Type */}
        {Object.entries(groupedProductsByType).map(([type, items]) => (
          <section key={type} className="mb-16">
            <h2 className={`text-3xl font-bold mb-6 capitalize ${theme === "dark" ? "text-white" : "text-black"}`}>{type}</h2>
            <ProductGrid products={items} viewMode={viewMode} />
          </section>
        ))}
      </main>
    </div>
  );
}
