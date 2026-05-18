export interface Concert {
  id: string;
  title: string;
  artist: string;
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
  concertId: string;
  concertTitle: string;
  artist: string;
  date: string;
  venue: string;
  seats: number[];
  totalPrice: number;
  bookedAt: string;
}

export const concerts: Concert[] = [
  {
    id: "1",
    title: "Neon Dreams World Tour",
    artist: "Aurora Lights",
    date: "2026-05-15",
    time: "8:00 PM",
    venue: "Madison Square Garden",
    city: "New York",
    price: 85,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    description: "Experience the electrifying Neon Dreams World Tour featuring Aurora Lights' greatest hits and brand new tracks from the latest album. An unforgettable night of music, lights, and energy.",
    totalSeats: 60,
    bookedSeats: [3, 7, 12, 15, 22, 28, 35, 41, 48, 55],
  },
  {
    id: "2",
    title: "Echoes of Tomorrow",
    artist: "The Midnight Collective",
    date: "2026-06-02",
    time: "7:30 PM",
    venue: "The O2 Arena",
    city: "London",
    price: 120,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    description: "The Midnight Collective brings their signature blend of synth-wave and indie rock to The O2 Arena. Prepare for an immersive audiovisual experience like no other.",
    totalSeats: 60,
    bookedSeats: [1, 5, 9, 14, 19, 25, 30, 37, 44, 50, 56],
  },
  {
    id: "3",
    title: "Summer Vibes Festival",
    artist: "Various Artists",
    date: "2026-07-20",
    time: "4:00 PM",
    venue: "Coachella Valley",
    city: "California",
    price: 200,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    description: "The biggest summer festival featuring top artists from around the world. Three stages, food trucks, art installations, and non-stop music from afternoon to midnight.",
    totalSeats: 60,
    bookedSeats: [2, 6, 11, 16, 21, 27, 33, 39, 45, 51],
  },
  {
    id: "4",
    title: "Acoustic Nights",
    artist: "Luna Rivera",
    date: "2026-05-28",
    time: "9:00 PM",
    venue: "Blue Note Jazz Club",
    city: "Chicago",
    price: 65,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    description: "An intimate acoustic evening with Luna Rivera, performing stripped-down versions of her chart-topping hits alongside unreleased material.",
    totalSeats: 60,
    bookedSeats: [4, 8, 13, 18, 24, 29, 34, 40, 46, 52, 58],
  },
  {
    id: "5",
    title: "Bass Drop Revolution",
    artist: "DJ Nexus",
    date: "2026-08-10",
    time: "10:00 PM",
    venue: "Warehouse District",
    city: "Miami",
    price: 95,
    image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d74?w=800&q=80",
    description: "DJ Nexus brings the Bass Drop Revolution to Miami's iconic Warehouse District. Heavy bass, mind-bending visuals, and an unforgettable rave experience.",
    totalSeats: 60,
    bookedSeats: [10, 17, 23, 31, 36, 42, 47, 53, 59],
  },
  {
    id: "6",
    title: "Classical Reimagined",
    artist: "Symphony X Orchestra",
    date: "2026-09-05",
    time: "7:00 PM",
    venue: "Carnegie Hall",
    city: "New York",
    price: 150,
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80",
    description: "Symphony X Orchestra reimagines classic compositions with modern electronic elements. A groundbreaking fusion of classical and contemporary music.",
    totalSeats: 60,
    bookedSeats: [0, 5, 11, 20, 26, 32, 38, 43, 49, 54],
  },
];

export const bookings: Booking[] = [
  {
    id: "b1",
    concertId: "1",
    concertTitle: "Neon Dreams World Tour",
    artist: "Aurora Lights",
    date: "2026-05-15",
    venue: "Madison Square Garden",
    seats: [5, 6],
    totalPrice: 170,
    bookedAt: "2026-04-01",
  },
  {
    id: "b2",
    concertId: "3",
    concertTitle: "Summer Vibes Festival",
    artist: "Various Artists",
    date: "2026-07-20",
    venue: "Coachella Valley",
    seats: [14, 15, 16],
    totalPrice: 600,
    bookedAt: "2026-04-05",
  },
];
