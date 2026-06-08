import axiosClient from '../../../lib/api/axiosClient';
import type { AxiosResponse } from 'axios';

export const getNotificationsReal = async () => {
  const res: AxiosResponse = await axiosClient.get('/notifications');
  return res.data.payload; // backend wraps in { success, payload }
};

export const markNotificationReadReal = async (id: string) => {
  await axiosClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsReadReal = async () => {
  await axiosClient.patch('/notifications/read-all');
};
