import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Workouts from './pages/Workouts';
import TrainingPlan from './pages/TrainingPlan';
import Stats from './pages/Stats';
import Goals from './pages/Goals';
import ImportData from './pages/ImportData';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  console.log('App component rendu');

  return (
    <HelmetProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Login />} />
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="workouts" element={<Workouts />} />
              <Route path="training-plan" element={<TrainingPlan />} />
              <Route path="stats" element={<Stats />} />
              <Route path="goals" element={<Goals />} />
              <Route path="import" element={<ImportData />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;