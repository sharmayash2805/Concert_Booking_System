import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Calendar, MapPin, Ticket, ArrowRight, Loader2, QrCode, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Concert } from "@/data/mockData";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface BookingState {
  concert: Concert;
  zoneName: string;
  quantity: number;
  pricePerTicket: number;
  totalPrice: number;
  bookingId?: string;
}

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BookingState | null;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (!state || !state.concert) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 glass p-8 rounded-2xl max-w-md">
          <h2 className="text-2xl font-bold text-foreground">No Active Booking Session</h2>
          <p className="text-muted-foreground text-sm">
            Please pick a concert to reserve your tickets.
          </p>
          <Button variant="neon" onClick={() => navigate("/")}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  const { concert, zoneName, quantity, pricePerTicket, totalPrice, bookingId } = state;
  const displayId = bookingId || `CH-${Date.now().toString(36).toUpperCase()}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in glass p-8 rounded-2xl">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
          <h3 className="text-xl font-bold text-foreground">Generating Your E-Ticket Pass</h3>
          <p className="text-sm text-muted-foreground">Securing seat allocation and verifying pass...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-5" />

      <div className="w-full max-w-xl animate-scale-in space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full gradient-bg flex items-center justify-center glow-primary shadow-xl">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-sm">
            Your e-tickets have been issued and saved to your dashboard.
          </p>
        </div>

        {/* E-Ticket Card (Ticket pass styling) */}
        <div className="glass rounded-3xl overflow-hidden border border-primary/30 shadow-2xl relative">
          <div className="relative h-44 overflow-hidden">
            <img src={concert.image} alt={concert.title} className="w-full h-full object-cover brightness-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-accent text-accent-foreground shadow-md">
              CONFIRMED
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Official Ticket Pass</span>
              <h2 className="text-2xl font-black text-foreground mt-0.5">{concert.title}</h2>
              <p className="text-base text-accent font-semibold">{concert.artist}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/40 p-4 rounded-2xl">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-accent" /> Date & Time
                </p>
                <p className="font-semibold text-foreground text-xs md:text-sm">
                  {new Date(concert.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  • {concert.time}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-neon-pink" /> Venue & City
                </p>
                <p className="font-semibold text-foreground text-xs md:text-sm truncate">
                  {concert.venue}, {concert.city}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Ticket className="w-3.5 h-3.5 text-primary" /> Zone & Passes
                </p>
                <p className="font-semibold text-foreground text-xs md:text-sm">
                  {zoneName} ({quantity} ticket{quantity > 1 ? "s" : ""})
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                  <QrCode className="w-3.5 h-3.5 text-primary" /> Reference ID
                </p>
                <p className="font-mono text-xs font-bold text-accent">
                  {displayId}
                </p>
              </div>
            </div>

            {/* Ticket Dashed Cut-Out Divider */}
            <div className="relative py-2">
              <div className="border-t-2 border-dashed border-border/80" />
              <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-border/60" />
              <div className="absolute -right-9 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-border/60" />
            </div>

            {/* Bottom: Payment Summary & Simulated QR Code */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs text-muted-foreground">Total Amount Paid</p>
                <p className="text-2xl md:text-3xl font-black gradient-text">
                  ₹{(totalPrice || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ₹{(pricePerTicket || 0).toLocaleString()} × {quantity} Pass{quantity > 1 ? "es" : ""}
                </p>
              </div>

              {/* QR Code */}
              <div className="p-2 rounded-xl bg-white flex flex-col items-center shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${displayId}`}
                  alt="Ticket QR Code"
                  className="w-16 h-16"
                />
                <span className="text-[9px] font-mono font-bold text-slate-800 mt-1">SCAN AT GATE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard" className="flex-1">
            <Button variant="neon" className="w-full gap-2 py-6 text-base font-semibold shadow-lg">
              <Ticket className="w-4 h-4" /> View in My Bookings <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              window.print();
            }}
            className="gap-2 py-6 text-base"
          >
            <Download className="w-4 h-4" /> Print / Save Pass
          </Button>
          <Link to="/">
            <Button variant="ghost" className="w-full sm:w-auto py-6">
              Browse More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;