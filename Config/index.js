import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyDg7yelRWaH-cp5xd4NDfspt9VbltuGKWI",
  authDomain: "whatsapp-7d5b3.firebaseapp.com",
  databaseURL: "https://whatsapp-7d5b3-default-rtdb.firebaseio.com",
  projectId: "whatsapp-7d5b3",
  storageBucket: "whatsapp-7d5b3.firebasestorage.app",
  messagingSenderId: "129441875828",
  appId: "1:129441875828:web:676da42a849669cc098e21",
  measurementId: "G-NX71EXQNW6"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
