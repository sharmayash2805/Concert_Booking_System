import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMyBookings } from "@/hooks/useApi";
import TicketStub from "@/components/TicketStub";

const Dashboard = () => {
  const { data: bookings = [], isLoading, isError, refetch } = useMyBookings();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="font-display text-5xl">My Bookings</h1>
          <p className="font-mono-ticket mt-1 text-sm uppercase">Your booking history</p>
        </div>

        {isLoading ? <p className="py-12 text-center text-muted-foreground">Loading bookings...</p> : null}
        {isError ? <div className="py-12 text-center space-y-4"><p>Bookings could not be loaded.</p><Button onClick={() => void refetch()}>Retry</Button></div> : null}
        {!isLoading && !isError && bookings.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center border-2 border-ink bg-secondary font-display text-3xl">
              ♪
            </div>
            <h2 className="font-display text-3xl">No Bookings Yet</h2>
            <p className="font-mono-ticket text-sm">Browse events to reserve tickets.</p>
            <Link to="/"><Button variant="default">Browse Events</Button></Link>
          </div>
        ) : null}
        {!isLoading && !isError && bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <TicketStub key={booking.id} bookingId={booking.id} eventTitle={booking.eventTitle}
                zoneName={booking.zoneName} ticketCount={booking.ticketCount}
                totalPrice={booking.totalPrice} status={booking.status} compact />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;