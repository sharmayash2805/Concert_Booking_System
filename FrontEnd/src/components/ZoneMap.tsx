import type { KeyboardEvent } from "react";
import Glyph from "@/components/Glyph";

export interface Zone {
  id: string;
  position: "front-fan" | "left-fan" | "right-fan" | "away-fan";
  name: string;
  price: number;
  available: number;
  total: number;
}

interface ZoneMapProps {
  zones: Zone[];
  selectedZone: string | null;
  quantity: number;
  onZoneSelect: (zoneId: string) => void;
  onQuantityChange: (delta: number) => void;
}

const mapPoints: Record<Zone["position"], string> = {
  "front-fan": "M218 111 H502 L472 209 H248 Z",
  "left-fan": "M70 145 H203 L229 348 L95 378 Z",
  "right-fan": "M517 145 H650 L625 378 L491 348 Z",
  "away-fan": "M244 220 H476 L454 387 H266 Z",
};

const ZoneMap = ({ zones, selectedZone, quantity, onZoneSelect, onQuantityChange }: ZoneMapProps) => {
  const selected = zones.find((zone) => zone.id === selectedZone) ?? null;
  const zoneAt = (position: Zone["position"]) => zones.find((zone) => zone.position === position);
  const availabilityOpacity = (zone: Zone) => Math.max(0.25, zone.available / Math.max(1, zone.total));

  const activateOnKey = (event: KeyboardEvent<SVGPathElement>, zone: Zone | undefined) => {
    if (zone && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onZoneSelect(zone.id);
    }
  };

  const zonePath = (position: Zone["position"], label: string) => {
    const zone = zoneAt(position);
    if (!zone) return null;
    const selectedPath = zone.id === selectedZone;
    return (
      <g key={zone.id}>
        <path
          d={mapPoints[position]}
          role="button"
          tabIndex={0}
          aria-label={`${zone.name}, ${zone.available} of ${zone.total} tickets available, ₹${zone.price}`}
          aria-pressed={selectedPath}
          onClick={() => onZoneSelect(zone.id)}
          onKeyDown={(event) => activateOnKey(event, zone)}
          fill={selectedPath ? "var(--vermilion)" : "var(--ink)"}
          fillOpacity={selectedPath ? 1 : availabilityOpacity(zone)}
          stroke="var(--ink)"
          strokeWidth="3"
          className="venue-zone"
        />
        <text x={position === "left-fan" ? 145 : position === "right-fan" ? 575 : 360} y={position === "front-fan" ? 168 : position === "away-fan" ? 298 : 268} className="venue-label" textAnchor="middle" pointerEvents="none">
          {label}
        </text>
        <text x={position === "left-fan" ? 145 : position === "right-fan" ? 575 : 360} y={position === "front-fan" ? 190 : position === "away-fan" ? 323 : 290} className="venue-count" textAnchor="middle" pointerEvents="none">
          {zone.available} LEFT
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="venue-plan border-y-2 border-ink py-4">
        <svg viewBox="0 0 720 430" role="group" aria-label="Interactive venue seating plan" className="mx-auto block w-full max-w-3xl">
          <rect x="230" y="20" width="260" height="68" fill="var(--ink)" />
          <text x="360" y="62" className="stage-label" textAnchor="middle">STAGE</text>
          {zonePath("front-fan", "PIT")}
          {zonePath("left-fan", "LEFT")}
          {zonePath("right-fan", "RIGHT")}
          {zonePath("away-fan", "BACK")}
        </svg>
        <div className="mt-3 flex justify-center gap-6 font-mono-ticket text-xs uppercase">
          <span><i className="mr-2 inline-block h-3 w-3 bg-vermilion align-middle" />Selected</span>
          <span><i className="mr-2 inline-block h-3 w-3 border border-ink bg-ink/40 align-middle" />Live availability</span>
        </div>
      </div>

      {selected && (
        <div className="mx-auto max-w-md border-2 border-ink bg-paper p-5 print-shadow-sm space-y-4">
          <div className="text-center">
            <p className="font-mono-ticket text-xs uppercase tracking-widest">Selected Zone</p>
            <p className="font-display text-2xl uppercase">{selected.name}</p>
            <p className="font-mono-ticket text-sm">₹{selected.price.toLocaleString("en-IN")} / ticket</p>
            <p className="font-mono-ticket text-xs">{selected.available} of {selected.total} available</p>
          </div>
          <div className="flex items-center justify-center gap-5">
            <button type="button" className="h-10 w-10 border-2 border-ink text-2xl leading-none" onClick={() => onQuantityChange(-1)} disabled={quantity <= 1} aria-label="Remove one ticket"><Glyph name="minus" /></button>
            <span className="w-12 text-center font-mono-ticket text-2xl">{quantity}</span>
            <button type="button" className="h-10 w-10 border-2 border-ink text-2xl leading-none" onClick={() => onQuantityChange(1)} disabled={quantity >= Math.min(selected.available, 6)} aria-label="Add one ticket"><Glyph name="plus" /></button>
          </div>
          <div className="border-t-2 border-dashed border-ink pt-3 text-center">
            <p className="font-mono-ticket text-xs uppercase">Total</p>
            <p className="font-display text-3xl">₹{(selected.price * quantity).toLocaleString("en-IN")}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono-ticket text-xs uppercase">
        {zones.map((zone) => (
          <span key={zone.id}>{zone.position === "front-fan" ? "Pit" : zone.position === "away-fan" ? "Back" : zone.position.replace("-fan", "")} · ₹{zone.price.toLocaleString("en-IN")}</span>
        ))}
      </div>
    </div>
  );
};

export default ZoneMap;