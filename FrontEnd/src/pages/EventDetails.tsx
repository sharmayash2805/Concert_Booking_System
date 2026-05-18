import API from "../api/api";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ZoneMap, { Zone } from "@/components/ZoneMap";
import { concerts } from "@/data/mockData";
import { toast } from "sonner";

const defaultZones: Zone[] = [
  { id: "front-fan", name: "Front Fan Zone", price: 5000, color: "bg-primary", glowColor: "glow-primary", available: 50 },
  { id: "left-fan", name: "Left Fan Zone", price: 2500, color: "bg-neon-cyan", glowColor: "glow-accent", available: 80 },
  { id: "right-fan", name: "Right Fan Zone", price: 2500, color: "bg-neon-pink", glowColor: "[box-shadow:0_0_20px_hsl(var(--neon-pink)/0.35)]", available: 80 },
  { id: "away-fan", name: "Away Fan Zone", price: 1500, color: "bg-muted-foreground", glowColor: "", available: 120 },
];

// Map frontend IDs to your Database IDs
const zoneIdMap: any = {
  "left-fan": 5,
  "right-fan": 6,
  "front-fan": 7,
  "away-fan": 8
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const concert = concerts.find((c) => c.id === id);

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Cleanup: Release tickets if user leaves the page
  useEffect(() => {
    return () => {
      if (pendingBookingId) {
        API.post(`/bookings/cancel/${pendingBookingId}`).catch(() => {});
      }
    };
  }, [pendingBookingId]);

  // 1. SELECT ZONE (Hold)
  const handleZoneSelect = async (zoneId: string) => {
    if (selectedZone === zoneId) return;
    setLoading(true);

    try {
      if (pendingBookingId) {
        await API.post(`/bookings/cancel/${pendingBookingId}`);
      }

      const response = await API.post("/bookings/hold", {
        zoneId: zoneIdMap[zoneId],
        ticketCount: 1,
        userId: 1
      });

      setPendingBookingId(response.data.id);
      setSelectedZone(zoneId);
      setQuantity(1);
      toast.success("Zone reserved!");
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to reserve zone");
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE QUANTITY
  const handleQuantityChange = async (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    
    if (pendingBookingId) {
      try {
        await API.post(`/bookings/update-quantity/${pendingBookingId}`, { quantity: newQuantity });
        setQuantity(newQuantity);
      } catch (error: any) {
        toast.error(error.response?.data || "Could not update quantity");
      }
    } else {
      setQuantity(newQuantity);
    }
  };

  // 3. CONFIRM
  const handleConfirm = async () => {
    if (!pendingBookingId) return;
    setLoading(true);

    try {
      await API.post(`/bookings/confirm/${pendingBookingId}`);
      toast.success("Booking Confirmed!");
      
      const zone = defaultZones.find((z) => z.id === selectedZone);
      
      navigate("/booking-confirmation", {
        state: {
          concert,
          zoneName: zone?.name,
          quantity,
          pricePerTicket: zone?.price || 0,
          totalPrice: (zone?.price || 0) * quantity,
        },
      });
    } catch (error: any) {
      toast.error("Confirmation failed");
      setLoading(false);
    }
  };

  if (!concert) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  const zone = defaultZones.find((z) => z.id === selectedZone);
  const totalPrice = zone ? zone.price * quantity : 0;

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img src={concert.image} alt={concert.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute top-4 left-4 glass rounded-full">
            <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-foreground">Select Your Zone</h2>
              <ZoneMap
                zones={defaultZones}
                selectedZone={selectedZone}
                quantity={quantity}
                onZoneSelect={handleZoneSelect}
                onQuantityChange={handleQuantityChange}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 space-y-5 sticky top-20">
              <h3 className="text-lg font-bold text-foreground">Booking Summary</h3>
              {zone ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Zone</span>
                    <span className="text-foreground font-medium">{zone.name}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Price</span>
                    <span className="text-foreground font-medium">₹{zone.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tickets</span>
                    <span className="text-foreground font-medium">{quantity}</span>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-xl gradient-text">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">Select a zone to see pricing</p>
              )}
              <Button 
                variant="neon" 
                className="w-full" 
                onClick={handleConfirm} 
                disabled={!pendingBookingId || loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;