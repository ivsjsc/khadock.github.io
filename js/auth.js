// Firebase Authentication Module
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Auth state management
let currentUser = null;

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateUIForAuthState(user);
    
    if (user) {
        console.log('👤 User authenticated:', user.email);
        // Store user token for API calls
        user.getIdToken().then(token => {
            localStorage.setItem('authToken', token);
        });
    } else {
        console.log('👤 User not authenticated');
        localStorage.removeItem('authToken');
    }
});

// Update UI based on auth state
function updateUIForAuthState(user) {
    const authButtons = document.querySelectorAll('[data-auth-required]');
    const loginButtons = document.querySelectorAll('[data-auth-login]');
    const logoutButtons = document.querySelectorAll('[data-auth-logout]');
    const userInfo = document.querySelectorAll('[data-user-info]');

    if (user) {
        // User is authenticated
        authButtons.forEach(btn => btn.style.display = 'block');
        loginButtons.forEach(btn => btn.style.display = 'none');
        logoutButtons.forEach(btn => btn.style.display = 'block');
        userInfo.forEach(el => {
            el.textContent = user.email || 'User';
            el.style.display = 'inline';
        });
    } else {
        // User is not authenticated
        authButtons.forEach(btn => btn.style.display = 'none');
        loginButtons.forEach(btn => btn.style.display = 'block');
        logoutButtons.forEach(btn => btn.style.display = 'none');
        userInfo.forEach(el => el.style.display = 'none');
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Sign in successful:', userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign up with email and password
async function signUpWithEmail(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Sign up successful:', userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('❌ Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Google sign in successful:', result.user.email);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('❌ Google sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign out
async function signOutUser() {
    try {
        await signOut(auth);
        console.log('✅ Sign out successful');
        return { success: true };
    } catch (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Get auth token for API calls
async function getAuthToken() {
    if (currentUser) {
        try {
            return await currentUser.getIdToken();
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }
    return null;
}

// Make authenticated API calls
async function makeAuthenticatedRequest(url, options = {}) {
    const token = await getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
        ...options,
        headers
    });
}

// Modal management
function showAuthModal(mode = 'signin') {
    const modal = document.getElementById('authModal');
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const modalTitle = document.getElementById('authModalTitle');
    
    if (modal && signinForm && signupForm && modalTitle) {
        modal.style.display = 'flex';
        
        if (mode === 'signup') {
            signinForm.style.display = 'none';
            signupForm.style.display = 'block';
            modalTitle.textContent = 'Create Account';
        } else {
            signinForm.style.display = 'block';
            signupForm.style.display = 'none';
            modalTitle.textContent = 'Sign In';
        }
    }
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize auth modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Show auth modal buttons
    document.querySelectorAll('[data-auth-login]').forEach(btn => {
        btn.addEventListener('click', () => showAuthModal('signin'));
    });
    
    // Sign up buttons
    document.querySelectorAll('[data-auth-signup]').forEach(btn => {
        btn.addEventListener('click', () => showAuthModal('signup'));
    });
    
    // Sign out buttons
    document.querySelectorAll('[data-auth-logout]').forEach(btn => {
        btn.addEventListener('click', async () => {
            await signOutUser();
        });
    });
    
    // Close modal
    document.addEventListener('click', (e) => {
        if (e.target.id === 'authModal' || e.target.classList.contains('modal-close')) {
            hideAuthModal();
        }
    });
    
    // Form submissions
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            
            const result = await signInWithEmail(email, password);
            if (result.success) {
                hideAuthModal();
            } else {
                alert('Sign in failed: ' + result.error);
            }
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            
            const result = await signUpWithEmail(email, password);
            if (result.success) {
                hideAuthModal();
            } else {
                alert('Sign up failed: ' + result.error);
            }
        });
    }
    
    // Google sign in
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-auth-google]')) {
            signInWithGoogle();
        }
    });
});

// Export functions for use in other modules
export {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutUser,
    getCurrentUser,
    getAuthToken,
    makeAuthenticatedRequest,
    showAuthModal,
    hideAuthModal
};