import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ProductListing from "./pages/ProductListing";
import AdminPanel from "./pages/AdminPanel";
import ProductDetails from "./pages/ProductDetails";

function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/signup" || location.pathname === "/products";
    location.pathname === "/login";  location.pathname === "/admin";
    location.pathname.startsWith("/products/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:id" element={<ProductDetails />} /> {/* ✅ FIXED */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </>
  );
}

export default function MainApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
