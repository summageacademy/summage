// firebase-init.js - CORRECT config for your main project

const firebaseConfig = {
    apiKey: "AIzaSyDX73k3QqXr9xu_PKkQBkr9pUNp7zmtrW0",
    authDomain: "summage-backend.firebaseapp.com",
    projectId: "summage-backend",
    storageBucket: "summage-backend.firebasestorage.app",
    messagingSenderId: "128191434358",
    appId: "1:128191434358:web:4c9e9f4f9ff4a23db5d957"
};

// Initialize Firebase (compat mode)
firebase.initializeApp(firebaseConfig);

// Make auth and db globally available
const auth = firebase.auth();
const db = firebase.firestore();