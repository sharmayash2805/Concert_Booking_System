import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { ConcertEvent } from "@/lib/api";
import Glyph from "@/components/Glyph";

interface EventCardProps {
  concert: ConcertEvent;
}

const EventCard = ({ concert }: EventCardProps) => {
  const date = new Date(concert.dateTime);
  const day = date.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const fromPrice = concert.zones.length > 0
    ? Math.min(...concert.zones.map((zone) => zone.price))
    : null;

  return (
    <article className="poster-card border-2 border-ink bg-paper text-ink print-shadow">
      <div className="poster-art relative flex aspect-[4/3] items-end border-b-2 border-ink bg-secondary p-4">
        <img src="/placeholder.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply" />
        <div className="relative grid w-full grid-cols-[auto_1fr] items-end gap-4">
          <div className="border-2 border-ink bg-paper p-2 text-center font-mono-ticket leading-none">
            <span className="block text-4xl">{day}</span>
            <span className="mt-1 block text-sm uppercase">{month}</span>
          </div>
          <p className="font-mono-ticket text-xs uppercase">Live event<br />{date.getFullYear()}</p>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <h2 className="font-display text-4xl uppercase leading-[0.88]">{concert.title}</h2>
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-ink pt-3 font-mono-ticket text-xs uppercase">
          <span className="max-w-[60%]">{concert.venue}</span>
          {fromPrice !== null && <span className="text-right">From INR<br /><strong className="text-base">₹{fromPrice.toLocaleString("en-IN")}</strong></span>}
        </div>
        <Link to={`/event/${concert.id}`} className="block">
          <Button variant="default" className="w-full font-mono-ticket uppercase" size="sm">Book Tickets <Glyph name="next" /></Button>
        </Link>
      </div>
    </article>
  );
};

export default EventCard;
