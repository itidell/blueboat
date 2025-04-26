// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBS_9r0WHiS6QxVpbLLpvZhbHpFAuwROvY",
  authDomain: "pfe-25-4ddae.firebaseapp.com",
  databaseURL: "https://pfe-25-4ddae-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pfe-25-4ddae",
  storageBucket: "pfe-25-4ddae.firebasestorage.app",
  messagingSenderId: "198572884728",
  appId: "1:198572884728:web:cb89d11e11bd8e9dd6b10d",
  measurementId: "G-JWBYRRB140"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!"); // Add this log
} else {
    app = getApp(); // Use the existing app instance
    console.log("Firebase already initialized."); // Add this log
}

const database = getDatabase(app);
const auth = getAuth(app);
export {app, database, auth };