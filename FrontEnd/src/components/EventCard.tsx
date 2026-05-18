import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Concert } from "@/data/mockData";

interface EventCardProps {
  concert: Concert;
}

const EventCard = ({ concert }: EventCardProps) => (
  <div className="group rounded-xl overflow-hidden bg-card border border-border/50 hover-lift">
    <div className="relative overflow-hidden aspect-[16/10]">
      <img
        src={concert.image}
        alt={concert.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold gradient-bg text-primary-foreground">
        ${concert.price}
      </div>
    </div>
    <div className="p-5 space-y-3">
      <div>
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {concert.title}
        </h3>
        <p className="text-sm text-muted-foreground">{concert.artist}</p>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          {new Date(concert.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-neon-pink" />
          {concert.city}
        </span>
      </div>
      <Link to={`/event/${concert.id}`}>
        <Button variant="neon" className="w-full mt-2" size="sm">
          Book Now
        </Button>
      </Link>
    </div>
  </div>
);

export default EventCard;
