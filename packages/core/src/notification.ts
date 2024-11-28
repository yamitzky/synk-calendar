export interface NotificationRepository<T = string> {
  notify: (target: string, payload: T) => Promise<void>
}
