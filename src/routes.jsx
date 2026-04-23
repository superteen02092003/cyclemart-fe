import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { InspectorLayout } from '@/layouts/InspectorLayout.jsx' 

import HomePage from '@/pages/Home'
import BrowsePage from '@/pages/Browse'
import BikeDetailPage from '@/pages/BikeDetail'
import SellPage from '@/pages/Sell'
import CommunityPage from '@/pages/Community'
import LoginPage from '@/pages/Auth/LoginPage'
import RegisterPage from '@/pages/Auth/RegisterPage'
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage'
import VerifyOtpPage from '@/pages/Auth/VerifyOtpPage'
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage'
import ProfilePage from '@/pages/Profile'
import SettingsPage from '@/pages/Settings'
import MyListingsPage from '@/pages/MyListings'
import WishlistPage from '@/pages/Wishlist'
import ChatPage from '@/pages/Chat'
import CheckoutPage from '@/pages/Checkout'
import OrdersPage from '@/pages/Orders'
import PaymentSuccessPage from '@/pages/Payment/PaymentSuccessPage'
import PaymentFailurePage from '@/pages/Payment/PaymentFailurePage'
import PaymentCallbackPage from '@/pages/Payment/PaymentCallbackPage'

// Admin Pages
import AdminDashboard from '@/pages/Admin'
import AdminUsers from '@/pages/Admin/Users'
import AdminListings from '@/pages/Admin/Listings'
import AdminReports from '@/pages/Admin/Reports'
import AdminDisputes from '@/pages/Admin/Disputes'
import AdminCategories from '@/pages/Admin/Categories'
import AdminTransactions from '@/pages/Admin/Transactions'
import AdminStatistics from '@/pages/Admin/Statistics'
import AdminPriorityPackages from '@/pages/Admin/PriorityPackages'
import AdminInspections from "@/pages/Admin/Inspections.jsx"; 

// 🔥 DÒNG QUAN TRỌNG: Import trang quản lý hạng mục kiểm định
import InspectionCriteria from '@/pages/Admin/InspectionCriteria' 

// Inspection / Inspector Pages
import InspectionPage from "@/pages/Inspection/index.jsx"; 
import InspectorTasks from "@/pages/Inspector/Tasks.jsx"; 

export const router = createBrowserRouter([
  // 1. LUỒNG NGƯỜI DÙNG CHUNG (Kể cả người bán)
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'browse', element: <BrowsePage /> },
      { path: 'bike/:id', element: <BikeDetailPage /> },
      { path: 'sell', element: <SellPage /> },
      { path: 'inspection', element: <InspectionPage /> }, 
      { path: 'community', element: <CommunityPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'my-listings', element: <MyListingsPage /> },
      { path: 'favorites', element: <WishlistPage /> },
      { path: 'messages', element: <ChatPage /> },
      { path: 'checkout/:id', element: <CheckoutPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'payment-success', element: <PaymentSuccessPage /> },
      { path: 'payment-failure', element: <PaymentFailurePage /> },
      { path: 'payment-callback', element: <PaymentCallbackPage /> },
    ],
  },

  // 2. LUỒNG ĐĂNG NHẬP / ĐĂNG KÝ
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'verify-otp', element: <VerifyOtpPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // 3. LUỒNG ADMIN
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'listings', element: <AdminListings /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'disputes', element: <AdminDisputes /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'transactions', element: <AdminTransactions /> },
      { path: 'statistics', element: <AdminStatistics /> },
      { path: 'priority-packages', element: <AdminPriorityPackages /> },
      { path: 'inspections', element: <AdminInspections /> }, 
    
      { path: 'inspection-criteria', element: <InspectionCriteria /> }
    ],
  },

  // 4. LUỒNG KIỂM DUYỆT VIÊN (INSPECTOR)
  {
    path: '/inspector',
    element: <InspectorLayout />,
    children: [
      { path: 'tasks', element: <InspectorTasks /> }, 
    ],
  },
])