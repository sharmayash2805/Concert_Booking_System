import { cn } from "@/lib/utils";

interface SeatGridProps {
  totalSeats: number;
  bookedSeats: number[];
  selectedSeats: number[];
  onSeatClick: (seat: number) => void;
}

const SeatGrid = ({ totalSeats, bookedSeats, selectedSeats, onSeatClick }: SeatGridProps) => {
  const cols = 10;

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="relative mx-auto w-3/4 max-w-md">
        <div className="h-2 rounded-full gradient-bg glow-primary" />
        <p className="text-center text-xs text-muted-foreground mt-2">STAGE</p>
      </div>

      {/* Seats */}
      <div className="grid gap-2 justify-center" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: "400px", margin: "0 auto" }}>
        {Array.from({ length: totalSeats }, (_, i) => {
          const isBooked = bookedSeats.includes(i);
          const isSelected = selectedSeats.includes(i);
          return (
            <button
              key={i}
              disabled={isBooked}
              onClick={() => onSeatClick(i)}
              className={cn(
                "w-8 h-8 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center",
                isBooked && "bg-muted text-muted-foreground cursor-not-allowed opacity-40",
                isSelected && "gradient-bg text-primary-foreground glow-primary scale-110",
                !isBooked && !isSelected && "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105 cursor-pointer"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded gradient-bg" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted opacity-40" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
