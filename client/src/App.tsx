import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { PublicMenu } from './pages/customer/PublicMenu';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { OutletsPage } from './pages/outlets/OutletsPage';
import { TablesPage } from './pages/tables/TablesPage';
import { QrCodesPage } from './pages/qr/QrCodesPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { ThemesPage } from './pages/themes/ThemesPage';
import { StaffPage } from './pages/staff/StaffPage';
import { SubscriptionPage } from './pages/subscription/SubscriptionPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRestaurants } from './pages/admin/AdminRestaurants';
import { AdminSubscriptions } from './pages/admin/AdminSubscriptions';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

export default function App() {
  const { isAuthenticated, user, isLoading, fetchMe } = useAuthStore();
  const role = user?.role;

  useEffect(() => {
    if (isLoading) {
      fetchMe();
    }
  }, [fetchMe, isLoading]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<LandingPage />} />
        <Route path="/features" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer routes */}
        <Route path="/order/:qrToken" element={<PublicMenu />} />
        <Route path="/order/:qrToken/status/:publicToken" element={<OrderTrackingPage />} />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          }
        />

        {/* Business routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="outlets" element={<OutletsPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="qr-codes" element={<QrCodesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="themes" element={<ThemesPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}