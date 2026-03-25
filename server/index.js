const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const cors = require("cors");
const admin = require("firebase-admin");

dotenv.config();

const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cors());

// Initialize Firebase Admin
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require("./serviceAccountKey.json");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error("Firebase Initialization Error:", error.message);
}

const db = admin.apps.length ? admin.firestore() : null;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

app.post("/api/upload/imgbb", async (req, res) => {
  try {
    const imgbbApiKey = process.env.IMGBB_API_KEY || process.env.VITE_IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return res.status(500).json({ error: "IMGBB_API_KEY is not configured on the server" });
    }

    const { imageBase64, name } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const cleanedBase64 = imageBase64.includes(",")
      ? imageBase64.split(",").pop()
      : imageBase64;

    const payload = new URLSearchParams({
      image: cleanedBase64,
    });

    if (name && typeof name === "string") {
      payload.set("name", name);
    }

    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload,
      }
    );

    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok || !uploadData?.success || !uploadData?.data?.url) {
      return res.status(502).json({
        error: "Failed to upload image to ImgBB",
        details: uploadData?.error?.message || "Unknown upload error",
      });
    }

    return res.status(200).json({
      success: true,
      url: uploadData.data.url,
      displayUrl: uploadData.data.display_url || uploadData.data.url,
      deleteUrl: uploadData.data.delete_url || null,
    });
  } catch (error) {
    console.error("ImgBB upload error:", error);
    return res.status(500).json({ error: "Internal server error while uploading image" });
  }
});

app.post("/api/settings/global", async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: "Database not initialized" });
  }

  try {
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const sanitizedPayload = {
      ...payload,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("settings").doc("global").set(sanitizedPayload, { merge: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save global settings error:", error);
    return res.status(500).json({ error: "Failed to save global settings" });
  }
});

// 1. Create Order API
app.post("/api/payment/create-order", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const { amount, currency, receipt, userId, items, shippingDetails } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: "Amount and userId are required" });
    }

    // Creating Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // convert to paisa
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Create a pending order in Firestore
    const orderRef = await db.collection("orders").add({
      userId,
      items,
      totalAmount: amount,
      paymentStatus: "pending",
      orderStatus: "processing",
      razorpayOrderId: order.id,
      shippingDetails,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      order_id: order.id,
      firestore_order_id: orderRef.id,
      amount: options.amount,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Verify Payment API
app.post("/api/payment/verify-payment", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      firestore_order_id,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment Verified
      await db.collection("orders").doc(firestore_order_id).update({
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      // Verification Failed
      await db.collection("orders").doc(firestore_order_id).update({
        paymentStatus: "failed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get User Orders
app.get("/api/orders/my-orders/:userId", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const { userId } = req.params;
    const snapshot = await db.collection("orders").where("userId", "==", userId).orderBy("createdAt", "desc").get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Export for Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
