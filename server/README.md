# TUS Payment Backend Setup Guide

This backend handles secure Razorpay payment creation and verification, as well as updating order status in Firebase Firestore.

## Prerequisites

1. **Razorpay Account**: Get your `KEY_ID` and `KEY_SECRET` from the Razorpay Dashboard.
2. **Firebase Service Account**:
   - Go to Firebase Console -> Project Settings -> Service Accounts.
   - Click "Generate new private key".
   - Download the JSON file and rename it to `serviceAccountKey.json`.
   - Place it in this `server/` directory.

## Configuration

Create a `.env` file in this directory with the following:

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
IMGBB_API_KEY=your_imgbb_api_key
PORT=5000
```

## Running the Server

```bash
cd server
npm install
npm start
```

## APIs Provided

- `POST /api/payment/create-order`: Initializes a Razorpay order.
- `POST /api/payment/verify-payment`: Verifies payment signature and updates Firestore.
- `GET /api/orders/my-orders/:userId`: Fetches user orders from Firestore.
- `POST /api/upload/imgbb`: Uploads a base64 image to ImgBB and returns a public URL.
- `POST /api/settings/global`: Saves global site settings to Firestore using Firebase Admin.
