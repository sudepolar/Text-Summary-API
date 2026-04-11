import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

// initialize the Firebase app with our service account key
initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    } as ServiceAccount),
});

// get a reference to firebase authentication
const auth: Auth = getAuth();

// get a reference to the firestore database
const db: Firestore = getFirestore();

export { auth, db };
