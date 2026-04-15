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

// Admin Pages
import AdminDashboard from '@/pages/Admin'
import AdminUsers from '@/pages/Admin/Users'
import AdminListings from '@/pages/Admin/Listings'
import AdminReports from '@/pages/Admin/Reports'
import AdminCategories from '@/pages/Admin/Categories'
import AdminTransactions from '@/pages/Admin/Transactions'
import AdminStatistics from '@/pages/Admin/Statistics'

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
    ],
  },
])
