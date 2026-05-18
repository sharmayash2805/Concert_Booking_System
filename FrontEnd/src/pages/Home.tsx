import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import SkeletonCard from "@/components/SkeletonCard";
import { concerts } from "@/data/mockData";

const cities = ["All", ...new Set(concerts.map((c) => c.city))];

const Home = () => {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = concerts.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.artist.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "All" || c.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-neon-pink/5 blur-3xl" />
        <div className="container mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary animate-fade-in">
            <Music2 className="w-4 h-4" />
            Discover Live Music Near You
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="gradient-text">Unforgettable</span> Live
            <br />Music Experiences
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Book tickets to the hottest concerts and festivals. Your next favorite memory starts here.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 -mt-4 relative z-10">
        <div className="glass rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events or artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {cities.map((city) => (
              <Button
                key={city}
                variant={cityFilter === city ? "neon" : "secondary"}
                size="sm"
                onClick={() => setCityFilter(city)}
              >
                {city === "All" ? city : <><MapPin className="w-3 h-3 mr-1" />{city}</>}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((concert, i) => (
              <div key={concert.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
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
