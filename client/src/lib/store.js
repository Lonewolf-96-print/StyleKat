import { create } from "zustand"
// import type { Socket } from "socket.io-client"
import {connectSocket, getSocket, disconnectSocket } from "./socket"
// import type { Booking } from "./bookings"






export const useBarberStore = create((set, get) => ({
  // Initial state
  shopState: {
    isOpen: true,
    queueLength: 0,
    avgHaircutDuration: 30,
    estimatedWaitTime: 0,
  },
  isConnected: false,
  socket: null,
  selectedShopId: null,
  notifications: [],
  pendingBookings: [],

  // Initialize socket connection
  initializeSocket: (shopId) => {
   
    const socket = connectSocket()

    if (shopId) {
      set({ selectedShopId: shopId })
    }

    socket.on("connect", () => {
      console.log(" Connected to server")
      set({ isConnected: true, socket })

      const { selectedShopId } = get()
      if (selectedShopId) {
        socket.emit("joinShop", selectedShopId)
        console.log("Joined shop room:", selectedShopId)
      }
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
      set({ isConnected: false })
    })

    socket.on("shopStateUpdate", (newState) => {
      console.log(" Shop state updated:", newState)
      set({ shopState: newState })
    })

    socket.on("newBookingRequest", (booking) => {
      console.log("New booking request received:", booking)
      const notification = {
        id: `notif-${Date.now()}`,
        type: "new_booking",
        booking,
        timestamp: new Date(),
        read: false,
      }

      const { addNotification, addPendingBooking } = get()
      addNotification(notification)
      addPendingBooking(booking)
    })

    socket.on("bookingStatusUpdate", (booking) => {
      console.log("Booking status updated:", booking)
      const notification= {
        id: `notif-${Date.now()}`,
        type: "booking_update",
        booking,
        timestamp: new Date(),
        read: false,
      }

      const { addNotification } = get()
      addNotification(notification)
    })

    set({ socket })
  },

  setSelectedShop: (shopId) => {
    const { socket } = get()
    set({ selectedShopId: shopId })

    if (socket && socket.connected) {
      socket.emit("joinShop", shopId)
      console.log("[v0] Joined shop room:", shopId)
    }
  },

  // Barber actions
  toggleShop: () => {
    const { socket, selectedShopId } = get()
    if (socket && selectedShopId) {
      socket.emit("toggleShop", selectedShopId)
    }
  },

  addCustomer: () => {
    const { socket, selectedShopId } = get()
    if (socket && selectedShopId) {
      socket.emit("addCustomer", selectedShopId)
    }
  },

  removeCustomer: () => {
    const { socket, selectedShopId } = get()
    if (socket && selectedShopId) {
      socket.emit("removeCustomer", selectedShopId)
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }))
  },

  markNotificationRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  updateBookingStatus: (bookingId, status) => {
    const { socket, selectedShopId } = get()
    if (socket && selectedShopId) {
      socket.emit("updateBookingStatus", { bookingId, status, shopId: selectedShopId })
      console.log("[v0] Updated booking status:", { bookingId, status })
    }

    // Remove from pending bookings
    set((state) => ({
      pendingBookings: state.pendingBookings.filter((booking) => booking.id !== bookingId),
    }))
  },

  addPendingBooking: (booking) => {
    set((state) => ({
      pendingBookings: [...state.pendingBookings, booking],
    }))
  },

  removePendingBooking: (bookingId) => {
    set((state) => ({
      pendingBookings: state.pendingBookings.filter((booking) => booking.id !== bookingId),
    }))
  },

  // Update state (called by socket listener)
  updateShopState: (newState) => {
    set({ shopState: newState })
  },

  // Cleanup
  disconnect: () => {
    socket.disconnectSocket()
    set({ socket: null, isConnected: false, selectedShopId: null })
  },
}))
