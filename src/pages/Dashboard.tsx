import { useState, useEffect } from "react";
import { Calendar, MapPin, Ticket, Music2, Search, QrCode, XCircle, RotateCcw, ArrowRight, ShieldCheck, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Booking } from "@/data/mockData";
import { ConcertService } from "@/services/concertService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [bookingList, setBookingList] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "CANCELLED">("ALL");
  const [viewTicket, setViewTicket] = useState<Booking | null>(null);

  const loadData = () => {
    // If admin, show all bookings; otherwise show current user's bookings
    const data = isAdmin
      ? ConcertService.getBookings()
      : ConcertService.getUserBookings(user.id);
    setBookingList(data);
  };

  useEffect(() => {
    loadData();
  }, [user.id, isAdmin]);

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      ConcertService.cancelBooking(bookingId);
      loadData();
      toast.success("Booking cancelled. A refund has been initiated.");
    }
  };

  const handleResetDemoData = () => {
    ConcertService.resetDemoData();
    loadData();
    toast.success("Demo bookings refreshed!");
  };

  const filtered = bookingList.filter((b) => {
    const matchesSearch =
      b.concertTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.artist.toLowerCase().includes(search.toLowerCase()) ||
      b.venue.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-foreground">My Concert Bookings</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold gradient-bg text-white">
                {isAdmin ? "Admin View (All Bookings)" : "Personal Passes"}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {isAdmin
                ? "Viewing all attendee bookings placed across ConcertHub."
                : `Logged in as ${user.name}. Manage your tickets and entry passes.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetDemoData}
              className="gap-1.5 text-xs"
              title="Reset sample bookings"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reload Demo Bookings
            </Button>
            <Link to="/">
              <Button variant="neon" size="sm" className="gap-1.5 text-xs">
                <Ticket className="w-3.5 h-3.5" /> Book More Tickets
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by artist, concert, or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/80 border-border/50 text-sm h-9"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto">
            {(["ALL", "CONFIRMED", "CANCELLED"] as const).map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? "neon" : "secondary"}
                size="sm"
                onClick={() => setStatusFilter(st)}
                className="text-xs h-9 capitalize"
              >
                {st.toLowerCase()} ({bookingList.filter((b) => (st === "ALL" ? true : b.status === st)).length})
              </Button>
            ))}
          </div>
        </div>

        {/* Booking Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-4 animate-fade-in glass rounded-2xl max-w-lg mx-auto p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <Music2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No bookings found</h3>
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "ALL"
                ? "Try clearing your search or status filters."
                : "You don't have any tickets yet. Explore upcoming concerts and reserve your zone!"}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/">
                <Button variant="neon">Browse Live Events</Button>
              </Link>
              <Button variant="secondary" onClick={handleResetDemoData}>
                Seed Sample Tickets
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((booking, i) => (
              <div
                key={booking.id}
                className="glass rounded-2xl p-6 hover-lift animate-slide-up border border-border/50 relative overflow-hidden flex flex-col justify-between"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Top header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-1">
                        {booking.concertTitle}
                      </h3>
                      <p className="text-sm text-primary font-semibold">{booking.artist}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                        booking.status === "CONFIRMED"
                          ? "bg-accent/20 text-accent border border-accent/30"
                          : "bg-destructive/20 text-destructive border border-destructive/30"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2 text-xs text-muted-foreground bg-secondary/40 p-3.5 rounded-xl mb-4">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {booking.time ? `• ${booking.time}` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neon-pink" />
                      <span className="truncate">{booking.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {booking.zoneName || "General Fan Zone"} ({booking.ticketCount || booking.seats?.length || 1} Ticket
                        {(booking.ticketCount || booking.seats?.length || 1) > 1 ? "s" : ""})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <span className="font-mono text-[11px] text-muted-foreground">{booking.id}</span>
                      <span className="text-foreground font-bold">
                        ₹{booking.totalPrice?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-border/40 gap-2">
                  <Button
                    variant="neon"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-8"
                    onClick={() => setViewTicket(booking)}
                  >
                    <QrCode className="w-3.5 h-3.5" /> View Pass
                  </Button>

                  {booking.status === "CONFIRMED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleCancelBooking(booking.id)}
                      title="Cancel booking"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Pass Modal Dialog */}
      <Dialog open={!!viewTicket} onOpenChange={() => setViewTicket(null)}>
        <DialogContent className="glass max-w-md border-primary/40 p-6">
          <DialogHeader>
            <DialogTitle className="text-center gradient-text text-xl font-black">
              Official ConcertHub Entry Pass
            </DialogTitle>
          </DialogHeader>

          {viewTicket && (
            <div className="space-y-4 pt-2">
              <div className="text-center">
                <h4 className="text-lg font-bold text-foreground">{viewTicket.concertTitle}</h4>
                <p className="text-sm text-accent font-semibold">{viewTicket.artist}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {viewTicket.venue} • {new Date(viewTicket.date).toLocaleDateString()}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl mx-auto w-48 flex flex-col items-center shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${viewTicket.id}`}
                  alt="QR Code"
                  className="w-36 h-36"
                />
                <span className="font-mono text-xs font-bold text-slate-800 mt-2">
                  {viewTicket.id}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Gate Barcode Pass</span>
              </div>

              <div className="bg-secondary/60 p-3 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone</span>
                  <span className="font-semibold text-foreground">{viewTicket.zoneName || "Fan Zone"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets</span>
                  <span className="font-semibold text-foreground">
                    {viewTicket.ticketCount || viewTicket.seats?.length || 1} Pass(es)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attendee</span>
                  <span className="font-semibold text-foreground">{viewTicket.userName || user.name}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/50">
                  <span className="font-bold text-foreground">Total Paid</span>
                  <span className="font-bold text-accent">₹{viewTicket.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="neon"
                className="w-full gap-2"
                onClick={() => {
                  window.print();
                }}
              >
                <Download className="w-4 h-4" /> Download / Print Ticket
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
