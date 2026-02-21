import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import { useAuth } from './hooks/useAuth';
import { trackPageView } from './utils/analytics';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const MissionsPage = lazy(() => import('./pages/MissionsPage'));
const MissionDetailsPage = lazy(() => import('./pages/MissionDetailsPage'));
const SpaceDataPage = lazy(() => import('./pages/SpaceDataPage'));
const SolarSystemPage = lazy(() => import('./pages/SolarSystemPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PostDetailsPage = lazy(() => import('./pages/PostDetailsPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const QuizTakePage = lazy(() => import('./pages/QuizTakePage'));
const QuizResultsPage = lazy(() => import('./pages/QuizResultsPage'));
const SatellitePage = lazy(() => import('./pages/SatellitePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(pathname);
  }, [pathname]);
  
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="missions" element={<MissionsPage />} />
            <Route path="missions/:id" element={<MissionDetailsPage />} />
            <Route path="space-data" element={<SpaceDataPage />} />
            <Route path="solar-system" element={<SolarSystemPage />} />
            <Route path="satellite" element={<SatellitePage />} />
            
            {/* Protected Routes */}
            <Route path="community" element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } />
            <Route path="community/post/:id" element={
              <ProtectedRoute>
                <PostDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="community/create" element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            } />
            <Route path="quiz" element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            } />
            <Route path="quiz/:id" element={
              <ProtectedRoute>
                <QuizTakePage />
              </ProtectedRoute>
            } />
            <Route path="quiz/:id/results" element={
              <ProtectedRoute>
                <QuizResultsPage />
              </ProtectedRoute>
            } />
            <Route path="profile/:username" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="profile/:username/edit" element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="admin/*" element={
              <ProtectedRoute allowedRoles={['admin', 'moderator']}>
                <AdminPage />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Auth Routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
