export interface NotificationItem {
  id: number;
  type: string;
  message: string;
  ticket_id: string | null;
  read: boolean;
  created_at: string;
}

export interface NotificationList {
  unread_count: number;
  notifications: NotificationItem[];
}
