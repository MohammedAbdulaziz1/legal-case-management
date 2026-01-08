import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import PrimaryCases from './pages/cases/PrimaryCases'
import PrimaryCaseEdit from './pages/cases/PrimaryCaseEdit'
import AppealCases from './pages/cases/AppealCases'
import AppealCaseEdit from './pages/cases/AppealCaseEdit'
import SupremeCourtCases from './pages/cases/SupremeCourtCases'
import SupremeCourtCaseEdit from './pages/cases/SupremeCourtCaseEdit'
import UserPermissions from './pages/users/UserPermissions'
import ArchiveLog from './pages/archive/ArchiveLog'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/primary"
              element={
                <ProtectedRoute>
                  <PrimaryCases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/primary/new"
              element={
                <ProtectedRoute>
                  <PrimaryCaseEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/primary/:id/edit"
              element={
                <ProtectedRoute>
                  <PrimaryCaseEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/appeal"
              element={
                <ProtectedRoute>
                  <AppealCases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/appeal/new"
              element={
                <ProtectedRoute>
                  <AppealCaseEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/appeal/:id/edit"
              element={
                <ProtectedRoute>
                  <AppealCaseEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/supreme"
              element={
                <ProtectedRoute>
                  <SupremeCourtCases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/supreme/new"
              element={
                <ProtectedRoute>
                  <SupremeCourtCaseEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cases/supreme/:id/edit"
              element={
                <ProtectedRoute>
                  <SupremeCourtCaseEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/permissions"
              element={
                <ProtectedRoute>
                  <UserPermissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/archive"
              element={
                <ProtectedRoute>
                  <ArchiveLog />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

