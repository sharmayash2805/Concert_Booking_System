import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Calendar, MapPin, Ticket, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Concert } from "@/data/mockData";
import { useState, useEffect } from "react";

interface BookingState {
  concert: Concert;
  zoneName: string;
  quantity: number;
  pricePerTicket: number;
  totalPrice: number;
}

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // We use "as BookingState | null" to handle the state object
  const state = location.state as BookingState | null;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // 1. Safety Check: If state is null, stop and show error
  if (!state || !state.concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">No booking data available</h2>
          <Button variant="neon" onClick={() => navigate("/")}>Browse Events</Button>
        </div>
      </div>
    );
  }

  // 2. Safely extract data
  const { concert, zoneName, quantity, pricePerTicket, totalPrice } = state;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse_glow">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
          <p className="text-lg font-medium text-muted-foreground">Processing your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-scale-in">
        <div className="text-center mb-8 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full gradient-bg flex items-center justify-center glow-primary">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your tickets have been reserved</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="relative h-40 overflow-hidden">
            <img src={concert.image} alt={concert.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{concert.title}</h2>
              <p className="text-sm text-primary">{concert.artist}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 text-accent" />
                {new Date(concert.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} • {concert.time}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-neon-pink" />
                {concert.venue}, {concert.city}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ticket className="w-4 h-4 text-primary" />
                {zoneName} — {quantity} ticket{quantity > 1 ? "s" : ""} × ₹{(pricePerTicket || 0).toLocaleString()}
              </div>
            </div>

            <div className="relative py-2">
              <div className="border-t border-dashed border-border/50" />
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold gradient-text">₹{(totalPrice || 0).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Booking ID</p>
                <p className="text-sm font-mono text-foreground">CNC-{Date.now().toString(36).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link to="/dashboard" className="flex-1">
            <Button variant="neon" className="w-full gap-2">
              My Bookings <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="neon-outline" className="w-full">Browse More</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;