import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBKmEcEX-3J9BbvmAkd-PBUlzCxkA1d6Dg",
    authDomain: "infographic-creator-b5778.firebaseapp.com",
    projectId: "infographic-creator-b5778",
    storageBucket: "infographic-creator-b5778.firebasestorage.app",
    messagingSenderId: "509275723694",
    appId: "1:509275723694:web:5f557e8c1f28205a3a9a3f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google provider configured to allow @complex.com emails only
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    hd: 'complex.com' // Restricts to complex.com domain in Google sign-in prompt
});

export default app;
