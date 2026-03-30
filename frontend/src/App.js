import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import NotesPage from './components/NotesPage';
import QuestionnairePage from './components/QuestionnairePage';
import DashboardPage from './components/DashboardPage';
import AdminDashboard from './components/AdminDashboard';
import ContributorDashboard from './components/ContributorDashboard';

function App() {
  const [profile, setProfile] = useState({
    semester: '',
    education_field: '',
    education_year: '',
    notes_preference: []
  });

  const updateProfile = (data) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/questionnaire"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <QuestionnairePage updateProfile={updateProfile} />
                </ProtectedRoute>
              }
            />

            {/* User Dashboard — all authenticated users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user', 'contributor', 'admin']}>
                  <DashboardPage inputs={profile} />
                </ProtectedRoute>
              }
            />

            {/* Legacy notes route — redirect to dashboard */}
            <Route
              path="/notes"
              element={
                <ProtectedRoute allowedRoles={['user', 'contributor', 'admin']}>
                  <DashboardPage inputs={profile} />
                </ProtectedRoute>
              }
            />

            {/* Contributor Dashboard */}
            <Route
              path="/contributor-dashboard"
              element={
                <ProtectedRoute allowedRoles={['contributor']}>
                  <ContributorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
