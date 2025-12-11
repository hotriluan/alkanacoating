import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import axios from 'axios';

// Helper function to decode JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      // Action to set token and user info
      setToken: (token) => {
        if (token) {
          const userData = parseJwt(token);
          set({ token, user: userData, isAuthenticated: true });
        } else {
          set({ token: null, user: null, isAuthenticated: false });
        }
      },

      // Action for logging out
      logout: () => {
        get().setToken(null); // Call setToken with null to clear everything
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      // Only persist the token, user and isAuthenticated will be re-derived from it
      partialize: (state) => ({ token: state.token }),
      // Re-hydrate the state
      onRehydrate: (state) => {
        if (state.token) {
          // When the store is re-hydrated from localStorage,
          // re-initialize the axios headers and user info.
          useAuthStore.getState().setToken(state.token);
        }
      }
    }
  )
);

// Initialize the store from localStorage on initial load
const initialToken = useAuthStore.getState().token;
if (initialToken) {
  useAuthStore.getState().setToken(initialToken);
}


export default useAuthStore;
