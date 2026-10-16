import axios from "axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface EventZone {
  id: number;
  zoneName: string;
  price: number;
  totalCapacity: number;
  availableCapacity: number;
}

export interface ConcertEvent {
  id: number;
  title: string;
  description: string | null;
  venue: string;
  dateTime: string;
  zones: EventZone[];
}

export interface EventRequest {
  title: string;
  description: string;
  venue: string;
  dateTime: string;
}

export interface Booking {
  id: number;
  eventId: number;
  eventTitle: string;
  zoneId: number;
  zoneName: string;
  ticketCount: number;
  status: string;
  totalPrice: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

const TOKEN_KEY = "concert-booking-token";

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

export const clearAuthToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthToken();
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthResponse> =>
    (await api.post<AuthResponse>("/auth/login", request)).data,
  register: async (request: RegisterRequest): Promise<User> =>
    (await api.post<User>("/auth/register", request)).data,
  me: async (): Promise<User> => (await api.get<User>("/auth/me")).data,
};

export const eventsApi = {
  list: async (): Promise<ConcertEvent[]> => (await api.get<ConcertEvent[]>("/events")).data,
  get: async (id: number): Promise<ConcertEvent> => (await api.get<ConcertEvent>(`/events/${id}`)).data,
  create: async (request: EventRequest): Promise<ConcertEvent> =>
    (await api.post<ConcertEvent>("/events", request)).data,
  update: async (id: number, request: EventRequest): Promise<ConcertEvent> =>
    (await api.put<ConcertEvent>(`/events/${id}`, request)).data,
  remove: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export const bookingsApi = {
  mine: async (): Promise<Booking[]> => (await api.get<Booking[]>("/bookings/me")).data,
  hold: async (zoneId: number, ticketCount: number): Promise<Booking> =>
    (await api.post<Booking>("/bookings/hold", { zoneId, ticketCount })).data,
  updateQuantity: async (bookingId: number, quantity: number): Promise<Booking> =>
    (await api.post<Booking>(`/bookings/update-quantity/${bookingId}`, { quantity })).data,
  confirm: async (bookingId: number): Promise<void> => {
    await api.post(`/bookings/confirm/${bookingId}`);
  },
  cancel: async (bookingId: number): Promise<void> => {
    await api.post(`/bookings/cancel/${bookingId}`);
  },
};