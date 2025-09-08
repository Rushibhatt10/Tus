import React, { useRef, useEffect, useState, useMemo, useId } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Import background images from src/assets folder
import bg1 from "../assets/1.jpg";
import bg2 from "../assets/2.jpeg";
import bg3 from "../assets/3.jpg";
import bg4 from "../assets/4.jpg";
import bg5 from "../assets/5.jpeg";
import bg6 from "../assets/6.jpg";



//                                  CurvedLoop Component 
const CurvedLoop = ({
  marqueeText = "",
  speed = 0.5,
  className,
  curveAmount = 40,
  direction = "left",
  interactive = true,
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, "") : marqueeText) + "\u00A0";
  }, [marqueeText]);


  const measureRef = useRef(null);
  const textPathRef = useRef(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;


  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef(direction);
  const velRef = useRef(0);


  const textLength = spacing;
  const totalText = textLength ? Array(Math.ceil(1800 / textLength) + 2).fill(text).join('') : text;
  const ready = spacing > 0;


  useEffect(() => {
    if (measureRef.current)
      setSpacing(measureRef.current.getComputedTextLength());
  }, [text]);


  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute("startOffset", initial + "px");
      setOffset(initial);
    }
  }, [spacing]);


  useEffect(() => {
    if (!spacing || !ready) return;
    let frame = 0;


    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === "right" ? speed : -speed;
        const currentOffset = parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
        let newOffset = currentOffset + delta;
        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;
        textPathRef.current.setAttribute("startOffset", newOffset + "px");
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };


    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready]);


  const onPointerDown = (e) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    e.target.setPointerCapture(e.pointerId);
  };


  const onPointerMove = (e) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    const currentOffset = parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
    let newOffset = currentOffset + dx;
    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;
    textPathRef.current.setAttribute("startOffset", newOffset + "px");
    setOffset(newOffset);
  };


  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? "right" : "left";
  };


  return (
    <div
      className="min-h-[150px] flex items-center justify-center w-full"
      style={{ visibility: ready ? "visible" : "hidden", cursor: interactive ? (dragRef.current ? "grabbing" : "grab") : "auto" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg
        className="select-none w-full overflow-visible block aspect-[100/12] text-[3rem] font-extrabold uppercase leading-none"
        viewBox="0 0 1440 120"
      >
        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{ visibility: "hidden", opacity: 0, pointerEvents: "none" }}
        >
          {text}
        </text>
        <defs>
          <path id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text xmlSpace="preserve" className={`fill-[#6A0DAD] ${className ?? ""}`}>
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={offset + "px"} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};


// ----------------- Landing Page -----------------
const LandingPage = () => {
  const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6];
  const [bgImage, setBgImage] = useState(bg1);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setBgImage(backgrounds[randomIndex]);
  }, []);

  return (
    <div
      className="w-full h-full overflow-x-hidden scroll-smooth relative text-gray-900"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Hero Section */}
      <section id="hero" className="relative flex flex-col items-center justify-center h-screen text-center px-6">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
          transition={{ repeat: Infinity, duration: 15 }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, -60, 60, 0], y: [0, 60, -60, 0] }}
          transition={{ repeat: Infinity, duration: 18 }}
        />


        <CurvedLoop marqueeText="Premium Suits - Custom Tailoring - Wardrobe Solutions - Fine Fabrics -" />


        <motion.div
          className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl shadow-2xl p-10 mt-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white bg-purple-600-gradient-to-bl drop-shadow-lg">Nidhi Enterprises</h1>
          <p className="text-xl text-black mt-6 font-medium">
            Your one-stop destination for premium fabrics and custom tailoring.
          </p>
          <Link
            to="/products"
            className="mt-10 inline-block px-10 py-4 rounded-full font-semibold text-white text-lg bg-gradient-to-r from-purple-700 to-pink-500 hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Shop Now
          </Link>
        </motion.div>
      </section>


      {/* Services Section */}
      <section id="services" className="py-40 px-6 md:px-20">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-purple-800"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Services
        </motion.h2>

        <div className="max-w-6xl mx-auto flex flex-col gap-20">
          {[
            {
              title: "Premium Suits",
              desc: "Custom-tailored suits using top-quality fabrics, crafted to perfection for every occasion.",
              img: "https://static.vecteezy.com/system/resources/previews/059/510/624/non_2x/tailored-jacket-displayed-in-sewing-studio-with-colorful-threads-free-photo.jpeg",
            },
            {
              title: "Shirtings & Shirts",
              desc: "A wide variety of formal and casual shirts designed for ultimate comfort and style.",
              img: "https://i.pinimg.com/1200x/57/18/bb/5718bbe0ede103cb7fe311a555bc707a.jpg",
            },
            {
              title: "Pants & Trousers",
              desc: "Stylish and comfortable pants tailored to fit you perfectly for both work and leisure.",
              img: "https://myraymond.com/cdn/shop/files/RMTS05351-B7-1.jpg?v=1751973073",
            },
          ].map((service, idx) => (
            <motion.div
              key={idx}
              className={`flex flex-col md:flex-row items-center gap-12 backdrop-blur-xl bg-white/50 border border-white/40 rounded-3xl shadow-xl p-8 ${
                idx % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
              whileHover={{ scale: 1 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={service.img}
                alt={service.title}
                className="w-full md:w-[50%] h-[400px] object-cover rounded-2xl shadow-lg"
              />
              <div className="flex-1 text-center md:text-left space-y-4">
                <h3 className="text-3xl font-bold text-purple-800">{service.title}</h3>
                <p className="text-lg text-gray-700">{service.desc}</p>
                <button className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full font-semibold hover:scale-105 cursor-pointer transition">
                  Explore Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-40 px-6 md:px-20">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-purple-800"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          About Us
        </motion.h2>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 backdrop-blur-lg bg-white/50 border border-white/40 rounded-3xl shadow-xl p-8">
          <img
            src="https://i.ibb.co/rK3d8B92/IMG-20250827-WA0018.jpg"
            alt="Owner"
            className="w-72 h-72 rounded-2xl object-cover shadow-lg"
          />
          <div className="space-y-4 text-lg text-neutral-700">
            <p>
              <strong className="text-purple-500/90">Nidhi Enterprises in Revdi Bazar, Ahmedabad</strong>
            </p>
            <p>
              We are a trusted name in the textile industry, specializing in premium
              <strong className="text-purple-400/90"> Suitings & Shirtings</strong> and offering an extensive range of
              <strong className="text-purple-400/90"> Fabrics</strong>, quality materials, and fashionable designs.
            </p>
            <p>
              With years of experience, we pride ourselves on delivering excellence and
              building long-term relationships with our customers through authentic products and
              personalized service.
            </p>
            <p>
              <strong className="text-purple-400/90">Our Promise:</strong> Best quality fabrics at competitive prices,
              exceptional craftsmanship, and a seamless shopping experience.
            </p>
            <p>
              <strong className="text-purple-400/90">Location:</strong> Opp. Dhanlaxmi Market, Ahmedabad.
            </p>
            <p>
              Visit us today to explore our latest collection and experience the blend of
              tradition and modernity in every fabric we offer.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 md:px-20">
        <motion.h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-purple-800">
          Contact Us
        </motion.h2>
        <form
          action="https://getform.io/f/anlnxjva"
          method="POST"
          className="max-w-2xl mx-auto backdrop-blur-xl bg-white/40 border border-white/50 shadow-lg p-8 rounded-3xl space-y-6"
        >
          <input type="text" name="name" placeholder="Your Name" className="w-full p-4 rounded-lg border border-gray-300 bg-white/70" required />
          <input type="email" name="email" placeholder="Your Email" className="w-full p-4 rounded-lg border border-gray-300 bg-white/70" required />
          <input type="text" name="number" placeholder="Your Number" className="w-full p-4 rounded-lg border border-gray-300 bg-white/70" required />
          <textarea name="message" placeholder="Your Message" rows="5" className="w-full p-4 rounded-lg border border-gray-300 bg-white/70" required></textarea>
          <button type="submit" className="w-full px-6 py-4 bg-purple-700 text-white rounded-lg hover:bg-purple-900 transition">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
};

export default LandingPage;
