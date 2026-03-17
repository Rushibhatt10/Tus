import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Instagram, Phone, Sun, Moon, ArrowRight, Menu, X } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import Lenis from "@studio-freight/lenis";

import hero1 from "../assets/1.jpg";
import hero2 from "../assets/2.jpeg";
import hero3 from "../assets/3.jpg";
import hero4 from "../assets/4.jpg";
import hero5 from "../assets/5.jpeg"; 
import hero6 from "../assets/6.jpg";
import hero7 from "../assets/7.jpg";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refs
  const lScroll = useRef(null);
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);
  const titleRefs = useRef([]);
  const textRefs = useRef([]);
  const parallaxImages = useRef([]);
  const collectionRef = useRef(null);
  
  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      mouseMultiplier: 1.2,
    });
    
    lScroll.current = lenis;

    function raf(time) {
      if(lenis) lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);
    
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    // 1. Hero Reveal Animation (Curtain Effect + Scale)
    gsap.fromTo(
      heroImageRef.current,
      { scale: 1.2, filter: "brightness(0.2)" },
      { 
        scale: 1, 
        filter: "brightness(0.6)", 
        duration: 2.5, 
        ease: "power3.inOut" 
      }
    );

    // 2. Split Type Animations for Titles
    titleRefs.current.forEach((el) => {
      if(!el) return;
      const text = new SplitType(el, { types: 'chars,lines' });
      
      // Ensure container overflow is hidden so letters slide UP from invisible
      el.style.overflow = "hidden";
      
      gsap.fromTo(
        text.chars,
        { y: 150, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.02,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 3. Simple Text Fade UPs
    textRefs.current.forEach((el) => {
      if(!el) return;
      gsap.fromTo(el, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 4. Parallax Images in Collection
    parallaxImages.current.forEach((img) => {
      if(!img) return;
      gsap.fromTo(img,
        { y: -30 },
        {
          y: 30,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });
    
    // Refresh ScrollTrigger to ensure calculations are correct with layout
    setTimeout(() => {
       ScrollTrigger.refresh();
    }, 100);

  }, []);

  // Make a beautiful magnetic button effect
  const handleMagneticMove = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power2.out" });
  };
  
  const handleMagneticLeave = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    fetch("https://getform.io/f/anlnxjva", {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
      },
    })
    .then(response => {
      if (response.ok) {
        form.reset();
        alert("Thank you! Your message has been sent successfully.");
      } else {
        alert("Oops! There was a problem submitting your form");
      }
    })
    .catch(error => {
      console.error(error);
      alert("Oops! There was a problem submitting your form");
    });
  };

  const navLinks = [
    { name: "Our Collection", id: "collection" },
    { name: "Our Moto", id: "tailoring" },
    { name: "Reach Out", id: "contact" },
  ];

  return (
    <div className={`transition-colors duration-1000 ${theme === "dark" ? "bg-[#0c0c0c] text-[#f5f5f0]" : "bg-[#f5f5f0] text-[#0c0c0c]"}`}>
      
      <nav className={`fixed top-0 w-full z-50 px-5 md:px-12 py-5 md:py-8 flex justify-between items-center transition-colors duration-1000 ${theme === "dark" ? "text-[#f5f5f0]" : "text-[#0c0c0c]"}`}>
        <Link to="/" className="text-lg md:text-2xl font-serif tracking-widest uppercase origin-left hover:scale-105 transition-transform duration-500 z-50 relative">
          Nidhi Enterprises
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 md:gap-12 font-medium tracking-[0.2em] uppercase text-xs md:text-sm relative group/nav">
          {navLinks.map((link) => (
            <button 
              key={link.id}
              onClick={() => {
                const el = document.getElementById(link.id);
                if(lScroll.current && el) {
                  lScroll.current.scrollTo(el);
                }
              }}
              className="relative px-2 py-1 group"
            >
              <span className="relative z-10 hover:opacity-100 opacity-60 transition-opacity duration-300">{link.name}</span>
              <span className={`absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-500 ease-out group-hover:w-full opacity-50 ${theme === "dark" ? "bg-white" : "bg-black"}`} />
            </button>
          ))}
          
          <button onClick={toggleTheme} className={`hover:rotate-180 transition-transform duration-700 ml-4 border p-2 rounded-full relative group overflow-hidden ${theme === "dark" ? "border-white/20" : "border-black/20"}`}>
            <span className={`absolute inset-0 border opacity-0 group-hover:opacity-30 rounded-full scale-150 group-hover:scale-100 transition-all duration-700 ease-out ${theme === "dark" ? "border-white" : "border-black"}`} />
            <div className="relative z-10 flex">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </div>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-3 z-50 relative">
          <button onClick={toggleTheme} className={`border p-1.5 rounded-full ${theme === "dark" ? "border-white/20" : "border-black/20"}`}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className={`absolute top-full left-0 w-full flex flex-col items-center gap-8 py-10 text-sm uppercase tracking-[0.25em] font-medium z-40 backdrop-blur-xl transition-all duration-300 ${
            theme === "dark" ? "bg-[#0c0c0c]/95 text-[#f5f5f0]" : "bg-[#f5f5f0]/95 text-[#0c0c0c]"
          }`}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  const el = document.getElementById(link.id);
                  if(lScroll.current && el) lScroll.current.scrollTo(el);
                  setMobileMenuOpen(false);
                }}
                className="opacity-70 hover:opacity-100 transition-opacity py-2"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}
              className={`mt-4 px-8 py-3 rounded-full border text-xs tracking-widest ${
                theme === "dark" ? "border-white/30 text-white" : "border-black/30 text-black"
              }`}
            >
              Shop Now
            </button>
          </div>
        )}
        
        {/* Full width ambient hanging thread */}
        <div className={`absolute top-0 right-12 w-[1px] h-32 opacity-20 hidden md:block origin-top animate-pulse ${theme === "dark" ? "bg-gradient-to-b from-white to-transparent" : "bg-gradient-to-b from-black to-transparent"}`} style={{ animationDuration: '4s' }} />
        <div className={`absolute top-0 right-48 w-[1px] h-16 opacity-10 hidden md:block origin-top animate-pulse ${theme === "dark" ? "bg-gradient-to-b from-white to-transparent" : "bg-gradient-to-b from-black to-transparent"}`} style={{ animationDuration: '3s', animationDelay: '1s' }} />
      </nav>

      {/* ================= HERO ================= */}
      <section ref={heroRef} className="relative w-full h-[100svh] flex flex-col justify-end pb-10 md:pb-24 px-5 md:px-12 overflow-hidden bg-black">
        <div 
          ref={heroImageRef}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${hero1})` }}
        />
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-6 md:gap-12">
          <h1 
            ref={el => el && !titleRefs.current.includes(el) && titleRefs.current.push(el)} 
            className="font-serif uppercase tracking-[-0.02em] text-white leading-[0.9] text-[clamp(2.5rem,12vw,8rem)] md:text-[clamp(5.2rem,9.4vw,11rem)] max-w-[12ch]"
          >
            <span className="block">The Art</span>
            <span className="block">of Clothing</span>
          </h1>
          <div className="flex flex-col items-start md:items-end gap-4 md:gap-6 text-white pb-2 md:pb-4 max-w-sm">
            <p ref={el => el && !textRefs.current.includes(el) && textRefs.current.push(el)} className="text-left md:text-right text-base md:text-xl font-light opacity-80 leading-relaxed">
              Redefining luxury clothing with the finest fabrics in Ahmedabad.
            </p>
            <button 
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              onClick={() => navigate('/products')}
              className="group flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 rounded-full border border-white/30 backdrop-blur-md hover:bg-white hover:text-black transition-colors duration-500 will-change-transform mt-2 md:mt-4 w-full md:w-auto justify-center"
            >
              <span className="uppercase tracking-widest text-xs font-semibold">Discover Collection</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= SIGNATURE STATEMENT ================= */}
      <section className="py-20 md:py-60 px-5 md:px-12 flex justify-center items-center">
        <h2 
          ref={el => el && !titleRefs.current.includes(el) && titleRefs.current.push(el)} 
          className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-serif text-center uppercase tracking-tight max-w-6xl leading-tight"
        >
          Elegance is not standing out, but being remembered. We craft timeless pieces for the modern gentleman.
        </h2>
      </section>

      {/* ================= COLLECTION (PARALLAX SCROLL) ================= */}
      <section id="collection" ref={collectionRef} className="py-16 md:py-24 px-5 md:px-12 w-full">
        <div className="flex justify-between items-end mb-10 md:mb-32 border-b border-current pb-6 md:pb-8 opacity-60">
          <h3 className="text-lg md:text-3xl uppercase tracking-widest font-serif">Selected Works</h3>
          <span className="text-sm tracking-widest">01 - 03</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 lg:gap-20 items-end">
          {/* Item 1 */}
          <div className="flex flex-col gap-5 md:mt-32">
            <div className="overflow-hidden w-full aspect-[3/4] group relative cursor-pointer" onClick={() => navigate('/products?type=SUIT')}>
              <div 
                ref={el => el && !parallaxImages.current.includes(el) && parallaxImages.current.push(el)}
                className="absolute inset-[-15%] w-[130%] h-[130%] bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-105 will-change-transform"
                style={{ backgroundImage: `url(${hero2})` }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
            </div>
            <div ref={el => el && !textRefs.current.includes(el) && textRefs.current.push(el)} className="flex items-center gap-4">
              <span className="text-sm uppercase tracking-widest opacity-50">01 /</span>
              <h4 className="text-xl md:text-2xl font-serif uppercase tracking-widest">Premium Suits</h4>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col gap-5">
            <div className="overflow-hidden w-full aspect-[3/4] group relative cursor-pointer" onClick={() => navigate('/products?type=SHIRT')}>
              <div 
                ref={el => el && !parallaxImages.current.includes(el) && parallaxImages.current.push(el)}
                className="absolute inset-[-15%] w-[130%] h-[130%] bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-105 will-change-transform"
                style={{ backgroundImage: `url(${hero5})` }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
            </div>
            <div ref={el => el && !textRefs.current.includes(el) && textRefs.current.push(el)} className="flex items-center gap-4">
              <span className="text-sm uppercase tracking-widest opacity-50">02 /</span>
              <h4 className="text-xl md:text-2xl font-serif uppercase tracking-widest">Fine Shirting</h4>
            </div>
          </div>
          
          {/* Item 3 */}
          <div className="flex flex-col gap-5 md:mt-32">
            <div className="overflow-hidden w-full aspect-[3/4] group relative cursor-pointer" onClick={() => navigate('/products?type=PANT')}>
              <div 
                ref={el => el && !parallaxImages.current.includes(el) && parallaxImages.current.push(el)}
                className="absolute inset-[-15%] w-[130%] h-[130%] bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-105 will-change-transform"
                style={{ backgroundImage: `url(${hero4})`, backgroundPosition: 'center 30%' }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
            </div>
            <div ref={el => el && !textRefs.current.includes(el) && textRefs.current.push(el)} className="flex items-center gap-4">
              <span className="text-sm uppercase tracking-widest opacity-50">03 /</span>
              <h4 className="text-xl md:text-2xl font-serif uppercase tracking-widest">Luxury Trousers</h4>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FABRIC STORYTELLING ================= */}
      <section id="tailoring" className="py-20 md:py-60 px-5 md:px-12 relative overflow-hidden flex items-center min-h-[80vh] md:min-h-[90vh]">
        <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{ backgroundImage: `url(${hero6})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' }} />
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-32 items-center">
          <h2 
            ref={el => el && !titleRefs.current.includes(el) && titleRefs.current.push(el)} 
            className="text-[13vw] sm:text-[10vw] md:text-7xl lg:text-8xl font-serif uppercase leading-[0.9]"
          >
            The Fabric <br/> of Success
          </h2>
          <div className="flex flex-col gap-6 md:gap-8 lg:ml-auto max-w-xl">
            <p ref={el => el && !textRefs.current.includes(el) && textRefs.current.push(el)} className="text-base md:text-2xl leading-relaxed opacity-80 font-light">
              We travel the world to source the highest quality wools, silks, and cottons. Each thread is chosen with intention, ensuring your garment not only looks impeccable but feels extraordinary.
            </p>
            <p ref={el => el && !textRefs.current.includes(el) && textRefs.current.push(el)} className="text-base md:text-2xl leading-relaxed opacity-80 font-light">
              Our master tailors bring decades of generational expertise to perfectly drape and contour these fabrics to your unique silhouette.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT CTA ================= */}
      <section id="contact" className={`py-20 md:py-40 px-5 md:px-12 flex flex-col items-center justify-center transition-colors duration-1000 ${theme === "dark" ? "bg-white text-black" : "bg-[#0c0c0c] text-white"}`}>
        <p className="tracking-[0.3em] uppercase text-xs md:text-sm mb-5 md:mb-6 opacity-60 font-semibold text-center">Ready to Elevate Your Style?</p>
        <h2 
          ref={el => el && !titleRefs.current.includes(el) && titleRefs.current.push(el)} 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif uppercase tracking-tighter mb-10 md:mb-16 text-center"
        >
          Get In Touch
        </h2>
        
        <form 
          onSubmit={handleFormSubmit}
          className="w-full max-w-2xl flex flex-col gap-6 md:gap-8 mb-16 md:mb-20"
        >
          <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
            <div className="w-full relative">
              <input 
                type="text" 
                name="name" 
                placeholder="Name" 
                required 
                className="w-full bg-transparent border-b border-current py-4 outline-none placeholder:opacity-50 transition-opacity focus:border-opacity-100 border-opacity-30 rounded-none text-lg"
              />
            </div>
            <div className="w-full relative">
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                required 
                className="w-full bg-transparent border-b border-current py-4 outline-none placeholder:opacity-50 transition-opacity focus:border-opacity-100 border-opacity-30 rounded-none text-lg"
              />
            </div>
          </div>
          <div className="w-full relative">
            <textarea 
              name="message" 
              placeholder="Message" 
              rows={4} 
              required 
              className="w-full bg-transparent border-b border-current py-4 outline-none placeholder:opacity-50 transition-opacity focus:border-opacity-100 border-opacity-30 rounded-none resize-none text-lg"
            />
          </div>
          
          <div className="flex justify-center mt-4 md:mt-8">
            <button 
              type="submit"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className={`group flex items-center justify-center w-28 h-28 md:w-40 md:h-40 rounded-full text-sm uppercase tracking-[0.2em] font-medium transition-colors duration-500 will-change-transform ${theme === "dark" ? "bg-[#0c0c0c] text-white hover:bg-black" : "bg-white text-[#0c0c0c] hover:bg-gray-100"}`}
            >
              Send
            </button>
          </div>
        </form>

        <div className="mt-16 md:mt-32 w-full max-w-7xl flex flex-col md:flex-row justify-between items-center md:items-end border-t border-current pt-10 md:pt-12 opacity-50 text-[10px] md:text-xs tracking-[0.2em] uppercase gap-6 md:gap-8">
          <div className="flex gap-8 md:gap-12">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:opacity-100 transition-opacity">Instagram</a>
            <a href="https://wa.me/9265083688" target="_blank" rel="noreferrer" className="hover:opacity-100 transition-opacity">WhatsApp</a>
            <a href="mailto:info@nidhienterprises.com" className="hover:opacity-100 transition-opacity">Email Us</a>
          </div>
          <div className="flex flex-col items-center md:items-end gap-3 text-center md:text-right">
            <span>© 2026 Nidhi Enterprises</span>
            <span>Handcrafted in Ahmedabad, India</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
