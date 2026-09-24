import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ErrorBoundary } from '../components/layout/ErrorBoundary'
import { CctvPage } from '../pages/CctvPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { MobileDemoPage } from '../pages/MobileDemoPage'
import { TriagePage } from '../pages/TriagePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'triagem',
        element: <TriagePage />,
      },
      {
        path: 'cftv',
        element: <CctvPage />,
      },
      {
        path: 'mobile',
        element: <MobileDemoPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
