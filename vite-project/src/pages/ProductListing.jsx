import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firebase config
import Navbar from '../components/navbar/navbar';
import FilterBar from '../components/filters/FilterBar';
import { useNavigate } from "react-router-dom";

// ------------------------
// Custom Hook for Data Fetching
// ------------------------
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productData);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, isLoading, error };
};

// ------------------------
// ProductCard Component
// ------------------------
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/150';

  return (
    <div
      className="bg-white border border-gray-400 rounded-2xl shadow-lg flex flex-col items-center justify-between cursor-pointer transition-transform hover:scale-105 p-4 w-full max-w-xs h-[370px] mx-auto"
      onClick={() => navigate(`/products/${product.id}`)}
      role="button"
      tabIndex={0}
    >
      <div className="w-full h-44 flex items-center justify-center overflow-hidden rounded-xl mb-3 bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="object-cover w-full h-full rounded-xl"
        />
      </div>
      <div className="w-full flex-1 flex flex-col justify-between">
        <h2 className="font-semibold text-lg text-gray-900 truncate mb-1">
          {product.name}
        </h2>
        <p className="text-gray-500 text-sm truncate mb-1">{product.brand}</p>
        <p className="text-purple-600 font-bold text-xl mt-2">
          ₹{product.price}
        </p>
      </div>
    </div>
  );
};


// ------------------------
// ProductGrid Component
// ------------------------
function ProductGrid({ products, viewMode, isLoading, onResetFilters, hasActiveFilters }) {
  const navigate = useNavigate();
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading products...</p>;
  }

  if (!products.length) {
    return (
      <div className="text-center text-gray-600">
        <p>{hasActiveFilters ? "No products found for these filters." : "No products found."}</p>
        <button
          onClick={onResetFilters}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          aria-label="Reset filters to see all products"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  const gridClasses = `grid gap-4 ${
    viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
  } px-2 md:px-0`;

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => navigate(`/products/${product.id}`)}
        />
      ))}
    </div>
  );
}

// ------------------------
// Main ProductListing Page
// ------------------------
export default function ProductListing() {
  const { products, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    price: 'all',
    color: 'all',
    brand: 'all',
    size: 'all'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      price: 'all',
      color: 'all',
      brand: 'all',
      size: 'all'
    });
    setSearchTerm('');
    setSortBy('relevance');
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Search and Filter
    result = result.filter(product => {
      const { price, color, brand, size } = filters;
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || (
        product.name?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );

      const matchesPrice = price === 'all' || (
        (price === 'under-1000' && product.price < 1000) ||
        (price === '1000-3000' && product.price >= 1000 && product.price <= 3000) ||
        (price === 'above-3000' && product.price > 3000)
      );

      const matchesColor = color === 'all' || product.colors?.some(c => c.toLowerCase() === color.toLowerCase());

      const matchesBrand = brand === 'all' || product.brand === brand;

      const matchesSize = size === 'all' || product.sizes?.includes(size);

      return matchesSearch && matchesPrice && matchesColor && matchesBrand && matchesSize;
    });

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchTerm, filters, sortBy]);

  const hasActiveFilters = searchTerm || Object.values(filters).some(f => f !== 'all');

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-purple-800 mb-4">SALE</h1>
          <motion.p
            key={filteredAndSortedProducts.length}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xl text-gray-700"
          >
            {filteredAndSortedProducts.length} products
          </motion.p>
        </motion.div>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          productCount={filteredAndSortedProducts.length}
        />

        <div className="mt-10">
          <ProductGrid
            products={filteredAndSortedProducts}
            viewMode={viewMode}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </main>
    </div>
  );
}