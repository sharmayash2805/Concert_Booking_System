import { Link } from "react-router-dom";
import Glyph from "@/components/Glyph";

const Footer = () => (
  <footer className="mt-auto border-t-2 border-ink bg-paper">
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="font-display text-xl">Stubline</span>
      </div>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Browse Events</Link>
        <Link to="/dashboard" className="hover:text-primary">My Bookings</Link>
        <Link to="/about" className="hover:text-primary">About</Link>
        <Link to="/terms" className="hover:text-primary">Terms</Link>
        <Link to="/privacy" className="hover:text-primary">Privacy</Link>
      </nav>
      <a
        href="https://github.com/sharmayash2805/Concert_Booking_System"
        target="_blank"
        rel="noreferrer"
        aria-label="Stubline source repository"
        className="inline-flex items-center gap-2 font-mono-ticket text-sm text-ink hover:text-vermilion"
      >
        <Glyph name="ticket" /> Repository
      </a>
    </div>
    <div className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
      © 2026 Stubline
    </div>
  </footer>
);

export default Footer;