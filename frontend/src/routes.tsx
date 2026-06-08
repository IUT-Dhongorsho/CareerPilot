import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LandingPage from './features/landing/components/LandingPage';
import LoginForm from './features/auth/components/LoginForm';
import SignupForm from './features/auth/components/SignupForm';
import CVUploader from './features/cv/components/CVUploader';
import DashboardLayout from './features/dashboard/components/MainLayout';
import { ProtectedRoute } from './lib/protectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginForm /> },
      { path: 'signup', element: <SignupForm /> },
      {
        path: 'upload-cv',
        element: (
          <ProtectedRoute requireCV={false}>
            <CVUploader />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requireCV={true}>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="jobs" replace /> },
          { path: 'jobs', element: <div>Job Search (coming soon)</div> },
          { path: 'kanban', element: <div>Kanban (coming soon)</div> },
          { path: 'calendar', element: <div>Calendar (coming soon)</div> },
          { path: 'todo', element: <div>To-Do (coming soon)</div> },
          { path: 'interview', element: <div>Mock Interview (coming soon)</div> },
        ],
      },
    ],
  },
]);
