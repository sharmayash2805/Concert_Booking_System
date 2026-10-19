import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowLeft, Loader2, ShieldCheck, Tag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import ZoneMap, { Zone } from "@/components/ZoneMap";
import { toast } from "sonner";
import { ConcertService } from "@/services/concertService";
import { useAuth } from "@/context/AuthContext";

const defaultZones: Zone[] = [
  { id: "front-fan", name: "Front Fan Zone", price: 5000, color: "bg-primary", glowColor: "glow-primary", available: 50 },
  { id: "left-fan", name: "Left Fan Zone", price: 2500, color: "bg-neon-cyan", glowColor: "glow-accent", available: 80 },
  { id: "right-fan", name: "Right Fan Zone", price: 2500, color: "bg-neon-pink", glowColor: "[box-shadow:0_0_20px_hsl(var(--neon-pink)/0.35)]", available: 80 },
  { id: "away-fan", name: "Away Fan Zone", price: 1500, color: "bg-muted-foreground", glowColor: "", available: 120 },
];

const zoneIdMap: Record<string, number> = {
  "left-fan": 5,
  "right-fan": 6,
  "front-fan": 7,
  "away-fan": 8,
};

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [concert, setConcert] = useState(() => (id ? ConcertService.getConcertById(id) : undefined));
  const [selectedZone, setSelectedZone] = useState<string | null>("front-fan"); // default selected for convenience
  const [quantity, setQuantity] = useState(1);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [holdTimer, setHoldTimer] = useState<number>(600); // 10 minutes hold timer

  useEffect(() => {
    if (id) {
      const found = ConcertService.getConcertById(id);
      setConcert(found);
    }
  }, [id]);

  // Hold countdown
  useEffect(() => {
    if (!pendingBookingId) return;
    const interval = setInterval(() => {
      setHoldTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [pendingBookingId]);

  // Clean up release hold on unmount
  useEffect(() => {
    return () => {
      if (pendingBookingId) {
        ConcertService.releaseHold(pendingBookingId).catch(() => {});
      }
    };
  }, [pendingBookingId]);

  // 1. SELECT ZONE (Hold)
  const handleZoneSelect = async (zoneId: string) => {
    if (selectedZone === zoneId && pendingBookingId) return;
    setLoading(true);

    try {
      if (pendingBookingId) {
        await ConcertService.releaseHold(pendingBookingId);
      }

      const zone = defaultZones.find((z) => z.id === zoneId);
      const res = await ConcertService.holdTickets({
        zoneId: zoneIdMap[zoneId] || 7,
        zoneName: zone?.name || "Standard Zone",
        ticketCount: quantity,
        userId: user.id,
        concertId: concert?.id || "1",
        pricePerTicket: zone?.price || 2500,
      });

      setPendingBookingId(res.id);
      setSelectedZone(zoneId);
      setHoldTimer(600);
      toast.success(`${zone?.name || "Zone"} reserved! Tickets locked for 10 minutes.`);
    } catch {
      toast.error("Failed to hold zone tickets");
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE QUANTITY
  const handleQuantityChange = async (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta));
    setQuantity(newQuantity);

    if (pendingBookingId) {
      try {
        await ConcertService.updateHoldQuantity(pendingBookingId, newQuantity);
      } catch {
        toast.error("Could not update reservation count");
      }
    }
  };

  // 3. CONFIRM
  const handleConfirm = async () => {
    if (!concert) return;
    setLoading(true);

    try {
      const zone = defaultZones.find((z) => z.id === selectedZone) || defaultZones[0];
      const holdId = pendingBookingId || Date.now();

      const createdBooking = await ConcertService.confirmHold(holdId, {
        concert,
        zoneName: zone.name,
        quantity,
        pricePerTicket: zone.price,
        totalPrice: zone.price * quantity,
        user,
      });

      toast.success("Booking Confirmed! Pass generated.");
      navigate("/booking-confirmation", {
        state: {
          concert,
          zoneName: zone.name,
          quantity,
          pricePerTicket: zone.price,
          totalPrice: zone.price * quantity,
          bookingId: createdBooking.id,
        },
      });
    } catch {
      toast.error("Confirmation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 glass p-8 rounded-2xl max-w-md">
          <Info className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Concert Not Found</h2>
          <p className="text-muted-foreground text-sm">
            The concert you requested might have been updated or removed.
          </p>
          <Button variant="neon" onClick={() => navigate("/")}>
            Back to All Events
          </Button>
        </div>
      </div>
    );
  }

  const zone = defaultZones.find((z) => z.id === selectedZone);
  const totalPrice = zone ? zone.price * quantity : 0;
  const minutes = Math.floor(holdTimer / 60);
  const seconds = holdTimer % 60;

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Header Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={concert.image}
          alt={concert.title}
          className="w-full h-full object-cover brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <Button
          variant="secondary"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 glass rounded-full shadow-lg"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <div className="max-w-3xl space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold gradient-bg text-white shadow-sm inline-block">
              {concert.genre || "Live Tour 2026"}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {concert.title}
            </h1>
            <p className="text-lg md:text-xl font-semibold text-accent drop-shadow">
              {concert.artist}
            </p>
          </div>
        </div>
      </div>

      {/* Main Booking Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Event Quick Info Bar */}
        <div className="glass rounded-2xl p-4 md:p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(concert.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                • {concert.time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center text-neon-pink">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Venue</p>
              <p className="text-sm font-semibold text-foreground">
                {concert.venue}, {concert.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Guarantee</p>
              <p className="text-sm font-semibold text-foreground">
                Verified 100% Authentic Tickets
              </p>
            </div>
          </div>
        </div>

        {/* Layout: Zone Selection on Left, Order Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 space-y-4 border border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Interactive Stage & Zone Map</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click any zone to view pricing and lock in your seats
                  </p>
                </div>
                {pendingBookingId && (
                  <div className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-accent/20 text-accent border border-accent/40 animate-pulse">
                    Hold: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </div>
                )}
              </div>

              <ZoneMap
                zones={defaultZones}
                selectedZone={selectedZone}
                quantity={quantity}
                onZoneSelect={handleZoneSelect}
                onQuantityChange={handleQuantityChange}
              />
            </div>

            {/* Description */}
            <div className="glass rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-bold text-foreground">About the Event</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {concert.description}
              </p>
            </div>
          </div>

          {/* Right Column: Checkout Summary Box */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 space-y-5 sticky top-24 border border-primary/30 shadow-2xl">
              <h3 className="text-lg font-bold text-foreground flex items-center justify-between">
                Booking Summary
                <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-normal">
                  Step 2 of 2
                </span>
              </h3>

              {zone ? (
                <div className="space-y-4">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Event</span>
                      <span className="text-foreground font-medium text-right max-w-[160px] truncate">
                        {concert.title}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Selected Zone</span>
                      <span className="text-foreground font-semibold">{zone.name}</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Price Per Ticket</span>
                      <span className="text-foreground font-medium">₹{zone.price.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Quantity</span>
                      <span className="text-foreground font-medium">{quantity} Pass{quantity > 1 ? "es" : ""}</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Booking Fee & GST</span>
                      <span className="text-accent font-medium">Included</span>
                    </div>

                    <div className="border-t border-border/70 pt-3 flex justify-between items-baseline">
                      <span className="font-bold text-foreground">Total Payable</span>
                      <span className="font-extrabold text-2xl gradient-text">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/60 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">Purchasing as:</p>
                    <p className="truncate">{user.name} ({user.email})</p>
                  </div>

                  <Button
                    variant="neon"
                    className="w-full py-6 text-base font-bold shadow-lg gap-2"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing Pass...
                      </>
                    ) : (
                      <>Confirm & Reserve Tickets</>
                    )}
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center">
                    Instant E-Ticket pass generated immediately upon confirmation
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click on any zone from the map to proceed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;