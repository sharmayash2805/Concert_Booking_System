import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ZoneMap, { type Zone } from "@/components/ZoneMap";
import Glyph from "@/components/Glyph";
import {
  useCancelBooking,
  useConfirmBooking,
  useEvent,
  useHoldTickets,
  useUpdateHoldQuantity,
} from "@/hooks/useApi";
import type { Booking } from "@/lib/api";
import { toast } from "sonner";

const zonePresentation: Record<string, Pick<Zone, "position" | "name">> = {
  LEFT: { position: "left-fan", name: "Left Fan Zone" },
  RIGHT: { position: "right-fan", name: "Right Fan Zone" },
  FRONT: { position: "front-fan", name: "Front Pit" },
  AWAY: { position: "away-fan", name: "Back Zone" },
};

const EventDetails = () => {
  const { id = "" } = useParams();
  const eventId = Number(id);
  const navigate = useNavigate();
  const { data: event, isLoading, isError, refetch } = useEvent(eventId);
  const holdMutation = useHoldTickets();
  const updateMutation = useUpdateHoldQuantity();
  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [holdSeconds, setHoldSeconds] = useState(600);
  const pendingBookingId = pendingBooking?.id;
  const cancelPendingBooking = cancelMutation.mutate;
  const loading = holdMutation.isPending || updateMutation.isPending
    || confirmMutation.isPending || cancelMutation.isPending;

  const zones: Zone[] = (event?.zones ?? []).flatMap((eventZone) => {
    const presentation = zonePresentation[eventZone.zoneName.toUpperCase()];
    return presentation ? [{
      id: String(eventZone.id),
      ...presentation,
      price: eventZone.price,
      available: eventZone.availableCapacity,
      total: eventZone.totalCapacity,
    }] : [];
  });
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null;

  useEffect(() => {
    if (!pendingBookingId) return;
    const timer = window.setInterval(() => {
      setHoldSeconds((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          cancelPendingBooking(pendingBookingId, {
            onSuccess: () => {
              setPendingBooking(null);
              setSelectedZoneId(null);
              setQuantity(1);
              toast.error("Hold expired. Select a zone to start again.");
            },
          });
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pendingBookingId, cancelPendingBooking]);

  const handleZoneSelect = async (zoneId: string) => {
    if (selectedZoneId === zoneId || loading) return;
    try {
      if (pendingBooking) {
        await cancelMutation.mutateAsync(pendingBooking.id);
        setPendingBooking(null);
      }
      const booking = await holdMutation.mutateAsync({ zoneId: Number(zoneId), ticketCount: 1 });
      setPendingBooking(booking);
      setSelectedZoneId(zoneId);
      setQuantity(1);
      setHoldSeconds(600);
      toast.success("Zone reserved");
    } catch {
      toast.error("Could not reserve this zone");
    }
  };

  const handleQuantityChange = async (delta: number) => {
    const nextQuantity = Math.max(1, Math.min(6, quantity + delta));
    if (nextQuantity === quantity) return;
    if (!pendingBooking) {
      setQuantity(nextQuantity);
      return;
    }
    try {
      const updated = await updateMutation.mutateAsync({ bookingId: pendingBooking.id, quantity: nextQuantity });
      setPendingBooking(updated);
      setQuantity(nextQuantity);
    } catch {
      toast.error("Could not update ticket quantity");
    }
  };

  const handleConfirm = async () => {
    if (!pendingBooking) return;
    try {
      await confirmMutation.mutateAsync(pendingBooking.id);
      navigate(`/booking-confirmation/${pendingBooking.id}`);
    } catch {
      toast.error("Booking confirmation failed");
    }
  };

  if (isLoading) return <div className="min-h-screen grid place-items-center">Loading event...</div>;
  if (isError) {
    return <div className="min-h-screen grid place-items-center text-center">
      <div className="space-y-4"><p>Could not load this event.</p><Button onClick={() => void refetch()}>Retry</Button></div>
    </div>;
  }
  if (!event) return <div className="min-h-screen grid place-items-center">Event not found</div>;

  const totalPrice = selectedZone ? selectedZone.price * quantity : 0;

  return (
    <div className="min-h-screen">
      <section className="relative min-h-56 md:min-h-72 flex items-end overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-secondary" />
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="container relative mx-auto px-4 py-8">
          <h1 className="font-display text-5xl md:text-7xl text-ink">{event.title}</h1>
          <p className="mt-2 font-mono-ticket text-sm uppercase text-ink">{event.venue} · {new Date(event.dateTime).toLocaleString()}</p>
          {event.description && <p className="mt-3 max-w-2xl text-ink">{event.description}</p>}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border-2 border-ink bg-paper p-5 print-shadow space-y-4">
              <h2 className="font-display text-3xl">Select Your Zone</h2>
              <ZoneMap
                zones={zones}
                selectedZone={selectedZoneId}
                quantity={quantity}
                onZoneSelect={handleZoneSelect}
                onQuantityChange={handleQuantityChange}
              />
            </div>
          </div>
          <aside>
            <div className="sticky top-20 border-2 border-ink bg-paper p-5 print-shadow space-y-5">
              <h2 className="font-display text-3xl">Booking Summary</h2>
              <p role="note" className="border-l-2 border-vermilion pl-3 text-sm font-semibold">
                Demo project only. No real payments are processed.
              </p>
              {pendingBooking && <div className="border-2 border-vermilion p-3 text-vermilion">
                <div className="flex items-baseline justify-between font-mono-ticket">
                  <span className="text-xs uppercase">Hold expires in</span>
                  <span className="text-xl">{String(Math.floor(holdSeconds / 60)).padStart(2, "0")}:{String(holdSeconds % 60).padStart(2, "0")}</span>
                </div>
                <div className="mt-2 h-2 border border-vermilion">
                  <div className="h-full bg-vermilion" style={{ width: `${(holdSeconds / 600) * 100}%` }} />
                </div>
              </div>}
              {selectedZone ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Zone</span><span>{selectedZone.name}</span></div>
                  <div className="flex justify-between font-mono-ticket"><span>Price</span><span>₹{selectedZone.price.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between font-mono-ticket"><span>Tickets</span><span>{quantity}</span></div>
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="font-display text-2xl">Total</span><span className="font-mono-ticket text-xl">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-6">Select a zone to see pricing</p>}
              <Button variant="default" className="w-full font-mono-ticket uppercase" onClick={handleConfirm} disabled={!pendingBooking || loading}>
                {loading ? <Glyph name="spinner" className="animate-spin" /> : "Confirm Booking"}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;