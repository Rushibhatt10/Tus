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
  { label: 'Under ₹500', value: 'under-500' },
  { label: '₹500 - ₹1000', value: '500-1000' },
  { label: '₹1000 - ₹2000', value: '1000-2000' },
  { label: '₹2000 - ₹3000', value: '2000-3000' },
  { label: '₹3000 - ₹5000', value: '3000-5000' },
  { label: '₹5000 - ₹10,000', value: '5000-10000' },
  { label: '₹10,000 - ₹20,000', value: '10000-20000' },
  { label: '₹20,000 - ₹50,000', value: '20000-50000' },
  { label: 'Above ₹50,000', value: 'above-50000' }
];


  const colors = [
    { label: 'All Colors', value: 'all' },
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
    { label: 'Black', value: 'black' },
    { label: 'White', value: 'white' },
    { label: 'Green', value: 'green' },
    { label: 'Yellow', value: 'yellow' },
    { label: 'Grey', value: 'grey' },
    { label: 'Pink', value: 'pink' },
    { label: 'Purple', value: 'purple' },
    { label: 'Brown', value: 'brown' },
    { label: 'Orange', value: 'orange' },
    { label: 'Beige', value: 'beige' },
    { label: 'Navy', value: 'navy' },
    { label: 'Maroon', value: 'maroon' },
    { label: 'Olive', value: 'olive' },
    { label: 'Cyan', value: 'cyan' },
    { label: 'Magenta', value: 'magenta' },
    { label: 'Turquoise', value: 'turquoise' },
    { label: 'Lavender', value: 'lavender' },
    { label: 'Gold', value: 'gold' },
    { label: 'Silver', value: 'silver' },
    { label: 'Bronze', value: 'bronze' },
    { label: 'Coral', value: 'coral' },
    { label: 'Teal', value: 'teal' },
    { label: 'Indigo', value: 'indigo' },
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
