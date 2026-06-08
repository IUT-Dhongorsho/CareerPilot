import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, PlusCircle, ArrowRightCircle } from 'lucide-react';
import type { AppNotification } from '../store/notificationSlice';

interface NotificationItemProps {
  notification: AppNotification;
  onClick: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'kanban_added':
      return <PlusCircle size={18} className="text-blue-500" />;
    case 'kanban_moved':
      return <ArrowRightCircle size={18} className="text-indigo-500" />;
    case 'todo_added':
      return <PlusCircle size={18} className="text-yellow-500" />;
    case 'todo_completed':
      return <CheckCircle size={18} className="text-green-500" />;
    default:
      return <Bell size={18} className="text-gray-500" />;
  }
};

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <div
      onClick={() => onClick(notification.id)}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition flex gap-3 ${
        !notification.isRead ? 'bg-blue-50/50' : ''
      }`}
    >
      <div className="mt-1">{getIcon(notification.type)}</div>
      <div className="flex-1">
        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
          {notification.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
      )}
    </div>
  );
}
