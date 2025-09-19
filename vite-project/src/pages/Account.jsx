import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  User,
  Mail,
  ShoppingCart,
  MapPin,
  Package,
  Heart,
  Shield,
  LifeBuoy,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Sheet, SheetHeader, SheetContent } from "../components/ui/sheet";

const sidebarItems = [
  { key: "orders", label: "Orders & Returns", icon: Package },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "profile", label: "Profile & Security", icon: Shield },
];

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("orders");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Data states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrError, setAddrError] = useState(null);

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);

  // removed coupons and payments

  // Profile form
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      if (!current) return;
      setDisplayName(current.displayName || "");
      // Load all collections for the user
      const uid = current.uid;
      // Orders from root collection filtered by userId
      (async () => {
        try {
          setOrdersLoading(true);
          const q = query(collection(db, "orders"), where("userId", "==", uid));
          const snap = await getDocs(q);
          setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (e) {
          setOrdersError(e.message || "Failed to load orders");
        } finally {
          setOrdersLoading(false);
        }
      })();
      // Addresses
      (async () => {
        try {
          setAddrLoading(true);
          const snap = await getDocs(collection(db, "users", uid, "addresses"));
          setAddresses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (e) {
          setAddrError(e.message || "Failed to load addresses");
        } finally {
          setAddrLoading(false);
        }
      })();
      // Wishlist removed
      // removed coupons and payments loaders
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Address CRUD
  const addAddress = async (address) => {
    if (!user) return;
    const ref = collection(db, "users", user.uid, "addresses");
    const docRef = await addDoc(ref, address);
    setAddresses((prev) => [{ id: docRef.id, ...address }, ...prev]);
  };
  const deleteAddress = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "addresses", id));
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };
  const updateAddress = async (id, next) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "addresses", id), next);
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...next } : a)));
  };

  // removed payment and coupon helpers

  const saveProfile = async () => {
    if (!user) return;
    try {
      setProfileError(null);
      setProfileSaved(false);
      setProfileSaving(true);
      await setDoc(
        doc(db, "users", user.uid),
        { displayName, phone },
        { merge: true }
      );
      if (newPassword) await updatePassword(user, newPassword);
      setProfileSaved(true);
    } catch (e) {
      setProfileError(e.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-2xl font-bold">Your Account</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">Login or create a new account to continue</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/login")}>Login</Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const Sidebar = () => (
    <div className="h-full">
      <div className="mb-6 flex items-center gap-3">
        {user.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="h-12 w-12 rounded-full border border-neutral-300 dark:border-neutral-700" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            <User className="h-6 w-6 text-neutral-600" />
          </div>
        )}
        <div>
          <div className="font-semibold">{user.displayName || "User"}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</div>
        </div>
      </div>
      <nav className="space-y-1">
        {sidebarItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActive(key); setMobileOpen(false); }}
            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition ${
              active === key
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
            <ChevronRight className="h-4 w-4 opacity-60" />
          </button>
        ))}
      </nav>
      <div className="mt-6">
        <Button variant="destructive" className="w-full" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
      </div>
    </div>
  );

  const SectionWrapper = ({ children }) => (
    <motion.div
      key={active}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="outline" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-4 w-4 mr-2" /> Menu
          </Button>
          <div className="text-2xl font-bold">Account</div>
          <div className="ml-auto">
            <Button onClick={() => navigate("/cart")}><ShoppingCart className="h-4 w-4 mr-2" />Cart</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-4 lg:col-span-3 hidden md:block p-4">
            <Sidebar />
          </Card>

          <Card className="md:col-span-8 lg:col-span-9">
            <CardContent>
              <AnimatePresence mode="wait">
                {active === "orders" && (
                  <SectionWrapper>
                    <div className="text-xl font-semibold">Orders & Returns</div>
                    {ordersLoading ? (
                      <div>Loading orders…</div>
                    ) : ordersError ? (
                      <div className="text-red-600">{ordersError}</div>
                    ) : orders.length === 0 ? (
                      <div className="text-neutral-600">No orders yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((o) => (
                          <div key={o.id} className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
                            <div>
                              <div className="font-medium">Order #{o.id.slice(0, 6)}</div>
                              <div className="text-xs text-neutral-600 dark:text-neutral-400">{o.date || ""}</div>
                            </div>
                            <Badge variant={o.status === "delivered" ? "success" : o.status === "cancelled" ? "danger" : o.status === "shipped" ? "default" : "outline"}>
                              {o.status || "pending"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionWrapper>
                )}

                {active === "addresses" && (
                  <SectionWrapper>
                    <div className="text-xl font-semibold">Addresses</div>
                    <AddressManager addresses={addresses} loading={addrLoading} error={addrError} onAdd={addAddress} onDelete={deleteAddress} onUpdate={updateAddress} />
                  </SectionWrapper>
                )}

                {active === "wishlist" && (
                  <SectionWrapper>
                    <div className="text-xl font-semibold">Wishlist</div>
                    {wishlistLoading ? (
                      <div>Loading wishlist…</div>
                    ) : wishlistError ? (
                      <div className="text-red-600">{wishlistError}</div>
                    ) : wishlist.length === 0 ? (
                      <div className="text-neutral-600">Your wishlist is empty.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlist.map((item) => (
                          <div key={item.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-40 w-full object-cover" />
                            )}
                            <div className="p-3 space-y-1">
                              <div className="font-medium truncate">{item.name}</div>
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">₹{item.price}</div>
                              <Button className="w-full mt-2">Move to Cart</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionWrapper>
                )}

                {/* coupons section removed */}

                {active === "profile" && (
                  <SectionWrapper>
                    <div className="text-xl font-semibold">Profile & Security</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm">Name</label>
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">Email</label>
                        <Input value={user.email || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">Phone</label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
                      </div>
                      
                    </div>
                    {profileError && <div className="text-red-600 text-sm">{profileError}</div>}
                    {profileSaved && <div className="text-green-600 text-sm">Profile updated</div>}
                    <div className="mt-3">
                      <Button onClick={saveProfile} disabled={profileSaving}>{profileSaving ? "Saving…" : "Save Changes"}</Button>
                    </div>
                  </SectionWrapper>
                )}

                
    
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="h-full flex flex-col">
          <SheetHeader className="flex items-center justify-between">
            <div className="font-semibold">Account</div>
            <Button variant="ghost" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></Button>
          </SheetHeader>
          <SheetContent>
            <Sidebar />
          </SheetContent>
        </div>
      </Sheet>
    </div>
  );
}

function AddressManager({ addresses, loading, error, onAdd, onDelete, onUpdate }) {
  const [form, setForm] = useState({ name: "", line1: "", line2: "", city: "", state: "", zip: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name || !form.line1 || !form.city) return;
    setSaving(true);
    try { await onAdd(form); setForm({ name: "", line1: "", line2: "", city: "", state: "", zip: "" }); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { key: "name", label: "Full Name" },
          { key: "line1", label: "Address Line 1" },
          { key: "line2", label: "Address Line 2" },
          { key: "city", label: "City" },
          { key: "state", label: "State" },
          { key: "zip", label: "ZIP" },
        ].map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm">{f.label}</label>
            <Input value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          </div>
        ))}
      </div>
      <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Add Address"}</Button>

      {loading ? (
        <div>Loading addresses…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : addresses.length === 0 ? (
        <div className="text-neutral-600">No addresses yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-1">
              <div className="font-medium">{a.name}</div>
              <div className="text-sm">{a.line1}</div>
              {a.line2 && <div className="text-sm">{a.line2}</div>}
              <div className="text-sm">{a.city}, {a.state} {a.zip}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => onUpdate(a.id, { ...a })}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(a.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// payment manager removed

