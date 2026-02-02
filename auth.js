// Authentication Module
const Auth = {
    currentUser: null,
    userData: null,
    

    // Initialize auth state listener
    init() {
        Firebase.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                this.getUserData(user.uid);
                UI.updateUIForLoggedInUser(user);
            } else {
                this.userData = null;
                UI.updateUIForLoggedOutUser();
            }
        });
    },

    // Get user data from Firestore
    async getUserData(uid) {
        try {
            const doc = await Firebase.db.collection('users').doc(uid).get();
            if (doc.exists) {
                this.userData = doc.data();
                return this.userData;
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    // Handle user login
    async login(email, password) {
        try {
            const userCredential = await Firebase.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    },

    // Handle user registration
    async register(name, email, phone, password) {
        try {
            // Create user with Firebase Authentication
            const userCredential = await Firebase.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update user profile
            await user.updateProfile({
                displayName: name
            });

            // Save additional user data to Firestore
            await Firebase.db.collection('users').doc(user.uid).set({
                uid: user.uid,
                name: name,
                email: email,
                phone: phone,
                createdAt: Firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: Firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    },

    // Handle user logout
    async logout() {
        try {
            await Firebase.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    },

    // Get user-friendly error messages
    getErrorMessage(error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/weak-password': 'Password is too weak (minimum 6 characters)',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later'
        };

        return errorMessages[error.code] || error.message || 'An error occurred';
    },

    // Get current user display name
    getDisplayName() {
        if (this.currentUser) {
            return this.currentUser.displayName || this.currentUser.email.split('@')[0];
        }
        return '';
    },

    // Get current user email
    getEmail() {
        return this.currentUser?.email || '';
    },

    // Get current user ID
    getUserId() {
        return this.currentUser?.uid || '';
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
};