import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  username: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{ userId: string; username: string; token: string }>,
    ) {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userId = null;
      state.username = null;
      state.token = null;
    },
    hydrateAuth(state) {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const username = localStorage.getItem("username");
      if (token && userId && username) {
        state.isAuthenticated = true;
        state.token = token;
        state.userId = userId;
        state.username = username;
      }
    },
  },
});

export const { setAuth, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
