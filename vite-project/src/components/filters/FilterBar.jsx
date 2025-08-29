import React from 'react';
import { Grid3X3, List } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FilterBar({ 
  filters, 
  onFilterChange, 
  sortBy, 
  onSortChange, 
  viewMode, 
  onViewModeChange,
  productCount 
}) {
  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹1000', value: 'under-1000' },
    { label: '₹1000 - ₹3000', value: '1000-3000' },
    { label: 'Above ₹3000', value: 'above-3000' }
  ];

  const colors = [
    { label: 'All Colors', value: 'all' },
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
    { label: 'Black', value: 'black' },
    { label: 'White', value: 'white' }
  ];

  const brands = [
    { label: 'All Brands', value: 'all' },
    { label: 'Raymond', value: 'Raymond' },
    { label: 'Park Avenue', value: 'Park Avenue' }
  ];

  const sizes = [
    { label: 'All Sizes', value: 'all' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' }
  ];

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' }
  ];

  return (
    <div className="bg-white border-b border-gray-100 sticky top-[128px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Filter controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Price Filter */}
            <select
              value={filters.price}
              onChange={(e) => onFilterChange('price', e.target.value)}
              className="w-40 bg-white border border-gray-200 rounded px-2 py-1 hover:border-purple-300"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            {/* Color Filter */}
            <select
              value={filters.color}
              onChange={(e) => onFilterChange('color', e.target.value)}
              className="w-32 bg-white border border-gray-200 rounded px-2 py-1 hover:border-purple-300"
            >
              {colors.map(color => (
                <option key={color.value} value={color.value}>{color.label}</option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={filters.brand}
              onChange={(e) => onFilterChange('brand', e.target.value)}
              className="w-36 bg-white border border-gray-200 rounded px-2 py-1 hover:border-purple-300 "
            >
              {brands.map(brand => (
                <option key={brand.value} value={brand.value}>{brand.label}</option>
              ))}
            </select>

            {/* Size Filter */}
            <select
              value={filters.size}
              onChange={(e) => onFilterChange('size', e.target.value)}
              className="w-28 bg-white border border-gray-200 rounded px-2 py-1 hover:border-purple-300"
            >
              {sizes.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-48 bg-white border border-gray-200 rounded px-2 py-1 hover:border-purple-300"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`w-10 h-8 flex items-center justify-center ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-red-600' 
                    : 'text-gray-500 hover:text-red-600'
                } rounded`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`w-10 h-8 flex items-center justify-center ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-red-600' 
                    : 'text-gray-500 hover:text-red-600'
                } rounded`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product count */}
        <div className="mt-3 text-sm text-gray-600">
          <motion.span
            key={productCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {productCount} products found
          </motion.span>
        </div>
      </div>
    </div>
  );
}
