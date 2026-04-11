/**
 * Firebase Admin SDK initialization module
 *
 * Handles initialization of Firebase Admin SDK for server-side usage.
 */

import {
    initializeApp,
    cert,
    getApps,
    App,
    AppOptions,
    ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";


/**
 * Builds Firebase config from environment variables
 */
const getFirebaseConfig = (): AppOptions => {
    const {
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY,
    } = process.env;
    
    if (
        !FIREBASE_PROJECT_ID ||
        !FIREBASE_CLIENT_EMAIL ||
        !FIREBASE_PRIVATE_KEY
    ) {
        throw new Error(
            "Missing Firebase configuration. Check your environment variables."
        );
    }

    const serviceAccount: ServiceAccount = {
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };

    return {
        credential: cert(serviceAccount),
        projectId: FIREBASE_PROJECT_ID,
    };
};

/**
 * Initializes Firebase Admin SDK if not already initialized
 *
 * This function implements the singleton pattern to ensure only
 * one Firebase app instance is created.
 *
 * @returns {App} Firebase Admin app instance
 */
const initializeFirebaseAdmin = (): App => {
    const existingApp = getApps()[0];

    if (existingApp) {
        return existingApp;
    }

    return initializeApp(getFirebaseConfig());
};

// Initialize app
const app: App = initializeFirebaseAdmin();

// Services
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth };