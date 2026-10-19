export interface Concert {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  image: string;
  description: string;
  totalSeats: number;
  bookedSeats: number[];
}

export interface Booking {
  id: string;
  userId?: number | string;
  userName?: string;
  userEmail?: string;
  concertId: string;
  concertTitle: string;
  artist: string;
  date: string;
  time?: string;
  venue: string;
  city?: string;
  zoneName?: string;
  ticketCount?: number;
  pricePerTicket?: number;
  seats: number[];
  totalPrice: number;
  bookedAt: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  qrCodeUrl?: string;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export const DEMO_USERS: AppUser[] = [
  {
    id: 1,
    name: "Sarah Connor (Music Fan)",
    email: "user@concerthub.com",
    role: "USER",
  },
  {
    id: 2,
    name: "Alex Vance (Event Director)",
    email: "admin@concerthub.com",
    role: "ADMIN",
  },
];

export const concerts: Concert[] = [
  {
    id: "1",
    title: "Neon Dreams World Tour",
    artist: "Aurora Lights",
    genre: "Synthwave / Pop",
    date: "2026-05-15",
    time: "8:00 PM",
    venue: "Madison Square Garden",
    city: "New York",
    price: 2500,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    description: "Experience the electrifying Neon Dreams World Tour featuring Aurora Lights' greatest hits and brand new tracks from the latest album. An unforgettable night of music, laser shows, and futuristic soundscapes.",
    totalSeats: 330,
    bookedSeats: [3, 7, 12, 15, 22, 28, 35, 41, 48, 55],
  },
  {
    id: "2",
    title: "Echoes of Tomorrow",
    artist: "The Midnight Collective",
    genre: "Indie Rock",
    date: "2026-06-02",
    time: "7:30 PM",
    venue: "The O2 Arena",
    city: "London",
    price: 3200,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    description: "The Midnight Collective brings their signature blend of synth-wave and indie rock to The O2 Arena. Prepare for an immersive audiovisual journey with stadium-scale acoustics.",
    totalSeats: 330,
    bookedSeats: [1, 5, 9, 14, 19, 25, 30, 37, 44, 50, 56],
  },
  {
    id: "3",
    title: "Summer Vibes Music Festival",
    artist: "Various Artists & Headliners",
    genre: "Festival / Multi-Genre",
    date: "2026-07-20",
    time: "4:00 PM",
    venue: "Coachella Valley Arena",
    city: "California",
    price: 4500,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    description: "The premier summer festival featuring 14 chart-topping international acts across three dynamic stages. Includes food trucks, art installations, and non-stop music from afternoon to midnight.",
    totalSeats: 400,
    bookedSeats: [2, 6, 11, 16, 21, 27, 33, 39, 45, 51],
  },
  {
    id: "4",
    title: "Acoustic Soul & Jazz Nights",
    artist: "Luna Rivera",
    genre: "Jazz / R&B",
    date: "2026-05-28",
    time: "9:00 PM",
    venue: "Blue Note Jazz Club",
    city: "Chicago",
    price: 1800,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    description: "An intimate, candlelit evening with Grammy-nominated Luna Rivera, performing stripped-down jazz standards and unreleased acoustic tracks with a live quartet.",
    totalSeats: 150,
    bookedSeats: [4, 8, 13, 18, 24, 29, 34, 40, 46, 52, 58],
  },
  {
    id: "5",
    title: "Bass Drop Revolution",
    artist: "DJ Nexus & Sub-Zero",
    genre: "Electronic / EDM",
    date: "2026-08-10",
    time: "10:00 PM",
    venue: "Warehouse District Stadium",
    city: "Miami",
    price: 2800,
    image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d74?w=800&q=80",
    description: "DJ Nexus headlines the heaviest bass night of the year with state-of-the-art 360-degree LED panels, synchronized pyrotechnics, and pulse-pounding electronic drops.",
    totalSeats: 330,
    bookedSeats: [10, 17, 23, 31, 36, 42, 47, 53, 59],
  },
  {
    id: "6",
    title: "Classical Reimagined",
    artist: "Symphony X Orchestra",
    genre: "Symphonic Fusion",
    date: "2026-09-05",
    time: "7:00 PM",
    venue: "Carnegie Hall",
    city: "New York",
    price: 3500,
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80",
    description: "An 80-piece orchestra fuses timeless classical movements with contemporary ambient and modular synthesizers. A breathtaking sensory masterpiece.",
    totalSeats: 280,
    bookedSeats: [0, 5, 11, 20, 26, 32, 38, 43, 49, 54],
  },
  {
    id: "7",
    title: "Tokyo Cyberpunk Live",
    artist: "Kitsune & Tokyo Beat Lab",
    genre: "J-Pop / Cyberpunk",
    date: "2026-10-14",
    time: "8:30 PM",
    venue: "Budokan Arena",
    city: "Tokyo",
    price: 3800,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    description: "Hyper-energetic neon rhythms with holographic stage avatars, live electric koto, and blistering synth bass lines straight from the heart of Tokyo.",
    totalSeats: 350,
    bookedSeats: [6, 12, 19, 30, 42, 60],
  },
  {
    id: "8",
    title: "Bollywood Beats Live Spectacle",
    artist: "Kabir Khan & Ensemble",
    genre: "Bollywood / World",
    date: "2026-11-01",
    time: "7:00 PM",
    venue: "Jio World Garden",
    city: "Mumbai",
    price: 2200,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
    description: "India's highest energy concert with 40 dancers, dhol troupes, electric sitar, and a 3-hour medley of the biggest chartbusters.",
    totalSeats: 500,
    bookedSeats: [8, 14, 25, 33, 49, 70, 88],
  },
];

export const bookings: Booking[] = [
  {
    id: "b1",
    userId: 1,
    userName: "Sarah Connor (Music Fan)",
    userEmail: "user@concerthub.com",
    concertId: "1",
    concertTitle: "Neon Dreams World Tour",
    artist: "Aurora Lights",
    date: "2026-05-15",
    time: "8:00 PM",
    venue: "Madison Square Garden",
    city: "New York",
    zoneName: "Front Fan Zone",
    ticketCount: 2,
    pricePerTicket: 5000,
    seats: [5, 6],
    totalPrice: 10000,
    bookedAt: "2026-04-01T14:32:00Z",
    status: "CONFIRMED",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CH-NEON-56",
  },
  {
    id: "b2",
    userId: 1,
    userName: "Sarah Connor (Music Fan)",
    userEmail: "user@concerthub.com",
    concertId: "3",
    concertTitle: "Summer Vibes Music Festival",
    artist: "Various Artists & Headliners",
    date: "2026-07-20",
    time: "4:00 PM",
    venue: "Coachella Valley Arena",
    city: "California",
    zoneName: "Right Fan Zone",
    ticketCount: 3,
    pricePerTicket: 2500,
    seats: [14, 15, 16],
    totalPrice: 7500,
    bookedAt: "2026-04-05T09:15:00Z",
    status: "CONFIRMED",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CH-SUMMER-141516",
  },
  {
    id: "b3",
    userId: 2,
    userName: "Alex Vance (Event Director)",
    userEmail: "admin@concerthub.com",
    concertId: "5",
    concertTitle: "Bass Drop Revolution",
    artist: "DJ Nexus & Sub-Zero",
    date: "2026-08-10",
    time: "10:00 PM",
    venue: "Warehouse District Stadium",
    city: "Miami",
    zoneName: "Front Fan Zone",
    ticketCount: 1,
    pricePerTicket: 5000,
    seats: [1],
    totalPrice: 5000,
    bookedAt: "2026-04-10T18:40:00Z",
    status: "CONFIRMED",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CH-BASS-1",
  },
];
