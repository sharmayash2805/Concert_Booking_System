import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Music2, Tag, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import SkeletonCard from "@/components/SkeletonCard";
import { Concert } from "@/data/mockData";
import { ConcertService } from "@/services/concertService";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const { isAdmin } = useAuth();
  const [concertsList, setConcertsList] = useState<Concert[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted or demo concerts
    const list = ConcertService.getConcerts();
    setConcertsList(list);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const cities = ["All", ...new Set(concertsList.map((c) => c.city))];
  const genres = ["All", ...new Set(concertsList.map((c) => c.genre || "Live Music"))];

  const filtered = concertsList.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.artist.toLowerCase().includes(search.toLowerCase()) ||
      c.venue.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "All" || c.city === cityFilter;
    const matchesGenre = genreFilter === "All" || (c.genre && c.genre.includes(genreFilter));
    return matchesSearch && matchesCity && matchesGenre;
  });

  return (
    <div className="min-h-screen">
      {/* Admin Quick Banner */}
      {isAdmin && (
        <div className="bg-accent/15 border-b border-accent/30 py-2 px-4">
          <div className="container mx-auto flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-accent font-semibold">
              <Shield className="w-3.5 h-3.5" />
              Admin Mode Active: You can create, edit, or delete concerts from the Admin Dashboard.
            </span>
            <Link to="/admin">
              <Button size="sm" variant="neon" className="h-7 text-xs px-2.5">
                Go to Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-neon-pink/10 blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-sm text-primary animate-fade-in shadow-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            Discover 2026 World Tours & Major Festivals
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight animate-fade-in leading-tight">
            <span className="gradient-text">Unforgettable</span> Live
            <br />Music Experiences
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Book tickets with interactive zone maps, real-time ticket holds, instant confirmation, and downloadable passes.
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="container mx-auto px-4 -mt-6 relative z-10 space-y-3">
        <div className="glass rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center shadow-xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by event, artist, venue, or genre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/80 border-border/50 text-foreground"
            />
          </div>

          {/* City pills */}
          <div className="flex gap-1.5 flex-wrap w-full md:w-auto items-center">
            <span className="text-xs text-muted-foreground mr-1 hidden lg:inline">City:</span>
            {cities.map((city) => (
              <Button
                key={city}
                variant={cityFilter === city ? "neon" : "secondary"}
                size="sm"
                onClick={() => setCityFilter(city)}
                className="text-xs h-8"
              >
                {city === "All" ? "All Cities" : <><MapPin className="w-3 h-3 mr-1" />{city}</>}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Live Events</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Showing {filtered.length} concert{filtered.length === 1 ? "" : "s"} with live zone booking
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4 animate-fade-in glass rounded-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No matching events found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search criteria or clearing filters.
            </p>
            <Button
              variant="neon-outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setCityFilter("All");
                setGenreFilter("All");
              }}
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((concert, i) => (
              <div key={concert.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <EventCard concert={concert} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
