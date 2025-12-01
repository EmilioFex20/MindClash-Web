// src/composables/useAuth.js
import { ref, computed } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/firebase/config';

const user = ref(null);
const error = ref(null);
const loading = ref(false);

export function useAuth() {
  // Register new user
  const register = async (email, password, displayName) => {
    loading.value = true;
    error.value = null;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      user.value = userCredential.user;
      return userCredential.user;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Login existing user
  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      return userCredential.user;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Logout user
  const logout = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      await signOut(auth);
      user.value = null;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value);

  // Initialize auth state listener
  const initAuth = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
    });
  };

  return {
    user,
    error,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    initAuth
  };
}