import React, { useState } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';

export default function Navbar({ searchTerm, onSearchChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Brands', href: '#' },
    { name: 'Fresh Arrivals', href: '#', isNew: true },
    { name: 'Categories', href: '#' },
    { name: 'SALE', href: '#', isHighlighted: true }
  ];

  return (
    <>
      {/* Top promotional banner */}
      <div className="bg-gray-50 border-b border-gray-100 py-2 text-center">
        <p className="text-sm text-gray-600">
          Get up to ₹750 OFF at checkout – Shop more, save more!
        </p>
      </div>

      {/* Main navbar */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex  items-center gap-1">
              <span className="text-2xl cursor-pointer font-bold text-purple-600">NE</span>
              
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`relative font-medium transition-colors duration-200 ${
                    item.isHighlighted
                      ? 'text-purple-600 hover:text-purple-700'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  {item.name}
                  {item.isNew && (
                    <span className="absolute -top-2 -right-8 bg-purple-600 text-white text-xs px-1 py-0 rounded">
                      New
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* Search bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for Sweatshirts"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded focus:border-purple-500 focus:ring-1 focus:ring-red-500 w-full"
                />
              </div>
            </div>

            {/* User icons */}
            <div className="flex items-center space-x-4">
              <button className="hidden md:flex p-2 rounded hover:bg-red-50">
                <User className="w-5 h-5 text-gray-700" />
              </button>
              <button className="hidden md:flex p-2 rounded hover:bg-red-50">
                <Heart className="w-5 h-5 text-gray-700" />
              </button>
              <button className="hidden md:flex p-2 rounded hover:bg-red-50">
                <ShoppingBag className="w-5 h-5 text-gray-700" />
              </button>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for Sweatshirts"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded focus:border-purple-500 focus:ring-1 focus:ring-red-500 w-full"
              />
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`block font-medium transition-colors duration-200 ${
                    item.isHighlighted
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.name}
                    {item.isNew && (
                      <span className="bg-purple-600 text-white text-xs px-1 py-0 rounded">
                        New
                      </span>
                    )}
                  </div>
                </a>
              ))}

              <div className="pt-4 border-t border-gray-100 flex space-x-4">
                <button className="p-2 rounded hover:bg-red-50">
                  <User className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 rounded hover:bg-red-50">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 rounded hover:bg-red-50">
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
