import { Calendar, MapPin, Ticket, Music2 } from "lucide-react";
import { bookings } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-1">Your upcoming events and booking history</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20 space-y-4 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <Music2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No bookings yet</h3>
            <p className="text-muted-foreground">Start exploring concerts and book your first ticket!</p>
            <Link to="/">
              <Button variant="neon">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking, i) => (
              <div
                key={booking.id}
                className="glass rounded-2xl p-6 hover-lift animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{booking.concertTitle}</h3>
                    <p className="text-sm text-primary">{booking.artist}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    Confirmed
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    {new Date(booking.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neon-pink" />
                    {booking.venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    Seats: {booking.seats.map((s) => s + 1).join(", ")}
                  </div>
                </div>
                <div className="border-t border-border/50 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Booked on {new Date(booking.bookedAt).toLocaleDateString()}</span>
                  <span className="font-bold gradient-text">${booking.totalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
