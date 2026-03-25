import React, { useEffect, useState, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import {
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  Shirt,
  Package,
  Users,
  Tags,
  LogOut,
  Settings,
  Tag,
} from "lucide-react";

const DEFAULT_AVAILABLE_LENGTHS = {
  SHIRT: {
    "1.40 m": true,
    "1.60 m": true,
    "1.80 m": true,
    "2.00 m": true,
    "2.20 m": true,
    "2.50 m": true,
  },
  SUIT: {
    "3.25 m": true,
    "3.50 m": true,
    "3.75 m": true,
    "4.00 m": true,
    "4.25 m": true,
  },
  PANT: {
    "1.20 m": true,
    "1.30 m": true,
    "1.40 m": true,
    "1.50 m": true,
    "1.60 m": true,
  },
};

const DEFAULT_SITE_SETTINGS = {
  heroHeading: "The Art\nof Clothing",
  heroSubtext: "Redefining luxury clothing with the finest fabrics in Ahmedabad.",
  heroCtaText: "Discover Collection",
  heroCtaLink: "/products",
  heroImage: "",
  whatsappLink: "https://wa.me/9265083688",
  instagramLink: "https://instagram.com",
  emailAddress: "nidhienterprises63@gmail.com",
  marqueeText: "Exclusive Offer: 10% OFF on all Suits! | Premium Handcrafted Tailoring",
  globalDiscountEnabled: false,
  globalDiscountPercent: 0,
  firstTimeDiscountPercent: 5,
};

const SUB_CATEGORY_OPTIONS = {
  SHIRT: [
    "Linen (Solids)",
    "Linen (Stripes & Checks)",
    "Linen (Printed)",
    "Cotton",
    "Linen Silk",
    "Cotton Linen",
  ],
  SUIT: [
    "Cotton Stretch",
    "Polyviscos Blend",
    "Wool Blend",
    "100% Linen",
    "100% Wool",
  ],
};

const AdminPanel = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // States
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Auth states
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Product form
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [pattern, setPattern] = useState("");
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [occasion, setOccasion] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [weight, setWeight] = useState("");
  const [stretch, setStretch] = useState("");
  const [availability, setAvailability] = useState("In Stock");
  const [discount, setDiscount] = useState("");
  const [collectionTag, setCollectionTag] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [images, setImages] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductSnapshot, setEditingProductSnapshot] = useState(null);
  const [type, setType] = useState("SHIRT");
  const [subCategory, setSubCategory] = useState("");
  const [isGifting, setIsGifting] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isPantAsSuit, setIsPantAsSuit] = useState(false);
  const [isSuitAsPant, setIsSuitAsPant] = useState(false);

  // Coupon state
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("");
  const [couponActive, setCouponActive] = useState(true);
  const [couponLoading, setCouponLoading] = useState(false);

  // Correct size pricing based on requirements
  const sizeOptions = {
    "SHIRT": ["1.40 m", "1.60 m", "1.80 m", "2.00 m", "2.20 m", "2.50 m"],
    "SUIT": ["3.25 m", "3.50 m", "3.75 m", "4.00 m", "4.25 m"],
    "PANT": ["1.20 m", "1.30 m", "1.40 m", "1.50 m", "1.60 m"]
  };

  const [allowCustomLength, setAllowCustomLength] = useState(true);
  const [sizePricing, setSizePricing] = useState({});
  const [pantSizePricing, setPantSizePricing] = useState({});
  const [availableLengths, setAvailableLengths] = useState(DEFAULT_AVAILABLE_LENGTHS);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [siteSettingsFile, setSiteSettingsFile] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY || "52848fd9eb0f7acc4f4fa3c5cd7ba2de";
  const apiBaseCandidates = useMemo(() => {
    const bases = [];
    const envBase = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
    if (envBase) bases.push(envBase);
    bases.push("");

    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        bases.push("http://localhost:5000");
      }
    }

    return [...new Set(bases)];
  }, []);

  const postToApi = async (path, payload, config = {}) => {
    const attempts = [];

    for (const base of apiBaseCandidates) {
      const url = `${base}${path}`;
      try {
        return await axios.post(url, payload, config);
      } catch (error) {
        attempts.push({
          url,
          status: error?.response?.status || null,
          message: error?.response?.data?.error || error?.message || "Unknown API error",
        });
      }
    }

    const err = new Error("All API endpoints failed");
    err.apiAttempts = attempts;
    throw err;
  };

  // Real-time data fetching
  useEffect(() => {
    if (user) {
      const productsUnsub = onSnapshot(collection(db, "products"), (snapshot) => {
        setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      const ordersUnsub = onSnapshot(collection(db, "orders"), (snapshot) => {
        setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      const settingsUnsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
        if (docSnap.exists()) {
          setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...docSnap.data() });
        }
      });

      const couponsUnsub = onSnapshot(collection(db, "coupons"), (snapshot) => {
        setCoupons(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      });

      return () => {
        settingsUnsub();
        productsUnsub();
        usersUnsub();
        ordersUnsub();
        couponsUnsub();
      };
    }
  }, [user]);

  // Reset toggles when type changes
  useEffect(() => {
    setIsPantAsSuit(false);
    setIsSuitAsPant(false);
    const allowedSubCategories = SUB_CATEGORY_OPTIONS[type] || [];
    if (!allowedSubCategories.includes(subCategory)) {
      setSubCategory("");
    }
  }, [type, subCategory]);

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    const ADMIN_NAME = "Hardik";
    const ADMIN_PASSWORD = "hardik@1234";

    if (adminName === ADMIN_NAME && adminPassword === ADMIN_PASSWORD) {
      try {
        await signInAnonymously(auth);
        setUser({ name: ADMIN_NAME, isAdmin: true });
        setToast({ show: true, message: "Login successful!", type: "success" });
        setAdminName("");
        setAdminPassword("");
      } catch (err) {
        console.error("Firebase Login Error:", err);
        setAuthError("Auth system unavailable. Try again.");
      }
      return;
    }

    setAuthError("Invalid name or password");
    setToast({ show: true, message: "Login failed", type: "error" });
  };

  const handleLogout = () => {
    setUser(null);
    setToast({ show: true, message: "Logged out successfully", type: "success" });
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        resolve(result);
      };
      reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const hasImageExtension = (fileName = "") =>
    /\.(png|jpe?g|gif|webp|bmp|svg|avif|heic|heif|jfif)$/i.test(fileName);

  const canLoadAsImage = (file) =>
    new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(true);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(false);
      };
      img.src = objectUrl;
    });

  const compressImageIfNeeded = async (file, options = {}) => {
    const maxDimension = options.maxDimension || 1920;
    const quality = options.quality || 0.82;
    const alreadySmall = file.size <= 1.5 * 1024 * 1024;

    if (
      !file?.type?.startsWith("image/") ||
      file.type === "image/gif" ||
      file.type === "image/svg+xml" ||
      alreadySmall
    ) {
      return file;
    }

    const imageUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to load image for compression"));
        image.src = imageUrl;
      });

      const width = img.width || 1;
      const height = img.height || 1;
      const scale = Math.min(1, maxDimension / Math.max(width, height));

      if (scale >= 1) {
        return file;
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return file;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });

      if (!blob) {
        return file;
      }

      const safeName = (file.name || "image").replace(/\.[^/.]+$/, "");
      return new File([blob], `${safeName}.jpg`, { type: "image/jpeg" });
    } catch (error) {
      console.error("Image compression failed. Using original file.", error);
      return file;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  // Image Upload
  const uploadSingleImage = async (file, options = {}) => {
    if (!file) return null;
    const mimeLooksLikeImage = typeof file.type === "string" && file.type.startsWith("image/");
    const extensionLooksLikeImage = hasImageExtension(file.name || "");
    if (!mimeLooksLikeImage && !extensionLooksLikeImage) {
      const loadable = await canLoadAsImage(file);
      if (!loadable) {
        throw new Error("Selected file is not a valid image.");
      }
    }

    const allowInlineFallback = options.allowInlineFallback === true;
    const preparedFile = await compressImageIfNeeded(file);
    const uploadErrors = [];
    let imageBase64 = "";

    try {
      imageBase64 = await fileToBase64(preparedFile);
      const { data } = await postToApi("/api/upload/imgbb", {
        imageBase64,
        name: preparedFile.name || file.name,
      });
      if (data?.url) return data.url;
      uploadErrors.push("Backend did not return an image URL");
    } catch (backendError) {
      console.error("Backend image upload failed:", backendError);
      const backendMsg =
        backendError?.response?.data?.error ||
        (Array.isArray(backendError?.apiAttempts) && backendError.apiAttempts.length > 0
          ? backendError.apiAttempts[backendError.apiAttempts.length - 1].message
          : backendError?.message || "Unknown backend upload error");
      uploadErrors.push(`Backend upload failed: ${backendMsg}`);
    }

    if (imgbbApiKey) {
      try {
        if (!imageBase64) {
          imageBase64 = await fileToBase64(preparedFile);
        }
        const body = new URLSearchParams({
          key: imgbbApiKey,
          image: imageBase64,
          name: preparedFile.name || file.name || "hero-image",
        });
        const directBase64Res = await axios.post("https://api.imgbb.com/1/upload", body, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        if (directBase64Res?.data?.data?.url) {
          return directBase64Res.data.data.url;
        }
        uploadErrors.push("Direct ImgBB base64 upload did not return image URL");
      } catch (directBase64Error) {
        console.error("Direct ImgBB base64 upload failed:", directBase64Error);
        uploadErrors.push(
          `Direct ImgBB base64 upload failed: ${
            directBase64Error?.response?.data?.error?.message ||
            directBase64Error?.message ||
            "Unknown direct upload error"
          }`
        );
      }

      try {
        const formData = new FormData();
        formData.append("image", preparedFile);
        const directFormDataRes = await axios.post(
          `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
          formData
        );
        if (directFormDataRes?.data?.data?.url) {
          return directFormDataRes.data.data.url;
        }
        uploadErrors.push("Direct ImgBB file upload did not return image URL");
      } catch (directFileError) {
        console.error("Direct ImgBB file upload failed:", directFileError);
        uploadErrors.push(
          `Direct ImgBB file upload failed: ${
            directFileError?.response?.data?.error?.message ||
            directFileError?.message ||
            "Unknown direct file upload error"
          }`
        );
      }
    } else {
      uploadErrors.push("No ImgBB API key available in frontend fallback");
    }

    if (allowInlineFallback) {
      try {
        const inlineDataUrl = await fileToDataUrl(preparedFile);
        if (inlineDataUrl) {
          return inlineDataUrl;
        }
      } catch (inlineError) {
        uploadErrors.push(`Inline image fallback failed: ${inlineError?.message || "Unknown error"}`);
      }
    }

    throw new Error(uploadErrors.join(" | "));
  };

  const handleMainImageChange = (e) => {
    setMainImage(e.target.files?.[0] || null);
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const normalizePercent = (value, fallback = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.min(100, parsed));
  };

  const saveSiteSettings = async (settingsPayload) => {
    const apiPayload = { ...settingsPayload };
    delete apiPayload.lastUpdated;

    try {
      await postToApi("/api/settings/global", apiPayload);
      return;
    } catch (apiError) {
      console.error("Backend settings save failed, trying Firestore client save:", apiError);
    }

    await setDoc(doc(db, "settings", "global"), settingsPayload, { merge: true });
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setEditingProductSnapshot(null);
    setProductName("");
    setDescription("");
    setPrice("");
    setBrand("");
    setColor("");
    setFabricType("");
    setPattern("");
    setMaterial("");
    setCareInstructions("");
    setOccasion("");
    setLength("");
    setWidth("");
    setWeight("");
    setStretch("");
    setAvailability("In Stock");
    setDiscount("");
    setMainImage(null);
    setImages([]);
    setCollectionTag("");
    setType("SHIRT");
    setSubCategory("");
    setIsGifting(false);
    setIsNewArrival(false);
    setIsPantAsSuit(false);
    setIsSuitAsPant(false);
    setAllowCustomLength(true);
    setSizePricing({});
    setPantSizePricing({});
    setAvailableLengths(DEFAULT_AVAILABLE_LENGTHS);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      let finalHeroUrl = siteSettings.heroImage;
      if (siteSettingsFile) {
        const url = await uploadSingleImage(siteSettingsFile, { allowInlineFallback: true });
        if (!url) {
          throw new Error("Hero image upload failed");
        }
        finalHeroUrl = url;
      }

      const settingsPayload = {
        ...DEFAULT_SITE_SETTINGS,
        ...siteSettings,
        heroImage: finalHeroUrl,
        globalDiscountPercent: normalizePercent(siteSettings.globalDiscountPercent, 0),
        firstTimeDiscountPercent: normalizePercent(siteSettings.firstTimeDiscountPercent, 0),
        lastUpdated: serverTimestamp(),
      };

      await saveSiteSettings(settingsPayload);
      setSiteSettings({
        ...DEFAULT_SITE_SETTINGS,
        ...siteSettings,
        heroImage: finalHeroUrl,
        globalDiscountPercent: normalizePercent(siteSettings.globalDiscountPercent, 0),
        firstTimeDiscountPercent: normalizePercent(siteSettings.firstTimeDiscountPercent, 0),
      });
      setToast({ show: true, message: "✅ Settings saved successfully!", type: "success" });
      setSiteSettingsFile(null);
    } catch (err) {
      console.error("Firestore Save Error:", err);
      const backendErrorMessage =
        err?.response?.data?.error ||
        (Array.isArray(err?.apiAttempts) && err.apiAttempts.length > 0
          ? err.apiAttempts[err.apiAttempts.length - 1].message
          : err?.message || "");
      const errMsg =
        err.code === "permission-denied"
          ? "Access denied: you do not have permission to save settings."
          : `Failed to save settings${backendErrorMessage ? `: ${backendErrorMessage}` : "."}`;
      setToast({ show: true, message: errMsg, type: "error" });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProductSnapshot(product);
    setEditingProductId(product.id);
    setProductName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price || "");
    setBrand(product.brand || "");
    setColor(product.color || "");
    setFabricType(product.fabricType || "");
    setPattern(product.pattern || "");
    setMaterial(product.material || "");
    setCareInstructions(product.careInstructions || "");
    setOccasion(product.occasion || "");
    setLength(product.length || "");
    setWidth(product.width || "");
    setWeight(product.weight || "");
    setStretch(product.stretch || "");
    setAvailability(product.availability || "In Stock");
    setDiscount(product.discount || "");
    setCollectionTag(product.collectionTag || "");
    const editType = product.type || "SHIRT";
    setType(editType);
    const allowedSubCategories = SUB_CATEGORY_OPTIONS[editType] || [];
    setSubCategory(allowedSubCategories.includes(product.subCategory) ? product.subCategory : "");
    setIsGifting(product.isGifting || false);
    setIsNewArrival(product.isNewArrival || false);
    setAllowCustomLength(product.allowCustomLength !== false);
    setIsPantAsSuit(product.isPantAsSuit || false);
    setIsSuitAsPant(product.isSuitAsPant || false);
    setMainImage(null);
    setImages([]);

    if (product.availableLengths) {
      setAvailableLengths({
        ...DEFAULT_AVAILABLE_LENGTHS,
        [product.type || "SHIRT"]: product.availableLengths
      });
    } else {
      setAvailableLengths(DEFAULT_AVAILABLE_LENGTHS);
    }
    setSizePricing(product.sizePricing || {});
    setPantSizePricing(product.pantSizePricing || {});
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const cancelEdit = () => {
    resetProductForm();
  };

  // Coupon handlers
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    const discountPercent = normalizePercent(couponDiscount, -1);
    const minimumOrderValue = Math.max(0, Number(couponMinOrder) || 0);

    if (!code || discountPercent <= 0) {
      setToast({ show: true, message: "Enter a valid coupon code and discount.", type: "error" });
      return;
    }

    setCouponLoading(true);
    try {
      const existingCouponQuery = query(collection(db, "coupons"), where("code", "==", code));
      const existingCouponSnap = await getDocs(existingCouponQuery);
      if (!existingCouponSnap.empty) {
        setToast({ show: true, message: `Coupon ${code} already exists.`, type: "error" });
        return;
      }

      await addDoc(collection(db, "coupons"), {
        code,
        discountPercent,
        minimumOrderValue,
        isActive: couponActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setToast({ show: true, message: "✅ Coupon created!", type: "success" });
      setCouponCode(""); setCouponDiscount(""); setCouponMinOrder(""); setCouponActive(true);
    } catch (error) {
      console.error("Coupon create failed:", error);
      setToast({ show: true, message: "❌ Failed to create coupon.", type: "error" });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      await updateDoc(doc(db, "coupons", coupon.id), {
        isActive: !coupon.isActive,
        updatedAt: serverTimestamp(),
      });
      setToast({ show: true, message: `Coupon ${coupon.isActive ? "disabled" : "enabled"}.`, type: "success" });
    } catch (error) {
      console.error("Coupon toggle failed:", error);
      setToast({ show: true, message: "❌ Failed to update coupon status.", type: "error" });
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await deleteDoc(doc(db, "coupons", id));
      setToast({ show: true, message: "✅ Coupon deleted.", type: "success" });
    } catch (error) {
      console.error("Coupon delete failed:", error);
      setToast({ show: true, message: "❌ Failed to delete coupon.", type: "error" });
    }
  };

  // Order status handler
  const handleOrderStatusChange = async (orderId, newStatus) => {
    const paymentStatusMap = {
      Pending: "pending",
      Paid: "paid",
      Shipped: "paid",
      Delivered: "paid",
    };
    const orderStatusMap = {
      Pending: "processing",
      Paid: "processing",
      Shipped: "shipped",
      Delivered: "delivered",
    };

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        paymentStatus: paymentStatusMap[newStatus] || "pending",
        orderStatus: orderStatusMap[newStatus] || "processing",
        updatedAt: serverTimestamp(),
      });
      setToast({ show: true, message: `Order status updated to ${newStatus}.`, type: "success" });
    } catch (error) {
      console.error("Order status update failed:", error);
      setToast({ show: true, message: "❌ Failed to update order status.", type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      setToast({ show: true, message: "Please enter a product name.", type: "error" });
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setToast({ show: true, message: "Please enter a valid product price.", type: "error" });
      return;
    }

    const requiresSubCategory = type === "SHIRT" || type === "SUIT";
    if (requiresSubCategory && !subCategory) {
      setToast({ show: true, message: "Please select a sub category for this product.", type: "error" });
      return;
    }

    if (!mainImage && !editingProductId) {
      setToast({ show: true, message: "Please upload a main hero image.", type: "error" });
      return;
    }

    setSubmitLoading(true);

    try {
      let uploadedHeroUrl = null;
      if (mainImage) {
        uploadedHeroUrl = await uploadSingleImage(mainImage);
        if (!uploadedHeroUrl) {
          throw new Error("Main hero image upload failed");
        }
      }

      const uploadedGalleryUrls = [];
      for (let i = 0; i < images.length; i++) {
        const url = await uploadSingleImage(images[i]);
        if (!url) {
          throw new Error(`Gallery image ${i + 1} upload failed`);
        }
        uploadedGalleryUrls.push(url);
      }

      const cleanedSizePricing = Object.entries(sizePricing || {}).reduce((acc, [len, val]) => {
        const parsed = Number(val);
        if (Number.isFinite(parsed) && parsed > 0) {
          acc[len] = parsed;
        }
        return acc;
      }, {});

      const cleanedPantSizePricing = Object.entries(pantSizePricing || {}).reduce((acc, [len, val]) => {
        const parsed = Number(val);
        if (Number.isFinite(parsed) && parsed > 0) {
          acc[len] = parsed;
        }
        return acc;
      }, {});

      const productData = {
        name: productName.trim(),
        description,
        price: numericPrice,
        brand,
        color,
        fabricType,
        pattern,
        material,
        careInstructions,
        occasion,
        length,
        width,
        weight,
        stretch,
        availability,
        discount: Math.max(0, Number(discount) || 0),
        collectionTag,
        type,
        allowCustomLength,
        availableLengths: availableLengths[type] || {},
        sizePricing: cleanedSizePricing,
        pantSizePricing: cleanedPantSizePricing,
        isPantAsSuit: type === "PANT" ? isPantAsSuit : false,
        isSuitAsPant: type === "SUIT" ? isSuitAsPant : false,
        isGifting,
        isNewArrival,
        subCategory: requiresSubCategory ? subCategory : "",
      };

      if (editingProductId) {
        const existingImages = Array.isArray(editingProductSnapshot?.images)
          ? editingProductSnapshot.images
          : [];
        const existingHero = editingProductSnapshot?.heroImage || existingImages[0] || "";
        const existingGallery = Array.isArray(editingProductSnapshot?.galleryImages)
          ? editingProductSnapshot.galleryImages
          : existingImages.slice(existingHero ? 1 : 0);

        const nextHeroImage = uploadedHeroUrl || existingHero || "";
        const nextGalleryImages = uploadedGalleryUrls.length > 0 ? uploadedGalleryUrls : existingGallery;
        const nextImages = [nextHeroImage, ...nextGalleryImages].filter(Boolean);

        await updateDoc(doc(db, "products", editingProductId), {
          ...productData,
          heroImage: nextHeroImage,
          galleryImages: nextGalleryImages,
          images: nextImages,
          updatedAt: serverTimestamp(),
        });
        setToast({ show: true, message: "✅ Product updated successfully!", type: "success" });
      } else {
        const heroImage = uploadedHeroUrl;
        if (!heroImage) {
          throw new Error("Main hero image upload failed");
        }

        const galleryImages = uploadedGalleryUrls;
        const finalImages = [heroImage, ...galleryImages];

        await addDoc(collection(db, "products"), {
          ...productData,
          heroImage,
          galleryImages,
          images: finalImages,
          createdAt: serverTimestamp(),
        });
        setToast({ show: true, message: "✅ Product added successfully!", type: "success" });
      }

      resetProductForm();
    } catch (error) {
      console.error("Product save failed:", error);
      setToast({
        show: true,
        message: `❌ ${error.message || "Failed to save product."}`,
        type: "error",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, "products", productToDelete.id));
        setToast({ show: true, message: "✅ Product deleted successfully!", type: "success" });
      } catch (error) {
        console.error("Product delete failed:", error);
        setToast({ show: true, message: "❌ Failed to delete product.", type: "error" });
      } finally {
        setShowDeleteModal(false);
        setProductToDelete(null);
      }
    }
  };

  const toggleAvailability = async (id, current) => {
    const newStatus = current === "In Stock" ? "Out of Stock" : "In Stock";
    try {
      await updateDoc(doc(db, "products", id), {
        availability: newStatus,
        updatedAt: serverTimestamp(),
      });
      setToast({ show: true, message: "✅ Availability updated!", type: "success" });
    } catch (error) {
      console.error("Availability update failed:", error);
      setToast({ show: true, message: "❌ Failed to update availability.", type: "error" });
    }
  };

  // Analytics calculations
  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const thisMonthOrders = orders.filter(o => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });
    return {
      totalRevenue,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalProducts: products.length,
      thisMonthOrders: thisMonthOrders.length,
      topProducts: products.slice(0, 5)
    };
  }, [orders, users, products]);

  // Group products by collectionTag
  const groupedProducts = useMemo(() => {
    const groups = {};
    products.forEach((p) => {
      const tag = p.collectionTag || "Others";
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(p);
    });
    return groups;
  }, [products]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Shirt },
    { id: "orders", label: "Orders", icon: Package },
    { id: "users", label: "Users", icon: Users },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "listing", label: "Collections", icon: Tags },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab);
  const pageTheme = theme === "dark" ? "bg-[#0c0c0c] text-[#f5f5f0]" : "bg-[#f5f5f0] text-[#0c0c0c]";
  const surfaceTheme =
    theme === "dark"
      ? "bg-[#141414]/85 border-white/10"
      : "bg-white/80 border-black/10";
  const sidebarHoverTheme = theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5";
  const authInputTheme =
    theme === "dark"
      ? "border-white/15 bg-[#121212]/70 text-[#f5f5f0] focus:ring-white/30"
      : "border-black/10 bg-white/90 text-[#0c0c0c] focus:ring-black/20";
  const fieldStyle = theme === "dark" ? { color: "#f5f5f0", backgroundColor: "#374151" } : { color: "#0c0c0c", backgroundColor: "white" };
  const sizeFieldStyle = theme === "dark" ? { color: "#f5f5f0", backgroundColor: "#1f2937" } : { color: "#0c0c0c", backgroundColor: "white" };

  // Show Toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageTheme}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-current"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 ${pageTheme}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-10 border backdrop-blur-xl ${surfaceTheme}`}
        >
          <h2 className="text-3xl font-extrabold text-center mb-2">Admin Login</h2>
          <p className={`text-center mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Manage your store efficiently
          </p>
          <form onSubmit={handleLogin} className="space-y-6">
            {authError && (
              <div className="bg-red-500/20 border border-red-500 text-red-600 px-4 py-3 rounded-xl">
                {authError}
              </div>
            )}
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Admin Username"
              className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 ${authInputTheme}`}
              required
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Password"
              className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 ${authInputTheme}`}
              required
            />
            <button
              type="submit"
              className={`w-full py-4 font-bold rounded-xl transition shadow-lg ${
                theme === "dark"
                  ? "bg-[#f5f5f0] text-[#0c0c0c] hover:bg-white"
                  : "bg-[#0c0c0c] text-[#f5f5f0] hover:bg-black/90"
              }`}
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${pageTheme}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white font-semibold`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-6 border rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 px-6 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 230 }}
              className={`fixed top-0 left-0 h-full w-72 border-r backdrop-blur-xl z-50 md:hidden ${surfaceTheme}`}
            >
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold tracking-wide">Admin Panel</h1>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`p-2 rounded-lg ${sidebarHoverTheme}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition ${
                          isActive
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : sidebarHoverTheme
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
                <div className={`border-t pt-4 space-y-2 ${theme === "dark" ? "border-white/10" : "border-black/10"}`}>
                  <button
                    onClick={toggleTheme}
                    className={`w-full text-left px-4 py-3 rounded-xl ${sidebarHoverTheme} flex items-center gap-3`}
                  >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:block w-72 border-r backdrop-blur-xl sticky top-0 h-screen ${surfaceTheme}`}>
          <div className="p-6 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-8 tracking-wide">Admin Panel</h1>
            <nav className="space-y-2 flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition ${
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : sidebarHoverTheme
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-6 space-y-2">
              <button
                onClick={toggleTheme}
                className={`w-full text-left px-4 py-3 rounded-xl ${sidebarHoverTheme} flex items-center gap-3`}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <header
            className={`sticky top-0 z-30 border-b backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-4 ${
              theme === "dark"
                ? "bg-[#0c0c0c]/85 border-white/10"
                : "bg-[#f5f5f0]/85 border-black/10"
            }`}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className={`md:hidden p-2 rounded-lg ${sidebarHoverTheme}`}
                  aria-label="Open navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <p className={`text-xs uppercase tracking-[0.22em] ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Admin Workspace
                  </p>
                  <h2 className="font-semibold text-base sm:text-lg truncate">{currentTab?.label || "Dashboard"}</h2>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`md:hidden p-2 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/20 hover:bg-white/10"
                    : "border-black/10 hover:bg-black/5"
                }`}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto"
            >
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-8">Dashboard</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: `₹${dashboardStats.totalRevenue.toLocaleString()}`, color: "bg-green-500" },
                    { label: "Total Orders", value: dashboardStats.totalOrders, color: "bg-blue-500" },
                    { label: "Total Users", value: dashboardStats.totalUsers, color: "bg-purple-500" },
                    { label: "Total Products", value: dashboardStats.totalProducts, color: "bg-orange-500" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`backdrop-blur-xl rounded-2xl p-6 shadow-lg border ${surfaceTheme}`}
                    >
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Additional Stats */}
                <div className={`backdrop-blur-xl rounded-2xl p-6 shadow-lg border ${surfaceTheme}`}>
                  <h3 className="text-xl font-bold mb-4">This Month Orders</h3>
                  <p className="text-4xl font-bold text-blue-600">{dashboardStats.thisMonthOrders}</p>
                </div>

                {/* Top Products */}
                <div className={`backdrop-blur-xl rounded-2xl p-6 shadow-lg border ${surfaceTheme}`}>
                  <h3 className="text-2xl font-bold mb-4">Top Products</h3>
                  <div className="space-y-3">
                    {dashboardStats.topProducts.map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 flex-wrap sm:flex-nowrap">
                        <span className="text-2xl">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{product.type}</p>
                        </div>
                        <p className="font-bold">₹{product.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Manage Products</h2>
                
                {/* Product Form */}
                <form onSubmit={handleSubmit} className={`backdrop-blur-xl rounded-2xl p-5 sm:p-8 border shadow-lg ${surfaceTheme}`}>
                  
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-2xl font-bold">{editingProductId ? "Edit Product" : "Add New Product"}</h3>
    {editingProductId && (
      <button type="button" onClick={cancelEdit} className="text-sm px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
        Cancel Edit
      </button>
    )}
  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Product Type *</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={fieldStyle}
                        className="w-full p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:!text-white"
                      >
                        <option value="SHIRT">👔 SHIRT</option>
                        <option value="SUIT">🧥 SUIT</option>
                        <option value="PANT">👖 PANT/TROUSERS</option>
                      </select>
                    </div>

                    {(type === "SHIRT" || type === "SUIT") && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Sub Category *</label>
                        <select
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          style={fieldStyle}
                          className="w-full p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:!text-white"
                          required
                        >
                          <option value="">Select Sub Category</option>
                          {(SUB_CATEGORY_OPTIONS[type] || []).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Available predefined lengths and custom length toggle */}
                    <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold">📏 Standard Fabric Lengths (Toggle Availability)</h4>
                        <label className="flex items-center gap-2 cursor-pointer font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border shadow-sm">
                          <input type="checkbox" checked={allowCustomLength} onChange={(e) => setAllowCustomLength(e.target.checked)} className="w-4 h-4" />
                          Allow Custom Input Length
                        </label>
                      </div>
                      <div className="flex flex-col gap-3 mt-2">
                        {sizeOptions[type].map(size => (
                          <div key={size} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <label className="flex items-center gap-2 cursor-pointer w-32">
                              <input
                                type="checkbox"
                                checked={availableLengths[type]?.[size] || false}
                                onChange={(e) => {
                                  const newAvail = { ...availableLengths };
                                  newAvail[type] = { ...newAvail[type], [size]: e.target.checked };
                                  setAvailableLengths(newAvail);
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-bold">{size}</span>
                            </label>
                            
                            {availableLengths[type]?.[size] && (
                              <div className="flex items-center gap-3">
                                <span>₹</span>
                                <input
                                  type="number"
                                  placeholder={price ? Math.round(Number(price) * parseFloat(size)) : "Price"}
                                  value={sizePricing[size] || ""}
                                  onChange={(e) => setSizePricing({...sizePricing, [size]: e.target.value})}
                                  className="w-24 p-2 border rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none dark:border-gray-600 text-sm"
                                />
                                <span className="text-xs opacity-60">Leave empty to use per-meter price (₹{price ? Math.round(Number(price) * parseFloat(size)) : 0})</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pant as Suit Toggle */}
                    {type === "PANT" && (
                      <div className="md:col-span-2 flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <label className="font-semibold">This Pant is same as Suit:</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPantAsSuit}
                            onChange={(e) => setIsPantAsSuit(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    )}

                    {/* Suit as Pant Toggle */}
                    {type === "SUIT" && (
                      <div className="md:col-span-2 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <label className="font-semibold">This Suit also shows in PANTS:</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSuitAsPant}
                            onChange={(e) => setIsSuitAsPant(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    )}

                    {/* New Arrivals / Gifting Toggles */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <label className="font-semibold text-sm">✨ Feature in New Arrivals</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="sr-only peer" />
                          <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <label className="font-semibold text-sm">🎁 Gifting Item</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={isGifting} onChange={(e) => setIsGifting(e.target.checked)} className="sr-only peer" />
                          <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
                        </label>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <input type="text" placeholder="Product Name *" value={productName} onChange={(e) => setProductName(e.target.value)} style={fieldStyle} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:!text-white" required />
                    <input type="text" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} style={fieldStyle} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:!text-white" />
                    <input type="number" placeholder="Price (₹) *" value={price} onChange={(e) => setPrice(e.target.value)} style={fieldStyle} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:!text-white" required />
                    <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} style={fieldStyle} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:!text-white" />
                    <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={fieldStyle} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 md:col-span-2 dark:!text-white" rows={3}></textarea>
                    <input type="text" placeholder="Fabric Type" value={fabricType} onChange={(e) => setFabricType(e.target.value)} style={fieldStyle} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:!text-white" />
                    <input type="text" placeholder="Pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-white" />
                    <input type="text" placeholder="Material" value={material} onChange={(e) => setMaterial(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-white" />
                    <input type="text" placeholder="Occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-white" />
                    <input type="number" placeholder="Discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-white" />

                    {/* Collection Tag */}
                    <select value={collectionTag} onChange={(e) => setCollectionTag(e.target.value)} className="p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 md:col-span-2 dark:text-white">
                      <option value="">Select Collection</option>
                      <option value="Trending">Trending</option>
                      <option value="The Trends">The Trends</option>
                      <option value="Fab Seasonal Fabric">Fab Seasonal Fabric</option>
                      <option value="Elegant Kurtas">Elegant Kurtas</option>
                      <option value="Supa Suits">Supa Suits</option>
                      <option value="Simp Shirting">Simp Shirting</option>
                    </select>
                    {/* Main Hero Image */}
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold mb-2">Main Product Image (Hero) *</p>
                      <input
                        id="mainImageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="mainImageUpload"
                        className="cursor-pointer block w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition border border-gray-300 dark:border-gray-600"
                      >
                        Upload Main Hero Image
                      </label>
                      {mainImage && (
                        <div className="mt-4">
                          <div className="w-full max-w-sm rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
                            <img
                              src={URL.createObjectURL(mainImage)}
                              alt="Main product"
                              className="w-full h-56 object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Gallery Images */}
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold mb-2">Additional Gallery Images</p>
                      <input
                        id="imageUpload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="cursor-pointer block w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition border border-gray-300 dark:border-gray-600"
                      >
                        Upload More Product Photos
                      </label>
                      <div className="flex gap-4 flex-wrap mt-4">
                        {images.map((file, i) => (
                          <div key={i} className="w-24 h-24 rounded-lg overflow-hidden border">
                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Image Order Preview */}
                    {(mainImage || images.length > 0) && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold mb-2">Display Order Preview (Hero first)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {mainImage && (
                            <div className="relative col-span-2 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
                              <img
                                src={URL.createObjectURL(mainImage)}
                                alt="Hero preview"
                                className="w-full h-40 sm:h-48 object-cover"
                              />
                              <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded bg-black text-white">
                                HERO
                              </span>
                            </div>
                          )}
                          {images.map((file, i) => (
                            <div key={`grid-${i}`} className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
                              <img src={URL.createObjectURL(file)} alt={`Gallery ${i + 1}`} className="w-full h-28 object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="md:col-span-2 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      {submitLoading ? "⏳ Saving..." : editingProductId ? "✅ Update Product" : "✅ Add Product"}
                    </button>
                  </div>
                </form>

                {/* Products List */}
                <div className={`backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden ${surfaceTheme}`}>
                  <h3 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">Products List</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="p-4 text-left">Name</th>
                          <th className="p-4 text-left">Price</th>
                          <th className="p-4 text-left">Status</th>
                          <th className="p-4 text-left">Type</th>
                          <th className="p-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <td className="p-4 font-semibold">{p.name}</td>
                            <td className="p-4">₹{p.price}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${p.availability === "In Stock" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"}`}>
                                {p.availability}
                              </span>
                            </td>
                            <td className="p-4">{p.type}</td>
                            <td className="p-4">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => handleEditClick(p)}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold shadow-sm transition-transform hover:scale-105"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => toggleAvailability(p.id, p.availability)}
                                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold"
                                >
                                  ↻ Toggle
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(p)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Orders Management</h2>
                <div className={`backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden ${surfaceTheme}`}>
                  <h3 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">All Orders</h3>
                  <div className="overflow-x-auto">
                    <div className="p-6 space-y-4">
                      {orders.length === 0 && <p className="text-center opacity-50 py-8">No orders yet.</p>}
                      {orders.map((o) => (
                        <div key={o.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                            <div>
                              <h4 className="font-bold text-lg">Order #{o.id.substring(0, 12)}...</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {o.createdAt?.toDate?.().toLocaleString() || "N/A"}
                              </p>
                            </div>
                            {/* Status Dropdown */}
                            <select
                              value={o.status || "Pending"}
                              onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                              style={fieldStyle}
                              className={`px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer ${
                                (o.status || "Pending") === "Delivered" ? "bg-green-100 dark:bg-green-900 border-green-400 text-green-800 dark:text-green-200" :
                                (o.status) === "Shipped" ? "bg-blue-100 dark:bg-blue-900 border-blue-400 text-blue-800 dark:text-blue-200" :
                                (o.status) === "Paid" ? "bg-purple-100 dark:bg-purple-900 border-purple-400 text-purple-800 dark:text-purple-200" :
                                "bg-yellow-100 dark:bg-yellow-900 border-yellow-400 text-yellow-800 dark:text-yellow-200"
                              }`}
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="Paid">💳 Paid</option>
                              <option value="Shipped">🚚 Shipped</option>
                              <option value="Delivered">✅ Delivered</option>
                            </select>
                          </div>
                          
                          {/* Customer Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <h5 className="font-semibold mb-2">Customer Information</h5>
                              <p className="text-sm">Name: {o.shippingDetails?.name || "N/A"}</p>
                              <p className="text-sm">Email: {o.email || o.shippingDetails?.email || "N/A"}</p>
                              <p className="text-sm">Phone: {o.shippingDetails?.mobile || "N/A"}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold mb-2">Shipping Address</h5>
                              <p className="text-sm">{o.shippingDetails?.address || ""}</p>
                              <p className="text-sm">{o.shippingDetails?.street || ""}</p>
                              <p className="text-sm">
                                {o.shippingDetails?.city}, {o.shippingDetails?.state} - {o.shippingDetails?.pincode}
                              </p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4">
                            <h5 className="font-semibold mb-2">Order Items</h5>
                            <div className="space-y-2">
                              {o.items?.map((item, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Length: {item.selectedLength || "Standard"} | Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <p className="font-bold">₹{(item.subtotal || 0).toFixed(2)}</p>
                                    {item.discount > 0 && (
                                      <p className="text-xs text-green-600">Discount: -₹{item.discount.toFixed(2)}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Subtotal:</span>
                              <span>₹{(o.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {o.volumeDiscount > 0 && (
                              <div className="flex justify-between text-sm mb-2 text-green-600">
                                <span>Volume Discount ({o.volumeDiscountPercent || 0}%):</span>
                                <span>-₹{(o.volumeDiscount || 0).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm mb-2">
                              <span>Shipping:</span>
                              <span>₹{o.shipping || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>GST ({o.taxRate || 0}%):</span>
                              <span>₹{(o.tax || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <span>Total:</span>
                              <span className="text-green-600">₹{(o.total || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Coupons Tab */}
            {activeTab === "coupons" && (
              <div className="space-y-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Coupon Management</h2>

                {/* Create Coupon Form */}
                <form onSubmit={handleAddCoupon} className={`backdrop-blur-xl rounded-2xl p-6 sm:p-8 border shadow-lg ${surfaceTheme}`}>
                  <h3 className="text-xl font-bold mb-6">Create New Coupon</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Coupon Code *</label>
                      <input type="text" placeholder="e.g. SAVE20" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} style={fieldStyle} className="w-full p-3 border rounded-xl font-mono tracking-widest uppercase" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Discount % *</label>
                      <input type="number" placeholder="e.g. 15" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} style={fieldStyle} className="w-full p-3 border rounded-xl" min="1" max="100" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Min Order Value (&#8377;)</label>
                      <input type="number" placeholder="0 = no minimum" value={couponMinOrder} onChange={(e) => setCouponMinOrder(e.target.value)} style={fieldStyle} className="w-full p-3 border rounded-xl" min="0" />
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border mb-3">
                        <label className="text-sm font-semibold">Active</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={couponActive} onChange={(e) => setCouponActive(e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      <button type="submit" disabled={couponLoading} className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50">
                        {couponLoading ? "Creating..." : "Create Coupon"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Coupons List */}
                <div className={`backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden ${surfaceTheme}`}>
                  <h3 className="text-xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">All Coupons ({coupons.length})</h3>
                  {coupons.length === 0 ? (
                    <p className="text-center opacity-50 py-12">No coupons yet. Create your first one above.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                          <tr>
                            <th className="p-4 text-left">Code</th>
                            <th className="p-4 text-left">Discount</th>
                            <th className="p-4 text-left">Min Order</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map((c) => (
                            <tr key={c.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                              <td className="p-4 font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400">{c.code}</td>
                              <td className="p-4 font-semibold text-green-600">{c.discountPercent}% off</td>
                              <td className="p-4 text-sm">{c.minimumOrderValue > 0 ? `\u20B9${c.minimumOrderValue}+` : "No minimum"}</td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.isActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
                                  {c.isActive ? "Active" : "Disabled"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2 flex-wrap">
                                  <button onClick={() => handleToggleCoupon(c)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${c.isActive ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-green-500 text-white hover:bg-green-600"}`}>
                                    {c.isActive ? "Disable" : "Enable"}
                                  </button>
                                  <button onClick={() => handleDeleteCoupon(c.id)} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition">
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}


            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Users Management</h2>
                <div className={`backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden ${surfaceTheme}`}>
                  <h3 className="text-2xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">All Users</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="p-4 text-left">Name</th>
                          <th className="p-4 text-left">Email</th>
                          <th className="p-4 text-left">UID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4">{u.displayName || "No Name"}</td>
                            <td className="p-4">{u.email}</td>
                            <td className="p-4 font-mono text-sm">{u.id.substring(0, 16)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Collections Listing Tab */}
            {activeTab === "listing" && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Collections Preview</h2>
                {Object.keys(groupedProducts).map((section) => (
                  <div key={section} className={`backdrop-blur-xl rounded-2xl p-6 border shadow-lg ${surfaceTheme}`}>
                    <h3 className="text-2xl font-bold mb-6">{section}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {groupedProducts[section].map((p) => (
                        <div key={p.id} className="border rounded-xl p-4 bg-white dark:bg-gray-900 hover:shadow-lg transition">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                          )}
                          <h4 className="font-bold">{p.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{p.brand}</p>
                          <p className="font-bold text-lg mt-2">₹{p.price}</p>
                          <p className="text-xs text-gray-500">{p.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Site Settings</h2>
                <form onSubmit={handleSaveSettings} className={`backdrop-blur-xl rounded-2xl p-5 md:p-8 border shadow-lg ${surfaceTheme}`}>
                  <h3 className="text-2xl font-bold mb-6">Landing Page & Globals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="font-semibold text-lg border-b pb-2">Hero Section</h4>
                      <input type="text" placeholder="Hero Heading" value={siteSettings.heroHeading || ""} onChange={e => setSiteSettings({...siteSettings, heroHeading: e.target.value})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                      <input type="text" placeholder="Hero Subtext" value={siteSettings.heroSubtext || ""} onChange={e => setSiteSettings({...siteSettings, heroSubtext: e.target.value})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                      <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="CTA Text" value={siteSettings.heroCtaText || ""} onChange={e => setSiteSettings({...siteSettings, heroCtaText: e.target.value})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                         <input type="text" placeholder="CTA Link" value={siteSettings.heroCtaLink || ""} onChange={e => setSiteSettings({...siteSettings, heroCtaLink: e.target.value})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                      </div>
                      <div className="border border-dashed p-4 rounded-xl">
                        <label className="block text-sm font-semibold mb-2">Hero Image</label>
                        <input type="file" accept="image/*" onChange={e => setSiteSettingsFile(e.target.files[0])} className="w-full text-sm" />
                        {siteSettings.heroImage && !siteSettingsFile && <img src={siteSettings.heroImage} alt="Hero" className="mt-2 h-24 object-cover rounded-lg" />}
                        {siteSettingsFile && <img src={URL.createObjectURL(siteSettingsFile)} alt="Preview" className="mt-2 h-24 object-cover rounded-lg" />}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="font-semibold text-lg border-b pb-2">Social & Contact Links</h4>
                      <input type="text" placeholder="WhatsApp Link" value={siteSettings.whatsappLink || ""} onChange={e => setSiteSettings({...siteSettings, whatsappLink: e.target.value})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                      <input type="text" placeholder="Instagram Link" value={siteSettings.instagramLink || ""} onChange={e => setSiteSettings({...siteSettings, instagramLink: e.target.value})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                      <input type="email" placeholder="Email Address" value={siteSettings.emailAddress || ""} onChange={e => setSiteSettings({...siteSettings, emailAddress: e.target.value})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="font-semibold text-lg border-b pb-2">Marquee Banner</h4>
                      <input type="text" placeholder="Marquee Info Text" value={siteSettings.marqueeText || ""} onChange={e => setSiteSettings({...siteSettings, marqueeText: e.target.value})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="font-semibold text-lg border-b pb-2">Global Discounts</h4>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border">
                        <label className="font-semibold">Enable Global Discount:</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={siteSettings.globalDiscountEnabled || false} onChange={(e) => setSiteSettings({...siteSettings, globalDiscountEnabled: e.target.checked})} className="sr-only peer" />
                          <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Global Discount (%)</label>
                          <input type="number" value={siteSettings.globalDiscountPercent || 0} onChange={e => setSiteSettings({...siteSettings, globalDiscountPercent: Number(e.target.value)})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">First-time User Discount (%)</label>
                          <input type="number" value={siteSettings.firstTimeDiscountPercent || 0} onChange={e => setSiteSettings({...siteSettings, firstTimeDiscountPercent: Number(e.target.value)})} style={fieldStyle} className="w-full p-4 border rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={settingsLoading} className="mt-8 w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50">
                    {settingsLoading ? "Saving..." : "Save Settings"}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminPanel;


