import { defineStore } from 'pinia'

// @ts-expect-error - hasn't d.ts, but i tak soidet
import toasteventbus from 'primevue/toasteventbus'

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'


interface Notification {
    id: number
    type: 'success' | 'error' | 'warn' | 'info' | 'secondary' | 'contrast'
    message: string
    timeout: number
    title?: string
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

type AddNotification = Omit<Notification, 'id' | 'timeout'> & {
  timeout?: number;
};

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
    timeouts: {} as Record<string, ReturnType<typeof setTimeout>>,
    nextId: 1,
    defaultTimeout: 3000,
  }),

  actions: {
    add(notification: AddNotification): number {
      if (!isBrowser) return 0;

      const id = this.nextId++

      const newNotification: Notification = {
        id,
        title: notification.title,
        message: notification.message || "",
        type: notification.type || 'info',
        timeout: notification.timeout !== undefined ? notification.timeout : this.defaultTimeout,
      }

      this.notifications.push(newNotification)

      requestAnimationFrame(() => {
        this.show()
      })

      return id
    },

    show() {
      const notification = this.notifications.pop()

      if (!notification) return

      toasteventbus.emit('add', {
        severity: notification.type,
        summary:  notification.title,
        detail: notification.message,
        position: notification.position,
        life: notification.timeout,
      })

      if (notification.timeout > 0) {
        this.timeouts[notification.id] = setTimeout(() => {
          this.remove(notification.id)
        }, notification.timeout)
      }

      return notification.id
    },

    remove(id: number) {
      this.notifications = this.notifications.filter(notification => notification.id !== id)
      clearTimeout(this.timeouts[id])
      delete this.timeouts[id]
    },

    success(message:string, title?: string, timeout?:number) {
      const type = 'success'
      return this.add({
        type,
        message,
        title: title || type,
        timeout,
      })
    },

    danger(message:string | Error | unknown, title?: string, timeout?:number) {
      const messageString = message instanceof Error ? message.message : String(message)
      const type = 'error'
      return this.add({
        type,
        message: messageString,
        title: title || type,
        timeout,
      })
    },

    warn(message:string | Error | unknown, title?: string, timeout?:number) {
      const messageString = message instanceof Error ? message.message : String(message)
      const type = 'warn'
      return this.add({
        type,
        message: messageString,
        title: title || type,
        timeout,
      })
    },

    info(message:string, title?: string, timeout?:number) {
      const type = 'info'
      return this.add({
        type,
        message,
        title: title || type,
        timeout,
      })
    },

    clear() {
      this.notifications = []
      Object.values(this.timeouts).forEach(clearTimeout)
      this.timeouts = {}
    },
  },
})