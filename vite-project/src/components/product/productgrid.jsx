import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { Package, RefreshCw } from 'lucide-react';

export default function ProductGrid({ products, viewMode, isLoading, onResetFilters }) {
  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading products...</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-96 flex flex-col items-center justify-center text-center py-16"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No products match your search
        </h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
        <Button
          onClick={onResetFilters}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          Reset Filters
        </Button>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={
        viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }
    >
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            layout
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ProductCard product={product} viewMode={viewMode} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}