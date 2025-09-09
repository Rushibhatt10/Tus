import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState("dark");

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Smooth scroll
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Detect active section
  useEffect(() => {
    const sections = ["home", "services", "about", "contact"];

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2;

      sections.forEach((section) => {
        const elem = document.getElementById(section);
        if (elem) {
          const top = elem.offsetTop;
          const bottom = top + elem.offsetHeight;
          if (scrollPos >= top && scrollPos < bottom) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", id: "home" },
    { name: "Services", id: "services" },
    { name: "About", id: "about" },
    { name: "Contact", id: "contact" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-lg transition-all duration-500 ${
        theme === "dark" ? "bg-black/40" : "bg-white/40"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-1">
        <Link
          to="/"
          className={`text-2xl font-bold tracking-wide cursor-pointer transition-all duration-300 ${
            theme === "dark"
              ? "text-white hover:text-pink-400"
              : "text-black hover:text-pink-500"
          }`}
        >
          Nidhi Enterprises
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6 text-lg">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className={`transition px-2 py-1 font-medium ${
              activeSection === link.id
                ? "text-pink-400"
                : theme === "dark"
                ? "text-white hover:text-pink-300"
                : "text-black hover:text-pink-500"
            }`}
          >
            {link.name}
          </button>
        ))}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-gray-400 hover:scale-110 transition bg-opacity-50 backdrop-blur-lg"
        >
          {theme === "dark" ? (
            <Sun className="w-6 h-6 text-yellow-400 transition-transform duration-300 rotate-0" />
          ) : (
            <Moon className="w-6 h-6 text-gray-700 transition-transform duration-300 rotate-0" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
