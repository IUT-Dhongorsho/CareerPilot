import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LandingPage from './features/landing/components/LandingPage';
import LoginForm from './features/auth/components/LoginForm';
import SignupForm from './features/auth/components/SignupForm';
import CVUploader from './features/cv/components/CVUploader';
import DashboardLayout from './features/dashboard/components/MainLayout';
import KanbanBoard from './features/tracker/components/KanbanBoard';
import CalendarView from './features/tracker/components/CalendarView';
import TodoList from './features/tracker/components/TodoList';
import ProgressDashboard from './features/tracker/components/ProgressDashboard';
import ChatInterface from './features/chat/components/ChatInterface';
import { ProtectedRoute } from '../src/lib/protectedRoute';

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
          { index: true, element: <Navigate to="apply" replace /> },
          { path: 'apply', element: <ChatInterface /> },
          { path: 'kanban', element: <KanbanBoard /> },
          { path: 'calendar', element: <CalendarView /> },
          { path: 'todo', element: <TodoList /> },
          { path: 'progress', element: <ProgressDashboard /> },
        ],
      },
    ],
  },
]);
