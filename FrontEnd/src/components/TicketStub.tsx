interface TicketStubProps {
  bookingId: number;
  eventTitle: string;
  zoneName: string;
  ticketCount: number;
  totalPrice: number;
  status: string;
  compact?: boolean;
}

const TicketStub = ({ bookingId, eventTitle, zoneName, ticketCount, totalPrice, status, compact = false }: TicketStubProps) => {
  const code = String(bookingId).padStart(8, "0");
  const bars = code.split("").flatMap((digit, digitIndex) => {
    const value = Number(digit);
    return Array.from({ length: 2 + (value % 3) }, (_, barIndex) => ({
      key: `${digitIndex}-${barIndex}`,
      width: 1 + ((value + barIndex) % 3),
    }));
  });

  return (
    <article className={`ticket-stub border-2 border-ink bg-paper text-ink print-shadow ${compact ? "p-4" : "p-6"}`}>
      <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-ink pb-4">
        <div className="min-w-0">
          <p className="font-mono-ticket text-[10px] uppercase tracking-[0.16em]">Concert Booking · Admit {ticketCount}</p>
          <h2 className={`mt-2 font-display uppercase leading-[0.9] ${compact ? "text-3xl" : "text-5xl"}`}>{eventTitle}</h2>
        </div>
        <div className="shrink-0 border-2 border-ink px-2 py-1 text-center font-mono-ticket text-xs uppercase">
          {status}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 py-4">
        <div>
          <p className="font-mono-ticket text-[10px] uppercase">Zone</p>
          <p className="font-display text-2xl uppercase">{zoneName}</p>
          <p className="font-mono-ticket text-xs">{ticketCount} ticket{ticketCount === 1 ? "" : "s"}</p>
        </div>
        <div className="text-right">
          <p className="font-mono-ticket text-[10px] uppercase">Total</p>
          <p className="font-mono-ticket text-lg">INR {totalPrice.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-5 border-t-2 border-ink pt-3">
        <div>
          <p className="font-mono-ticket text-[10px] uppercase">Booking ID</p>
          <p className="font-mono-ticket text-sm">CBS-{code}</p>
        </div>
        <div className="w-28 shrink-0" aria-label={`Barcode for booking ${bookingId}`} role="img">
          <div className="flex h-9 items-stretch justify-end gap-px overflow-hidden" aria-hidden="true">
            {bars.map((bar) => <i key={bar.key} className="bg-ink" style={{ width: `${bar.width}px` }} />)}
          </div>
          <p className="font-mono-ticket text-center text-[9px] tracking-[0.2em]">{code}</p>
        </div>
      </div>
    </article>
  );
};

export default TicketStub;