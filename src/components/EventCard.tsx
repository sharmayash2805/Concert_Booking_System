import { Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Concert } from "@/data/mockData";

interface EventCardProps {
  concert: Concert;
}

const EventCard = ({ concert }: EventCardProps) => (
  <div className="group rounded-2xl overflow-hidden bg-card border border-border/50 hover-lift shadow-lg flex flex-col justify-between">
    <div>
      <div className="relative overflow-hidden aspect-[16/10]">
        <img
          src={concert.image}
          alt={concert.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold gradient-bg text-white shadow-md">
          From ₹{concert.price.toLocaleString()}
        </div>
        {concert.genre && (
          <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-background/80 backdrop-blur-md text-foreground border border-border/50">
            {concert.genre}
          </div>
        )}
      </div>
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {concert.title}
          </h3>
          <p className="text-sm text-accent font-medium">{concert.artist}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            {new Date(concert.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neon-pink" />
            {concert.city}
          </span>
        </div>
      </div>
    </div>

    <div className="p-5 pt-0">
      <Link to={`/event/${concert.id}`} className="block">
        <Button variant="neon" className="w-full" size="sm">
          Reserve Tickets & Zones
        </Button>
      </Link>
    </div>
  </div>
);

export default EventCard;
