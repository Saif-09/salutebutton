import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

interface GroupStats {
  total: number;
  public: number;
  private: number;
  hasGroups: boolean;
  created: { _id: string; name: string }[];
  createdCount: number;
}

interface ProfileState {
  loaded: boolean;
  loading: boolean;
  username: string | null;
  phone: string | null;
  createdAt: string | null;
  groups: GroupStats;
}

const emptyGroups: GroupStats = {
  total: 0,
  public: 0,
  private: 0,
  hasGroups: false,
  created: [],
  createdCount: 0,
};

const initialState: ProfileState = {
  loaded: false,
  loading: false,
  username: null,
  phone: null,
  createdAt: null,
  groups: emptyGroups,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api("/api/users/me");
      if (!res.ok) return rejectWithValue("Failed to fetch profile");
      return await res.json();
    } catch {
      return rejectWithValue("Network error");
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.username = action.payload.username;
        state.phone = action.payload.phone;
        state.createdAt = action.payload.createdAt;
        state.groups = action.payload.groups;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
