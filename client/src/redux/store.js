import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import missionReducer from './slices/missionSlice';
import communityReducer from './slices/communitySlice';
import spaceDataReducer from './slices/spaceDataSlice';
import quizReducer from './slices/quizSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import satelliteReducer from './slices/satelliteSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    missions: missionReducer,
    community: communityReducer,
    spaceData: spaceDataReducer,
    quiz: quizReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    satellite: satelliteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.error', 'payload.file'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'missions.currentMission'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
