import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Header';
import FloatingChat from '../../../components/ui/FloatingChat';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}
