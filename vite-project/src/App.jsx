import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ProductListing from "./pages/ProductListing";
import AdminPanel from "./pages/AdminPanel";
import ProductDetails from "./pages/ProductDetails";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Checkout from "./pages/Cheakout";

function App() {
  const location = useLocation();

  // ✅ Hide Navbar on specific routes
  const hideNavbar =
    location.pathname === "/signup" ||
    location.pathname === "/login" ||
    location.pathname === "/admin" ||
    location.pathname === "/account" ||
    location.pathname === "/products" ||
    location.pathname === "/cart" ||
    location.pathname === "/checkout" || 
    location.pathname.startsWith("/products/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/account" element={<Account />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
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
