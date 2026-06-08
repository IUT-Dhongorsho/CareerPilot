import axiosClient from '../../../lib/api/axiosClient';

export const getNotificationsReal = async () => {
  const res: any = await axiosClient.get('/notifications');
  return res.notifications;
};

export const markNotificationReadReal = async (id: string) => {
  await axiosClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsReadReal = async () => {
  await axiosClient.patch('/notifications/read-all');
};
