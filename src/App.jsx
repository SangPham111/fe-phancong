import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppBarComponent from './components/Appbar';
import MainWorkersPage from './components/pages/MainWorkersPage';
import SupervisorsPage from './components/pages/SupervisorsPage';
import CarsTodayPage from './components/pages/Home';
import AddCarPage from './components/pages/AddCar';
import ManageCarsPage from './components/pages/ManageCars';
import AvailableWorkersPage from './components/pages/AvailableWorkersPage'
import CateCarManager from './components/pages/CateCarManager';
import LocationManager from './components/pages/LocationManager';
import { Box, TextField, Button, Typography, useMediaQuery, useTheme, Paper } from '@mui/material';

const PASSWORD = 'otobathanh2025@';
const EXPIRY_TIME = 60 * 60 * 1000; // 1 giờ

function isAuthenticated() {
  const saved = localStorage.getItem('authTime');
  if (!saved) return false;
  const diff = Date.now() - parseInt(saved, 10);
  return diff < EXPIRY_TIME;
}

function setAuthenticated() {
  localStorage.setItem('authTime', Date.now().toString());
}

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(isAuthenticated());
  const [password, setPassword] = useState('');
  const location = useLocation();

  const handleSubmit = () => {
    if (password === PASSWORD) {
      setAuthenticated();
      setAuth(true);
    } else {
      alert('Sai mật khẩu!');
    }
  };

  if (auth) return children;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper sx={{ p: 4, width: '90%', maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          Nhập mật khẩu để truy cập
        </Typography>
        <TextField
          type="password"
          label="Mật khẩu"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" fullWidth onClick={handleSubmit}>
          Đăng nhập
        </Button>
      </Paper>
    </Box>
  );
};

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const appBarHeight = isMobile ? 56 : 64;

  return (
    <Router>
      <AppBarComponent />
      <Box sx={{ mt: `${appBarHeight}px`, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/cars" />} />
          <Route path="/cars" element={<CarsTodayPage />} />

          {/* Các route cần mật khẩu */}
          <Route
            path="/workers/main"
            element={
              <ProtectedRoute>
                <MainWorkersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisors"
            element={
              <ProtectedRoute>
                <SupervisorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars/add"
            element={
              <ProtectedRoute>
                <AddCarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars/manage"
            element={
              <ProtectedRoute>
                <ManageCarsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/available"
            element={
              <ProtectedRoute>
                <AvailableWorkersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catecars"
            element={
              <ProtectedRoute>
                <CateCarManager />
              </ProtectedRoute>
            }
          />
          <Route
          path="/locations"
          element={
            <ProtectedRoute>
              <LocationManager />
            </ProtectedRoute>
          }
        />
        </Routes>
        
      </Box>
    </Router>
  );
}

export default App;
