// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5sqz_HT339RjzhMu3YbVcjyVGgkPZi7U",
  authDomain: "status-page-app-452aa.firebaseapp.com",
  projectId: "status-page-app-452aa",
  storageBucket: "status-page-app-452aa.appspot.com",
  messagingSenderId: "161835031476",
  appId: "1:161835031476:web:abaf7f532b93d7be2030e1",
  measurementId: "G-LSED8D91L2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// For accessing DB in order to have the CRUD functionality in our app
const db = getFirestore(app);

// Exporting 
export { auth, db, analytics};