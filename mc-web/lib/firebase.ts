import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyCtHCKltwzJcg8jIc7EHdGzvQQ0WCGFHfg",
  authDomain: "mindclashv2-78bed.firebaseapp.com",
  projectId: "mindclashv2-78bed",
  storageBucket: "mindclashv2-78bed.firebasestorage.app",
  messagingSenderId: "932690419713",
  appId: "1:932690419713:web:6908843032bd75d9842000",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
