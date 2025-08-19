import { defineStore } from 'pinia'

interface INotification {
    id: number
    message: string
    type: 'success' | 'danger' | 'warning' | 'info'
    timeout: number
}

interface IAddNotificationPayload {
    message: string
    type?: 'success' | 'danger' | 'warning' | 'info'
    timeout?: number
}


export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as INotification[],
    nextId: 1,
    defaultTimeout: 3000,
  }),

  actions: {
    add(notification: IAddNotificationPayload): number {
      const id = this.nextId++

      const newNotification: INotification = {
        id,
        message: notification.message,
        type: notification.type || 'info',
        timeout: notification.timeout !== undefined ? notification.timeout : this.defaultTimeout,
      }

      this.notifications.push(newNotification)

      // Auto-remove if timeout is set
      if (newNotification.timeout > 0) {
        setTimeout(() => {
          this.remove(id)
        }, newNotification.timeout)
      }

      return id
    },

    remove(id: number) {
      this.notifications = this.notifications.filter(notification => notification.id !== id)
    },

    showSuccess(message:string, timeout:number) {
      return this.add({ message, type: 'success', timeout })
    },

    showDanger(message:string, timeout:number) {
      return this.add({ message, type: 'danger', timeout })
    },

    showWarning(message:string, timeout:number) {
      return this.add({ message, type: 'warning', timeout })
    },

    showInfo(message:string, timeout:number) {
      return this.add({ message, type: 'info', timeout })
    },

    clear() {
      this.notifications = []
    },
  },
})