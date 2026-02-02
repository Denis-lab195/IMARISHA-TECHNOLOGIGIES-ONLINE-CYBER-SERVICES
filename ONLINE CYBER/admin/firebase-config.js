// Firebase Configuration
console.log('🔥 Initializing Firebase...');

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
let app;
try {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized');
    } else {
        app = firebase.app();
        console.log('✅ Firebase already initialized');
    }
} catch (error) {
    console.error('❌ Firebase init error:', error);
    throw error;
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Create collections object
const collections = {
    serviceRequests: db.collection('serviceRequests'),
    employees: db.collection('employees'),
    assignments: db.collection('assignments'),
    cyberServices: db.collection('cyberServices'),
    activities: db.collection('activities'),
    users: db.collection('users'),
    payouts: db.collection('payouts')
};

console.log('✅ Firebase collections created');

// Make available globally
window.firebase = firebase;
window.auth = auth;
window.db = db;
window.collections = collections;

// Function to create admin user
window.createAdminUser = async function() {
    const email = "admin@imarisha.co.ke";
    const password = "Admin@123";
    
    console.log('👤 Creating admin user...');
    
    try {
        // Sign out if already logged in
        if (auth.currentUser) {
            await auth.signOut();
        }
        
        // Create user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ User created in Firebase Auth');
        
        // Add to Firestore
        await collections.users.doc(userCredential.user.uid).set({
            uid: userCredential.user.uid,
            email: email,
            name: "System Administrator",
            role: "admin",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            isVerified: true
        });
        
        console.log('✅ User added to Firestore');
        
        // Send email verification (optional)
        await userCredential.user.sendEmailVerification();
        console.log('✅ Verification email sent');
        
        // Sign out
        await auth.signOut();
        
        console.log('✅ Admin user created successfully!');
        alert(`✅ Admin user created!\n\nEmail: ${email}\nPassword: ${password}\n\nPlease wait 30 seconds, then try to login.`);
        
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            alert('✅ Admin user already exists.\n\nUse:\nEmail: admin@imarisha.co.ke\nPassword: Admin@123\n\nIf login fails, reset password in Firebase Console.');
        } else if (error.code === 'auth/network-request-failed') {
            alert('❌ Network error. Check internet connection.');
        } else {
            alert('❌ Error: ' + error.message);
        }
    }
};

// Function to reset admin password
window.resetAdminPassword = async function() {
    try {
        const email = "admin@imarisha.co.ke";
        await auth.sendPasswordResetEmail(email);
        alert(`✅ Password reset email sent to ${email}`);
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
};

console.log('🎉 Firebase configuration loaded successfully!');