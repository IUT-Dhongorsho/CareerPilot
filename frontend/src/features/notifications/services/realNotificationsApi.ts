import axiosClient from '../../../lib/api/axiosClient';

export const getNotificationsReal = async () => {
  const res = await axiosClient.get('/notifications');
  return res.data.notifications;
};

export const markNotificationReadReal = async (id: string) => {
  await axiosClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsReadReal = async () => {
  await axiosClient.patch('/notifications/read-all');
};
