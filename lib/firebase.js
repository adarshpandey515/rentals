import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, memoryLocalCache, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase Config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase configuration is incomplete. Check your environment variables.");
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Firestore with optimized caching strategy
let db;
if (typeof window !== "undefined") {
    // Browser environment - use persistent cache with multi-tab support
    try {
        db = initializeFirestore(app, {
            cache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
            })
        });
    } catch (error) {
        // If persistence is already set up, just get the instance
        db = getFirestore(app);
    }
} else {
    // Server environment - use in-memory cache
    db = initializeFirestore(app, {
        cache: memoryLocalCache()
    });
}

const storage = getStorage(app);

export { auth, db, storage };
