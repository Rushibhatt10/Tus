import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firebase config
import Navbar from '../components/navbar/navbar';
import FilterBar from '../components/filters/FilterBar';

// ------------------------
// Inline ProductGrid Component
// ------------------------
function ProductGrid({ products, viewMode, isLoading, onResetFilters }) {
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading products...</p>;
  }

  if (!products.length) {
    return (
      <div className="text-center text-gray-600">
        <p>No products found.</p>
        <button
          onClick={onResetFilters}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 ${
        viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'
      }`}
    >
      {products.map(product => (
        <div
          key={product.id}
          className="border rounded p-4 flex flex-col items-start bg-white shadow-sm"
        >
          <img
            src={product.image || 'https://via.placeholder.com/150'}
            alt={product.name}
            className="w-full h-40 object-cover mb-2 rounded"
          />
          <h2 className="font-semibold text-lg">{product.name}</h2>
          <p className="text-gray-500 text-sm">{product.brand}</p>
          <p className="text-purple-600 font-bold mt-1">₹{product.price}</p>
        </div>
      ))}
    </div>
  );
}

// ------------------------
// Main ProductListing Page
// ------------------------
export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    price: 'all',
    color: 'all',
    brand: 'all',
    size: 'all'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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
    let filtered = products.filter(product => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !product.name?.toLowerCase().includes(searchLower) &&
          !product.brand?.toLowerCase().includes(searchLower) &&
          !product.description?.toLowerCase().includes(searchLower)
        ) return false;
      }

      if (filters.price !== 'all') {
        switch (filters.price) {
          case 'under-1000':
            if (product.price >= 1000) return false;
            break;
          case '1000-3000':
            if (product.price < 1000 || product.price > 3000) return false;
            break;
          case 'above-3000':
            if (product.price <= 3000) return false;
            break;
        }
      }

      if (filters.color !== 'all') {
        if (!product.colors?.some(color => color.toLowerCase() === filters.color.toLowerCase())) {
          return false;
        }
      }

      if (filters.brand !== 'all') {
        if (product.brand !== filters.brand) return false;
      }

      if (filters.size !== 'all') {
        if (!product.sizes?.includes(filters.size)) return false;
      }

      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, filters, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Navbar */}
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* SALE Header */}
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

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          productCount={filteredAndSortedProducts.length}
        />

        {/* Product Grid */}
        <div className="mt-10">
          <ProductGrid
            products={filteredAndSortedProducts}
            viewMode={viewMode}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
          />
        </div>
      </main>
    </div>
  );
}
