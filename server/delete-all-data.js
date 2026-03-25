/**
 * One-time script to wipe site data and make the project fresh.
 *
 * Primary mode:
 * - Uses Firebase Admin SDK (requires FIREBASE_SERVICE_ACCOUNT or serviceAccountKey.json)
 *
 * Fallback mode:
 * - Uses Firebase Web Auth anonymous sign-in + Firestore REST API
 * - Works when security rules allow anonymous admin-panel style access
 *
 * Run:
 *   node delete-all-data.js
 */

const admin = require("firebase-admin");

const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY || "AIzaSyDsgyFSIkW__hYHgjL9QgQyxd2IL74ubVY";
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "website-a1db3";

const TOP_LEVEL_COLLECTIONS = ["products", "orders", "coupons", "settings", "users"];
const USER_SUBCOLLECTIONS = ["cart", "addresses"];

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is set but not valid JSON.");
    }
  }

  try {
    return require("./serviceAccountKey.json");
  } catch (error) {
    throw new Error(
      "Firebase Admin credentials not found. Set FIREBASE_SERVICE_ACCOUNT or add server/serviceAccountKey.json."
    );
  }
}

function initializeFirebaseAdmin() {
  const serviceAccount = loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

async function wipeWithAdminSdk() {
  initializeFirebaseAdmin();
  const db = admin.firestore();

  const collections = await db.listCollections();
  for (const collectionRef of collections) {
    console.log(`Admin wipe: deleting collection '${collectionRef.id}' recursively...`);
    await db.recursiveDelete(collectionRef);
  }

  let pageToken;
  do {
    const page = await admin.auth().listUsers(1000, pageToken);
    const uids = page.users.map((user) => user.uid);
    if (uids.length) {
      const result = await admin.auth().deleteUsers(uids);
      console.log(
        `Admin wipe: auth users deleted=${result.successCount}, failed=${result.failureCount}`
      );
    }
    pageToken = page.pageToken;
  } while (pageToken);
}

async function anonymousSignIn() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true }),
  });

  const data = await response.json();
  if (!response.ok || !data.idToken) {
    throw new Error(
      `Anonymous sign-in failed: ${data?.error?.message || response.statusText || "Unknown error"}`
    );
  }

  return data.idToken;
}

function documentsBaseUrl() {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

function authHeaders(idToken) {
  return {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  };
}

function toRelativeDocPath(fullDocName) {
  const marker = "/documents/";
  const idx = fullDocName.indexOf(marker);
  return idx === -1 ? fullDocName : fullDocName.slice(idx + marker.length);
}

async function listDocuments(idToken, collectionPath) {
  const docs = [];
  let pageToken = "";

  do {
    const tokenQuery = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
    const url = `${documentsBaseUrl()}/${collectionPath}?pageSize=1000${tokenQuery}`;
    const response = await fetch(url, {
      method: "GET",
      headers: authHeaders(idToken),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed listing '${collectionPath}': ${
          data?.error?.message || response.statusText || "Unknown error"
        }`
      );
    }

    if (Array.isArray(data.documents)) {
      docs.push(...data.documents);
    }
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return docs;
}

async function deleteDocByName(idToken, fullDocName) {
  const url = `https://firestore.googleapis.com/v1/${fullDocName}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(idToken),
  });

  if (!response.ok) {
    let details = "";
    try {
      const data = await response.json();
      details = data?.error?.message || "";
    } catch (error) {
      details = "";
    }
    throw new Error(`Failed deleting '${fullDocName}': ${details || response.statusText}`);
  }
}

async function wipeUsersViaRest(idToken) {
  const users = await listDocuments(idToken, "users");
  console.log(`REST wipe: found ${users.length} user documents.`);

  let deletedSubDocs = 0;
  for (const userDoc of users) {
    const userPath = toRelativeDocPath(userDoc.name);

    for (const sub of USER_SUBCOLLECTIONS) {
      const subDocs = await listDocuments(idToken, `${userPath}/${sub}`);
      for (const subDoc of subDocs) {
        await deleteDocByName(idToken, subDoc.name);
        deletedSubDocs += 1;
      }
    }

    await deleteDocByName(idToken, userDoc.name);
  }

  console.log(`REST wipe: deleted ${users.length} users and ${deletedSubDocs} user sub-documents.`);
}

async function wipeCollectionViaRest(idToken, collectionPath) {
  const docs = await listDocuments(idToken, collectionPath);
  for (const doc of docs) {
    await deleteDocByName(idToken, doc.name);
  }
  console.log(`REST wipe: deleted ${docs.length} docs from '${collectionPath}'.`);
}

async function wipeWithRestFallback() {
  const idToken = await anonymousSignIn();

  for (const collectionName of TOP_LEVEL_COLLECTIONS) {
    if (collectionName === "users") {
      await wipeUsersViaRest(idToken);
    } else {
      await wipeCollectionViaRest(idToken, collectionName);
    }
  }
}

async function main() {
  console.log("Starting full data wipe...");

  try {
    await wipeWithAdminSdk();
    console.log("Completed wipe using Firebase Admin SDK.");
    return;
  } catch (error) {
    console.log(`Admin wipe unavailable: ${error.message}`);
    console.log("Falling back to anonymous client-style wipe...");
  }

  await wipeWithRestFallback();
  console.log("Completed wipe using REST fallback.");
}

main()
  .then(() => {
    console.log("Done. Site data is fresh.");
  })
  .catch((error) => {
    console.error("Data wipe failed:", error.message);
    process.exit(1);
  });
