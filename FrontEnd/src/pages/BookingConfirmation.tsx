import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEvent, useMyBookings } from "@/hooks/useApi";
import TicketStub from "@/components/TicketStub";
import Glyph from "@/components/Glyph";

const BookingConfirmation = () => {
  const { bookingId = "" } = useParams();
  const numericBookingId = Number(bookingId);
  const { data: bookings = [], isLoading, isError } = useMyBookings();
  const booking = bookings.find((item) => item.id === numericBookingId);
  const { data: event } = useEvent(booking?.eventId ?? 0);

  if (isLoading) return <div className="min-h-screen grid place-items-center">Loading booking...</div>;

  if (isError || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl text-foreground">Booking Not Found</h1>
          <p className="text-muted-foreground">This booking is unavailable for the current account.</p>
          <Link to="/dashboard"><Button variant="default">My Bookings</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center border-2 border-ink bg-vermilion font-display text-3xl text-paper print-shadow-sm">
            <Glyph name="check" />
          </div>
          <h1 className="font-display text-6xl">Booking Confirmed</h1>
          <p className="font-mono-ticket text-sm uppercase">Your booking is recorded.</p>
        </div>

        <TicketStub bookingId={booking.id} eventTitle={booking.eventTitle} zoneName={booking.zoneName}
          ticketCount={booking.ticketCount} totalPrice={booking.totalPrice} status={booking.status} />
        {event && <p className="mt-3 text-center font-mono-ticket text-xs uppercase">{event.venue} · {new Date(event.dateTime).toLocaleString()}</p>}

        <div className="flex gap-3 mt-6">
          <Link to="/dashboard" className="flex-1">
            <Button variant="default" className="w-full">My Bookings <Glyph name="next" /></Button>
          </Link>
          <Link to="/" className="flex-1"><Button variant="outline" className="w-full">Browse Events</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;