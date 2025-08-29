import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Search, User, Menu, Grid, List } from "lucide-react";

const SalePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Relevance");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [searchQuery, sortBy, products]);

  return (
    <div className="bg-white min-h-screen">
      {/* ✅ Top Banner */}
      <div className="bg-gray-100 text-center py-2 text-sm text-gray-600">
        Get up to ₹750 OFF at checkout – Shop more, save more!
      </div>

      {/* ✅ Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-white sticky top-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-3xl font-extrabold">RR</span>
          <h1 className="text-xl font-bold">MyRaymond</h1>
        </div>

        {/* Menu */}
        <ul className="hidden md:flex gap-8 font-semibold text-gray-700">
          <li className="hover:text-red-600 cursor-pointer">Brands</li>
          <li className="hover:text-red-600 cursor-pointer">
            Fresh Arrivals <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
          </li>
          <li className="hover:text-red-600 cursor-pointer">Categories</li>
          <li className="text-red-600 cursor-pointer">SALE</li>
        </ul>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full w-64">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search for Sweatshirts"
            className="bg-transparent outline-none ml-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6 text-gray-700">
          <User className="cursor-pointer" />
          <Heart className="cursor-pointer" />
          <ShoppingBag className="cursor-pointer" />
          <Menu className="cursor-pointer md:hidden" />
        </div>
      </nav>

      {/* ✅ SALE Header */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">SALE</h2>
          <p className="text-gray-500">{filteredProducts.length} products</p>
        </div>

        {/* ✅ Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
          <div className="flex gap-4 flex-wrap">
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option>Price</option>
              <option>Under ₹1000</option>
              <option>₹1000 - ₹3000</option>
              <option>Above ₹3000</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option>Color</option>
              <option>Red</option>
              <option>Blue</option>
              <option>Black</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option>Brand</option>
              <option>PARK AVENUE</option>
              <option>Raymond</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option>Size</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <div className="flex gap-2 text-gray-500">
              <Grid className="cursor-pointer" />
              <List className="cursor-pointer" />
            </div>
          </div>
        </div>

        {/* ✅ Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition duration-300 group"
              >
                {/* Wishlist Icon */}
                <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>

                {/* Product Image */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-t-xl"
                />

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Color Swatches */}
                  <div className="flex gap-2 mb-3">
                    {product.colors?.map((color, index) => (
                      <span
                        key={index}
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: color }}
                      ></span>
                    ))}
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-red-600">
                      ₹{product.price}
                    </span>
                    <button className="bg-gray-100 p-2 rounded-full hover:bg-red-100">
                      <ShoppingBag className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No products found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalePage;
