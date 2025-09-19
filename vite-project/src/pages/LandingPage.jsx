import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { MapPin, Instagram, Phone, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

// ✅ Import ALL your hero images
import hero1 from "../assets/1.jpg";
import hero2 from "../assets/2.jpeg";
import hero3 from "../assets/3.jpg";
import hero4 from "../assets/4.jpg";
import hero5 from "../assets/5.jpeg"; 
import hero6 from "../assets/6.jpg";
import hero7 from "../assets/7.jpg";
import hero8 from "../assets/8.jpeg";

import qrCode from "../assets/qr-code.png";

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("home");
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [randomHero, setRandomHero] = useState(null);

  // ✅ Store all hero images
  const heroImages = [hero1, hero2, hero3, hero4, hero5];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    setRandomHero(heroImages[randomIndex]);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  // ✅ Dynamic accent color
  const accentColor = theme === "dark" ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700";
  const borderAccent = theme === "dark" ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white";

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* ==================== NAVBAR ==================== */}
      <nav
        className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-lg transition-all duration-500 ${
          theme === "dark" ? "bg-black/40" : "bg-white/60"
        }`}
      >
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`text-2xl font-bold tracking-wide cursor-pointer transition-all duration-300 ${accentColor}`}
          >
            Nidhi Enterprises
          </Link>
        </div>

        <div className="flex items-center space-x-6 text-lg">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`transition px-2 py-1 font-medium ${
                activeSection === link.id
                  ? theme === "dark" ? "text-white" : "text-black"
                  : accentColor
              }`}
            >
              {link.name}
            </button>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-400 hover:scale-110 transition bg-opacity-50 backdrop-blur-lg"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6 text-yellow-400 transition-transform duration-300" />
            ) : (
              <Moon className="w-6 h-6 text-gray-700 transition-transform duration-300" />
            )}
          </button>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-6"
      >
        {randomHero && (
          <motion.div
            className="absolute inset-0 bg-cover bg-center brightness-75"
            style={{ backgroundImage: `url(${randomHero})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        <div className="relative z-10 max-w-4xl text-center">
          <Link to="/products">
            <motion.button
              className={`px-12 py-4 border rounded-full backdrop-blur font-semibold text-lg transition ${borderAccent}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              START SHOPPING
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ==================== SERVICES SECTION ==================== */}
      <section
        id="services"
        className={`py-40 px-6 md:px-20 transition-colors ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        <motion.h2
          className={`text-4xl md:text-5xl font-bold text-center mb-16 ${theme === "dark" ? "text-white" : "text-black"}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Services
        </motion.h2>

        <motion.div
          className="max-w-7xl mx-auto flex flex-col gap-20"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {[
            {
              title: "Premium Suits",
              desc: "Custom-tailored suits using the finest fabrics, designed to deliver luxury and sophistication for any occasion.",
              img: "https://static.vecteezy.com/system/resources/previews/059/510/624/non_2x/tailored-jacket-displayed-in-sewing-studio-with-colorful-threads-free-photo.jpeg",
            },
            {
              title: "Shirtings & Shirts",
              desc: "A wide variety of formal and casual shirts, crafted for comfort and elegance, made with top-quality materials.",
              img: "https://i.pinimg.com/1200x/57/18/bb/5718bbe0ede103cb7fe311a555bc707a.jpg",
            },
            {
              title: "Pants & Trousers",
              desc: "Perfectly tailored trousers and pants for work or leisure, offering comfort, style, and a flawless fit.",
              img: "https://myraymond.com/cdn/shop/files/RMTS05351-B7-1.jpg?v=1751973073",
            },
          ].map((service, idx) => (
            <motion.div
              key={idx}
              className={`flex flex-col md:flex-row items-center gap-12 backdrop-blur-xl rounded-3xl shadow-lg p-8 border transition ${
                theme === "dark" ? "bg-white/10 border-white/20" : "bg-black/5 border-gray-300"
              } ${idx % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={service.img}
                alt={service.title}
                className="w-full md:w-1/2 h-[400px] object-cover rounded-2xl shadow-lg"
                loading="lazy"
              />
              <div className="flex-1 text-center md:text-left space-y-4">
                <h3 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  {service.title}
                </h3>
                <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                  {service.desc}
                </p>
                <button className={`mt-4 px-6 py-3 rounded-full font-semibold transition border ${borderAccent}`}>
                  Explore Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ==================== ABOUT US ==================== */}
      <section
        id="about"
        className={`py-40 px-6 md:px-20 transition-colors ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div className="max-w-7xl mx-auto md:flex md:space-x-16 items-center">
          <div className="md:w-1/2 space-y-8">
            <h2 className={`text-4xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
              About Us
            </h2>
            <p className={`leading-relaxed text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Nidhi Enterprises is a premier textile house based in Ahmedabad specializing in
              premium suits, shirtings, and trousers...
            </p>
            <p className={`leading-relaxed text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              With years of expertise in tailoring and fabric sourcing...
            </p>

            <div className={`flex flex-wrap gap-6 mt-6 ${theme === "dark" ? "text-white" : "text-black"}`}>
              <a
                href="https://maps.app.goo.gl/1QzMtkjQcLWxtoCG9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 transition"
              >
                <MapPin className="w-6 h-6" />
                <span>Ahmedabad, India</span>
              </a>
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 transition"
              >
                <Instagram className="w-6 h-6" />
                <span>@nidhienterprises</span>
              </a>
              <a
                href="https://wa.me/9265083688"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 transition"
              >
                <Phone className="w-6 h-6" />
                <span>Chat with us</span>
              </a>
            </div>
          </div>

          <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
            <img
              src={qrCode}
              alt="Nidhi Enterprises QR Code"
              className="w-48 h-48 rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ==================== CONTACT ==================== */}
      <section
        id="contact"
        className={`py-35 px-6 md:px-20 transition-colors ${
          theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-4xl mb-8 text-center font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            Contact Us
          </h2>
          <form
            action="https://getform.io/f/anlnxjva"
            method="POST"
            className={`flex flex-col gap-6 p-8 rounded-xl shadow-lg ${
              theme === "dark" ? "bg-white/10 backdrop-blur-lg" : "bg-white border border-gray-200"
            }`}
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              className="p-4 rounded-md border border-gray-300 placeholder-gray-500 text-black"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              className="p-4 rounded-md border border-gray-300 placeholder-gray-500 text-black"
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              required
              className="p-4 rounded-md border border-gray-300 placeholder-gray-500 text-black resize-none"
            />
            <button
              type="submit"
              className={`py-4 rounded-full font-semibold transition ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
