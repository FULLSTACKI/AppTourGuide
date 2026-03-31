import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TourMapPage from '../features/tour/TourMapPage';
import { AuthProvider } from '../features/admin/AuthContext';
import ProtectedRoute from '../features/admin/ProtectedRoute';
import LoginPage from '../features/admin/LoginPage';
import AdminLayout from '../features/admin/AdminLayout';
import PlaceListPage from '../features/admin/PlaceListPage';
import PlaceForm from '../features/admin/PlaceForm';
import DishListPage from '../features/admin/DishListPage';
import DishForm from '../features/admin/DishForm';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public tourist routes */}
          <Route path="/" element={<Navigate to="/tour" replace />} />
          <Route path="tour" element={<TourMapPage />} />

          {/* Admin auth */}
          <Route path="admin/login" element={<LoginPage />} />

          {/* Protected admin routes */}
          <Route path="admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="places" replace />} />
              <Route path="places" element={<PlaceListPage />} />
              <Route path="places/new" element={<PlaceForm />} />
              <Route path="places/:id/edit" element={<PlaceForm />} />
              <Route path="dishes" element={<DishListPage />} />
              <Route path="dishes/new" element={<DishForm />} />
              <Route path="dishes/:id/edit" element={<DishForm />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
