import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

import HomePage from '@/pages/Home'
import BrowsePage from '@/pages/Browse'
import BikeDetailPage from '@/pages/BikeDetail'
import SellPage from '@/pages/Sell'
import InspectionPage from '@/pages/Inspection'
import CommunityPage from '@/pages/Community'
import LoginPage from '@/pages/Auth/LoginPage'
import RegisterPage from '@/pages/Auth/RegisterPage'
import ProfilePage from '@/pages/Profile'
import MyListingsPage from '@/pages/MyListings'
import WishlistPage from '@/pages/Wishlist'
import ChatPage from '@/pages/Chat'
import CheckoutPage from '@/pages/Checkout'
import OrdersPage from '@/pages/Orders'

// Admin Pages
import AdminDashboard from '@/pages/Admin'
import AdminUsers from '@/pages/Admin/Users'
import AdminListings from '@/pages/Admin/Listings'
import AdminReports from '@/pages/Admin/Reports'
import AdminCategories from '@/pages/Admin/Categories'
import AdminTransactions from '@/pages/Admin/Transactions'
import AdminStatistics from '@/pages/Admin/Statistics'
// THÊM IMPORT TRANG MỚI Ở ĐÂY
import AdminPriorityPackages from '@/pages/Admin/PriorityPackages'

export const router = createBrowserRouter([
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
      { path: 'my-listings', element: <MyListingsPage /> },
      { path: 'favorites', element: <WishlistPage /> },
      { path: 'messages', element: <ChatPage /> },
      { path: 'checkout/:id', element: <CheckoutPage /> },
      { path: 'orders', element: <OrdersPage /> },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'listings', element: <AdminListings /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'transactions', element: <AdminTransactions /> },
      { path: 'statistics', element: <AdminStatistics /> },
      // THÊM ROUTE MỚI VÀO ĐÂY
      { path: 'priority-packages', element: <AdminPriorityPackages /> },
    ],
  },
])
