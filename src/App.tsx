import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './components/layouts/PublicLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProductCatalog } from './pages/public/ProductCatalog';
import { AboutUs } from './pages/public/AboutUs';
import { ContactUs } from './pages/public/ContactUs';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerProducts } from './pages/customer/CustomerProducts';
import { MyOrders } from './pages/customer/MyOrders';
import { Cart } from './pages/customer/Cart';
import { CustomerProfile } from './pages/customer/CustomerProfile';
// Supplier Pages
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';
import { MaterialRequests } from './pages/supplier/MaterialRequests';
import { ForecastViewer } from './pages/supplier/ForecastViewer';
import { DeliveryHistory } from './pages/supplier/DeliveryHistory';
import { SupplierProfile } from './pages/supplier/SupplierProfile';
// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { InventoryManagement } from './pages/admin/InventoryManagement';
import { OrderManagement } from './pages/admin/OrderManagement';
import { SupplierManagement } from './pages/admin/SupplierManagement';
import { ForecastPanel } from './pages/admin/ForecastPanel';
import { Reports } from './pages/admin/Reports';
const theme = {
  token: {
    colorPrimary: '#8B4513',
    colorSuccess: '#6B8E23',
    colorWarning: '#D2691E',
    colorError: '#CD5C5C',
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  components: {
    Button: {
      borderRadius: 8
    },
    Card: {
      borderRadius: 12
    },
    Input: {
      borderRadius: 8
    }
  }
};
export function App() {
  return <ConfigProvider theme={theme}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-amber-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductCatalog />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="contact" element={<ContactUs />} />
              </Route>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Customer Routes */}
              <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout userRole="customer" />
                  </ProtectedRoute>}>
                <Route index element={<CustomerDashboard />} />
                <Route path="products" element={<CustomerProducts />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="cart" element={<Cart />} />
                <Route path="profile" element={<CustomerProfile />} />
              </Route>
              {/* Supplier Routes */}
              <Route path="/supplier" element={<ProtectedRoute allowedRoles={['supplier']}>
                    <DashboardLayout userRole="supplier" />
                  </ProtectedRoute>}>
                <Route index element={<SupplierDashboard />} />
                <Route path="requests" element={<MaterialRequests />} />
                <Route path="forecasts" element={<ForecastViewer />} />
                <Route path="history" element={<DeliveryHistory />} />
                <Route path="profile" element={<SupplierProfile />} />
              </Route>
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout userRole="admin" />
                  </ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="suppliers" element={<SupplierManagement />} />
                <Route path="forecast" element={<ForecastPanel />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>;
}