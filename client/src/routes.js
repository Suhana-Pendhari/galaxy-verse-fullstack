import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './utils/constants';

// Layout Components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import AuthLayout from './components/layout/AuthLayout';

// Page Components - Lazy loaded for performance
import { lazy } from 'react';

// Public Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const MissionsPage = lazy(() => import('./pages/MissionsPage'));
const MissionDetailsPage = lazy(() => import('./pages/MissionDetailsPage'));
const SpaceDataPage = lazy(() => import('./pages/SpaceDataPage'));
const SolarSystemPage = lazy(() => import('./pages/SolarSystemPage'));
const SatellitePage = lazy(() => import('./pages/SatellitePage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

// Protected Pages
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PostDetailsPage = lazy(() => import('./pages/PostDetailsPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const EditPostPage = lazy(() => import('./pages/EditPostPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const QuizTakePage = lazy(() => import('./pages/QuizTakePage'));
const QuizResultsPage = lazy(() => import('./pages/QuizResultsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminMissions = lazy(() => import('./pages/admin/AdminMissions'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments'));
const AdminQuizzes = lazy(() => import('./pages/admin/AdminQuizzes'));
const AdminModeration = lazy(() => import('./pages/admin/AdminModeration'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Error Pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage'));

// Route Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { ModeratorRoute } from './components/auth/ModeratorRoute';
import { GuestRoute } from './components/auth/GuestRoute';

// Loading Component
import PageLoader from './components/common/PageLoader';

/**
 * Application Router Configuration
 * Defines all routes with proper guards and lazy loading
 */
export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes with Layout */}
      <Route path="/" element={<Layout />} errorElement={<ServerErrorPage />}>
        {/* Home */}
        <Route index element={<HomePage />} />
        
        {/* Missions */}
        <Route path={ROUTES.MISSIONS} element={<MissionsPage />} />
        <Route path={ROUTES.MISSION_DETAILS} element={<MissionDetailsPage />} />
        
        {/* Space Data */}
        <Route path={ROUTES.SPACE_DATA} element={<SpaceDataPage />} />
        
        {/* Solar System */}
        <Route path={ROUTES.SOLAR_SYSTEM} element={<SolarSystemPage />} />
        
        {/* Satellite Tracker */}
        <Route path={ROUTES.SATELLITE} element={<SatellitePage />} />
        
        {/* Protected Routes */}
        <Route path={ROUTES.COMMUNITY} element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.POST_DETAILS} element={
          <ProtectedRoute>
            <PostDetailsPage />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.CREATE_POST} element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        } />
        
        <Route path="/community/post/:id/edit" element={
          <ProtectedRoute>
            <EditPostPage />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.QUIZ} element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.QUIZ_TAKE} element={
          <ProtectedRoute>
            <QuizTakePage />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.QUIZ_RESULTS} element={
          <ProtectedRoute>
            <QuizResultsPage />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.PROFILE} element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.PROFILE_EDIT} element={
          <ProtectedRoute>
            <ProfileEditPage />
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/watchlist" element={
          <ProtectedRoute>
            <WatchlistPage />
          </ProtectedRoute>
        } />
        
        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Auth Routes - No Layout */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        } />
        
        <Route path={ROUTES.REGISTER} element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        } />
        
        <Route path={ROUTES.FORGOT_PASSWORD} element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        } />
        
        <Route path={ROUTES.RESET_PASSWORD} element={
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        } />
        
        <Route path={ROUTES.VERIFY_EMAIL} element={
          <GuestRoute>
            <VerifyEmailPage />
          </GuestRoute>
        } />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />} errorElement={<ServerErrorPage />}>
        <Route index element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        <Route path="users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />
        
        <Route path="missions" element={
          <AdminRoute>
            <AdminMissions />
          </AdminRoute>
        } />
        
        <Route path="posts" element={
          <AdminRoute>
            <AdminPosts />
          </AdminRoute>
        } />
        
        <Route path="comments" element={
          <AdminRoute>
            <AdminComments />
          </AdminRoute>
        } />
        
        <Route path="quizzes" element={
          <AdminRoute>
            <AdminQuizzes />
          </AdminRoute>
        } />
        
        <Route path="moderation" element={
          <ModeratorRoute>
            <AdminModeration />
          </ModeratorRoute>
        } />
        
        <Route path="analytics" element={
          <AdminRoute>
            <AdminAnalytics />
          </AdminRoute>
        } />
        
        <Route path="logs" element={
          <AdminRoute>
            <AdminLogs />
          </AdminRoute>
        } />
        
        <Route path="settings" element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        } />
      </Route>

      {/* Error Routes */}
      <Route path="/401" element={<UnauthorizedPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      
      {/* Catch all - redirect to 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </>
  ),
  {
    future: {
      v7_normalizeFormMethod: true,
    },
  }
);

// Route configuration with metadata
export const routeConfig = {
  public: [
    { path: ROUTES.HOME, name: 'Home', icon: 'home' },
    { path: ROUTES.MISSIONS, name: 'Missions', icon: 'rocket' },
    { path: ROUTES.SPACE_DATA, name: 'Space Data', icon: 'satellite' },
    { path: ROUTES.SOLAR_SYSTEM, name: 'Solar System', icon: 'solar' },
    { path: ROUTES.SATELLITE, name: 'Satellite Tracker', icon: 'map' },
  ],
  
  protected: [
    { path: ROUTES.COMMUNITY, name: 'Community', icon: 'users', roles: ['user', 'moderator', 'admin'] },
    { path: ROUTES.QUIZ, name: 'Quiz', icon: 'brain', roles: ['user', 'moderator', 'admin'] },
    { path: '/watchlist', name: 'Watchlist', icon: 'bookmark', roles: ['user', 'moderator', 'admin'] },
    { path: '/favorites', name: 'Favorites', icon: 'heart', roles: ['user', 'moderator', 'admin'] },
    { path: '/notifications', name: 'Notifications', icon: 'bell', roles: ['user', 'moderator', 'admin'] },
    { path: ROUTES.PROFILE, name: 'Profile', icon: 'user', roles: ['user', 'moderator', 'admin'] },
    { path: '/settings', name: 'Settings', icon: 'settings', roles: ['user', 'moderator', 'admin'] },
  ],
  
  admin: [
    { path: '/admin', name: 'Dashboard', icon: 'dashboard', roles: ['admin'] },
    { path: '/admin/users', name: 'Users', icon: 'users', roles: ['admin'] },
    { path: '/admin/missions', name: 'Missions', icon: 'rocket', roles: ['admin'] },
    { path: '/admin/posts', name: 'Posts', icon: 'post', roles: ['admin'] },
    { path: '/admin/comments', name: 'Comments', icon: 'comment', roles: ['admin'] },
    { path: '/admin/quizzes', name: 'Quizzes', icon: 'brain', roles: ['admin'] },
    { path: '/admin/moderation', name: 'Moderation', icon: 'shield', roles: ['admin', 'moderator'] },
    { path: '/admin/analytics', name: 'Analytics', icon: 'chart', roles: ['admin'] },
    { path: '/admin/logs', name: 'Logs', icon: 'file', roles: ['admin'] },
    { path: '/admin/settings', name: 'Settings', icon: 'settings', roles: ['admin'] },
  ],
};

// Navigation items for sidebar/menu
export const navigationItems = [
  {
    title: 'Main',
    items: routeConfig.public,
  },
  {
    title: 'Community',
    items: routeConfig.protected,
    requiresAuth: true,
  },
  {
    title: 'Admin',
    items: routeConfig.admin,
    requiresAuth: true,
    requiresAdmin: true,
  },
];

// Breadcrumb configuration
export const breadcrumbConfig = {
  [ROUTES.HOME]: { name: 'Home', parent: null },
  [ROUTES.MISSIONS]: { name: 'Missions', parent: ROUTES.HOME },
  [ROUTES.MISSION_DETAILS]: { name: 'Mission Details', parent: ROUTES.MISSIONS, dynamic: true },
  [ROUTES.SPACE_DATA]: { name: 'Space Data', parent: ROUTES.HOME },
  [ROUTES.SOLAR_SYSTEM]: { name: 'Solar System', parent: ROUTES.HOME },
  [ROUTES.SATELLITE]: { name: 'Satellite Tracker', parent: ROUTES.HOME },
  [ROUTES.COMMUNITY]: { name: 'Community', parent: ROUTES.HOME },
  [ROUTES.POST_DETAILS]: { name: 'Post', parent: ROUTES.COMMUNITY, dynamic: true },
  [ROUTES.QUIZ]: { name: 'Quiz', parent: ROUTES.HOME },
  [ROUTES.QUIZ_TAKE]: { name: 'Take Quiz', parent: ROUTES.QUIZ, dynamic: true },
  [ROUTES.QUIZ_RESULTS]: { name: 'Results', parent: ROUTES.QUIZ_TAKE, dynamic: true },
  [ROUTES.PROFILE]: { name: 'Profile', parent: ROUTES.HOME, dynamic: true },
  '/admin': { name: 'Admin', parent: ROUTES.HOME },
  '/admin/users': { name: 'Users', parent: '/admin' },
  '/admin/missions': { name: 'Missions', parent: '/admin' },
  '/admin/posts': { name: 'Posts', parent: '/admin' },
  '/admin/moderation': { name: 'Moderation', parent: '/admin' },
  '/admin/analytics': { name: 'Analytics', parent: '/admin' },
  '/admin/logs': { name: 'Logs', parent: '/admin' },
  '/admin/settings': { name: 'Settings', parent: '/admin' },
};

// Route permissions
export const routePermissions = {
  [ROUTES.COMMUNITY]: ['user', 'moderator', 'admin'],
  [ROUTES.QUIZ]: ['user', 'moderator', 'admin'],
  [ROUTES.QUIZ_TAKE]: ['user', 'moderator', 'admin'],
  [ROUTES.QUIZ_RESULTS]: ['user', 'moderator', 'admin'],
  [ROUTES.CREATE_POST]: ['user', 'moderator', 'admin'],
  '/watchlist': ['user', 'moderator', 'admin'],
  '/favorites': ['user', 'moderator', 'admin'],
  '/notifications': ['user', 'moderator', 'admin'],
  [ROUTES.PROFILE_EDIT]: ['user', 'moderator', 'admin'],
  '/settings': ['user', 'moderator', 'admin'],
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/missions': ['admin'],
  '/admin/posts': ['admin'],
  '/admin/comments': ['admin'],
  '/admin/quizzes': ['admin'],
  '/admin/analytics': ['admin'],
  '/admin/logs': ['admin'],
  '/admin/settings': ['admin'],
  '/admin/moderation': ['admin', 'moderator'],
};

// SEO metadata for routes
export const routeMetadata = {
  [ROUTES.HOME]: {
    title: 'GalaxyVerse - Explore the Universe',
    description: 'Your gateway to space exploration. Track missions, explore 3D solar system, and connect with space enthusiasts.',
    keywords: 'space, missions, nasa, spacex, solar system, astronomy',
  },
  [ROUTES.MISSIONS]: {
    title: 'Space Missions - GalaxyVerse',
    description: 'Track upcoming and past space missions from NASA, SpaceX, ISRO and more.',
    keywords: 'space missions, rocket launches, nasa, spacex, isro',
  },
  [ROUTES.SPACE_DATA]: {
    title: 'Space Data - GalaxyVerse',
    description: 'Explore NASA APIs including APOD, Mars Rover photos, and asteroid data.',
    keywords: 'nasa api, apod, mars rover, asteroids, space data',
  },
  [ROUTES.SOLAR_SYSTEM]: {
    title: '3D Solar System - GalaxyVerse',
    description: 'Interactive 3D visualization of our solar system. Explore planets in real-time.',
    keywords: 'solar system, planets, 3d, space visualization',
  },
  [ROUTES.SATELLITE]: {
    title: 'Satellite Tracker - GalaxyVerse',
    description: 'Track live positions of satellites including the International Space Station.',
    keywords: 'satellite tracker, iss, space station, orbit',
  },
  [ROUTES.COMMUNITY]: {
    title: 'Community - GalaxyVerse',
    description: 'Connect with space enthusiasts, share posts, and discuss space missions.',
    keywords: 'space community, forum, discussion, space enthusiasts',
  },
  [ROUTES.QUIZ]: {
    title: 'Space Quiz - GalaxyVerse',
    description: 'Test your knowledge of the cosmos with our interactive space quizzes.',
    keywords: 'space quiz, astronomy test, space knowledge',
  },
  [ROUTES.LOGIN]: {
    title: 'Login - GalaxyVerse',
    description: 'Login to your GalaxyVerse account to access all features.',
    keywords: 'login, sign in, space community',
  },
  [ROUTES.REGISTER]: {
    title: 'Register - GalaxyVerse',
    description: 'Create a GalaxyVerse account and join our space community.',
    keywords: 'register, sign up, create account',
  },
  [ROUTES.PROFILE]: {
    title: 'Profile - GalaxyVerse',
    description: 'View and manage your GalaxyVerse profile.',
    keywords: 'profile, user profile, space enthusiast',
  },
};

// Function to check if route is accessible
export const isRouteAccessible = (pathname, userRole) => {
  const permissions = routePermissions[pathname];
  if (!permissions) return true; // Public route
  return permissions.includes(userRole);
};

// Function to get route metadata
export const getRouteMetadata = (pathname) => {
  // Handle dynamic routes
  if (pathname.includes('/missions/')) {
    return routeMetadata[ROUTES.MISSION_DETAILS] || routeMetadata[ROUTES.MISSIONS];
  }
  if (pathname.includes('/community/post/')) {
    return routeMetadata[ROUTES.POST_DETAILS] || routeMetadata[ROUTES.COMMUNITY];
  }
  if (pathname.includes('/quiz/') && pathname.includes('/results')) {
    return routeMetadata[ROUTES.QUIZ_RESULTS] || routeMetadata[ROUTES.QUIZ];
  }
  if (pathname.includes('/quiz/')) {
    return routeMetadata[ROUTES.QUIZ_TAKE] || routeMetadata[ROUTES.QUIZ];
  }
  if (pathname.includes('/profile/') && pathname.includes('/edit')) {
    return routeMetadata[ROUTES.PROFILE_EDIT] || routeMetadata[ROUTES.PROFILE];
  }
  if (pathname.includes('/profile/')) {
    return routeMetadata[ROUTES.PROFILE] || routeMetadata[ROUTES.HOME];
  }
  
  return routeMetadata[pathname] || {
    title: 'GalaxyVerse - Space Exploration Platform',
    description: 'Explore the universe with GalaxyVerse',
    keywords: 'space, universe, exploration',
  };
};
