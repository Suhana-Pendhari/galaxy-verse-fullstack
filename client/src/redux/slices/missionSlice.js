import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

// Async thunks
export const fetchMissions = createAsyncThunk(
  'missions/fetchMissions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getMissions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch missions');
    }
  }
);

export const fetchMissionById = createAsyncThunk(
  'missions/fetchMissionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getMissionById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mission');
    }
  }
);

export const fetchUpcomingMissions = createAsyncThunk(
  'missions/fetchUpcomingMissions',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await api.getUpcomingMissions(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming missions');
    }
  }
);

export const fetchMissionStats = createAsyncThunk(
  'missions/fetchMissionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMissionStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mission stats');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'missions/toggleLike',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.toggleMissionLike(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  'missions/addToWatchlist',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.addToWatchlist(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to watchlist');
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'missions/removeFromWatchlist',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.removeFromWatchlist(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from watchlist');
    }
  }
);

export const addComment = createAsyncThunk(
  'missions/addComment',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      const response = await api.addMissionComment(id, text);
      return { missionId: id, comment: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

// Initial state
const initialState = {
  missions: [],
  currentMission: null,
  upcomingMissions: [],
  stats: null,
  filters: {
    organization: '',
    status: '',
    missionType: '',
    search: '',
    sortBy: 'launchDate',
    sortOrder: 'asc',
    page: 1,
    limit: 10,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
  success: false,
};

// Slice
const missionSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearCurrentMission: (state) => {
      state.currentMission = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    updateMissionInList: (state, action) => {
      const index = state.missions.findIndex(m => m._id === action.payload._id);
      if (index !== -1) {
        state.missions[index] = { ...state.missions[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Missions
      .addCase(fetchMissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.missions = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Mission By Id
      .addCase(fetchMissionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMissionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMission = action.payload;
        state.error = null;
      })
      .addCase(fetchMissionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Upcoming Missions
      .addCase(fetchUpcomingMissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUpcomingMissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingMissions = action.payload;
      })
      .addCase(fetchUpcomingMissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Mission Stats
      .addCase(fetchMissionStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMissionStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchMissionStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { id, isLiked, likeCount } = action.payload;
        
        // Update in missions list
        const missionIndex = state.missions.findIndex(m => m._id === id);
        if (missionIndex !== -1) {
          state.missions[missionIndex].stats.likeCount = likeCount;
          if (isLiked) {
            state.missions[missionIndex].likes.push('current-user');
          } else {
            state.missions[missionIndex].likes = 
              state.missions[missionIndex].likes.filter(l => l !== 'current-user');
          }
        }

        // Update current mission if it's the one
        if (state.currentMission && state.currentMission._id === id) {
          state.currentMission.stats.likeCount = likeCount;
          if (isLiked) {
            state.currentMission.likes.push('current-user');
          } else {
            state.currentMission.likes = 
              state.currentMission.likes.filter(l => l !== 'current-user');
          }
        }
      })

      // Add to Watchlist
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.success = true;
        // Update in missions list
        const missionIndex = state.missions.findIndex(m => m._id === action.payload.id);
        if (missionIndex !== -1) {
          state.missions[missionIndex].stats.watchlistCount += 1;
        }
      })

      // Remove from Watchlist
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.success = true;
        // Update in missions list
        const missionIndex = state.missions.findIndex(m => m._id === action.payload.id);
        if (missionIndex !== -1) {
          state.missions[missionIndex].stats.watchlistCount -= 1;
        }
      })

      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentMission && state.currentMission._id === action.payload.missionId) {
          state.currentMission.comments.push(action.payload.comment);
          state.currentMission.stats.commentCount += 1;
        }
      });
  },
});

export const { 
  setFilters, 
  resetFilters, 
  setPage, 
  clearCurrentMission, 
  clearError, 
  clearSuccess,
  updateMissionInList 
} = missionSlice.actions;

// Selectors
export const selectMissions = (state) => state.missions.missions;
export const selectCurrentMission = (state) => state.missions.currentMission;
export const selectUpcomingMissions = (state) => state.missions.upcomingMissions;
export const selectMissionStats = (state) => state.missions.stats;
export const selectMissionFilters = (state) => state.missions.filters;
export const selectMissionPagination = (state) => state.missions.pagination;
export const selectMissionsLoading = (state) => state.missions.isLoading;
export const selectMissionsError = (state) => state.missions.error;

export default missionSlice.reducer;
