import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Shield,
  Ticket,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Concert, Booking } from "@/data/mockData";
import { ConcertService } from "@/services/concertService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const PRESET_IMAGES = [
  { label: "Festival", url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80" },
  { label: "Stadium", url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80" },
  { label: "Arena", url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80" },
  { label: "Club", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80" },
  { label: "Rave / EDM", url: "https://images.unsplash.com/photo-1571266028243-3716f02d2d74?w=800&q=80" },
];

const Admin = () => {
  const { isAdmin, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"EVENTS" | "BOOKINGS">("EVENTS");
  const [events, setEvents] = useState<Concert[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    artist: "",
    genre: "Pop / Rock",
    date: "",
    time: "8:00 PM",
    venue: "",
    city: "",
    price: "2500",
    totalSeats: "300",
    image: PRESET_IMAGES[0].url,
    description: "",
  });

  const loadData = () => {
    setEvents(ConcertService.getConcerts());
    setAllBookings(ConcertService.getBookings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      artist: "",
      genre: "Pop / Rock",
      date: "",
      time: "8:00 PM",
      venue: "",
      city: "",
      price: "2500",
      totalSeats: "300",
      image: PRESET_IMAGES[0].url,
      description: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (concert: Concert) => {
    setForm({
      title: concert.title,
      artist: concert.artist,
      genre: concert.genre || "Pop / Rock",
      date: concert.date,
      time: concert.time || "8:00 PM",
      venue: concert.venue,
      city: concert.city,
      price: String(concert.price),
      totalSeats: String(concert.totalSeats || 300),
      image: concert.image || PRESET_IMAGES[0].url,
      description: concert.description || "",
    });
    setEditingId(concert.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this concert from the system?")) {
      ConcertService.deleteConcert(id);
      loadData();
      toast.success("Event deleted from catalog");
    }
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.artist.trim() || !form.date || !form.venue.trim()) {
      toast.error("Please fill in required fields (Title, Artist, Date, Venue)");
      return;
    }

    ConcertService.saveConcert({
      id: editingId || undefined,
      title: form.title.trim(),
      artist: form.artist.trim(),
      genre: form.genre.trim(),
      date: form.date,
      time: form.time,
      venue: form.venue.trim(),
      city: form.city.trim() || "Mumbai",
      price: Number(form.price) || 2000,
      totalSeats: Number(form.totalSeats) || 300,
      image: form.image || PRESET_IMAGES[0].url,
      description: form.description.trim() || "An unforgettable live music performance.",
    });

    toast.success(editingId ? "Event updated successfully!" : "New event published!");
    resetForm();
    loadData();
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Admin action: Cancel this attendee reservation?")) {
      ConcertService.cancelBooking(bookingId);
      loadData();
      toast.success("Booking cancelled by Admin");
    }
  };

  const handleResetDemoData = () => {
    ConcertService.resetDemoData();
    loadData();
    toast.success("Catalog and sample bookings reset to default demo state");
  };

  // KPIs
  const totalRevenue = allBookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const totalTicketsSold = allBookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.ticketCount || b.seats?.length || 1), 0);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.artist.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBookings = allBookings.filter((b) =>
    b.concertTitle.toLowerCase().includes(search.toLowerCase()) ||
    (b.userName && b.userName.toLowerCase().includes(search.toLowerCase())) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* User Mode Notice if visited by regular user */}
        {!isAdmin && (
          <div className="glass rounded-2xl p-4 border border-accent/40 bg-accent/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">You are currently in User Mode</h4>
                <p className="text-xs text-muted-foreground">
                  Switch to Admin Mode to edit concert listings, add new events, and view attendee transactions.
                </p>
              </div>
            </div>
            <Button
              variant="neon"
              size="sm"
              onClick={() => switchRole("ADMIN")}
              className="gap-2 shrink-0 font-bold"
            >
              <Shield className="w-4 h-4" /> Activate Admin Mode
            </Button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Admin Control Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent text-accent-foreground">
                LIVE
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Manage concert inventory, ticket pricing tiers, and monitor live sales.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetDemoData}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Catalog
            </Button>
            <Button
              variant="neon"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="gap-1.5 text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Add New Event
            </Button>
          </div>
        </div>

        {/* Analytics KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5 border border-border/60 hover-lift">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</span>
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-black gradient-text mt-2">
              ₹{totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-accent mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Real-time ticket earnings
            </p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 hover-lift">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Tickets Issued</span>
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">
              {totalTicketsSold}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Across all zones & sections</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 hover-lift">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Events</span>
              <Calendar className="w-5 h-5 text-neon-pink" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">
              {events.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Live in marketplace</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 hover-lift">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Orders</span>
              <Users className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">
              {allBookings.filter((b) => b.status === "CONFIRMED").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Attendees registered</p>
          </div>
        </div>

        {/* Create / Edit Event Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 md:p-8 animate-scale-in space-y-6 border border-primary/40 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {editingId ? "Edit Concert Information" : "Publish New Live Concert"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update concert details and stage configuration
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label>Concert Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Electric Symphony 2026"
                  className="bg-secondary/70 border-border/60"
                />
              </div>

              <div className="space-y-1">
                <Label>Artist / Band *</Label>
                <Input
                  value={form.artist}
                  onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))}
                  placeholder="e.g. Astral Horizon"
                  className="bg-secondary/70 border-border/60"
                />
              </div>

              <div className="space-y-1">
                <Label>Genre / Category</Label>
                <Input
                  value={form.genre}
                  onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
                  placeholder="e.g. Electronic / Synthwave"
                  className="bg-secondary/70 border-border/60"
                />
              </div>

              <div className="space-y-1">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="bg-secondary/70 border-border/60"
                />
              </div>

              <div className="space-y-1">
                <Label>Time</Label>
                <Input
                  value={form.time}
                  onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                  placeholder="e.g. 8:00 PM"
                  className="bg-secondary/70 border-border/60"
                />
              </div>

              <div className="space-y-1">
                <Label>Venue Name *</Label>
                <Input
                  value={form.venue}
                  onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
                  placeholder="e.g. National Stadium"
                  className="bg-secondary/70 border-border/60"
                />
              </div>

              <div className="space-y-1">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. Mumbai, New York"
                  className="bg-secondary/70 border-border/60"
                />
              </div>

              <div className="space-y-1">
                <Label>Base Ticket Price (₹)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="2500"
                  className="bg-secondary/70 border-border/60"
                />
              </div>
            </div>

            {/* Image selection */}
            <div className="space-y-2">
              <Label>Concert Banner Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                placeholder="https://..."
                className="bg-secondary/70 border-border/60"
              />
              <div className="flex gap-2 flex-wrap items-center pt-1">
                <span className="text-xs text-muted-foreground mr-1">Presets:</span>
                {PRESET_IMAGES.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={form.image === preset.url ? "neon" : "secondary"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setForm((p) => ({ ...p, image: preset.url }))}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Description & Details</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Event synopsis, stage highlights, and guidelines..."
                className="bg-secondary/70 border-border/60 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="neon" onClick={handleSave} className="gap-2 px-6">
                <CheckCircle2 className="w-4 h-4" />
                {editingId ? "Save Changes" : "Publish Event"}
              </Button>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/60 pb-3">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={activeTab === "EVENTS" ? "neon" : "ghost"}
              onClick={() => setActiveTab("EVENTS")}
              className="gap-2 text-sm font-semibold"
            >
              <Calendar className="w-4 h-4" /> Events Catalog ({events.length})
            </Button>
            <Button
              variant={activeTab === "BOOKINGS" ? "neon" : "ghost"}
              onClick={() => setActiveTab("BOOKINGS")}
              className="gap-2 text-sm font-semibold"
            >
              <Ticket className="w-4 h-4" /> Attendee Orders ({allBookings.length})
            </Button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search table records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/70 border-border/60 text-xs h-8"
            />
          </div>
        </div>

        {/* Tab 1: Events Catalog */}
        {activeTab === "EVENTS" && (
          <div className="glass rounded-2xl overflow-hidden border border-border/60">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-secondary/40">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Concert
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Artist & Genre
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Date & Time
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Venue
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Base Price
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Seats
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-border/30 hover:bg-secondary/40 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-bold text-foreground text-sm line-clamp-1">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{event.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-foreground">{event.artist}</p>
                        <p className="text-xs text-accent">{event.genre || "Live Tour"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                        <br />
                        <span className="text-foreground">{event.time}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {event.venue}
                      </td>
                      <td className="px-4 py-3.5 font-bold gradient-text">
                        ₹{event.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="text-accent font-semibold">
                          {(event.totalSeats || 300) - (event.bookedSeats?.length || 0)}
                        </span>
                        <span className="text-muted-foreground"> / {event.totalSeats || 300}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(event)}
                            className="h-8 w-8 hover:text-primary"
                            title="Edit Event"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                            className="h-8 w-8 hover:text-destructive"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Bookings & Orders */}
        {activeTab === "BOOKINGS" && (
          <div className="glass rounded-2xl overflow-hidden border border-border/60">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-secondary/40">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Booking Ref
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Attendee
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Concert
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Zone & Passes
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-border/30 hover:bg-secondary/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-accent">
                        {b.id}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-foreground">{b.userName || "Customer"}</p>
                        <p className="text-muted-foreground">{b.userEmail || "user@concerthub.com"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-bold text-foreground">{b.concertTitle}</p>
                        <p className="text-muted-foreground">{b.artist}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {b.zoneName || "Fan Zone"} ({b.ticketCount || b.seats?.length || 1} Passes)
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground">
                        ₹{b.totalPrice?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            b.status === "CONFIRMED"
                              ? "bg-accent/20 text-accent"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {b.status === "CONFIRMED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Refund / Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
