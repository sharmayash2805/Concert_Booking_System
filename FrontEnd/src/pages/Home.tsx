import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Glyph from "@/components/Glyph";
import EventCard from "@/components/EventCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useEvents } from "@/hooks/useApi";

const Home = () => {
  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("All venues");
  const { data: events = [], isLoading, isError, refetch } = useEvents();
  const venues = useMemo(() => ["All venues", ...new Set(events.map((event) => event.venue))], [events]);

  const filtered = events.filter((event) => {
    const query = search.toLowerCase();
    const matchesSearch = event.title.toLowerCase().includes(query)
      || (event.description ?? "").toLowerCase().includes(query)
      || event.venue.toLowerCase().includes(query);
    const matchesVenue = venueFilter === "All venues" || event.venue === venueFilter;
    return matchesSearch && matchesVenue;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-ink px-4 py-20">
        <div className="container relative z-10 mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-2 font-mono-ticket text-xs uppercase">
            <Glyph name="music" />
            Stubline · Event booking demo
          </div>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.85]">
            <span className="text-vermilion">Live events.</span>
            <br />Clear bookings.
          </h1>
          <p className="mx-auto max-w-xl text-lg text-ink">
            Browse events, compare ticket zones, and manage reservations.
          </p>
          <p className="font-mono-ticket text-sm">
            Built by{" "}
            <a className="text-vermilion underline underline-offset-4" href="https://github.com/sharmayash2805" target="_blank" rel="noreferrer">
              Yash Sharma
            </a>
          </p>
        </div>
      </section>

      <section aria-labelledby="build-notes-title" className="container mx-auto px-4 pb-12">
        <div className="border-t-2 border-ink pt-6">
          <h2 id="build-notes-title" className="font-display text-3xl">Notes from the build</h2>
          <ul className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <li className="border-l-2 border-vermilion pl-3">Seat counts are guarded by row-level database locks.</li>
            <li className="border-l-2 border-vermilion pl-3">Server state is managed with TanStack React Query.</li>
            <li className="border-l-2 border-vermilion pl-3">Built with Spring Boot 3 and React 18.</li>
          </ul>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 -mt-4 relative z-10">
        <div className="flex flex-col items-center gap-4 border-2 border-ink bg-paper p-4 md:flex-row md:p-6 print-shadow">
          <div className="relative flex-1 w-full">
            <Glyph name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-ink" />
            <Input
              placeholder="Search events or artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
              {venues.map((venue) => (
              <Button
                  key={venue}
                  variant={venueFilter === venue ? "neon" : "secondary"}
                size="sm"
                  onClick={() => setVenueFilter(venue)}
              >
                  {venue === "All venues" ? venue : <><Glyph name="pin" className="mr-1" />{venue}</>}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <div className="py-16 text-center space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Events could not be loaded</h3>
            <Button variant="default" onClick={() => void refetch()}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="space-y-4 py-20 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center border-2 border-ink bg-secondary font-display text-3xl">
              ▦
            </div>
            <h3 className="text-xl font-semibold text-foreground">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((concert) => (
              <div key={concert.id}>
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
