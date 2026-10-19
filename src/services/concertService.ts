import API from "@/api/api";
import { Concert, Booking, AppUser, concerts as initialConcerts, bookings as initialBookings, DEMO_USERS } from "@/data/mockData";

const CONCERTS_KEY = "concerthub_concerts";
const BOOKINGS_KEY = "concerthub_bookings";
const USERS_KEY = "concerthub_users";
const HOLDS_KEY = "concerthub_pending_holds";

// Initialize LocalStorage with default mock data if not present
function initializeStorage() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(CONCERTS_KEY)) {
    localStorage.setItem(CONCERTS_KEY, JSON.stringify(initialConcerts));
  }
  if (!localStorage.getItem(BOOKINGS_KEY)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(initialBookings));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  }
}

// Ensure storage initialized on module load
initializeStorage();

export const ConcertService = {
  // Concerts
  getConcerts(): Concert[] {
    initializeStorage();
    const data = localStorage.getItem(CONCERTS_KEY);
    return data ? JSON.parse(data) : initialConcerts;
  },

  getConcertById(id: string): Concert | undefined {
    const list = this.getConcerts();
    return list.find((c) => c.id === id);
  },

  saveConcert(concert: Partial<Concert> & { title: string; artist: string; date: string }): Concert {
    const list = this.getConcerts();
    if (concert.id) {
      // Update
      const index = list.findIndex((c) => c.id === concert.id);
      if (index >= 0) {
        const updated = { ...list[index], ...concert };
        list[index] = updated;
        localStorage.setItem(CONCERTS_KEY, JSON.stringify(list));
        return updated;
      }
    }

    // Create New
    const newConcert: Concert = {
      id: String(Date.now()),
      title: concert.title,
      artist: concert.artist,
      genre: concert.genre || "Pop / Rock",
      date: concert.date,
      time: concert.time || "8:00 PM",
      venue: concert.venue || "Grand Arena",
      city: concert.city || "Mumbai",
      price: Number(concert.price) || 2000,
      image: concert.image || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
      description: concert.description || "An unforgettable live music experience.",
      totalSeats: concert.totalSeats || 300,
      bookedSeats: concert.bookedSeats || [],
    };
    list.unshift(newConcert);
    localStorage.setItem(CONCERTS_KEY, JSON.stringify(list));
    return newConcert;
  },

  deleteConcert(id: string): boolean {
    const list = this.getConcerts().filter((c) => c.id !== id);
    localStorage.setItem(CONCERTS_KEY, JSON.stringify(list));

    // Try notifying backend if available (fire and forget)
    API.delete(`/events/${id}`).catch(() => {});
    return true;
  },

  // Bookings
  getBookings(): Booking[] {
    initializeStorage();
    const data = localStorage.getItem(BOOKINGS_KEY);
    return data ? JSON.parse(data) : initialBookings;
  },

  getUserBookings(userId?: number | string): Booking[] {
    const all = this.getBookings();
    if (!userId) return all;
    return all.filter((b) => String(b.userId) === String(userId));
  },

  cancelBooking(bookingId: string): boolean {
    const list = this.getBookings();
    const index = list.findIndex((b) => b.id === bookingId);
    if (index >= 0) {
      list[index].status = "CANCELLED";
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
      API.post(`/bookings/cancel/${bookingId}`).catch(() => {
        // ignore offline error
      });
      return true;
    }
    return false;
  },

  // Hold Flow (Ticket reservation)
  async holdTickets(params: {
    zoneId: number;
    zoneName: string;
    ticketCount: number;
    userId: number;
    concertId: string;
    pricePerTicket: number;
  }): Promise<{ id: number; expiresAt: number }> {
    try {
      // First attempt backend API call
      const res = await API.post("/bookings/hold", {
        zoneId: params.zoneId,
        ticketCount: params.ticketCount,
        userId: params.userId,
      });
      if (res?.data?.id) {
        return { id: res.data.id, expiresAt: Date.now() + 10 * 60 * 1000 };
      }
    } catch (_err) {
      // Graceful offline / standalone fallback
    }

    const holdId = Date.now();
    const holds = JSON.parse(localStorage.getItem(HOLDS_KEY) || "{}");
    holds[holdId] = {
      ...params,
      id: holdId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    localStorage.setItem(HOLDS_KEY, JSON.stringify(holds));
    return { id: holdId, expiresAt: holds[holdId].expiresAt };
  },

  async updateHoldQuantity(holdId: number, quantity: number): Promise<boolean> {
    try {
      await API.post(`/bookings/update-quantity/${holdId}`, { quantity });
      return true;
    } catch (_err) {
      // Local fallback
    }
    const holds = JSON.parse(localStorage.getItem(HOLDS_KEY) || "{}");
    if (holds[holdId]) {
      holds[holdId].ticketCount = quantity;
      localStorage.setItem(HOLDS_KEY, JSON.stringify(holds));
      return true;
    }
    return false;
  },

  async confirmHold(holdId: number, bookingDetails: {
    concert: Concert;
    zoneName: string;
    quantity: number;
    pricePerTicket: number;
    totalPrice: number;
    user: AppUser;
  }): Promise<Booking> {
    try {
      await API.post(`/bookings/confirm/${holdId}`);
    } catch (_err) {
      // Local fallback
    }

    const newBooking: Booking = {
      id: `CH-${Date.now().toString(36).toUpperCase()}`,
      userId: bookingDetails.user.id,
      userName: bookingDetails.user.name,
      userEmail: bookingDetails.user.email,
      concertId: bookingDetails.concert.id,
      concertTitle: bookingDetails.concert.title,
      artist: bookingDetails.concert.artist,
      date: bookingDetails.concert.date,
      time: bookingDetails.concert.time,
      venue: bookingDetails.concert.venue,
      city: bookingDetails.concert.city,
      zoneName: bookingDetails.zoneName,
      ticketCount: bookingDetails.quantity,
      pricePerTicket: bookingDetails.pricePerTicket,
      seats: Array.from({ length: bookingDetails.quantity }, (_, i) => i + 1),
      totalPrice: bookingDetails.totalPrice,
      bookedAt: new Date().toISOString(),
      status: "CONFIRMED",
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CH-${holdId}-${bookingDetails.concert.id}`,
    };

    // Save to stored bookings
    const allBookings = this.getBookings();
    allBookings.unshift(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(allBookings));

    // Clear hold
    const holds = JSON.parse(localStorage.getItem(HOLDS_KEY) || "{}");
    delete holds[holdId];
    localStorage.setItem(HOLDS_KEY, JSON.stringify(holds));

    return newBooking;
  },

  async releaseHold(holdId: number): Promise<void> {
    try {
      await API.post(`/bookings/cancel/${holdId}`);
    } catch (_err) {
      // offline error ignored
    }
    const holds = JSON.parse(localStorage.getItem(HOLDS_KEY) || "{}");
    delete holds[holdId];
    localStorage.setItem(HOLDS_KEY, JSON.stringify(holds));
  },

  // Reset to initial demo data
  resetDemoData(): void {
    localStorage.setItem(CONCERTS_KEY, JSON.stringify(initialConcerts));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(initialBookings));
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  },
};
