import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'

import HomePage from '@/pages/Home'
import BrowsePage from '@/pages/Browse'
import BikeDetailPage from '@/pages/BikeDetail'
import SellPage from '@/pages/Sell'
import InspectionPage from '@/pages/Inspection'
import CommunityPage from '@/pages/Community'
import LoginPage from '@/pages/Auth/LoginPage'
import RegisterPage from '@/pages/Auth/RegisterPage'

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
])
