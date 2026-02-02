// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAL4V8WmSQis5WILYaoHOZ8sY4b7XoC7u4",
    authDomain: "farm-iq-a74bb.firebaseapp.com",
    projectId: "farm-iq-a74bb",
    storageBucket: "farm-iq-a74bb.firebasestorage.app",
    messagingSenderId: "282490627955",
    appId: "1:282490627955:web:d94f6a5946256b13cbc706",
    measurementId: "G-CMBF5XFMCC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other modules
const Firebase = {
    auth,
    db,
    firestore: firebase.firestore
};