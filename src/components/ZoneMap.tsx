import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Zone {
  id: string;
  name: string;
  price: number;
  color: string;
  glowColor: string;
  available: number;
}

interface ZoneMapProps {
  zones: Zone[];
  selectedZone: string | null;
  quantity: number;
  onZoneSelect: (zoneId: string) => void;
  onQuantityChange: (delta: number) => void;
}

const ZoneMap = ({ zones, selectedZone, quantity, onZoneSelect, onQuantityChange }: ZoneMapProps) => {
  const zoneMap: Record<string, Zone> = {};
  zones.forEach((z) => (zoneMap[z.id] = z));

  const selected = selectedZone ? zoneMap[selectedZone] : null;

  return (
    <div className="space-y-8">
      {/* Venue Map */}
      <div className="relative max-w-2xl mx-auto space-y-3">
        {/* Stage */}
        <div className="mx-auto w-3/4 py-4 rounded-xl bg-muted/40 border border-border/50 text-center">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">Stage</span>
        </div>

        {/* Singer Area */}
        <div className="mx-auto w-1/2 py-3 rounded-lg bg-muted/20 border border-border/30 text-center">
          <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground/70">Singer Area</span>
        </div>

        {/* Front Fan Zone */}
        <ZoneBlock
          zone={zoneMap["front-fan"]}
          isSelected={selectedZone === "front-fan"}
          onClick={() => onZoneSelect("front-fan")}
          className="mx-auto w-3/4"
        />

        {/* Left + Right Fan Zones */}
        <div className="grid grid-cols-2 gap-3">
          <ZoneBlock
            zone={zoneMap["left-fan"]}
            isSelected={selectedZone === "left-fan"}
            onClick={() => onZoneSelect("left-fan")}
          />
          <ZoneBlock
            zone={zoneMap["right-fan"]}
            isSelected={selectedZone === "right-fan"}
            onClick={() => onZoneSelect("right-fan")}
          />
        </div>

        {/* Away Fan Zone */}
        <ZoneBlock
          zone={zoneMap["away-fan"]}
          isSelected={selectedZone === "away-fan"}
          onClick={() => onZoneSelect("away-fan")}
          className="mx-auto w-full"
        />
      </div>

      {/* Quantity Selector */}
      {selected && (
        <div className="glass rounded-2xl p-6 max-w-md mx-auto animate-scale-in space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Selected Zone</p>
            <p className="text-lg font-bold text-foreground">{selected.name}</p>
            <p className="text-sm text-primary font-medium">₹{selected.price.toLocaleString()} per ticket</p>
            <p className="text-xs text-muted-foreground mt-1">{selected.available} tickets available</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
              className="rounded-full h-10 w-10"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-3xl font-bold text-foreground w-12 text-center">{quantity}</span>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= selected.available}
              className="rounded-full h-10 w-10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold gradient-text">₹{(selected.price * quantity).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        {zones.map((z) => (
          <div key={z.id} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded", z.color)} />
            <span>{z.name} — ₹{z.price.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function ZoneBlock({
  zone,
  isSelected,
  onClick,
  className,
}: {
  zone: Zone;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}) {
  if (!zone) return null;
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative py-6 rounded-xl border-2 text-center transition-all duration-300 cursor-pointer group",
        isSelected
          ? `${zone.color} border-transparent shadow-lg scale-[1.02]`
          : "bg-secondary/40 border-border/40 hover:border-border hover:bg-secondary/60",
        isSelected && zone.glowColor,
        className
      )}
    >
      <p className={cn("font-bold text-sm", isSelected ? "text-primary-foreground" : "text-foreground")}>
        {zone.name}
      </p>
      <p className={cn("text-xs mt-1", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
        ₹{zone.price.toLocaleString()}
      </p>
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
          <span className="text-[10px] font-bold text-accent-foreground">✓</span>
        </div>
      )}
    </button>
  );
}

export default ZoneMap;
