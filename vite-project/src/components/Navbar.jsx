import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("hero");

  // Smooth scroll
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Detect active section
  useEffect(() => {
    const sections = ["hero", "about", "services", "contact"];

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
    { name: "Home", id: "hero" },
    { name: "Services", id: "services" },
    { name: "About", id: "about" },
    { name: "Contact", id: "contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent text-purple-600 px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-1">
        <Link
          to="/"
          className="text-2xl text-purple-600 font-bold cursor-pointer"
        >
          Nidhi Enterprises
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="space-x-6 text-lg flex">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className={`transition px-2 py-1 ${
              activeSection === link.id
                ? "text-purple-400 font-semibold"
                : "hover:text-purple-400"
            }`}
          >
            {link.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
