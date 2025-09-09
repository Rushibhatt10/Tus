import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Instagram, Phone } from "lucide-react";
import heroFabric from "../assets/1.jpg";
import qrCode from "../assets/qr-code.png";

const LandingPage = () => {
  const [theme, setTheme] = useState("dark");

  // Load theme from local storage and listen for changes
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const handleStorageChange = () => {
      const updatedTheme = localStorage.getItem("theme") || "dark";
      setTheme(updatedTheme);
      document.documentElement.classList.toggle("dark", updatedTheme === "dark");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* HERO SECTION */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 to-pink-700 px-6"
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center brightness-75"
          style={{ backgroundImage: `url(${heroFabric})` }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <div className="relative z-10 max-w-4xl text-center">
          <motion.button
            onClick={scrollToServices}
            className={`px-12 py-4 border rounded-full backdrop-blur font-semibold text-lg transition ${
              theme === "dark"
                ? "border-white/40 bg-white/10 text-white hover:bg-white/30"
                : "border-black/40 bg-black/10 text-black hover:bg-black/20"
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            START SHOPPING
          </motion.button>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section
        id="services"
        className={`py-40 px-6 md:px-20 transition-colors ${
          theme === "dark"
            ? "bg-gradient-to-tr from-gray-900 via-black to-gray-900"
            : "bg-gradient-to-tr from-gray-100 via-white to-gray-100"
        }`}
      >
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-pink-400"
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
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
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
                theme === "dark"
                  ? "bg-white/10 border-white/20"
                  : "bg-black/5 border-gray-300"
              } ${idx % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px 2px rgba(232, 121, 249, 0.7)",
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={service.img}
                alt={service.title}
                className="w-full md:w-1/2 h-[400px] object-cover rounded-2xl shadow-lg"
                loading="lazy"
              />
              <div className="flex-1 text-center md:text-left space-y-4">
                <h3 className="text-3xl font-bold text-pink-400">
                  {service.title}
                </h3>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {service.desc}
                </p>
                <button className="mt-4 px-6 py-3 border border-pink-400 text-pink-400 rounded-full font-semibold hover:bg-pink-400 hover:text-black transition">
                  Explore Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ABOUT US SECTION */}
      <section
        id="about"
        className={`py-40 px-6 md:px-20 transition-colors ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div className="max-w-7xl mx-auto md:flex md:space-x-16 items-center">
          {/* Text Content */}
          <div className="md:w-1/2 space-y-8">
            <h2 className="text-4xl font-bold text-pink-400">About Us</h2>
            <p
              className={`leading-relaxed text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Nidhi Enterprises is a premier textile house based in Ahmedabad
              specializing in premium suits, shirtings, and trousers. We
              combine timeless craftsmanship with cutting-edge fabric
              technology to cater to the modern wardrobe needs of our
              customers. Our commitment is towards sustainable innovation and
              unparalleled quality.
            </p>
            <p
              className={`leading-relaxed text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              With years of expertise in tailoring and fabric sourcing, we
              ensure each piece is a blend of style, comfort, and durability,
              perfected to your taste.
            </p>

            {/* Contact Icons */}
            <div className="flex flex-wrap gap-6 mt-6 text-pink-400">
              <a
                href="https://maps.app.goo.gl/1QzMtkjQcLWxtoCG9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-pink-600 transition"
              >
                <MapPin className="w-6 h-6" />
                <span>Ahmedabad, India</span>
              </a>
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-pink-600 transition"
              >
                <Instagram className="w-6 h-6" />
                <span>@nidhienterprises</span>
              </a>
              <a
                href="https://wa.me/9265083688"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-pink-600 transition"
              >
                <Phone className="w-6 h-6" />
                <span>Chat with us</span>
              </a>
            </div>
          </div>

          {/* QR Code Image */}
          <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
            <img
              src={qrCode}
              alt="Nidhi Enterprises QR Code"
              className="w-48 h-48 rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section
        id="contact"
        className={`py-20 px-6 md:px-20 transition-colors ${
          theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl mb-8 text-center text-pink-400 font-bold">
            Contact Us
          </h2>
          <form
            action="https://getform.io/f/anlnxjva"
            method="POST"
            className={`flex flex-col gap-6 p-8 rounded-xl shadow-lg ${
              theme === "dark"
                ? "bg-white/10 backdrop-blur-lg"
                : "bg-white border border-gray-200"
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
              className="bg-pink-400 text-black font-semibold py-4 rounded-full hover:bg-pink-500 transition"
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
