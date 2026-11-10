// ============================================================
// SIMONIK - App Routes
// File: src/routes/AppRoutes.jsx
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import UserDashboard from '../pages/user/UserDashboard';
import ReportTypePage from '../pages/user/ReportTypePage';
import CreateReportPage from '../pages/user/CreateReportPage';
import MyReportsPage from '../pages/user/MyReportsPage';
import ReportDetailPage from '../pages/user/ReportDetailPage';
import MapReportsPage from '../pages/user/MapReportsPage';
import StatistikPage from '../pages/user/StatistikPage';
import PetugasDashboard from '../pages/petugas/PetugasDashboard';
import ReportDetailPetugasPage from '../pages/petugas/ReportDetailPetugasPage';
import MapReportsPetugasPage from '../pages/petugas/MapReportsPetugasPage';
import StatistikPetugasPage from '../pages/petugas/StatistikPetugasPage';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
        Memuat...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;

  return children;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* User */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/report-type"
          element={
            <ProtectedRoute allowedRole="user">
              <ReportTypePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/create-report"
          element={
            <ProtectedRoute allowedRole="user">
              <CreateReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/my-reports"
          element={
            <ProtectedRoute allowedRole="user">
              <MyReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/report/:id"
          element={
            <ProtectedRoute allowedRole="user">
              <ReportDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/map"
          element={
            <ProtectedRoute allowedRole="user">
              <MapReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/statistik"
          element={
            <ProtectedRoute allowedRole="user">
              <StatistikPage />
            </ProtectedRoute>
          }
        />

        {/* Petugas */}
        <Route
          path="/petugas/dashboard"
          element={
            <ProtectedRoute allowedRole="petugas">
              <PetugasDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/petugas/report/:id"
          element={
            <ProtectedRoute allowedRole="petugas">
              <ReportDetailPetugasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/petugas/map"
          element={
            <ProtectedRoute allowedRole="petugas">
              <MapReportsPetugasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/petugas/statistik"
          element={
            <ProtectedRoute allowedRole="petugas">
              <StatistikPetugasPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect default */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={user.role === 'petugas' ? '/petugas/dashboard' : '/user/dashboard'}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}