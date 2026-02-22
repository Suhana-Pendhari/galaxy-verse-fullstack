import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

// Async thunks
export const fetchAPOD = createAsyncThunk(
  'spaceData/fetchAPOD',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getAPOD(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch APOD');
    }
  }
);

export const fetchMarsRoverPhotos = createAsyncThunk(
  'spaceData/fetchMarsRoverPhotos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getMarsRoverPhotos(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Mars Rover photos');
    }
  }
);

export const fetchAsteroids = createAsyncThunk(
  'spaceData/fetchAsteroids',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getAsteroids(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asteroids');
    }
  }
);

export const fetchAsteroidById = createAsyncThunk(
  'spaceData/fetchAsteroidById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getAsteroidById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asteroid');
    }
  }
);

export const fetchEarthImagery = createAsyncThunk(
  'spaceData/fetchEarthImagery',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getEarthImagery(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Earth imagery');
    }
  }
);

export const fetchEPIC = createAsyncThunk(
  'spaceData/fetchEPIC',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getEPIC(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch EPIC images');
    }
  }
);

export const searchSpaceData = createAsyncThunk(
  'spaceData/search',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.searchSpaceData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'spaceData/toggleFavorite',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const response = await api.toggleFavorite(type, id);
      return { type, id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'spaceData/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getFavorites();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }
);

// Initial state
const initialState = {
  apod: {
    current: null,
    history: [],
    loading: false,
    error: null,
  },
  mars: {
    photos: [],
    selectedPhoto: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      per_page: 25,
      total: 0,
      total_pages: 0,
    },
    filters: {
      rover: 'curiosity',
      camera: '',
      sol: '',
      earth_date: '',
    },
  },
  asteroids: {
    list: [],
    selectedAsteroid: null,
    loading: false,
    error: null,
    filters: {
      start_date: '',
      end_date: '',
      date: new Date().toISOString().split('T')[0],
      detailed: false,
    },
  },
  earth: {
    imagery: null,
    loading: false,
    error: null,
  },
  epic: {
    images: [],
    loading: false,
    error: null,
  },
  search: {
    results: null,
    loading: false,
    error: null,
    query: '',
  },
  favorites: {
    apod: [],
    roverImages: [],
    asteroids: [],
    loading: false,
    error: null,
  },
};

// Slice
const spaceDataSlice = createSlice({
  name: 'spaceData',
  initialState,
  reducers: {
    setMarsFilters: (state, action) => {
      state.mars.filters = { ...state.mars.filters, ...action.payload };
    },
    resetMarsFilters: (state) => {
      state.mars.filters = initialState.mars.filters;
    },
    setMarsPage: (state, action) => {
      state.mars.pagination.page = action.payload;
    },
    setAsteroidFilters: (state, action) => {
      state.asteroids.filters = { ...state.asteroids.filters, ...action.payload };
    },
    resetAsteroidFilters: (state) => {
      state.asteroids.filters = initialState.asteroids.filters;
    },
    selectAsteroid: (state, action) => {
      state.asteroids.selectedAsteroid = action.payload;
    },
    selectMarsPhoto: (state, action) => {
      state.mars.selectedPhoto = action.payload;
    },
    clearSearch: (state) => {
      state.search.results = null;
      state.search.query = '';
    },
    clearErrors: (state) => {
      state.apod.error = null;
      state.mars.error = null;
      state.asteroids.error = null;
      state.earth.error = null;
      state.epic.error = null;
      state.search.error = null;
      state.favorites.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // APOD
      .addCase(fetchAPOD.pending, (state) => {
        state.apod.loading = true;
        state.apod.error = null;
      })
      .addCase(fetchAPOD.fulfilled, (state, action) => {
        state.apod.loading = false;
        if (Array.isArray(action.payload)) {
          state.apod.history = action.payload;
          state.apod.current = action.payload[0] || null;
        } else {
          state.apod.current = action.payload;
          if (!state.apod.history.some(item => item.date === action.payload.date)) {
            state.apod.history.unshift(action.payload);
          }
        }
      })
      .addCase(fetchAPOD.rejected, (state, action) => {
        state.apod.loading = false;
        state.apod.error = action.payload;
      })

      // Mars Rover Photos
      .addCase(fetchMarsRoverPhotos.pending, (state) => {
        state.mars.loading = true;
        state.mars.error = null;
      })
      .addCase(fetchMarsRoverPhotos.fulfilled, (state, action) => {
        state.mars.loading = false;
        if (action.meta.arg?.page === 1) {
          state.mars.photos = action.payload;
        } else {
          state.mars.photos = [...state.mars.photos, ...action.payload];
        }
        state.mars.pagination = action.meta.arg?.pagination || state.mars.pagination;
      })
      .addCase(fetchMarsRoverPhotos.rejected, (state, action) => {
        state.mars.loading = false;
        state.mars.error = action.payload;
      })

      // Asteroids
      .addCase(fetchAsteroids.pending, (state) => {
        state.asteroids.loading = true;
        state.asteroids.error = null;
      })
      .addCase(fetchAsteroids.fulfilled, (state, action) => {
        state.asteroids.loading = false;
        state.asteroids.list = action.payload;
      })
      .addCase(fetchAsteroids.rejected, (state, action) => {
        state.asteroids.loading = false;
        state.asteroids.error = action.payload;
      })

      // Asteroid By Id
      .addCase(fetchAsteroidById.pending, (state) => {
        state.asteroids.loading = true;
        state.asteroids.error = null;
      })
      .addCase(fetchAsteroidById.fulfilled, (state, action) => {
        state.asteroids.loading = false;
        state.asteroids.selectedAsteroid = action.payload;
      })
      .addCase(fetchAsteroidById.rejected, (state, action) => {
        state.asteroids.loading = false;
        state.asteroids.error = action.payload;
      })

      // Earth Imagery
      .addCase(fetchEarthImagery.pending, (state) => {
        state.earth.loading = true;
        state.earth.error = null;
      })
      .addCase(fetchEarthImagery.fulfilled, (state, action) => {
        state.earth.loading = false;
        state.earth.imagery = action.payload;
      })
      .addCase(fetchEarthImagery.rejected, (state, action) => {
        state.earth.loading = false;
        state.earth.error = action.payload;
      })

      // EPIC
      .addCase(fetchEPIC.pending, (state) => {
        state.epic.loading = true;
        state.epic.error = null;
      })
      .addCase(fetchEPIC.fulfilled, (state, action) => {
        state.epic.loading = false;
        state.epic.images = action.payload;
      })
      .addCase(fetchEPIC.rejected, (state, action) => {
        state.epic.loading = false;
        state.epic.error = action.payload;
      })

      // Search
      .addCase(searchSpaceData.pending, (state) => {
        state.search.loading = true;
        state.search.error = null;
      })
      .addCase(searchSpaceData.fulfilled, (state, action) => {
        state.search.loading = false;
        state.search.results = action.payload;
        state.search.query = action.meta.arg?.q || '';
      })
      .addCase(searchSpaceData.rejected, (state, action) => {
        state.search.loading = false;
        state.search.error = action.payload;
      })

      // Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites.loading = false;
        state.favorites.apod = action.payload.apod || [];
        state.favorites.roverImages = action.payload.roverImages || [];
        state.favorites.asteroids = action.payload.asteroids || [];
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = action.payload;
      })

      // Toggle Favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { type, id, isFavorite } = action.payload;
        
        if (type === 'apod') {
          if (isFavorite) {
            if (!state.favorites.apod.includes(id)) {
              state.favorites.apod.push(id);
            }
          } else {
            state.favorites.apod = state.favorites.apod.filter(item => item !== id);
          }
        } else if (type === 'roverImages') {
          if (isFavorite) {
            if (!state.favorites.roverImages.includes(id)) {
              state.favorites.roverImages.push(id);
            }
          } else {
            state.favorites.roverImages = state.favorites.roverImages.filter(item => item !== id);
          }
        } else if (type === 'asteroids') {
          if (isFavorite) {
            if (!state.favorites.asteroids.includes(id)) {
              state.favorites.asteroids.push(id);
            }
          } else {
            state.favorites.asteroids = state.favorites.asteroids.filter(item => item !== id);
          }
          
          // Update in list if present
          const asteroidIndex = state.asteroids.list.findIndex(a => a.id === id);
          if (asteroidIndex !== -1) {
            state.asteroids.list[asteroidIndex].isFavorite = isFavorite;
          }
          if (state.asteroids.selectedAsteroid?.id === id) {
            state.asteroids.selectedAsteroid.isFavorite = isFavorite;
          }
        }
      });
  },
});

export const {
  setMarsFilters,
  resetMarsFilters,
  setMarsPage,
  setAsteroidFilters,
  resetAsteroidFilters,
  selectAsteroid,
  selectMarsPhoto,
  clearSearch,
  clearErrors,
} = spaceDataSlice.actions;

// Selectors
export const selectAPOD = (state) => state.spaceData.apod;
export const selectMarsData = (state) => state.spaceData.mars;
export const selectAsteroidsData = (state) => state.spaceData.asteroids;
export const selectEarthImagery = (state) => state.spaceData.earth;
export const selectEPIC = (state) => state.spaceData.epic;
export const selectSearchResults = (state) => state.spaceData.search;
export const selectFavorites = (state) => state.spaceData.favorites;

export default spaceDataSlice.reducer;
